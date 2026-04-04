
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";




const firebaseConfig = {
    apiKey: "AIzaSyA-GCaPNmnX8sG5F2nrp5pstE-h5I11cVI",
    authDomain: "dtc-time.firebaseapp.com",
    projectId: "dtc-time",
    storageBucket: "dtc-time.firebasestorage.app",
    messagingSenderId: "942603970945",
    appId: "1:942603970945:web:2a2c0ad2c4b999bb17e080",
    measurementId: "G-FMZCLM4FJP"
  };
  


  const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function saveBaseCloud(data){
  await setDoc(doc(db, "sync", "base"), data);
}

export async function loadBaseCloud(){
  const snap = await getDoc(doc(db, "sync", "base"));
  return snap.exists() ? snap.data() : null;
}

