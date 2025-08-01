// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "uncoverly-hub",
  "appId": "1:506136237998:web:06fd0145a782cbd4865a3f",
  "storageBucket": "uncoverly-hub.firebasestorage.app",
  "apiKey": "AIzaSyC2bLv4_Mqcnfw-eaztHlwTatGlWtlWe1Q",
  "authDomain": "uncoverly-hub.firebaseapp.com",
  "messagingSenderId": "506136237998"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
