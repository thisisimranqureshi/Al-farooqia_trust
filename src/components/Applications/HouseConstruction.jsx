// src/components/Applications/HouseConstructionForm.jsx
import React, { useState } from "react";
import { useFirebase } from "../../context/FirebaseContext";
import { collection, addDoc, Timestamp, query, where, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "../css/GeneralApplicationForm.css";

// ---------------- Options ----------------
const syedOptions = ["Syed", "Non-Syed"];
const zakatOptions = ["Eligible for Zakat", "Not Eligible for Zakat"];
const provinces = {
  Punjab: ["Lahore", "Multan", "Faisalabad", "Gujranwala"],
  Sindh: ["Karachi", "Sukkur", "Larkana", "Hyderabad"],
};
const tehsils = {
  Lahore: ["Lahore City", "Model Town", "Cantt"],
  Multan: ["Multan City", "Shujabad", "Jalalpur Pirwala"],
  Faisalabad: ["Lyallpur", "Jaranwala", "Chak Jhumra"],
  Gujranwala: ["Gujranwala City", "Kamoke", "Wazirabad"],
  Karachi: ["Karachi East", "Karachi West", "Korangi", "Malir"],
  Sukkur: ["Sukkur City", "Rohri", "Pano Akil"],
  Larkana: ["Larkana City", "Ratodero", "Bakrani"],
  Hyderabad: ["Hyderabad City", "Qasimabad", "Latifabad"],
};
 const labelNames = {
  name: "Applicant Name / نام",
  fatherName: "Father's Name / والد کا نام",
  caste: "Cast / Caste / ذات / برادری",
  phone: "Mobile Number / فون نمبر",
  familyMembers: "Number of Family Members / گھرانے کےافراد ",
  notes: "Additional Notes / تفصیل اختیاری",
};

const addressLabels = {
  moza: "Moza / موضع ",
  basti: "Basti / بستی  ",
  UCNumber: "UC Number / یونین کونسل نمبر",
  NANumber: "NA Numver / NA حلقہ",
 PPNumber: "PP Number / PP حلقہ",
  fullAddress: "Full Address / مکمل پتہ",
};


const generateUniqueId = () => {
  const now = new Date();

  // Format date as DD-MM-YYYY
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
  const year = now.getFullYear();

  // You can use a counter or a random number for uniqueness
  const random = String(Math.floor(Math.random() * 100)).padStart(2, "0"); // 00-99

  return `${day}-${month}-${year}_${random}`;
};

// Example
console.log(generateUniqueId()); // "10-12-2025_42"


// ---------------- Validators ----------------
const validators = {
  required: (v) => (!v ? "Required" : ""),
  phone: (v) => {
    if (!v) return "Required";
    if (!/^((\+92)|0)?3\d{9}$/.test(v)) return "Enter valid Pakistan mobile number";
    return "";
  },
  cnic: (v) => {
    if (!v) return "Required";
    const normalized = v.replace(/[^0-9]/g, "");
    if (normalized.length !== 13) return "CNIC must contain 13 digits";
    return "";
  },
};

export default function HouseConstructionForm() {
  const { db, storage, auth } = useFirebase();

  const [form, setForm] = useState({
    name: "",
    fatherName: "", 
    caste: "",
    phone: "",
    familyMembers: "",
    syed: "",
    zakatEligibility: "",
    cnic: "",
    applicantPhoto: null,
    cnicFront: null,
    cnicBack: null,
    province: "",
    district: "",
    tehsil: "",
    moza: "",
    basti: "",
    UCNumber: "",      // ← add this
    NANumber: "",      // ← add this
    PPNumber: "",      // ← add this
    fullAddress: "",
    proofImages: [],
    proofVideo: null,
    latitude: "",
    longitude: "",
    applicationCategory: "House Construction",
  });

  const [errors, setErrors] = useState({});
  const [review, setReview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState({ latitude: "", longitude: "" });

  // ---------------- Handlers ----------------
  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleFileChange = (e, key, multiple = false) => {
    if (multiple) setForm((prev) => ({ ...prev, [key]: [...prev[key], ...Array.from(e.target.files)] }));
    else setForm((prev) => ({ ...prev, [key]: e.target.files[0] }));
  };

  const handleCaptureLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation is not supported by your browser");
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setLocation({ latitude, longitude });
        setField("latitude", latitude);
        setField("longitude", longitude);
      },
      (err) => alert("Failed to get location: " + err.message)
    );
  };

  // ---------------- Validation ----------------
  const validateForm = () => {
    const nextErrors = {};
    if (!form.name) nextErrors.name = "Required";
    if (!form.fatherName) nextErrors.fatherName = "Required";
    if (!form.caste) nextErrors.caste = "Required";
    if (validators.phone(form.phone)) nextErrors.phone = validators.phone(form.phone);
    if (validators.cnic(form.cnic)) nextErrors.cnic = validators.cnic(form.cnic);
    if (!form.familyMembers) nextErrors.familyMembers = "Required";
    if (!form.syed) nextErrors.syed = "Required";
    if (!form.zakatEligibility) nextErrors.zakatEligibility = "Required";
    if (!form.applicantPhoto) nextErrors.applicantPhoto = "Applicant photo required";
    if (!form.cnicFront) nextErrors.cnicFront = "CNIC front required";
    if (!form.cnicBack) nextErrors.cnicBack = "CNIC back required";
    if (!form.province) nextErrors.province = "Required";
    if (!form.district) nextErrors.district = "Required";
    if (!form.tehsil) nextErrors.tehsil = "Required";
    if (!form.moza) nextErrors.moza = "Required";
    if (!form.basti) nextErrors.basti = "Required";
    if (!form.fullAddress) nextErrors.fullAddress = "Required";
    if (!form.proofImages.length) nextErrors.proofImages = "At least one proof image required";
    if (!form.proofVideo) nextErrors.proofVideo = "Proof video required";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  // ---------------- Review ----------------
  const handleReview = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const applicationsRef = collection(db, "applications");

    const [cnicSnapshot, phoneSnapshot] = await Promise.all([
      getDocs(query(applicationsRef, where("cnic", "==", form.cnic))),
      getDocs(query(applicationsRef, where("phone", "==", form.phone))),
    ]);

    let hasError = false;
    if (!cnicSnapshot.empty) {
      setErrors((prev) => ({ ...prev, cnic: "CNIC already exists" }));
      hasError = true;
    }
    if (!phoneSnapshot.empty) {
      setErrors((prev) => ({ ...prev, phone: "Phone already exists" }));
      hasError = true;
    }

    setLoading(false);
    if (!hasError) setReview(true);
  };

  // ---------------- Submit ----------------
  // Upload a single file and get its download URL
const uploadFile = async (file) => {
  const storageRef = ref(storage, `applications/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};

const handleSubmit = async () => {
  try {
    setLoading(true);
    const uploadedFiles = {};

    if (form.applicantPhoto) uploadedFiles.applicantPhotoUrl = await uploadFile(form.applicantPhoto);
    if (form.cnicFront) uploadedFiles.cnicFrontUrl = await uploadFile(form.cnicFront);
    if (form.cnicBack) uploadedFiles.cnicBackUrl = await uploadFile(form.cnicBack);
    if (form.proofImages.length) uploadedFiles.proofImageUrls = await Promise.all(
      form.proofImages.map(uploadFile)
    );
    if (form.proofVideo) uploadedFiles.proofVideoUrl = await uploadFile(form.proofVideo);

    // Build Firestore data manually, excluding raw File objects
    const firestoreData = {
      uniqueId: generateUniqueId(),
      name: form.name,
      fatherName: form.fatherName,
      caste: form.caste,
      phone: form.phone,
      familyMembers: form.familyMembers,
      syed: form.syed,
      zakatEligibility: form.zakatEligibility,
      cnic: form.cnic,
      province: form.province,
      district: form.district,
      tehsil: form.tehsil,
      moza: form.moza,
      basti: form.basti,
      fullAddress: form.fullAddress,
      latitude: form.latitude,
      longitude: form.longitude,
      ucNumber:form.UCNumber,
      ppNumber:form.PPNumber,
      naNumber:form.NANumber,
      applicationCategory: form.applicationCategory,
      ...uploadedFiles,       // Only include uploaded URLs
      createdAt: Timestamp.now(),
      createdBy: auth?.currentUser?.uid || null,
      status: "submitted",
    };

    await addDoc(collection(db, "applications"), firestoreData);

    alert("Application submitted successfully!");
  } catch (err) {
    console.error(err);
    alert("Failed to submit application: " + err.message);
  } finally {
    setLoading(false);
  }
};



  // ---------------- Render ----------------
  return review ? (
    <div className="general-container">
      <h2 className="review-title">Review Your House Construction Application</h2>

      <div className="review-section">
        <h3>Personal Details</h3>
        <div><strong>Name:</strong> {form.name}</div>
        <div><strong>Father Name:</strong> {form.fatherName}</div>
        <div><strong>Caste:</strong> {form.caste}</div>
        <div><strong>Phone:</strong> {form.phone}</div>
        <div><strong>CNIC:</strong> {form.cnic}</div>
        <div><strong>Family Members:</strong> {form.familyMembers}</div>
        <div><strong>Syed Status:</strong> {form.syed}</div>
        <div><strong>Zakat Eligibility:</strong> {form.zakatEligibility}</div>
      </div>

      <div className="review-section">
        <h3>Applicant & Proof Files</h3>
        {form.applicantPhoto && <img src={URL.createObjectURL(form.applicantPhoto)} alt="Applicant" className="review-img" />}
        {form.cnicFront && <img src={URL.createObjectURL(form.cnicFront)} alt="CNIC Front" className="review-img" />}
        {form.cnicBack && <img src={URL.createObjectURL(form.cnicBack)} alt="CNIC Back" className="review-img" />}
        {form.proofImages.length > 0 && form.proofImages.map((img, idx) => <img key={idx} src={URL.createObjectURL(img)} alt={`Proof ${idx}`} className="review-img" />)}
        {form.proofVideo && <p><strong>Proof Video:</strong> {form.proofVideo.name}</p>}
      </div>

      <div className="review-section">
        <h3>Address & Location</h3>
        <div><strong>Province:</strong> {form.province}</div>
        <div><strong>District:</strong> {form.district}</div>
        <div><strong>Tehsil:</strong> {form.tehsil}</div>
        <div><strong>Moza / Basti:</strong> {form.moza} / {form.basti}</div>
        <div><strong>Uc Number:</strong> {form.UCNumber}</div>
        <div><strong>PP Number:</strong> {form.PPNumber}</div>
        <div><strong>NA Number:</strong> {form.NANumber}</div>
        <div><strong>Full Address:</strong> {form.fullAddress}</div>
        {location.latitude && location.longitude && <div><strong>GPS:</strong> {location.latitude}, {location.longitude}</div>}
      </div>

      <div className="review-btn-group">
        <button type="button" className="btn edit" onClick={() => setReview(false)}>Edit</button>
        <button type="button" className="btn submit" onClick={handleSubmit} disabled={loading}>{loading ? "Submitting..." : "Submit"}</button>
      </div>
    </div>
  ) : (
    <div className="general-container">
      <h2 style={{fontSize:40}}>House Construction Application Form</h2>
      <form className="general-form" onSubmit={handleReview}>
        {/* ---------------- Personal Details ---------------- */}
          {["name", "fatherName", "caste", "phone", "familyMembers", "notes"].map((field) => (
    <div key={field}>
      <label>{labelNames[field]}</label>

      {field === "notes" ? (
        <textarea
          value={form[field]}
          onChange={(e) => setField(field, e.target.value)}
        />
      ) : (
        <input
          value={form[field]}
          onChange={(e) => setField(field, e.target.value)}
        />
      )}

      {errors[field] && <span className="error">{errors[field]}</span>}
    </div>
  ))}

        {/* ---------------- Syed / Zakat ---------------- */}
        <div className="section">
          <label>Syed Status</label>
          <div className="icon-toggle-group">
            {syedOptions.map((opt) => (
              <div key={opt} className={`icon-toggle ${form.syed === opt ? "active" : ""}`} onClick={() => setField("syed", opt)}>
                <span>{opt}</span>{form.syed === opt && <span className="tick">✔</span>}
              </div>
            ))}
          </div>
          <span className="error">{errors.syed}</span>
        </div>

        <div className="section">
          <label>Zakat Eligibility</label>
          <div className="icon-toggle-group">
            {zakatOptions.map((opt) => (
              <div key={opt} className={`icon-toggle ${form.zakatEligibility === opt ? "active" : ""}`} onClick={() => setField("zakatEligibility", opt)}>
                <span>{opt}</span>{form.zakatEligibility === opt && <span className="tick">✔</span>}
              </div>
            ))}
          </div>
          <span className="error">{errors.zakatEligibility}</span>
        </div>

        {/* ---------------- CNIC ---------------- */}
        <div className="section">
          <label>CNIC</label>
          <input placeholder="CNIC" value={form.cnic} onChange={(e) => setField("cnic", e.target.value)} />
          <span className="error">{errors.cnic}</span>
        </div>

        {/* ---------------- File Uploads ---------------- */}
        <div className="section">
          <label>Applicant Photo</label>
          <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "applicantPhoto")} />
          {form.applicantPhoto && <img src={URL.createObjectURL(form.applicantPhoto)} alt="Applicant Preview" className="preview-image-small" />}
          <span className="error">{errors.applicantPhoto}</span>

          <label>CNIC Front</label>
          <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "cnicFront")} />
          {form.cnicFront && <img src={URL.createObjectURL(form.cnicFront)} alt="CNIC Front" className="preview-image-small" />}
          <span className="error">{errors.cnicFront}</span>

          <label>CNIC Back</label>
          <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "cnicBack")} />
          {form.cnicBack && <img src={URL.createObjectURL(form.cnicBack)} alt="CNIC Back" className="preview-image-small" />}
          <span className="error">{errors.cnicBack}</span>
        </div>

        {/* ---------------- Address ---------------- */}
        <div className="section">
          <label>Province</label>
          <select value={form.province} onChange={(e) => setField("province", e.target.value)}>
            <option value="">Select Province</option>
            {Object.keys(provinces).map((p) => <option key={p}>{p}</option>)}
          </select>
          <span className="error">{errors.province}</span>

          {form.province && (
            <>
              <label>District</label>
              <select value={form.district} onChange={(e) => setField("district", e.target.value)}>
                <option value="">Select District</option>
                {provinces[form.province].map((d) => <option key={d}>{d}</option>)}
              </select>
              <span className="error">{errors.district}</span>
            </>
          )}

          {form.district && (
            <>
              <label>Tehsil</label>
              <select value={form.tehsil} onChange={(e) => setField("tehsil", e.target.value)}>
                <option value="">Select Tehsil</option>
                {tehsils[form.district].map((t) => <option key={t}>{t}</option>)}
              </select>
              <span className="error">{errors.tehsil}</span>
            </>
          )}

          {["moza", "basti", "UCNumber", "NANumber", "PPNumber", "fullAddress"].map((field) => (
  <div key={field}>
    <label>{addressLabels[field]}</label>

    <input 
      value={form[field]} 
      onChange={(e) => setField(field, e.target.value)} 
    />

    <span className="error">{errors[field]}</span>
  </div>
))}
        </div>

        {/* ---------------- Proof Files ---------------- */}
        <div className="section">
          <label>Proof Images</label>
          <input type="file" multiple accept="image/*" onChange={(e) => handleFileChange(e, "proofImages", true)} />
          <div className="proof-images-preview">{form.proofImages.map((img, idx) => <img key={idx} src={URL.createObjectURL(img)} alt={`Proof ${idx}`} className="preview-image-small" />)}</div>
          <span className="error">{errors.proofImages}</span>

          <label>Proof Video</label>
          <input type="file" accept="video/*" onChange={(e) => handleFileChange(e, "proofVideo")} />
          <span className="error">{errors.proofVideo}</span>
        </div>

        {/* ---------------- Capture Location ---------------- */}
        <div className="section">
          <button type="button" className="btn capture-location" onClick={handleCaptureLocation}>Capture Location</button>
          {location.latitude && location.longitude && <p>Latitude: {location.latitude}, Longitude: {location.longitude}</p>}
        </div>

        {/* ---------------- Submit ---------------- */}
        <div className="btn-group">
          <button type="submit" className="btn submit" disabled={loading}>{loading ? "Checking..." : "Review & Continue"}</button>
        </div>
      </form>
    </div>
  );
}
