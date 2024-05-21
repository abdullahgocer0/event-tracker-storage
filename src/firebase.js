// Import the functions you need from the SDKs you need
import { initializeApp } from "../node_modules/firebase/app";
import { getFirestore, collection, addDoc, doc, setDoc, getDoc } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCOBwvkt9EmXCwk3TPK1mFFL1TJjqVQrmA",
  authDomain: "neo-test-tracker.firebaseapp.com",
  projectId: "neo-test-tracker",
  storageBucket: "neo-test-tracker.appspot.com",
  messagingSenderId: "52733911348",
  appId: "1:52733911348:web:9e96f8d442c0366c824561"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, addDoc, collection, doc, setDoc, getDoc };