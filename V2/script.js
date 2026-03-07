import { loadBaseCloud } from "./firebase.js";
import { episodes, toSeconds } from "./schedule.js";

const resultArea = document.getElementById("resultArea");
const nextBroadcast = document.getElementById("nextBroadcast");
const copyBtn = document.getElementById("copyBtn");

const durations = episodes.map(e => toSeconds(e.time));

let baseData;


// 기준 방송 시작 시간
function getBaseDate() {

  return new Date(
    baseData.y,
    baseData.m - 1,
    baseData.d,
    baseData.h,
    baseData.min
  );

}


// 현재 방송 찾기
function getCurrent() {

  const baseDate = getBaseDate();
  const baseIndex = parseInt(baseData.ep);

  const now = new Date();

  let time = new Date(baseDate);
  let index = baseIndex;

  while (true) {

    const next = new Date(time.getTime() + durations[index] * 1000);

    if (now < next) break;

    time = next;
    index = (index + 1) % episodes.length;

  }

  return { time, index };

}


// 특정 에피소드 기준 스케줄 생성
function generateSchedule(startIndex) {

  const current = getCurrent();

  let time = new Date(current.time);
  let index = current.index;

  while (index !== startIndex) {

    time = new Date(time.getTime() + durations[index] * 1000);
    index = (index + 1) % episodes.length;

  }

  let output = "";

  for (let i = 0; i < 6; i++) {

    const idx = (startIndex + i) % episodes.length;

    if (i > 0) {

      time = new Date(
        time.getTime() + durations[(startIndex + i - 1) % episodes.length] * 1000
      );

    }

    const h = time.getHours();
    const m = time.getMinutes();

    const title = episodes[idx].title;

    output += `${h}:${String(m).padStart(2, "0")} ${title}`;

    if (i < 5) output += " / ";

  }

  resultArea.textContent = output;

}


// 시즌별 버튼 생성
function buildButtons() {

  const seasons = [
    document.getElementById("season1"),
    document.getElementById("season2"),
    document.getElementById("season3"),
    document.getElementById("season4")
  ];

  episodes.forEach((ep, i) => {

    const btn = document.createElement("button");

    btn.textContent = ep.title;

    btn.onclick = () => generateSchedule(i);

    const season = Math.floor(i / 7);

    seasons[season].appendChild(btn);

  });

}


// 다음 방송 표시
function updateNextBroadcast() {

  const current = getCurrent();

  const nextTime = new Date(
    current.time.getTime() + durations[current.index] * 1000
  );

  const nextIndex = (current.index + 1) % episodes.length;

  const y = nextTime.getFullYear();
  const m = nextTime.getMonth() + 1;
  const d = nextTime.getDate();

  const h = nextTime.getHours();
  const min = nextTime.getMinutes();

  const title = episodes[nextIndex].title;

    nextBroadcast.textContent =
`${m}월 ${d}일 ${h}시 ${String(min).padStart(2,'0')}분 ${title}`;

}


// 복사 버튼
copyBtn.onclick = () => {

  navigator.clipboard.writeText(resultArea.textContent);

};


// 초기 실행
async function init() {

  baseData = await loadBaseCloud();

  buildButtons();

  generateSchedule(baseData.ep);

  updateNextBroadcast();

  setInterval(updateNextBroadcast, 60000);

}


init();