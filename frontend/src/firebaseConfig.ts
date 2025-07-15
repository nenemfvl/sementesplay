import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAm7P5DMB8KY5snKflviigQfm8a97gMsR8",
  authDomain: "sementesplay-87159.firebaseapp.com",
  projectId: "sementesplay-87159",
  storageBucket: "sementesplay-87159.appspot.com",
  messagingSenderId: "448092780821",
  appId: "1:448092780821:web:1f6ac44b5279e780ac5c",
  measurementId: "G-HC9JWL6V4Y"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); 