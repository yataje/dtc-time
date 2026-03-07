import { saveBaseCloud, loadBaseCloud } from "./firebase.js";
import { episodes } from "./episodes.js";

const year=document.getElementById("year");
const month=document.getElementById("month");
const day=document.getElementById("day");
const hour=document.getElementById("hour");
const minute=document.getElementById("minute");
const episode=document.getElementById("episode");

const saveBtn=document.getElementById("saveBtn");
const status=document.getElementById("status");

episodes.forEach((ep,i)=>{
  const opt=document.createElement("option");
  opt.value=i;
  opt.textContent=ep.title;
  episode.appendChild(opt);
});

async function load(){

const cloud=await loadBaseCloud();



if(!cloud) return;

year.value=cloud.y;
month.value=cloud.m;
day.value=cloud.d;
hour.value=cloud.h;
minute.value=cloud.min;
episode.value=cloud.ep;

}

saveBtn.addEventListener("click",async()=>{

const data={
y:Number(year.value),
m:Number(month.value),
d:Number(day.value),
h:Number(hour.value),
min:Number(minute.value),
ep:Number(episode.value)
};

await saveBaseCloud(data);

status.textContent="저장 완료";

});

load();