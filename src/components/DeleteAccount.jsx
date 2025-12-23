import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useFirebase } from "../context/FirebaseContext"; // your Firebase context
import "./css/DeleteAccount.css";

const DeleteAccount = () => {
  const { db, user } = useFirebase(); // get Firestore db and current user from context
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: user?.email || "",
    reason: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    if (!formData.name || !formData.email) {
      setErrorMsg("Name and email are required.");
      setLoading(false);
      return;
    }

    try {
      // Store the deletion request in Firestore
      await addDoc(collection(db, "delete_account_requests"), {
        uid: user?.uid || null,
        name: formData.name,
        email: formData.email,
        reason: formData.reason,
        requestedAt: serverTimestamp(),
      });

      setSuccessMsg("Your request has been submitted successfully.");
      setFormData({ name: "", email: user?.email || "", reason: "" });
    } catch (error) {
      console.error("Error submitting request:", error);
      setErrorMsg("Something went wrong. Please try again later.");
    }

    setLoading(false);
  };

  return (
    <div className="delete-account-container">
      <h2>Request Account Deletion</h2>
      <p>
        Submitting this request will notify us to delete your account and all
        associated data.
      </p>

      <form onSubmit={handleSubmit}>
        <label>
          Full Name:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />
        </label>

        <label>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </label>

        <label>
          Reason for deletion (optional):
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            placeholder="Tell us why you're leaving..."
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Deletion Request"}
        </button>
      </form>

      {successMsg && <p className="success-msg">{successMsg}</p>}
      {errorMsg && <p className="error-msg">{errorMsg}</p>}
    </div>
  );
};

export default DeleteAccount;
