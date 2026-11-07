// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword as raw_createUserWithEmailAndPassword, signInWithEmailAndPassword as raw_signInWithEmailAndPassword, signOut as raw_signOut, onAuthStateChanged as raw_onAuthStateChanged, GoogleAuthProvider, signInWithPopup as raw_signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc as raw_addDoc, getDocs as raw_getDocs, doc, updateDoc as raw_updateDoc, deleteDoc as raw_deleteDoc, query, where, orderBy, serverTimestamp, setDoc as raw_setDoc, getDoc as raw_getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getFunctions, httpsCallable as raw_httpsCallable } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBVtCR6XBaKjIKtPPpo01IWu9e4lrjMRz8",
  authDomain: "ldcalusic.firebaseapp.com",
  projectId: "ldcalusic",
  storageBucket: "ldcalusic.firebasestorage.app",
  messagingSenderId: "570944285695",
  appId: "1:570944285695:web:2f03f657ac0dc04a6015ca",
  measurementId: "G-45Z8FW11FQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);
const analytics = getAnalytics(app);

// Export for use in other files
export { auth, db, functions, analytics, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp, setDoc, getDoc, GoogleAuthProvider, signInWithPopup, httpsCallable };

const loadingTask=(task,label)=>globalThis.appLoading?globalThis.appLoading.track(task,label):task();
const createUserWithEmailAndPassword=(...args)=>loadingTask(()=>raw_createUserWithEmailAndPassword(...args),"Prijava u tijeku…");
const signInWithEmailAndPassword=(...args)=>loadingTask(()=>raw_signInWithEmailAndPassword(...args),"Prijava u tijeku…");
const signOut=(...args)=>loadingTask(()=>raw_signOut(...args),"Odjava…");
const signInWithPopup=(...args)=>loadingTask(()=>raw_signInWithPopup(...args),"Prijava u tijeku…");
const addDoc=(...args)=>loadingTask(()=>raw_addDoc(...args),"Spremanje promjena…");
const getDocs=(...args)=>loadingTask(()=>raw_getDocs(...args),"Učitavanje podataka…");
const updateDoc=(...args)=>loadingTask(()=>raw_updateDoc(...args),"Spremanje promjena…");
const deleteDoc=(...args)=>loadingTask(()=>raw_deleteDoc(...args),"Spremanje promjena…");
const setDoc=(...args)=>loadingTask(()=>raw_setDoc(...args),"Spremanje promjena…");
const getDoc=(...args)=>loadingTask(()=>raw_getDoc(...args),"Učitavanje podataka…");
const httpsCallable=(...args)=>{const call=raw_httpsCallable(...args);return (...data)=>loadingTask(()=>call(...data),'Obrada zahtjeva…');};
function onAuthStateChanged(auth,next,error,completed){const end=globalThis.appLoading?.begin('Provjera prijave…')||(()=>{});const unsub=raw_onAuthStateChanged(auth,async user=>{try{await (typeof next==='function'?next(user):next?.next?.(user));}finally{end();}},e=>{end();if(typeof error==='function')error(e);else next?.error?.(e);},completed);return ()=>{end();unsub();};}
