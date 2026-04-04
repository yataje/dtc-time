import { loadBaseByChannel } from "./firebase.js";

/* =====================
채널 선택
===================== */

const CHANNEL_STORAGE_KEY = "dtc_selected_channel";
const channelRadios = document.querySelectorAll('input[name="channelType"]');

let selectedChannel = localStorage.getItem(CHANNEL_STORAGE_KEY) || "chzzk";

let seasonData = [];
let durations = [];

/* =====================
채널별 시즌 개수
===================== */

const seasonLayout = {
  chzzk: [7, 7, 7, 7],
  youtube: [9, 6, 7, 7]
};

function syncChannelRadios() {
  channelRadios.forEach(radio => {
    radio.checked = radio.value === selectedChannel;
  });
}

async function loadChannelData(channel) {
  const path = channel === "youtube" ? "./youtube.js" : "./chzzk.js";
  const mod = await import(path);

  seasonData = mod.episodes;
  durations = seasonData.map(ep => toSeconds(ep.time));
}

/* =====================
유틸
===================== */

function toSeconds(str) {
  const [h, m, s] = str.split(":").map(Number);
  return h * 3600 + m * 60 + s;
}

const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

/* =====================
DOM
===================== */

const resultArea = document.getElementById("resultArea");
const copyBtn = document.getElementById("copyBtn");
const copyNextBtn = document.getElementById("copyNextBtn");

const clockMode = document.getElementById("clockMode");
const outputOrder = document.getElementById("outputOrder");

const nextBroadcast = document.getElementById("nextBroadcast");

const btnMap = {};

/* =====================
Firebase 기준 데이터
===================== */

let baseData = null;
let activeIndex = null;

/* =====================
기준 날짜
===================== */

function getBaseDate() {
  return new Date(
    Number(baseData.y),
    Number(baseData.m) - 1,
    Number(baseData.d),
    Number(baseData.h),
    Number(baseData.min)
  );
}

/* =====================
시계 포맷
===================== */

function formatClock(date) {
  let h = date.getHours();
  const m = date.getMinutes();

  if (clockMode.value === "24") {
    return `${h}:${String(m).padStart(2, "0")}`;
  }

  h = h % 12;
  if (h === 0) h = 12;

  return `${h}:${String(m).padStart(2, "0")}`;
}

/* =====================
버튼 렌더링
===================== */

const seasonContainers = {
  1: document.getElementById("season1"),
  2: document.getElementById("season2"),
  3: document.getElementById("season3"),
  4: document.getElementById("season4")
};

function clearRenderedButtons() {
  for (const key in seasonContainers) {
    seasonContainers[key].innerHTML = "";
  }

  for (const key in btnMap) {
    delete btnMap[key];
  }
}

function renderButtons() {
  clearRenderedButtons();

  const layout = seasonLayout[selectedChannel] || [7, 7, 7, 7];
  let startIndex = 0;

  layout.forEach((count, seasonNumber) => {
    const container = seasonContainers[seasonNumber + 1];
    if (!container) return;

    const slice = seasonData.slice(startIndex, startIndex + count);

    slice.forEach((ep, localIndex) => {
      const globalIndex = startIndex + localIndex;

      const btn = document.createElement("button");
      btn.textContent = ep.title;
      btn.dataset.index = globalIndex;

      btnMap[globalIndex] = btn;

      btn.addEventListener("click", () => {
        clearActive();
        btn.classList.add("active");
        activeIndex = globalIndex;
        refreshAll();
      });

      container.appendChild(btn);
    });

    startIndex += count;
  });
}

/* =====================
상태 초기화
===================== */

function clearActive() {
  for (const key in btnMap) {
    btnMap[key].classList.remove("active");
  }
}

function clearUpcoming() {
  for (const key in btnMap) {
    btnMap[key].classList.remove("upcoming");
  }
}

/* =====================
현재 방송 계산용 공통 계산
===================== */

function getCurrentProgress() {
  const baseDate = getBaseDate();
  const baseIndex = parseInt(baseData.ep, 10);
  const now = new Date();

  let currentTime = new Date(baseDate);
  let index = baseIndex;

  while (true) {
    const nextTime = new Date(currentTime.getTime() + durations[index] * 1000);

    if (now < nextTime) break;

    currentTime = nextTime;
    index = (index + 1) % seasonData.length;
  }

  return { currentTime, index };
}

function getCurrentIndex() {
  return getCurrentProgress().index;
}

/* =====================
스케줄 생성
===================== */

function generateSchedule(targetIndex) {
  const progress = getCurrentProgress();

  let currentTime = new Date(progress.currentTime);
  let index = progress.index;

  while (index !== targetIndex) {
    currentTime = new Date(currentTime.getTime() + durations[index] * 1000);
    index = (index + 1) % seasonData.length;
  }

  let output = "";

  for (let i = 0; i < 6; i++) {
    const idx = (targetIndex + i) % seasonData.length;

    if (i > 0) {
      currentTime = new Date(
        currentTime.getTime() + durations[(targetIndex + i - 1) % seasonData.length] * 1000
      );
    }

    const time = formatClock(currentTime);
    const title = seasonData[idx].title;

    if (outputOrder.value === "title-time") {
      output += `${title}-${time}`;
    } else {
      output += `${time}-${title}`;
    }

    if (i < 5) output += " / ";
  }

  resultArea.textContent = output;
}

/* =====================
다음 방송
===================== */

function showNextBroadcast(targetIndex) {
  const progress = getCurrentProgress();

  let currentTime = new Date(progress.currentTime);
  let index = progress.index;

  for (let i = 0; i < 6; i++) {
    currentTime = new Date(currentTime.getTime() + durations[index] * 1000);
    index = (index + 1) % seasonData.length;
  }

  while (index !== targetIndex) {
    currentTime = new Date(currentTime.getTime() + durations[index] * 1000);
    index = (index + 1) % seasonData.length;
  }

  const m = currentTime.getMonth() + 1;
  const d = currentTime.getDate();
  const dayName = weekDays[currentTime.getDay()];
  const hh = String(currentTime.getHours()).padStart(2, "0");
  const mm = String(currentTime.getMinutes()).padStart(2, "0");

  nextBroadcast.textContent =
    `${seasonData[targetIndex].title} ${m}월 ${d}일 (${dayName}) ${hh}시 ${mm}분`;
}

/* =====================
upcoming
===================== */

function highlightUpcoming() {
  clearUpcoming();

  const progress = getCurrentProgress();
  const startIndex = progress.index;

  for (let i = 0; i < 6; i++) {
    const target = (startIndex + i) % seasonData.length;
    const btn = btnMap[target];
    if (btn) btn.classList.add("upcoming");
  }
}

/* =====================
출력 초기화
===================== */

function clearOutputs() {
  resultArea.textContent = "";
  nextBroadcast.textContent = "";
  activeIndex = null;
  clearActive();
  clearUpcoming();
}

/* =====================
이벤트
===================== */

copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(resultArea.textContent);
});

copyNextBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(nextBroadcast.textContent);
});

clockMode.addEventListener("change", refreshAll);
outputOrder.addEventListener("change", refreshAll);

channelRadios.forEach(radio => {
  radio.addEventListener("change", async (e) => {
    selectedChannel = e.target.value;
    localStorage.setItem(CHANNEL_STORAGE_KEY, selectedChannel);
    await rebuild();
  });
});

/* =====================
리빌드
===================== */

async function rebuild() {
  await loadChannelData(selectedChannel);
  baseData = await loadBaseByChannel(selectedChannel);

  renderButtons();

  if (!baseData || !seasonData.length) {
    clearOutputs();
    return;
  }

  const maxIndex = seasonData.length - 1;
  const baseEp = Number(baseData.ep);

  if (baseEp < 0 || baseEp > maxIndex) {
    activeIndex = 0;
  } else {
    activeIndex = getCurrentIndex();
  }

  clearActive();
  if (btnMap[activeIndex]) {
    btnMap[activeIndex].classList.add("active");
  }

  refreshAll();
}

/* =====================
새로고침
===================== */

function refreshAll() {
  if (!baseData || !seasonData.length) {
    clearOutputs();
    return;
  }

  highlightUpcoming();

  if (activeIndex === null) return;

  generateSchedule(activeIndex);
  showNextBroadcast(activeIndex);
}

/* =====================
초기화
===================== */

async function init() {
  syncChannelRadios();
  await rebuild();
}

init();