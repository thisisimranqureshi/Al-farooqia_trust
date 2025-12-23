import React, { useState } from "react";
import { useFirebase } from "../context/FirebaseContext";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const CreateVerifier = () => {
  const { auth, db } = useFirebase();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    district: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateVerifier = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!form.name || !form.email || !form.password || !form.district) {
      setMsg("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      // 1. Create user in Firebase Auth
      const userCred = await createUserWithEmailAndPassword(
        auth,
        form.email.trim(),
        form.password.trim()
      );

      const uid = userCred.user.uid;

      // 2. Save user document to Firestore INCLUDING password
      await setDoc(doc(db, "users", uid), {
        name: form.name.trim(),
        email: form.email.trim(),
        district: form.district.trim(),
        role: "verfiyer",
        createdAt: new Date(),
        password: form.password.trim(),   // ⭐ ADD THIS LINE ⭐
      });

      setMsg("Verifier account created successfully!");

      // Reset form
      setForm({ name: "", email: "", password: "", district: "" });
    } catch (err) {
      console.error(err);
      setMsg(err.message || "Error creating verifier");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-verifier-container">
      <h2>Create Verifier</h2>

      {msg && <p>{msg}</p>}

      <form onSubmit={handleCreateVerifier} className="verifier-form">
        <label>Name</label>
        <input name="name" value={form.name} onChange={handleChange} required />

        <label>Email</label>
        <input name="email" value={form.email} onChange={handleChange} type="email" required />

        <label>Password</label>
        <input name="password" value={form.password} onChange={handleChange} type="password" required />

        <label>District</label>
        <input name="district" value={form.district} onChange={handleChange} required />

        <button disabled={loading} className="align-middle">
          {loading ? "Creating..." : "Create Verifier"}
        </button>
      </form>
    </div>
  );
};

export default CreateVerifier;
