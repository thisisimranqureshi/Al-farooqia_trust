import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useFirebase } from '../../../context/FirebaseContext';
import ApplicationModal from "../../css/dashboard/ApplicationModal.jsx"
import "../../css/ApprovedApplication.css";
import * as XLSX from "xlsx";
import letterpad from "../../Applications/letterpad.jpg"
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { doc, deleteDoc } from "firebase/firestore";

const ApprovedApplications = () => {
  const { db } = useFirebase();
  const [selectedIds, setSelectedIds] = useState([]);

  const [applications, setApplications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Fetch approved applications
  useEffect(() => {
    const q = query(collection(db, "applications"), where("status", "==", "approved"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setApplications(apps);
    });
    return () => unsubscribe();
  }, [db]);
  const handleDeleteApplications = async () => {
    if (!selectedIds.length) return alert("Please select applications to delete.");

    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} application(s)?`)) return;

    try {
      for (const id of selectedIds) {
        await deleteDoc(doc(db, "applications", id));
      }
      alert("Selected applications deleted successfully.");
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
      alert("Error deleting applications.");
    }
  };

  // Filter applications based on search text
  useEffect(() => {
    let apps = [...applications];

    if (searchText.trim() !== "") {
      const s = searchText.toLowerCase();

      apps = apps.filter(app => {
        const addressString = [
          app.fullAddress, app.moza, app.basti,
          app.tehsil, app.district, app.province,
          app.postalCode
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return (
          (app.name && app.name.toLowerCase().includes(s)) ||
          (app.cnic && app.cnic.toLowerCase().includes(s)) ||
          (app.phone && app.phone.toLowerCase().includes(s)) ||
          addressString.includes(s)
        );
      });
    }

    setFilteredApps(apps);
  }, [applications, searchText]);

  const handleAddGrantClick = (app) => {
    setSelectedApp(app);
    setShowModal(true);
  };

  // Excel Export
  const downloadExcel = () => {
    const selectedAppsData = filteredApps.filter(app =>
      selectedIds.includes(app.id)
    );
  
    if (selectedAppsData.length === 0) {
      alert("Please select at least one application.");
      return;
    }
  
    const excelData = selectedAppsData.map(app => ({
      // PERSONAL INFO
      ID:app.uniqueId || "",
      Name: app.name || "",
      FatherName: app.fatherName || "",
      Phone: app.phone || "",
      CNIC: app.cnicNumber || app.cnic || "",
      Caste: app.caste || "",
      ShaheedStatus: app.shaheedStatus || "",
      ZakatEligibility: app.zakatEligibility || "",
  
      // ADDRESS INFO
      Address: app.fullAddress || "",
      City: app.city || "",
      District: app.district || "",
      Province: app.province || "",
      Country: app.country || "",
      Tehsil: app.tehsil || "",
      UCNumber: app.ucNumber || "",
  
      // APPLICATION DETAILS
      
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
  
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Applications");
  
    XLSX.writeFile(wb, "Selected_Applications.xlsx");
  };
  
  


  const handleDownloadPDF = () => {
    const selectedAppsData = filteredApps.filter(app =>
      selectedIds.includes(app.id)
    );
  
    if (selectedAppsData.length === 0) {
      alert("Please select at least one application.");
      return;
    }
  
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
  
    selectedAppsData.forEach((app, index) => {
      if (index !== 0) doc.addPage();
  
      // ---- ADD LETTER PAD IMAGE ----
      // Use the whole width of the page, adjust height as needed
      doc.addImage(letterpad, "JPEG", 0, 0, pageWidth, pageHeight);
  
      // ---- START TABLE BELOW HEADER ----
      // Adjust startY depending on header size in letterpad
      const startY = 60; // e.g., leave 60px space for header
  
      const rows = [
        ["Id",app.uniqueId || ""],
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
        margin: { top: 0, bottom: 40 }, // leave space for footer in letterpad
      });
  
      // No need to add separate footer; it's already in your letterpad
    });
  
    doc.save("Selected_Applications.pdf");
  };
  
  
  
  

  return (
    <div>
      <h2>Approved Applications</h2>

      {/* Search */}
      <div style={{ marginBottom: "15px" }}>
        <input
          type="text"
          placeholder="Search by name or CNIC"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ padding: "5px 10px", width: "100%", maxWidth: "400px" }}
        />
      </div>

      {/* Export Buttons */}
      <button onClick={downloadExcel}>Download Excel</button>
      <button onClick={handleDownloadPDF}>Download PDF</button>
      <button
          onClick={handleDeleteApplications}
          disabled={selectedIds.length === 0}
          style={{ marginLeft: "10px", backgroundColor: "red", color: "white" }}
        >
          Delete Selected
        </button>

      <div className="approved-applications-table-container">
        <table className="approved-applications-table">
        <thead>
  <tr>
    <th>
      <input
        type="checkbox"
        onChange={(e) => {
          if (e.target.checked) {
            setSelectedIds(filteredApps.map(a => a.id));
          } else {
            setSelectedIds([]);
          }
        }}
        checked={
          selectedIds.length === filteredApps.length && filteredApps.length > 0
        }
      />
    </th>

    <th>Name</th>
    <th>ID</th>
    <th>CNIC</th>
    <th>Phone</th>
    <th>Tehsil</th>
    <th>District</th>
    <th>Moza</th>
    <th>UC</th>
    <th>NA</th>
    <th>PP</th>
    <th>Service Type</th>
    <th>Actions</th>
  </tr>
</thead>


          <tbody>
            {filteredApps.map(app => {
              return (
                <tr key={app.id}>
                  <td>
  <input
    type="checkbox"
    checked={selectedIds.includes(app.id)}
    onChange={(e) => {
      if (e.target.checked) {
        setSelectedIds(prev => [...prev, app.id]);
      } else {
        setSelectedIds(prev => prev.filter(id => id !== app.id));
      }
    }}
  />
</td>

                  <td>{app.name}</td>
                  <td>{app.uniqueId}</td>
                  <td>{app.cnic}</td>
                  <td>{app.phone}</td>
                  <td>{app.tehsil || "-"}</td>
                  <td>{app.district || "-"}</td>
                  <td>{app.moza || "-"}</td>
                  <td>{app.ucNumber || "-"}</td>
                  <td>{app.naNumber || "-"}</td>
                  <td>{app.ppNumber || "-"}</td>
                  <td>{app.serviceType || "-"}</td>
                  

                  {/* VIEW BUTTON (same functionality as ApplicationList.jsx) */}
                  <td>
                    <button
                      className="view-btn"
                      onClick={() => {
                        setSelectedApp(app);
                        setShowModal(true);
                      }}
                    >
                      View
                    </button>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* VIEW MODAL */}
      {showModal && selectedApp && (
        <ApplicationModal
          selectedApp={selectedApp}
          onClose={() => setShowModal(false)}
          type="approved"
          verifier={null}
          handleVerifierVerify={() => {}}
          handleVerifierReject={() => {}}
        />
      )}
    </div>
  );
};

export default ApprovedApplications;
