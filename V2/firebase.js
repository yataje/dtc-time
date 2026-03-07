import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "xxxxx",
  authDomain: "xxxxx",
  projectId: "xxxxx",
  storageBucket: "xxxxx",
  messagingSenderId: "xxxxx",
  appId: "xxxxx"
};

const app = initializeApp(firebaseConfig);

// 핵심 수정
const db = getDatabase(app, "https://dtc-time-default-rtdb.firebaseio.com");

export async function loadBaseCloud(){

  const snapshot = await get(ref(db,"dtc/base"));

  if(snapshot.exists()){
    return snapshot.val();
  }

  return null;
}

export async function saveBaseCloud(data){

  await set(ref(db,"dtc/base"),data);

}