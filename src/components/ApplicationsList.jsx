import React, { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { collection, query, onSnapshot, doc, updateDoc,deleteDoc } from "firebase/firestore";
import { useFirebase } from "../context/FirebaseContext";
import ApplicationModal from "./css/dashboard/ApplicationModal";
import "./css/ApplicationsList.css";
import logo from "../../src/components/Applications/logo.png"
import letterpad from "../../src/components/Applications/letterpad.jpg"
const ApplicationsList = ({ type = "pending" }) => {
  const [applications, setApplications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchText, setSearchText] = useState("");

  const { db, user } = useFirebase();
  const verifier = user?.role === "verifiyer" ? user : null;

  // ---------------- Fetch applications ----------------
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "applications"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      setApplications(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, type]);

  // ---------------- Search filter ----------------
  useEffect(() => {
    let apps = [...applications];

    if (searchText.trim() !== "") {
      const s = searchText.toLowerCase();
      apps = apps.filter(
        (app) =>
          app.name?.toLowerCase().includes(s) ||
          app.cnic?.toLowerCase().includes(s) ||
          app.phone?.toLowerCase().includes(s) ||
          app.district?.toLowerCase().includes(s) ||
          app.tehsil?.toLowerCase().includes(s)||
          app.moza?.toLowerCase().includes(s)||
          app.ucNumber?.toLowerCase().includes(s)||
          app.ppNumber?.toLowerCase().includes(s)||
          app.naNumber?.toLowerCase().includes(s)
          // app.serviceType?.toLowerCase().includes(s)
      );
    }

    setFilteredApps(apps);
  }, [applications, searchText]);

  // ---------------- Final filter based on "type" ----------------
  let displayApps = [...filteredApps];

  if (type === "pending") {
    displayApps = displayApps.filter(
      (a) =>
        a.status === "submitted" ||
        a.status === "under_review" ||
        !a.adminStatus // newly created apps have no admin status
    );
  }

  if (type === "approved") {
    displayApps = displayApps.filter((a) => a.status === "approved");
  }

  if (type === "rejected") {
    displayApps = displayApps.filter((a) => a.status === "rejected");
  }

  // ---------------- EXPORTS ----------------
  const handleDownloadExcel = () => {
    const selectedAppsData = displayApps.filter(app => selectedIds.includes(app.id));
  
    if (selectedAppsData.length === 0) {
      return alert("Please select at least one application.");
    }
  
    const exportData = selectedAppsData.map((app) => ({
      // PERSONAL
      ID:app.uniqueId || "",
      Name: app.name || "",
      FatherName: app.fatherName || "",
      Phone: app.phone || "",
      CNIC: app.cnicNumber || app.cnic || "",
      Caste: app.caste || "",
      ShaheedStatus: app.shaheedStatus || "",
      ZakatEligibility: app.zakatEligibility || "",
  
      // ADDRESS
      Address: app.fullAddress || "",
      City: app.city || "",
      District: app.district || "",
      Province: app.province || "",
      Country: app.country || "",
      Tehsil: app.tehsil || "",
      UCNumber: app.ucNumber || "",
  
      // APPLICATION INFO
      ApplicationID: app.applicationId || "",
      Type: app.applicationType || "",
      Status: app.status || "",
      AdminStatus: app.adminStatus || "",
      FamilyMembers: app.familyMembers || "",
      BastiChak: app.bastiChak || "",
      Moza: app.moza || "",
      PPNumber: app.ppNumber || "",
      NANumber: app.naNumber || "",
      ServiceNeeded: app.serviceNeeded || "",
      ServiceType: app.serviceType || "",
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");
  
    XLSX.writeFile(workbook, `${type}-Selected_Applications.xlsx`);
  };
  
  

  // PDF Export
  const handleDownloadPDF = () => {
    const selectedAppsData = filteredApps.filter(app =>
      selectedIds.includes(app.id)
    );
  
    if (selectedAppsData.length === 0) {
      alert("Please select at least one application.");
      return;
    }
  
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
  
    selectedAppsData.forEach((app, index) => {
      if (index !== 0) doc.addPage();
  
      // ---------- ADD LETTER PAD AS FULL PAGE BACKGROUND ----------
      try {
        doc.addImage(letterpad, "JPEG", 0, 0, pageWidth, pageHeight);
      } catch (e) {
        console.error("Letterpad load error:", e);
      }
  
      // ---------- START TABLE BELOW HEADER ----------
      const startY = 60; // adjust depending on header in letterpad
      const rows = [
        ["ID",app.uniqueId||""],
        ["Name", app.name || ""],
        ["Father Name", app.fatherName || ""],
        ["Phone", app.phone || ""],
        ["CNIC", app.cnicNumber || app.cnic || ""],
        ["Caste", app.caste || ""],
        ["Shaheed Status", app.shaheedStatus || ""],
        ["Zakat Eligibility", app.zakatEligibility || ""],
  
        ["Address", app.fullAddress || ""],
        ["City", app.city || ""],
        ["District", app.district || ""],
        ["Province", app.province || ""],
        ["Country", app.country || ""],
        ["Tehsil", app.tehsil || ""],
        ["UC Number", app.ucNumber || ""],
        ["Type", app.applicationType || ""],
        ["Status", app.status || ""],
        ["Admin Status", app.adminStatus || ""],
        ["Family Members", app.familyMembers || ""],
        ["Basti Chak", app.bastiChak || ""],
        ["Moza", app.moza || ""],
        ["PP Number", app.ppNumber || ""],
        ["NA Number", app.naNumber || ""],
        ["Service Needed", app.serviceNeeded || ""],
        ["Service Type", app.serviceType || ""],
      ];
  
      autoTable(doc, {
        body: rows,
        startY: startY,
        theme: "grid",
        styles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 130 },
        },
        margin: { bottom: 40 } // leave space for footer in letterpad
      });
  
      // No need for extra footer; already in letterpad
    });
  
    doc.save(`${type}_Selected_Applications.pdf`);
  };
  
  


  

  // ---------------- Selection logic ----------------
  useEffect(() => {
    if (!applications.length) return setSelectedIds([]);
    const appIds = new Set(applications.map((a) => a.id));
    setSelectedIds((prev) => prev.filter((id) => appIds.has(id)));
  }, [applications]);

  const isAllSelected = useMemo(
    () => selectedIds.length === displayApps.length && displayApps.length > 0,
    [selectedIds, displayApps]
  );

  const toggleSelectAll = () =>
    setSelectedIds(isAllSelected ? [] : displayApps.map((a) => a.id));

  const toggleSelectOne = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );

  // ---------------- Verifier actions ----------------
  const handleVerifierVerify = async (id) => {
    if (!verifier) return alert("Verifier info missing.");
    await updateDoc(doc(db, "applications", id), {
      status: "verified",
      verifierStatus: "verified",
      verifierId: verifier.uid,
      verifierName: verifier.name,
      verifierEmail: verifier.email,
      verifierAt: new Date(),
    });
    setSelectedApp(null);
  };

  const handleVerifierReject = async (id) => {
    if (!verifier) return alert("Verifier info missing.");
    await updateDoc(doc(db, "applications", id), {
      status: "rejected",
      verifierStatus: "rejected",
      verifierId: verifier.uid,
      verifierName: verifier.name,
      verifierEmail: verifier.email,
      verifierAt: new Date(),
    });
    setSelectedApp(null);
  };

  // ---------------- Admin delete for rejected ----------------
const handleDeleteApplications = async () => {
  if (!selectedIds.length) return alert("Select applications to delete");

  if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} application(s)?`)) return;

  try {
    for (const id of selectedIds) {
      await deleteDoc(doc(db, "applications", id));
    }
    alert("Selected applications deleted successfully");
    setSelectedIds([]);
  } catch (err) {
    console.error(err);
    alert("Error deleting applications");
  }
};


  // ---------------- Admin bulk approve/reject ----------------
  const handleAddAdminStatus = async (status) => {
    if (!selectedIds.length) return alert("Select applications first");

    for (const id of selectedIds) {
      await updateDoc(doc(db, "applications", id), {
        adminStatus: status,
        adminAt: new Date(),
        adminId: user?.uid || null,
        adminName: user?.name || null,
        adminEmail: user?.email || null,
        status: status === "approved" ? "approved" : "rejected",
      });
    }

    alert(`Updated admin status to ${status}`);
    setSelectedIds([]);
  };

  if (loading) return <p className="loading">Loading...</p>;

  return (
    <div className="applications-container">
      <h2 className="applications-title">
        {type === "pending" && "Pending Applications"}
        {type === "approved" && "Approved Applications"}
        {type === "rejected" && "Rejected Applications"}
      </h2>

      {/* Search Bar */}
      <div className="filter-row">
        <input
          type="text"
          className="search-input"
          placeholder="Search by name, CNIC, tehsil, district"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {/* Export Buttons */}
      <div className="export-row">
        <button className="pending-excel-btn" onClick={handleDownloadExcel}>
          Download Excel
        </button>
        <button className="pending-pdf-btn" onClick={handleDownloadPDF}>
          Download PDF
        </button>
      </div>

      {/* Bulk admin actions */}
{/* Bulk admin actions */}
{type === "pending" && (
  <div className="admin-actions">
    <button
      className="list-approve-btn"
      disabled={!selectedIds.length}
      onClick={() => handleAddAdminStatus("approved")}
    >
      Approve
    </button>

    <button
      className="list-reject-btn"
      disabled={!selectedIds.length}
      onClick={() => handleAddAdminStatus("rejected")}
    >
      Reject
    </button>

    <button
      className="delete-admin-actions"
      disabled={!selectedIds.length}
      onClick={handleDeleteApplications}
      style={{ marginLeft: "10px" }}
    >
      Delete Selected
    </button>

    <span style={{ marginLeft: "10px" }}>{selectedIds.length} selected</span>
  </div>
)}


{/* Delete button for rejected page */}
{type === "rejected" && (
  <div className="admin-actions">
    <button 
      className="delete-admin-actions"                                                
      disabled={!selectedIds.length}
      onClick={handleDeleteApplications}
    >
      Delete Selected
    </button>
    <span style={{ marginLeft: "10px" }}>{selectedIds.length} selected</span>
  </div>
)}


      {/* Applications Table */}
      {displayApps.length === 0 ? (
        <p className="no-data">No applications found.</p>
      ) : (
        <div className="applications-table-container">
          <table className="applications-table">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" checked={isAllSelected} onChange={toggleSelectAll} />
                </th>
                <th>Name</th>
                <th>ID</th>
                <th>CNIC</th>
                <th>District</th>
                <th>Tehsil</th>
                <th>Moza</th>
    <th>UC</th>
    <th>NA</th>
    <th>PP</th>
    <th>Service Type</th>
                <th>Status</th>
                <th>Admin Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
  {displayApps.map((app) => (
    <tr key={app.id}>
      <td>
        <input
          type="checkbox"
          checked={selectedIds.includes(app.id)}
          onChange={() => toggleSelectOne(app.id)}
        />
      </td>

      <td>{app.name}</td>
      <td>{app.uniqueId || "-"}</td>  {/* Show uniqueId here */}
      <td>{app.cnic}</td>
      <td>{app.district || "-"}</td>
      <td>{app.tehsil || "-"}</td>
      <td>{app.moza || "-"}</td>           {/* Moza */}
      <td>{app.ucNumber || "-"}</td>       {/* UC */}
      <td>{app.naNumber || "-"}</td>       {/* NA */}
      <td>{app.ppNumber || "-"}</td>       {/* PP */}
      <td>{app.serviceType || "-"}</td>  
      <td>{app.status?.toUpperCase() || "-"}</td>
      <td>{app.adminStatus ? app.adminStatus.toUpperCase() : "PENDING"}</td>

      <td>
        <button className="view-btn" onClick={() => setSelectedApp(app)}>
          View
        </button>

        {type === "pending" && verifier && app.status === "under_review" && (
          <>
            <button
              className="approve-btn"
              onClick={() => handleVerifierVerify(app.id)}
            >
              Verify
            </button>

            <button
              className="reject-btn"
              onClick={() => handleVerifierReject(app.id)}
            >
              Reject
            </button>
          </>
        )}
      </td>
    </tr>
  ))}
</tbody>

          </table>
        </div>
      )}

      {/* View Modal */}
      {selectedApp && (
        <ApplicationModal
          selectedApp={selectedApp}
          onClose={() => setSelectedApp(null)}
          type={type}
          verifier={verifier}
          handleVerifierVerify={handleVerifierVerify}
          handleVerifierReject={handleVerifierReject}
        />
      )}
    </div>
  );
};

export default ApplicationsList;
