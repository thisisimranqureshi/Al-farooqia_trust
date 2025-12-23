import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useFirebase } from "../context/FirebaseContext";

const VerifierList = () => {
  const { db } = useFirebase();
  const [verifiers, setVerifiers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    setLoading(true);

    const q = query(collection(db, "users"), where("role", "==", "verfiyer"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

      setVerifiers(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  const handleDeleteVerifier = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this verifier?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "users", id));
      alert("Verifier deleted successfully.");
    } catch (err) {
      console.error(err);
      alert("Error deleting verifier.");
    }
  };

  const handleUpdatePassword = async (id) => {
    if (!newPassword.trim()) {
      alert("Password cannot be empty.");
      return;
    }

    try {
      await updateDoc(doc(db, "users", id), {
        password: newPassword.trim(),
      });

      alert("Password updated successfully!");
      setEditingId(null);
      setNewPassword("");
    } catch (err) {
      console.error(err);
      alert("Error updating password.");
    }
  };

  if (loading) return <p>Loading verifiers...</p>;
  if (verifiers.length === 0) return <p>No verifiers found.</p>;

  return (
    <div style={{ padding: "20px", background: "#fff", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
      <h2>Verifiers</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "15px" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
            <th>Name</th>
            <th>Email</th>
            <th>Password</th>
            <th>District</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {verifiers.map((v) => (
            <tr key={v.id} style={{ borderBottom: "1px solid #eee" }}>
              <td>{v.name}</td>
              <td>{v.email}</td>

              <td>
                {editingId === v.id ? (
                  <>
                    <input
                      type="text"
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{ padding: "4px", width: "120px" }}
                    />
                    <button
                      onClick={() => handleUpdatePassword(v.id)}
                      style={{
                        marginLeft: "6px",
                        padding: "4px 8px",
                        background: "green",
                        color: "#fff",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <>
                    {v.password || "-"}
                    {/* <button
                      onClick={() => setEditingId(v.id)}
                      style={{
                        marginLeft: "8px",
                        padding: "4px 8px",
                        background: "blue",
                        color: "#fff",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Update
                    </button> */}
                  </>
                )}
              </td>

              <td>{v.district || "-"}</td>
              <td>{v.createdAt?.seconds ? new Date(v.createdAt.seconds * 1000).toLocaleString() : "-"}</td>

              <td>
                <button
                  style={{
                    background: "red",
                    color: "#fff",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                  onClick={() => handleDeleteVerifier(v.id)}
                >
                  Delete
                </button>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VerifierList;
