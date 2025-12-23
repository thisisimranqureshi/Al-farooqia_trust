import React, { useEffect, useState, useMemo } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { useFirebase } from '../../../context/FirebaseContext';
// import "./css/ApplicationsList.css";

const PendingApplications = ({ currentUser }) => {
  const { db } = useFirebase();
  const [applications, setApplications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const q = query(collection(db, "applications"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Only pending applications
      apps = apps.filter(a => a.status === "under_review");
      setApplications(apps);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  // Filter applications based on search text
  useEffect(() => {
    let apps = [...applications];
    if (searchText.trim() !== "") {
      const lowerSearch = searchText.toLowerCase();
      apps = apps.filter(
        app =>
          (app.name && app.name.toLowerCase().includes(lowerSearch)) ||
          (app.phone && app.phone.toLowerCase().includes(lowerSearch))
      );
    }
    setFilteredApps(apps);
  }, [applications, searchText]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="applications-container">
      <h2>Pending Applications</h2>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search by name or phone"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ padding: "5px 10px", width: "100%", maxWidth: "400px", marginBottom: "15px" }}
      />

      {filteredApps.length === 0 ? (
        <p>No applications found.</p>
      ) : (
        <table className="applications-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Father Name</th>
              <th>Phone</th>
              <th>District</th>
              <th>Tehsil</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredApps.map(app => (
              <tr key={app.id}>
                <td>{app.name}</td>
                <td>{app.fatherName}</td>
                <td>{app.phone}</td>
                <td>{app.district}</td>
                <td>{app.tehsil}</td>
                <td>{app.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PendingApplications;
