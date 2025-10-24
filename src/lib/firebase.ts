
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, reauthenticateWithCredential, EmailAuthProvider, updateEmail, updatePassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "uncoverly-hub",
  "appId": "1:506136237998:web:06fd0145a782cbd4865a3f",
  "storageBucket": "uncoverly-hub.appspot.com",
  "apiKey": "AIzaSyC2bLv4_Mqcnfw-eaztHlwTatGlWtlWe1Q",
  "authDomain": "uncoverly-hub.firebaseapp.com",
  "messagingSenderId": "506136237998"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);


export const updateUserCredentials = async (currentPassword: string, newEmail?: string, newPassword?: string) => {
    const user = auth.currentUser;
    if (!user || !user.email) {
        throw new Error("No user is currently signed in.");
    }

    // Re-authenticate the user
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // After re-authentication, update email and/or password
    if (newEmail && newEmail !== user.email) {
        await updateEmail(user, newEmail);
    }
    if (newPassword) {
        await updatePassword(user, newPassword);
    }
};
