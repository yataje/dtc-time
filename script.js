import { saveBaseCloud, loadBaseCloud } from "./firebase.js";



// =====================
// 에피소드 데이터
// =====================

const seasonData = [
  { title:"사설도박장", time:"2:39:59"},
  { title:"폐병원", time:"2:43:45"},
  { title:"유전자은행", time:"2:00:19"},
  { title:"악령감옥", time:"3:09:18"},
  { title:"벙커", time:"2:36:18"},
  { title:"태양여고", time:"2:41:00"},
  { title:"시즌1 스페셜", time:"1:14:32"},

  { title:"미래대학교", time:"2:42:37"},
  { title:"부암동저택", time:"2:45:00"},
  { title:"무간교도소", time:"2:43:52"},
  { title:"희망연구소", time:"2:51:05"},
  { title:"조마테오 정신병원", time:"2:42:06"},
  { title:"살인감옥", time:"2:57:48"},
  { title:"시즌2 스페셜", time:"1:16:32"},

  { title:"타임머신연구실", time:"2:45:48"},
  { title:"좀비공장", time:"2:36:47"},
  { title:"어둠의 별장", time:"2:32:25"},
  { title:"아차랜드", time:"2:35:46"},
  { title:"빵공장", time:"2:42:00"},
  { title:"백투더 경성", time:"2:35:23"},
  { title:"시즌3 스페셜", time:"1:19:23"},

  { title:"백투더 아한", time:"2:48:21"},
  { title:"럭키랜드", time:"2:39:57"},
  { title:"적송교도소", time:"2:35:57"},
  { title:"크레이지 하우스", time:"2:47:14"},
  { title:"제3공업단지", time:"2:35:13"},
  { title:"하늘에 쉼터", time:"2:39:32"},
  { title:"시즌4 스페셜", time:"1:30:46"},
];

// =====================
// 유틸
// =====================

function toSeconds(str){
  const [h,m,s] = str.split(":").map(Number);
  return h*3600 + m*60 + s;
}

const durations = seasonData.map(ep => toSeconds(ep.time));
const weekDays = ["일","월","화","수","목","금","토"];

function formatClock(date){

  const mode = clockMode.value;

  let h = date.getHours();
  const m = date.getMinutes();

  if(mode === "24"){
    return `${h}:${String(m).padStart(2,'0')}`;
  }

  h = h % 12;
  if(h === 0) h = 12;

  return `${h}:${String(m).padStart(2,'0')}`;
}









// =====================
// DOM
// =====================

const baseYear = document.getElementById("baseYear");
const baseMonth = document.getElementById("baseMonth");
const baseDay = document.getElementById("baseDay");
const baseHour = document.getElementById("baseHour");
const baseMinute = document.getElementById("baseMinute");
const baseEpisodeSelect = document.getElementById("baseEpisodeSelect");

const resultArea = document.getElementById("resultArea");
const copyBtn = document.getElementById("copyBtn");
const copyNextBtn = document.getElementById("copyNextBtn");

const clockMode = document.getElementById("clockMode");
const outputOrder = document.getElementById("outputOrder");




// =====================
// A열 저장
// =====================

const STORAGE_KEY = "dtc_base_sync";


async function saveBase(){

  console.log("SAVE RUN");

  
  const data = {
    y: baseYear.value,
    m: baseMonth.value,
    d: baseDay.value,
    h: baseHour.value,
    min: baseMinute.value,
    ep: baseEpisodeSelect.value
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
 
 await saveBaseCloud(data);

}

async function loadBase(){

const cloud = await loadBaseCloud();

if(cloud){
  baseYear.value = cloud.y;
  baseMonth.value = cloud.m;
  baseDay.value = cloud.d;
  baseHour.value = cloud.h;
  baseMinute.value = cloud.min;
  baseEpisodeSelect.value = cloud.ep;
  return;
}


  const saved = localStorage.getItem(STORAGE_KEY);
  if(!saved) return;
  const d = JSON.parse(saved);
  baseYear.value = d.y;
  baseMonth.value = d.m;
  baseDay.value = d.d;
  baseHour.value = d.h;
  baseMinute.value = d.min;
  baseEpisodeSelect.value = d.ep;
}

// =====================
// 드롭다운 생성
// =====================

seasonData.forEach((ep,i)=>{
  const opt = document.createElement("option");
  opt.value = i;
  opt.textContent = ep.title;
  baseEpisodeSelect.appendChild(opt);
});


// =====================
// 시즌 버튼 생성
// =====================


function initDefaultDate(){

  const now = new Date();

  // 값이 없을 때만 자동 입력
  if(!baseYear.value) baseYear.value = now.getFullYear();
  if(!baseMonth.value) baseMonth.value = now.getMonth() + 1;
  if(!baseDay.value) baseDay.value = now.getDate();

  if(!baseHour.value) baseHour.value = now.getHours();
  if(!baseMinute.value) baseMinute.value = now.getMinutes();
}


const seasonContainers = {
  1: document.getElementById("season1"),
  2: document.getElementById("season2"),
  3: document.getElementById("season3"),
  4: document.getElementById("season4"),
};

seasonData.forEach((ep,i)=>{
  const btn = document.createElement("button");
  btn.textContent = ep.title;
  btn.dataset.index = i;

  btn.addEventListener("click", ()=>{
    document.querySelectorAll(".season-buttons button")
      .forEach(b=>b.classList.remove("active"));

    btn.classList.add("active");

    generateSchedule(i);
    highlightUpcoming();
    showNextBroadcast(i);
  });

  const seasonNumber = Math.floor(i/7)+1;
  seasonContainers[seasonNumber].appendChild(btn);
});

// =====================
// 스케줄 출력
// =====================

function generateSchedule(targetIndex){

  const baseDate = new Date(
    baseYear.value,
    baseMonth.value-1,
    baseDay.value,
    baseHour.value,
    baseMinute.value
  );

  const baseIndex = parseInt(baseEpisodeSelect.value);
  if(isNaN(baseIndex)) return;

  let currentTime = new Date(baseDate);

  if(targetIndex !== baseIndex){
    let i = baseIndex;
    while(i !== targetIndex){
      currentTime = new Date(currentTime.getTime() + durations[i]*1000);
      i = (i+1) % seasonData.length;
    }
  }

  let output = "";

  for(let i=0;i<6;i++){
    const index = (targetIndex+i) % seasonData.length;

    if(i>0){
      currentTime = new Date(
        currentTime.getTime() + durations[(targetIndex+i-1)%seasonData.length]*1000
      );
    }

    const time = formatClock(currentTime);
const title = seasonData[index].title;

if(outputOrder.value === "title-time"){
  output += `${title}-${time}`;
}else{
  output += `${time}-${title}`;
}




    if(i<5) output+="/";
  }

  resultArea.textContent = output;
}

// =====================
// 다음 방송일 표시
// =====================

function showNextBroadcast(targetIndex){

  const baseDate = new Date(
    baseYear.value,
    baseMonth.value-1,
    baseDay.value,
    baseHour.value,
    baseMinute.value
  );

  const baseIndex = parseInt(baseEpisodeSelect.value);
  const now = new Date();

  let currentTime = new Date(baseDate);
  let index = baseIndex;

  while(true){
    const nextTime = new Date(currentTime.getTime() + durations[index]*1000);
    if(now < nextTime) break;
    currentTime = nextTime;
    index = (index+1) % seasonData.length;
  }

  while(index !== targetIndex){
    currentTime = new Date(currentTime.getTime() + durations[index]*1000);
    index = (index+1) % seasonData.length;
  }

  const m = currentTime.getMonth()+1;
  const d = currentTime.getDate();
  const h = currentTime.getHours();
  const min = currentTime.getMinutes();
  const dayName = weekDays[currentTime.getDay()];
  const title = seasonData[targetIndex].title;

  const text = `${title} ${m}월 ${d}일 (${dayName}) ${h}시 ${min}분`;


  document.getElementById("nextBroadcast").textContent = text;
}

// =====================
// 하이라이트
// =====================

function highlightUpcoming(){

  document.querySelectorAll(".season-buttons button")
    .forEach(b=>b.classList.remove("upcoming"));

  const baseDate = new Date(
    baseYear.value,
    baseMonth.value-1,
    baseDay.value,
    baseHour.value,
    baseMinute.value
  );

  const now = new Date();
  const baseIndex = parseInt(baseEpisodeSelect.value);

  let currentTime = new Date(baseDate);
  let index = baseIndex;

  
let safety = 0;

while(true){

  if(safety++ > 1000){
    console.warn("highlightUpcoming safety break");
    break;
  }

  const nextTime = new Date(
    currentTime.getTime() + durations[index]*1000
  );

  if(now < nextTime){
  break;
  }

  currentTime = nextTime;
  index = (index+1) % seasonData.length;
}




  for(let i=0;i<6;i++){
    const target = (index+i) % seasonData.length;
    const btn = document.querySelector(`.season-buttons button[data-index="${target}"]`);
    if(btn) btn.classList.add("upcoming");
  }
}

// =====================
// 복사
// =====================

copyBtn.addEventListener("click", ()=>{
  navigator.clipboard.writeText(resultArea.textContent);
});

copyNextBtn.addEventListener("click", ()=>{
  const text = document.getElementById("nextBroadcast").textContent;
  navigator.clipboard.writeText(text);
});




// =====================
// 이벤트
// =====================

let saveTimer;

function refreshAll(){

   saveBase();

  highlightUpcoming();

  const activeBtn = document.querySelector(".season-buttons button.active");

  if(activeBtn){
    const index = parseInt(activeBtn.dataset.index);
    generateSchedule(index);
    showNextBroadcast(index);
  }
}

[
  baseYear, baseMonth, baseDay,
  baseHour, baseMinute, baseEpisodeSelect
].forEach(el=>{

  el.addEventListener("input", () => {

    refreshAll();

    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveBase();
    }, 500);

  });

  el.addEventListener("change", refreshAll); // ⭐ 이것만 추가

});




highlightUpcoming();


// 30분마다 업커밍 자동 갱신
setInterval(() => {

  highlightUpcoming();

  const activeBtn = document.querySelector(".season-buttons button.active");
  if (activeBtn) {
    const index = parseInt(activeBtn.dataset.index);
    showNextBroadcast(index);
  }

}, 1800000); // 30분 = 1,800,000ms







async function init(){

  await loadBase();   // Firebase 먼저 로딩
  initDefaultDate();

  refreshAll(); // ⭐ 추가

}

init();

