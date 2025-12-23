import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useFirebase } from "../context/FirebaseContext";
import ApplicationDetails from "./css/dashboard/ApplicationDetails";

const ApplicationReview = () => {
  const { id } = useParams();
  const { db } = useFirebase();
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const ref = doc(db, "applications", id);
      const snap = await getDoc(ref);
      if (snap.exists()) setData(snap.data());
    };
    fetchData();
  }, [id, db]);

  const handleApprove = async () => {
    await updateDoc(doc(db, "applications", id), { status: "approved" });
    alert("Application approved!");
    navigate("/dashboard/applications/pending");
  };

  const handleReject = async () => {
    await updateDoc(doc(db, "applications", id), { status: "rejected" });
    alert("Application rejected!");
    navigate("/dashboard/applications/pending");
  };

  if (!data) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
    <h2>Application Review</h2>
    <ApplicationDetails app={data} />

    <div style={{ marginTop: "20px" }}>
      <button onClick={handleApprove} className="btn btn-success" style={{ marginRight: "10px" }}>
        Approve
      </button>
      <button onClick={handleReject} className="btn btn-danger">
        Reject
      </button>
    </div>
  </div>
  );
};

export default ApplicationReview;
