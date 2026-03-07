import { saveBaseCloud, loadBaseCloud } from "./firebase.js";
import { episodes } from "./schedule.js";

const year=document.getElementById("year");
const month=document.getElementById("month");
const day=document.getElementById("day");
const hour=document.getElementById("hour");
const minute=document.getElementById("minute");

const episode=document.getElementById("episode");
const saveBtn=document.getElementById("saveBtn");

episodes.forEach((e,i)=>{

const opt=document.createElement("option");

opt.value=i;
opt.textContent=e.title;

episode.appendChild(opt);

});

async function load(){

const data = await loadBaseCloud();


if(!data) return;

year.value=data.y;
month.value=data.m;
day.value=data.d;
hour.value=data.h;
minute.value=data.min;
episode.value=data.ep;

}

load();

saveBtn.onclick=async()=>{

const data={

y:Number(year.value),
m:Number(month.value),
d:Number(day.value),
h:Number(hour.value),
min:Number(minute.value),
ep:Number(episode.value)

};

await saveBaseCloud(data);


alert("저장 완료");

};