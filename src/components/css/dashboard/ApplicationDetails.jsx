import React, { useState } from "react";
import "../../css/Applicationsdetail.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import letterpad from "../../Applications/letterpad.jpg";
import html2canvas from "html2canvas";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { getStorage, ref, getDownloadURL,getBlob  } from "firebase/storage";
import { useFirebase } from "../../../context/FirebaseContext";

const ApplicationDetails = ({ app }) => {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState([]);
  const { storage } = useFirebase(); // get Firebase storage instance


  if (!app) return <p>No data available</p>;

  // Prepare media fields with type
  const mediaFields = [];

  if (app.selfieUrl)
    mediaFields.push({ url: app.selfieUrl, label: "Selfie", type: "image" });
  if (app.cnicFrontUrl)
    mediaFields.push({
      url: app.cnicFrontUrl,
      label: "CNIC Front",
      type: "image",
    });
  if (app.cnicBackUrl)
    mediaFields.push({
      url: app.cnicBackUrl,
      label: "CNIC Back",
      type: "image",
    });
  (app.proofImageUrls || []).forEach((url, i) =>
    mediaFields.push({ url, label: `Proof Image ${i + 1}`, type: "image" })
  );
  if (app.proofVideoUrl)
    mediaFields.push({
      url: app.proofVideoUrl,
      label: "Proof Video",
      type: "video",
    });

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prevMedia = () =>
    setLightboxIndex(
      (prev) => (prev - 1 + mediaFields.length) % mediaFields.length
    );
  const nextMedia = () =>
    setLightboxIndex((prev) => (prev + 1) % mediaFields.length);
    const convertImagesToBase64 = async (container) => {
      const images = container.querySelectorAll("img");
    
      const originalSrcMap = new Map();
    
      for (let img of images) {
        try {
          const src = img.src;
          originalSrcMap.set(img, src);
    
          const res = await fetch(src);
          const blob = await res.blob();
    
          const reader = new FileReader();
          const base64 = await new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
    
          img.src = base64;
        } catch (e) {
          console.warn("Image skipped:", img.src);
        }
      }
    
      return originalSrcMap;
    };
    

  const loadImageAsBase64 = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };

      img.onerror = (e) => reject(e);
      img.src = url;
    });
  };

  // PDF Generation
  const downloadPDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Add letterpad background
    try {
      doc.addImage(letterpad, "JPEG", 0, 0, pageWidth, pageHeight);
    } catch (e) {
      console.error("Letterpad load error:", e);
    }

    let y = 60; // start below letterpad header

    // ---------- Personal Info ----------

    const personalInfo = [
      ["uniqueId", app.uniqueId || ""],
      ["Name", app.name || ""],
      ["Father Name", app.fatherName || ""],
      ["Phone", app.phone || ""],
      ["CNIC", app.cnicNumber || app.cnic || ""],
      ["Caste", app.caste || ""],
      ["Shaheed Status", app.shaheedStatus || ""],
      ["Zakat Eligibility", app.zakatEligibility || ""],
    ];

    autoTable(doc, {
      startY: y,
      body: personalInfo,
      margin: { top: 0, bottom: 10 },
      styles: { fontSize: 9 },
    });
    y = doc.lastAutoTable.finalY + 5;

    // ---------- Location ----------

    const locationInfo = [
      ["Address", app.fullAddress || ""],
      ["City", app.city || ""],
      ["District", app.district || ""],
      ["Province", app.province || ""],
      ["Country", app.country || ""],
      ["Tehsil", app.tehsil || ""],
      ["UC Number", app.ucNumber || ""],
    ];

    autoTable(doc, {
      startY: y,
      body: locationInfo,
      margin: { top: 0, bottom: 10 },
      styles: { fontSize: 9 },
    });
    y = doc.lastAutoTable.finalY + 5;

    // ---------- Application Info ----------

    const appInfo = [
      ["Application ID", app.applicationId || ""],
      ["Type", app.applicationType || ""],
      ["Status", app.status || ""],
      ["Admin Status", app.adminStatus || ""],
      ["Family Members", app.familyMembers || ""],
      ["Basti Chak", app.bastiChak || ""],
      ["Moza", app.moza || ""],
      ["PP Number", app.ppNumber || ""],
      ["NA Number", app.naNumber || ""],
      ["Service Needed", app.serviceNeeded || ""],
      ["Service Type", app.serviceType || ""][("Notes", app.notes || "--")],
    ];

    autoTable(doc, {
      startY: y,

      body: appInfo,
      margin: { top: 0, bottom: 10 },
      styles: { fontSize: 9 },
    });
    y = doc.lastAutoTable.finalY + 5;

    // ---------- Verifier Info ----------
    if (app.verifierInfo) {
      y += 100;
      doc.text("Verifier", 100, y);
      y += 20;

      const verifierInfo = [
        ["Name", app.verifierInfo.name || ""],
        ["Email", app.verifierInfo.email || ""],
        ["Phone", app.verifierInfo.phone || ""],
        ["Role", app.verifierInfo.role || ""],
        ["Decision", app.verifierInfo.decision || ""],
        ["Remarks", app.verifierInfo.verifierRemarks || ""],
        [
          "Decided At",
          app.verifierInfo.decidedAt
            ? new Date(
                app.verifierInfo.decidedAt.seconds * 1000
              ).toLocaleString()
            : "",
        ],
      ];

      autoTable(doc, {
        startY: y,
        body: verifierInfo,
        margin: { top: 0, top: 10 },
        styles: { fontSize: 9 },
      });
    }

    //  ---------- Images Section ----------
    for (let i = 0; i < mediaFields.length; i++) {
      const media = mediaFields[i];
      if (media.type !== "image") continue;

      try {
        const imgBase64 = await loadImageAsBase64(media.url);

        if (y + 80 > pageHeight) {
          doc.addPage();
          y = 20;
        }

        doc.text(media.label, 14, y);
        y += 5;

        doc.addImage(imgBase64, "JPEG", 14, y, 80, 60);
        y += 70;
      } catch (err) {
        console.error("Image failed:", err);
      }
    }

    doc.save(`${app.name || "applicant"}_details.pdf`);
  };
  const downloadScreenshotPDF = async () => {
    const element = document.querySelector(".application-details-container");
    if (!element) return;
  
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  
    // 🔥 convert images to base64
    const originalImages = await convertImagesToBase64(element);
  
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: "#fff",
      useCORS: false,
      allowTaint: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      onclone: (doc) => {
        doc.querySelectorAll("video").forEach(v => v.remove());
        doc.querySelectorAll("button").forEach(b => b.style.display = "none");
      }
    });
  
    // restore original images
    originalImages.forEach((src, img) => {
      img.src = src;
    });
  
    document.body.style.overflow = originalOverflow;
  
    const imgData = canvas.toDataURL("image/png");
  
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
  
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
  
    let heightLeft = imgHeight;
    let position = 0;
  
    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;
  
    while (heightLeft > 0) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }
  
    pdf.save(`${app.name || "application"}_screenshot.pdf`);
  };

 
  
  
  
  
  

  return (
    <div className="application-details-container">
      <button
        onClick={downloadScreenshotPDF}
        style={{
          marginBottom: "15px",
          marginLeft: "10px",
          padding: "10px 20px",
          backgroundColor: "#28a745",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Download Screenshot PDF
      </button>

      <button
        onClick={downloadPDF}
        style={{
          marginBottom: "15px",
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Download PDF
      </button>

      {/* Personal Info */}
      <div className="detail_section">
        <strong>
          <h1>Personal Information</h1>
        </strong>
        {app.name && (
          <div className="row">
            <strong>Name:</strong> {app.name}
          </div>
        )}
        {app.fatherName && (
          <div className="row">
            <strong>Father Name:</strong> {app.fatherName}
          </div>
        )}
        {app.phone && (
          <div className="row">
            <strong>Phone:</strong> {app.phone}
          </div>
        )}
        {(app.cnicNumber || app.cnic) && (
          <div className="row">
            <strong>CNIC:</strong> {app.cnicNumber || app.cnic}
          </div>
        )}
        {app.caste && (
          <div className="row">
            <strong>Caste:</strong> {app.caste}
          </div>
        )}
        {app.shaheedStatus && (
          <div className="row">
            <strong>Shaheed Status:</strong> {app.shaheedStatus}
          </div>
        )}
        {app.zakatEligibility && (
          <div className="row">
            <strong>Zakat Eligibility:</strong> {app.zakatEligibility}
          </div>
        )}
        {app.uniqueId && (
          <div className="row">
            <strong>ID:</strong> {app.uniqueId}
          </div>
        )}
      </div>

      {/* Location */}
      <div className="detail_section">
        <strong>
          <h3>Location</h3>
        </strong>
        {app.fullAddress && (
          <div className="row">
            <strong>Address:</strong> {app.fullAddress}
          </div>
        )}
        {app.city && (
          <div className="row">
            <strong>City:</strong> {app.city}
          </div>
        )}
        {app.district && (
          <div className="row">
            <strong>District:</strong> {app.district}
          </div>
        )}
        {app.province && (
          <div className="row">
            <strong>Province:</strong> {app.province}
          </div>
        )}
        {app.country && (
          <div className="row">
            <strong>Country:</strong> {app.country}
          </div>
        )}
        {app.tehsil && (
          <div className="row">
            <strong>Tehsil:</strong> {app.tehsil}
          </div>
        )}
        {app.ucNumber && (
          <div className="row">
            <strong>UC Number:</strong> {app.ucNumber}
          </div>
        )}
      </div>

      {/* Application Info */}
      <div className="detail_section">
        <strong>
          <h1>Application Information</h1>
        </strong>
        {app.applicationId && (
          <div className="row">
            <strong>Application ID:</strong> {app.applicationId}
          </div>
        )}
        {app.applicationType && (
          <div className="row">
            <strong>Type:</strong> {app.applicationType}
          </div>
        )}
        {app.status && (
          <div className="row">
            <strong>Status:</strong> {app.status}
          </div>
        )}
        {app.adminStatus && (
          <div className="row">
            <strong>Admin Status:</strong> {app.adminStatus}
          </div>
        )}
        {app.familyMembers && (
          <div className="row">
            <strong>Family Members:</strong> {app.familyMembers}
          </div>
        )}
        {app.bastiChak && (
          <div className="row">
            <strong>Basti Chak:</strong> {app.bastiChak}
          </div>
        )}
        {app.moza && (
          <div className="row">
            <strong>Moza:</strong> {app.moza}
          </div>
        )}
        {app.ppNumber && (
          <div className="row">
            <strong>PP Number:</strong> {app.ppNumber}
          </div>
        )}
        {app.naNumber && (
          <div className="row">
            <strong>NA Number:</strong> {app.naNumber}
          </div>
        )}
        {app.serviceNeeded && (
          <div className="row">
            <strong>Service Needed:</strong> {app.serviceNeeded}
          </div>
        )}
        {app.serviceType && (
          <div className="row">
            <strong>Service Type:</strong> {app.serviceType}
          </div>
        )}
        {app.notes && (
          <div className="row">
            <strong>Notes:</strong> {app.notes}
          </div>
        )}
      </div>

      {/* Media */}
      {mediaFields.length > 0 && (
       <div className="application-media-section">
       {mediaFields.map((m, i) =>
         <div key={i} style={{ display: "inline-block", margin: "10px", textAlign: "center" }}>
           {m.type === "image" ? (
             <img
               src={m.url}
               alt={m.label}
               className="media-img"
               onClick={() => openLightbox(i)}
               style={{ display: "block", width: "200px", height: "auto", cursor: "pointer" }}
             />
           ) : (
             <video
               src={m.url}
               className="video-player"
               controls
               style={{ display: "block", width: "200px", cursor: "pointer" }}
               onClick={() => openLightbox(i)}
             />
           )}
           
        
         </div>
       )}
     </div>
     
      )}



      {/* Verifier Info */}
      {app.verifierInfo && (
        <div className="section">
          <strong>
            <h3>Verifier Information</h3>
          </strong>
          {app.verifierInfo.name && (
            <div className="row">
              <strong>Name:</strong> {app.verifierInfo.name}
            </div>
          )}
          {app.verifierInfo.email && (
            <div className="row">
              <strong>Email:</strong> {app.verifierInfo.email}
            </div>
          )}
          {app.verifierInfo.phone && (
            <div className="row">
              <strong>Phone:</strong> {app.verifierInfo.phone}
            </div>
          )}
          {app.verifierInfo.role && (
            <div className="row">
              <strong>Role:</strong> {app.verifierInfo.role}
            </div>
          )}
          {app.verifierInfo.decision && (
            <div className="row">
              <strong>Decision:</strong> {app.verifierInfo.decision}
            </div>
          )}
          {app.verifierInfo.verifierRemarks && (
            <div className="row">
              <strong>Remarks:</strong> {app.verifierInfo.verifierRemarks}
            </div>
          )}
          {app.verifierInfo.decidedAt && (
            <div className="row">
              <strong>Decided At:</strong>{" "}
              {new Date(
                app.verifierInfo.decidedAt.seconds * 1000
              ).toLocaleString()}
            </div>
          )}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div className="media-lightbox">
          <span className="close-btn" onClick={closeLightbox}>
            &times;
          </span>
          <span className="prev-btn" onClick={prevMedia}>
            &#10094;
          </span>
          <span className="next-btn" onClick={nextMedia}>
            &#10095;
          </span>
          {mediaFields[lightboxIndex].type === "image" ? (
            <img
              src={mediaFields[lightboxIndex].url}
              alt={mediaFields[lightboxIndex].label}
            />
          ) : (
            <video src={mediaFields[lightboxIndex].url} controls autoPlay />
          )}
        </div>
      )}
    </div>
  );
};

export default ApplicationDetails;
