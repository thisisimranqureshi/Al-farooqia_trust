// SignIn.js
import React from "react";
import { useFirebase } from "../context/FirebaseContext"; 

function SignIn() {
  const { signUpWithGoogle } = useFirebase();

  const handleSignIn = () => {
    signUpWithGoogle().catch((err) => console.error(err));
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <button
        onClick={handleSignIn}
        className="p-4 bg-amber-800 text-white rounded"
      >
        Sign in with Google
      </button>
    </div>
  );
}

export default SignIn;
