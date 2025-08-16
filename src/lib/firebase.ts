
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  projectId: "finsight-analyzer-hmg6h",
  appId: "1:22001911686:web:490ecff71849ff95700e07",
  storageBucket: "finsight-analyzer-hmg6h.firebasestorage.app",
  apiKey: "AIzaSyDTK25Jq8BVYzAJzvgpiWc8rbf2Hp_23NU",
  authDomain: "finsight-analyzer-hmg6h.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "22001911686",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
