import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD0tBqi0Et7ngh1vSKXvMPC5ke31uD9yn4",
  authDomain: "sementesplay-49cf0.firebaseapp.com",
  projectId: "sementesplay-49cf0",
  storageBucket: "sementesplay-49cf0.appspot.com",
  messagingSenderId: "137476416460",
  appId: "1:137476416460:web:998dfcd668208e478880a1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); 