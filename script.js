import { loadBaseCloud } from "./firebase.js";
import { episodes } from "./episodes.js";

/* =====================
에피소드 데이터
===================== */

const seasonData = episodes;

/* =====================
유틸
===================== */

function toSeconds(str){
const [h,m,s]=str.split(":").map(Number);
return h*3600+m*60+s;
}

const durations=seasonData.map(ep=>toSeconds(ep.time));

const weekDays=["일","월","화","수","목","금","토"];

/* =====================
DOM
===================== */

const resultArea=document.getElementById("resultArea");
const copyBtn=document.getElementById("copyBtn");
const copyNextBtn=document.getElementById("copyNextBtn");

const clockMode=document.getElementById("clockMode");
const outputOrder=document.getElementById("outputOrder");

const nextBroadcast=document.getElementById("nextBroadcast");

const btnMap={};

/* =====================
Firebase 기준 데이터
===================== */

let baseData=null;
let activeIndex=null;

/* =====================
기준 날짜 생성
===================== */

function getBaseDate(){

return new Date(
Number(baseData.y),
Number(baseData.m)-1,
Number(baseData.d),
Number(baseData.h),
Number(baseData.min)
);

}

/* =====================
시계 포맷
===================== */

function formatClock(date){

let h=date.getHours();
const m=date.getMinutes();

if(clockMode.value==="24"){
return `${h}:${String(m).padStart(2,"0")}`;
}

h=h%12;
if(h===0)h=12;

return `${h}:${String(m).padStart(2,"0")}`;

}

/* =====================
시즌 버튼 생성
===================== */

const seasonContainers={
1:document.getElementById("season1"),
2:document.getElementById("season2"),
3:document.getElementById("season3"),
4:document.getElementById("season4")
};

seasonData.forEach((ep,i)=>{

const btn=document.createElement("button");
btn.textContent=ep.title;
btn.dataset.index=i;

btnMap[i]=btn;

btn.addEventListener("click",()=>{

clearActive();

btn.classList.add("active");

activeIndex=i;

refreshAll();

});

const seasonNumber=Math.floor(i/7)+1;

seasonContainers[seasonNumber].appendChild(btn);

});

/* =====================
active 초기화
===================== */

function clearActive(){

for(const key in btnMap){
btnMap[key].classList.remove("active");
}

}

/* =====================
upcoming 초기화
===================== */

function clearUpcoming(){

for(const key in btnMap){
btnMap[key].classList.remove("upcoming");
}

}

/* =====================
현재 방송 계산
===================== */

function getCurrentIndex(){

const baseDate=getBaseDate();
const baseIndex=parseInt(baseData.ep);

const now=new Date();

let currentTime=new Date(baseDate);
let index=baseIndex;

while(true){

const nextTime=new Date(
currentTime.getTime()+durations[index]*1000
);

if(now<nextTime) break;

currentTime=nextTime;
index=(index+1)%seasonData.length;

}

return index;

}

/* =====================
스케줄 생성
===================== */

function generateSchedule(targetIndex){

const baseDate=getBaseDate();
const baseIndex=parseInt(baseData.ep);

const now=new Date();

let currentTime=new Date(baseDate);
let index=baseIndex;

while(true){

const nextTime=new Date(
currentTime.getTime()+durations[index]*1000
);

if(now<nextTime)break;

currentTime=nextTime;
index=(index+1)%seasonData.length;

}

while(index!==targetIndex){

currentTime=new Date(
currentTime.getTime()+durations[index]*1000
);

index=(index+1)%seasonData.length;

}

let output="";

for(let i=0;i<6;i++){

const idx=(targetIndex+i)%seasonData.length;

if(i>0){

currentTime=new Date(
currentTime.getTime()+durations[(targetIndex+i-1)%seasonData.length]*1000
);

}

const time=formatClock(currentTime);
const title=seasonData[idx].title;

if(outputOrder.value==="title-time"){
output+=`${title}-${time}`;
}else{
output+=`${time}-${title}`;
}

if(i<5)output+=" / ";

}

resultArea.textContent=output;

}

/* =====================
다음 방송 표시
===================== */

function showNextBroadcast(targetIndex){

const baseDate=getBaseDate();
const baseIndex=parseInt(baseData.ep);

const now=new Date();

let currentTime=new Date(baseDate);
let index=baseIndex;

while(true){

const nextTime=new Date(
currentTime.getTime()+durations[index]*1000
);

if(now<nextTime)break;

currentTime=nextTime;
index=(index+1)%seasonData.length;

}

for(let i=0;i<6;i++){

currentTime=new Date(
currentTime.getTime()+durations[index]*1000
);

index=(index+1)%seasonData.length;

}

while(index!==targetIndex){

currentTime=new Date(
currentTime.getTime()+durations[index]*1000
);

index=(index+1)%seasonData.length;

}

const m=currentTime.getMonth()+1;
const d=currentTime.getDate();
const dayName=weekDays[currentTime.getDay()];

const hh=String(currentTime.getHours()).padStart(2,"0");
const mm=String(currentTime.getMinutes()).padStart(2,"0");

nextBroadcast.textContent=
`${seasonData[targetIndex].title} ${m}월 ${d}일 (${dayName}) ${hh}시 ${mm}분`;

}

/* =====================
upcoming 표시
===================== */

function highlightUpcoming(){

clearUpcoming();

const baseDate=getBaseDate();
const baseIndex=parseInt(baseData.ep);

const now=new Date();

let currentTime=new Date(baseDate);
let index=baseIndex;

while(true){

const nextTime=new Date(
currentTime.getTime()+durations[index]*1000
);

if(now<nextTime)break;

currentTime=nextTime;
index=(index+1)%seasonData.length;

}

for(let i=0;i<6;i++){

const target=(index+i)%seasonData.length;
const btn=btnMap[target];

if(btn)btn.classList.add("upcoming");

}

}

/* =====================
복사
===================== */

copyBtn.addEventListener("click",()=>{

navigator.clipboard.writeText(resultArea.textContent);

copyBtn.textContent="복사됨";

setTimeout(()=>{
copyBtn.textContent="복사";
},1000);

});

copyNextBtn.addEventListener("click",()=>{

navigator.clipboard.writeText(nextBroadcast.textContent);

});

/* =====================
옵션 변경
===================== */

clockMode.addEventListener("change",refreshAll);
outputOrder.addEventListener("change",refreshAll);

/* =====================
새로고침
===================== */

function refreshAll(){

highlightUpcoming();

if(activeIndex===null) return;

generateSchedule(activeIndex);
showNextBroadcast(activeIndex);

}

/* =====================
초기화
===================== */

async function init(){

baseData=await loadBaseCloud();

activeIndex=getCurrentIndex();

clearActive();
btnMap[activeIndex].classList.add("active");

refreshAll();

}

init();
