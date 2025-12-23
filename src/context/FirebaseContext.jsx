// src/context/FirebaseContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAfU8zs3K1vj4ukHa4bhCgdr8UN1DE2VvE",
  authDomain: "al-farooqia.firebaseapp.com",
  projectId: "al-farooqia",
  storageBucket: "al-farooqia.firebasestorage.app",
  messagingSenderId: "949267314575",
  appId: "1:949267314575:web:6775afcfe4c4547a47fdfa"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

const FirebaseContext = createContext();

export const FirebaseProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to user state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

   // SIGNUP
  const signup = async (email, password, additionalData = {}) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Optional: update display name
    if (additionalData.displayName) {
      await updateProfile(userCredential.user, {
        displayName: additionalData.displayName
      });
    }

    return userCredential.user;
  };

  const logout = () => signOut(auth);

  const signUpWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  return (
    <FirebaseContext.Provider
      value={{ db, storage, auth, user, loading, login, logout, signUpWithGoogle, signup }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => useContext(FirebaseContext);
