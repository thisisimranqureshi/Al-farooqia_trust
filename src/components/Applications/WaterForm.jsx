// src/components/Applications/GeneralForm.jsx
import React, { useState } from "react";
import { useFirebase } from "../../context/FirebaseContext";
import { collection, addDoc, Timestamp, query, where, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "../css/GeneralApplicationForm.css";

// ---------------- Dropdown Options ----------------
const categories = ["Hand Pump", "Water Boring", "Water Tank / Tanki", "Filtration Plant","Repair Existing System", "Other"];
const services = ["Individual", "Masjid", "Madrasa", "Government Building", "Educational Institute", "Hospital", "Public Place", "Other"];
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

export default function WaterApplicationForm() {
  const { db, storage, auth } = useFirebase();
  const [form, setForm] = useState({
  applicantCategory: "",
  applicantCategoryOther: "",
  requiredService: "",
  requiredServiceOther: "",
  name: "",
  fatherName: "",
  caste: "",
  phone: "",
  familyMembers: "",
  notes: "",
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
  ucNumber: "",
  naNumber: "",
  ppNumber: "",
  fullAddress: "",
  proofImages: [],
  proofVideo: null,
  latitude: "",   // ✅ Add these two
  longitude: "",
  applicationCategory: "Water"
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
    if (multiple) {
      setForm((prev) => ({ ...prev, [key]: [...prev[key], ...Array.from(e.target.files)] }));
    } else {
      setForm((prev) => ({ ...prev, [key]: e.target.files[0] }));
    }
  };

  // ---------------- capture location ----------------

  const handleCaptureLocation = () => {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      setLocation({ latitude, longitude });
      // Save to form as well
      setField("latitude", latitude);
      setField("longitude", longitude);
    },
    (error) => {
      console.error(error);
      alert("Failed to get location. Make sure location services are enabled.");
    }
  );
};


  // ---------------- Validation ----------------
  const validateForm = () => {
    const nextErrors = {};

    if (!form.applicantCategory) nextErrors.applicantCategory = "Required";
    if (form.applicantCategory === "Other" && !form.applicantCategoryOther) nextErrors.applicantCategoryOther = "Required";
    if (!form.requiredService) nextErrors.requiredService = "Required";
    if (form.requiredService === "Other" && !form.requiredServiceOther) nextErrors.requiredServiceOther = "Required";

    if (!form.name) nextErrors.name = "Required";
    if (!form.fatherName) nextErrors.fatherName = "Required";
    if (!form.caste) nextErrors.caste = "Required";
    const phoneError = validators.phone(form.phone);
    if (phoneError) nextErrors.phone = phoneError;
    const cnicError = validators.cnic(form.cnic);
    if (cnicError) nextErrors.cnic = cnicError;
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
    if (!form.ucNumber) nextErrors.ucNumber = "Required";
    if (!form.naNumber) nextErrors.naNumber = "Required";
    if (!form.ppNumber) nextErrors.ppNumber = "Required";
    if (!form.fullAddress) nextErrors.fullAddress = "Required";

    if (!form.proofImages || form.proofImages.length === 0) nextErrors.proofImages = "At least one proof image required";
    if (!form.proofVideo) nextErrors.proofVideo = "Proof video required";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  // ---------------- Review ----------------
  const handleReview = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    // Check uniqueness for CNIC and phone
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
  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Upload files
      const uploadedFiles = {};

      if (form.proofImages && form.proofImages.length > 0) {
        const storageRef = ref(storage, `applications/${Date.now()}_${form.applicantPhoto.name}`);
        await uploadBytes(storageRef, form.applicantPhoto);
        uploadedFiles.applicantPhotoUrl = await getDownloadURL(storageRef);
      }
      

      if (form.cnicFront) {
        const storageRef = ref(storage, `applications/${Date.now()}_${form.cnicFront.name}`);
        await uploadBytes(storageRef, form.cnicFront);
        uploadedFiles.cnicFrontUrl = await getDownloadURL(storageRef);
      }

      if (form.cnicBack) {
        const storageRef = ref(storage, `applications/${Date.now()}_${form.cnicBack.name}`);
        await uploadBytes(storageRef, form.cnicBack);
        uploadedFiles.cnicBackUrl = await getDownloadURL(storageRef);
      }

      if (form.proofImages.length > 0) {
        uploadedFiles.proofImageUrls = await Promise.all(
          form.proofImages.map(async (file) => {
            const storageRef = ref(storage, `applications/${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            return await getDownloadURL(storageRef);
          })
        );
      }

      if (form.proofVideo) {
        const storageRef = ref(storage, `applications/${Date.now()}_${form.proofVideo.name}`);
        await uploadBytes(storageRef, form.proofVideo);
        uploadedFiles.proofVideoUrl = await getDownloadURL(storageRef);
      }

      // Submit to Firestore
      await addDoc(collection(db, "applications"), {
  applicantCategory: form.applicantCategory,
  applicantCategoryOther: form.applicantCategoryOther,
  requiredService: form.requiredService,
  requiredServiceOther: form.requiredServiceOther,
  name: form.name,
  fatherName: form.fatherName,
  caste: form.caste,
  phone: form.phone,
  familyMembers: form.familyMembers,
  notes: form.notes,
  syed: form.syed,
  zakatEligibility: form.zakatEligibility,
  cnic: form.cnic,
  province: form.province,
  district: form.district,
  tehsil: form.tehsil,
  moza: form.moza,
  basti: form.basti,
  ucNumber: form.ucNumber,
  naNumber: form.naNumber,
  ppNumber: form.ppNumber,
  fullAddress: form.fullAddress,
  latitude: form.latitude,
  longitude: form.longitude,
  ...uploadedFiles,   // only URLs go here
  createdAt: Timestamp.now(),
  createdBy: auth?.currentUser?.uid || null,
  status: "submitted",
});


      alert("Application submitted successfully!");
      setForm({
        applicantCategory: "",
        applicantCategoryOther: "",
        requiredService: "",
        requiredServiceOther: "",
        name: "",
        fatherName: "",
        caste: "",
        phone: "",
        familyMembers: "",
        notes: "",
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
        ucNumber: "",
        naNumber: "",
        ppNumber: "",
        fullAddress: "",
        proofImages: [],
        proofVideo: null,
      });
      setReview(false);
    } catch (err) {
      console.error(err);
      alert("Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
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
  ucNumber: "UC Number / یونین کونسل نمبر",
  naNumber: "NA Numver / NA حلقہ",
  ppNumber: "PP Number / PP حلقہ",
  fullAddress: "Full Address / مکمل پتہ",
};

  // ---------------- Render ----------------
 return review ? (
  <div className="general-container">
    <h2 className="review-title">Review Your Application</h2>

    {/* ---------------- Sections ---------------- */}
    <div className="review-section">
      <h3>Personal Details</h3>
      <div className="review-field"><strong>Name:</strong> {form.name}</div>
      <div className="review-field"><strong>Father Name:</strong> {form.fatherName}</div>
      <div className="review-field"><strong>Caste:</strong> {form.caste}</div>
      <div className="review-field"><strong>Phone:</strong> {form.phone}</div>
      <div className="review-field"><strong>CNIC:</strong> {form.cnic}</div>
      <div className="review-field"><strong>Family Members:</strong> {form.familyMembers}</div>
      <div className="review-field"><strong>Syed Status:</strong> {form.syed}</div>
      <div className="review-field"><strong>Zakat Eligibility:</strong> {form.zakatEligibility}</div>
    </div>

    <div className="review-section">
      <h3>Applicant & Proof Files</h3>
      {form.applicantPhoto && <img src={URL.createObjectURL(form.applicantPhoto)} alt="Applicant" className="review-img" />}
      {form.cnicFront && <img src={URL.createObjectURL(form.cnicFront)} alt="CNIC Front" className="review-img" />}
      {form.cnicBack && <img src={URL.createObjectURL(form.cnicBack)} alt="CNIC Back" className="review-img" />}
      {form.proofImages.length > 0 && (
        <div className="review-proof-images">
          {form.proofImages.map((img, idx) => (
            <img key={idx} src={URL.createObjectURL(img)} alt={`Proof ${idx}`} className="review-img" />
          ))}
        </div>
      )}
      {form.proofVideo && <p><strong>Proof Video:</strong> {form.proofVideo.name}</p>}
    </div>

    <div className="review-section">
      <h3>Service & Location</h3>
      <div className="review-field"><strong>Applicant Category:</strong> {form.applicantCategory} {form.applicantCategoryOther && `(${form.applicantCategoryOther})`}</div>
      <div className="review-field"><strong>Required Service:</strong> {form.requiredService} {form.requiredServiceOther && `(${form.requiredServiceOther})`}</div>
      <div className="review-field"><strong>Province:</strong> {form.province}</div>
      <div className="review-field"><strong>District:</strong> {form.district}</div>
      <div className="review-field"><strong>Tehsil:</strong> {form.tehsil}</div>
      <div className="review-field"><strong>Moza / Basti:</strong> {form.moza} / {form.basti}</div>
      <div className="review-field"><strong>Full Address:</strong> {form.fullAddress}</div>
      {location.latitude && location.longitude && (
        <div className="review-field"><strong>GPS:</strong> {location.latitude}, {location.longitude}</div>
      )}
    </div>

    {/* ---------------- Buttons ---------------- */}
    <div className="review-btn-group">
      <button type="button" className="btn edit" onClick={() => setReview(false)}>
        Edit
      </button>
      <button type="button" className="btn submit" onClick={handleSubmit} disabled={loading}>
        {loading ? "Submitting..." : "Submit"}
      </button>
    </div>
    {/* ---------------- review end after this div| ---------------- */}
  </div>
  
) : (

    

    <div className="general-container">
      <h2 style={{fontSize:40}}>Water Application Form</h2>
      <form className="general-form" onSubmit={handleReview}>
        {/* ---------------- Applicant Category ---------------- */}
        <div className="section">
          <label>Water Service Type</label>
          <div className="button-group">
            {categories.map((c) => (
              <button
                type="button"
                key={c}
                className={`btn-option ${form.applicantCategory === c ? "selected" : ""}`}
                onClick={() => setField("applicantCategory", c)}
              >
                {c}
              </button>
            ))}
          </div>
          {form.applicantCategory === "Other" && (
            <input
              placeholder="Specify Other"
              value={form.applicantCategoryOther}
              onChange={(e) => setField("applicantCategoryOther", e.target.value)}
              className="other-input"
            />
          )}
          <span className="error">{errors.applicantCategory || errors.applicantCategoryOther}</span>
        </div>

        {/* ---------------- Required Service ---------------- */}
        <div className="section">
          <label>Required Service</label>
          <div className="button-group">
            {services.map((s) => (
              <button
                type="button"
                key={s}
                className={`btn-option ${form.requiredService === s ? "selected" : ""}`}
                onClick={() => setField("requiredService", s)}
              >
                {s}
              </button>
            ))}
          </div>
          {form.requiredService === "Other" && (
            <input
              placeholder="Specify Other"
              value={form.requiredServiceOther}
              onChange={(e) => setField("requiredServiceOther", e.target.value)}
              className="other-input"
            />
          )}
          <span className="error">{errors.requiredService || errors.requiredServiceOther}</span>
        </div>

        {/* ---------------- Personal Details ---------------- */}
        <div className="section">
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
        </div>

        {/* ---------------- Syed / Non-Syed ---------------- */}
        <div className="section">
          <label>Syed Status</label>
          <div className="icon-toggle-group">
            {syedOptions.map((option) => (
              <div
                key={option}
                className={`icon-toggle ${form.syed === option ? "active" : ""}`}
                onClick={() => setField("syed", option)}
              >
                <span>{option}</span>
                {form.syed === option && <span className="tick">✔</span>}
              </div>
            ))}
          </div>
          <span className="error">{errors.syed}</span>
        </div>

        {/* ---------------- Zakat Eligibility ---------------- */}
        <div className="section">
          <label>Zakat Eligibility</label>
          <div className="icon-toggle-group">
            {zakatOptions.map((option) => (
              <div
                key={option}
                className={`icon-toggle ${form.zakatEligibility === option ? "active" : ""}`}
                onClick={() => setField("zakatEligibility", option)}
              >
                <span>{option}</span>
                {form.zakatEligibility === option && <span className="tick">✔</span>}
              </div>
            ))}
          </div>
          <span className="error">{errors.zakatEligibility}</span>
        </div>

{/* ---------------- capture location ---------------- */}
        <div className="section">
  <label>Location</label>
  <button type="button" className="btn capture-location" onClick={handleCaptureLocation}>
    Capture Location
  </button>
  {location.latitude && location.longitude && (
    <p>
      Latitude: {location.latitude}, Longitude: {location.longitude}
    </p>
  )}
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
<div className="file-upload-card" onClick={() => document.getElementById("applicantPhoto").click()}>
  {form.applicantPhoto ? form.applicantPhoto.name : "Click to upload Applicant Photo"}
  <input
    type="file"
    id="applicantPhoto"
    accept="image/*"
    style={{ display: "none" }}
    onChange={(e) => handleFileChange(e, "applicantPhoto")}
  />
</div>
{form.applicantPhoto && (
  <img
    src={URL.createObjectURL(form.applicantPhoto)}
    alt="Applicant Preview"
    className="preview-image-small"
  />
)}
<span className="error">{errors.applicantPhoto}</span>


          <label>CNIC Front</label>
<div className="file-upload-card" onClick={() => document.getElementById("cnicFront").click()}>
  {form.cnicFront ? form.cnicFront.name : "Click to upload CNIC Front"}
  <input
    type="file"
    id="cnicFront"
    accept="image/*"
    style={{ display: "none" }}
    onChange={(e) => handleFileChange(e, "cnicFront")}
  />
</div>
{form.cnicFront && (
  <img
    src={URL.createObjectURL(form.cnicFront)}
    alt="CNIC Front Preview"
    className="preview-image-small"
  />
)}
<span className="error">{errors.cnicFront}</span>

<label>CNIC Back</label>
<div className="file-upload-card" onClick={() => document.getElementById("cnicBack").click()}>
  {form.cnicBack ? form.cnicBack.name : "Click to upload CNIC Back"}
  <input
    type="file"
    id="cnicBack"
    accept="image/*"
    style={{ display: "none" }}
    onChange={(e) => handleFileChange(e, "cnicBack")}
  />
</div>
{form.cnicBack && (
  <img
    src={URL.createObjectURL(form.cnicBack)}
    alt="CNIC Back Preview"
    className="preview-image-small"
  />
)}
<span className="error">{errors.cnicBack}</span>

        </div>

        {/* ---------------- Address ---------------- */}
        <div className="section">
          <label>Province</label>
          <select value={form.province} onChange={(e) => setField("province", e.target.value)}>
            <option value="">Select Province</option>
            {Object.keys(provinces).map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <span className="error">{errors.province}</span>

          {form.province && (
            <>
              <label>District</label>
              <select value={form.district} onChange={(e) => setField("district", e.target.value)}>
                <option value="">Select District</option>
                {provinces[form.province].map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
              <span className="error">{errors.district}</span>
            </>
          )}

          {form.district && (
            <>
              <label>Tehsil</label>
              <select value={form.tehsil} onChange={(e) => setField("tehsil", e.target.value)}>
                <option value="">Select Tehsil</option>
                {tehsils[form.district].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <span className="error">{errors.tehsil}</span>
            </>
          )}

          {["moza", "basti", "ucNumber", "naNumber", "ppNumber", "fullAddress"].map((field) => (
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
        <p style={{ fontSize: "0.85rem", color: "#555", marginTop: "4px" }}>
    Please upload proof images captured using our app. The images must have 
    the **location and address overlaid** on them. 
    You can capture them directly from the app
  </p>
        <div className="section">
         <label>Proof Images</label>
<div className="file-upload-card" onClick={() => document.getElementById("proofImages").click()}>
  {form.proofImages.length > 0 ? `${form.proofImages.length} image(s) selected` : "Click to upload proof images"}
  <input
    type="file"
    id="proofImages"
    multiple
    accept="image/*"
    style={{ display: "none" }}
    onChange={(e) => handleFileChange(e, "proofImages", true)}
  />
</div>
<div className="proof-images-preview">
  {form.proofImages.map((img, idx) => (
    <img
      key={idx}
      src={URL.createObjectURL(img)}
      alt={`Proof ${idx}`}
      className="preview-image-small"
    />
  ))}
</div>
<span className="error">{errors.proofImages}</span>


          <label>Proof Video</label>
          <div className="file-upload-card" onClick={() => document.getElementById("proofVideo").click()}>
            {form.proofVideo ? form.proofVideo.name : "Click to upload proof video"}
            <input type="file" id="proofVideo" accept="video/*" style={{ display: "none" }} onChange={(e) => handleFileChange(e, "proofVideo")} />
          </div>
          <span className="error">{errors.proofVideo}</span>
        </div>

        {/* ---------------- Submit ---------------- */}
        <div className="btn-group">
          <button type="submit" className="btn submit" disabled={loading}>
            {loading ? "Checking..." : "Review & Continue"}
          </button>
        </div>
      </form>
    </div>
  );
}
