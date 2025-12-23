import React, { useState } from "react";
import { useFirebase } from "../context/FirebaseContext";
import { collection, addDoc, Timestamp, query, where, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./css/FloodReliefForm.css";

const FloodReliefForm = () => {
  const { db, storage } = useFirebase();

  const [form, setForm] = useState({
    name: "",
    fatherName: "",
    cnic: "",
    phone: "",
    province: "",
    district: "",
    tehsil: "",
    address: "",
    familyMembers: "",
    floodDetails: "",
    houseCondition: "",
    existingItems: "",
    proofImages: [],
  });

  const [review, setReview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ cnic: "", phone: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // Clear error when typing
  };

  const handleFileChange = (e) => {
    // Allow multiple images
    setForm((prev) => ({
      ...prev,
      proofImages: [...prev.proofImages, ...Array.from(e.target.files)],
    }));
  };

  const districts = {
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

  // ✅ Check uniqueness before review
  const handleReview = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({ cnic: "", phone: "" });

    const applicationsRef = collection(db, "applications");

    const cnicQuery = query(applicationsRef, where("cnic", "==", form.cnic));
    const phoneQuery = query(applicationsRef, where("phone", "==", form.phone));

    const [cnicSnapshot, phoneSnapshot] = await Promise.all([
      getDocs(cnicQuery),
      getDocs(phoneQuery),
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

    if (!hasError) {
      setReview(true);
    }
  };

  // ✅ Submit to Firebase
  const handleSubmit = async () => {
    try {
      setLoading(true);

      const uploadedUrls = [];
      for (let file of form.proofImages) {
        const storageRef = ref(storage, `applications/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        uploadedUrls.push(url);
      }

      const applicationsRef = collection(db, "applications");
      await addDoc(applicationsRef, {
        ...form,
        proofImages: uploadedUrls,
        submittedAt: Timestamp.now(),
      });

      setLoading(false);
      alert("Application Submitted Successfully!");
      setForm({
        name: "",
        fatherName: "",
        cnic: "",
        phone: "",
        province: "",
        district: "",
        tehsil: "",
        address: "",
        familyMembers: "",
        floodDetails: "",
        houseCondition: "",
        existingItems: "",
        proofImages: [],
      });
      setReview(false);
    } catch (error) {
      console.error("Error submitting application:", error);
      setLoading(false);
      alert("Failed to submit application. Please try again.");
    }
  };

  return review ? (
    <div className="flood-container">
      <h2 className="title">Review Your Application</h2>
      <div className="review-box">
        {Object.entries(form).map(([key, value]) => {
          if (key === "proofImages") return null;
          return (
            <p key={key}>
              <strong>{key.replace(/([A-Z])/g, " $1")}:</strong> {String(value)}
            </p>
          );
        })}
        <div>
          <strong>Uploaded Proof Images:</strong>
          <ul>
            {form.proofImages.map((file, idx) => (
              <li key={idx}>{file.name}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="btn-group">
        <button type="button" className="btn edit" onClick={() => setReview(false)}>
          Edit
        </button>
        <button type="button" className="btn submit" onClick={handleSubmit} disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  ) : (
    <div className="flood-container">
      <h2 className="title">Flood Relief Application Form</h2>
      <form className="flood-form" onSubmit={handleReview}>
        {["name", "fatherName", "cnic", "phone"].map((field) => (
          <div className="form-group" key={field}>
            <label className="required">{field.replace(/([A-Z])/g, " $1")}</label>
            <input
              name={field}
              value={form[field]}
              onChange={handleChange}
              className={errors[field] ? "error" : ""}
              required
            />
            {errors[field] && <p className="error-text">{errors[field]}</p>}
          </div>
        ))}

        <div className="form-group">
          <label className="required">Province</label>
          <select name="province" value={form.province} onChange={handleChange} required>
            <option value="">Select Province</option>
            <option value="Punjab">Punjab</option>
            <option value="Sindh">Sindh</option>
          </select>
        </div>

        {form.province && (
          <div className="form-group">
            <label className="required">District</label>
            <select name="district" value={form.district} onChange={handleChange} required>
              <option value="">Select District</option>
              {districts[form.province].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        )}

        {form.district && (
          <div className="form-group">
            <label className="required">Tehsil</label>
            <select name="tehsil" value={form.tehsil} onChange={handleChange} required>
              <option value="">Select Tehsil</option>
              {tehsils[form.district].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        )}

        {["address", "familyMembers", "floodDetails", "houseCondition", "existingItems"].map(
          (field) => (
            <div className="form-group" key={field}>
              <label className="required">{field.replace(/([A-Z])/g, " $1")}</label>
              {field === "familyMembers" ? (
                <input type="number" name={field} value={form[field]} onChange={handleChange} required />
              ) : (
                <textarea name={field} value={form[field]} onChange={handleChange} required />
              )}
            </div>
          )
        )}

        <div className="form-group">
          <label className="required">Upload Proof (Images)</label>
          <input type="file" multiple onChange={handleFileChange} />
          {form.proofImages.length > 0 && (
            <ul>
              {form.proofImages.map((file, idx) => (
                <li key={idx}>{file.name}</li>
              ))}
            </ul>
          )}
        </div>

        <button type="submit" className="btn next" disabled={loading}>
          {loading ? "Checking..." : "Review & Continue"}
        </button>
      </form>
    </div>
  );
};

export default FloodReliefForm;




// import React, { useState } from "react";
// import Camera from "react-html5-camera-photo";
// import "react-html5-camera-photo/build/css/index.css";
// import { useFirebase } from "../context/FirebaseContext";
// import {
//   collection,
//   addDoc,
//   Timestamp,
//   query,
//   where,
//   getDocs,
// } from "firebase/firestore";
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import "./css/FloodReliefForm.css";

// const FloodReliefForm = () => {
//   const { db, storage } = useFirebase();

//   const [form, setForm] = useState({
//     name: "",
//     fatherName: "",
//     cnic: "",
//     phone: "",
//     province: "",
//     district: "",
//     tehsil: "",
//     address: "",
//     familyMembers: "",
//     floodDetails: "",
//     houseCondition: "",
//     existingItems: "",
//     proofImages: [], // { url, location }
//   });

//   const [review, setReview] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState({ cnic: "", phone: "" });
//   const [cameraOpen, setCameraOpen] = useState(false);

//   const districts = {
//     Punjab: ["Lahore", "Multan", "Faisalabad", "Gujranwala"],
//     Sindh: ["Karachi", "Sukkur", "Larkana", "Hyderabad"],
//   };

//   const tehsils = {
//     Lahore: ["Lahore City", "Model Town", "Cantt"],
//     Multan: ["Multan City", "Shujabad", "Jalalpur Pirwala"],
//     Faisalabad: ["Lyallpur", "Jaranwala", "Chak Jhumra"],
//     Gujranwala: ["Gujranwala City", "Kamoke", "Wazirabad"],
//     Karachi: ["Karachi East", "Karachi West", "Korangi", "Malir"],
//     Sukkur: ["Sukkur City", "Rohri", "Pano Akil"],
//     Larkana: ["Larkana City", "Ratodero", "Bakrani"],
//     Hyderabad: ["Hyderabad City", "Qasimabad", "Latifabad"],
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//     setErrors((prev) => ({ ...prev, [name]: "" }));
//   };

//   // ✅ CNIC and Phone uniqueness
//   const handleReview = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setErrors({ cnic: "", phone: "" });

//     const applicationsRef = collection(db, "applications");
//     const cnicQuery = query(applicationsRef, where("cnic", "==", form.cnic));
//     const phoneQuery = query(applicationsRef, where("phone", "==", form.phone));

//     const [cnicSnapshot, phoneSnapshot] = await Promise.all([
//       getDocs(cnicQuery),
//       getDocs(phoneQuery),
//     ]);

//     let hasError = false;
//     if (!cnicSnapshot.empty) {
//       setErrors((prev) => ({ ...prev, cnic: "CNIC already exists" }));
//       hasError = true;
//     }
//     if (!phoneSnapshot.empty) {
//       setErrors((prev) => ({ ...prev, phone: "Phone already exists" }));
//       hasError = true;
//     }

//     setLoading(false);
//     if (!hasError) setReview(true);
//   };

//   // ✅ Handle photo capture
//   const handleTakePhoto = async (dataUri) => {
//     try {
//       // Convert base64 to Blob
//       const res = await fetch(dataUri);
//       const blob = await res.blob();

//       // Get geolocation
//       const position = await new Promise((resolve, reject) =>
//         navigator.geolocation.getCurrentPosition(resolve, reject)
//       );
//       const location = {
//         lat: position.coords.latitude,
//         lng: position.coords.longitude,
//       };

//       // Upload to Firebase
//       const storageRef = ref(
//         storage,
//         `applications/${Date.now()}_${Math.random()}.jpg`
//       );
//       await uploadBytes(storageRef, blob);
//       const url = await getDownloadURL(storageRef);

//       setForm((prev) => ({
//         ...prev,
//         proofImages: [...prev.proofImages, { url, location }],
//       }));
//       setCameraOpen(false);
//     } catch (err) {
//       console.error(err);
//       alert(
//         "Failed to get location or upload image. Make sure permissions are allowed and you're on HTTPS."
//       );
//     }
//   };

//   // ✅ Submit application
//   const handleSubmit = async () => {
//     try {
//       setLoading(true);
//       const applicationsRef = collection(db, "applications");
//       await addDoc(applicationsRef, { ...form, submittedAt: Timestamp.now() });
//       setLoading(false);
//       alert("Application Submitted Successfully!");
//       setForm({
//         name: "",
//         fatherName: "",
//         cnic: "",
//         phone: "",
//         province: "",
//         district: "",
//         tehsil: "",
//         address: "",
//         familyMembers: "",
//         floodDetails: "",
//         houseCondition: "",
//         existingItems: "",
//         proofImages: [],
//       });
//       setReview(false);
//     } catch (err) {
//       console.error(err);
//       setLoading(false);
//       alert("Failed to submit application.");
//     }
//   };

//   // ✅ Render
//   return review ? (
//     <div className="flood-container">
//       <h2 className="title">Review Your Application</h2>
//       <div className="review-box">
//         {Object.entries(form).map(([key, value]) => {
//           if (key === "proofImages") return null;
//           return (
//             <p key={key}>
//               <strong>{key.replace(/([A-Z])/g, " $1")}:</strong> {String(value)}
//             </p>
//           );
//         })}
//         <div>
//           <strong>Captured Proof Images & Locations:</strong>
//           <ul>
//             {form.proofImages.map((item, idx) => (
//               <li key={idx}>
//                 <img src={item.url} width={100} /> <br />
//                 Location: {item.location.lat}, {item.location.lng}
//               </li>
//             ))}
//           </ul>
//         </div>
//       </div>

//       <div className="btn-group">
//         <button
//           type="button"
//           className="btn edit"
//           onClick={() => setReview(false)}
//         >
//           Edit
//         </button>
//         <button
//           type="button"
//           className="btn submit"
//           onClick={handleSubmit}
//           disabled={loading}
//         >
//           {loading ? "Submitting..." : "Submit"}
//         </button>
//       </div>
//     </div>
//   ) : (
//     <div className="flood-container">
//       <h2 className="title">Flood Relief Application Form</h2>
//       <form className="flood-form" onSubmit={handleReview}>
//         {["name", "fatherName", "cnic", "phone"].map((field) => (
//           <div className="form-group" key={field}>
//             <label className="required">
//               {field.replace(/([A-Z])/g, " $1")}
//             </label>
//             <input
//               name={field}
//               value={form[field]}
//               onChange={handleChange}
//               className={errors[field] ? "error" : ""}
//               required
//             />
//             {errors[field] && <p className="error-text">{errors[field]}</p>}
//           </div>
//         ))}

//         <div className="form-group">
//           <label className="required">Province</label>
//           <select
//             name="province"
//             value={form.province}
//             onChange={handleChange}
//             required
//           >
//             <option value="">Select Province</option>
//             <option value="Punjab">Punjab</option>
//             <option value="Sindh">Sindh</option>
//           </select>
//         </div>

//         {form.province && (
//           <div className="form-group">
//             <label className="required">District</label>
//             <select
//               name="district"
//               value={form.district}
//               onChange={handleChange}
//               required
//             >
//               <option value="">Select District</option>
//               {districts[form.province].map((d) => (
//                 <option key={d} value={d}>
//                   {d}
//                 </option>
//               ))}
//             </select>
//           </div>
//         )}

//         {form.district && (
//           <div className="form-group">
//             <label className="required">Tehsil</label>
//             <select
//               name="tehsil"
//               value={form.tehsil}
//               onChange={handleChange}
//               required
//             >
//               <option value="">Select Tehsil</option>
//               {tehsils[form.district].map((t) => (
//                 <option key={t} value={t}>
//                   {t}
//                 </option>
//               ))}
//             </select>
//           </div>
//         )}

//         {[
//           "address",
//           "familyMembers",
//           "floodDetails",
//           "houseCondition",
//           "existingItems",
//         ].map((field) => (
//           <div className="form-group" key={field}>
//             <label className="required">{field.replace(/([A-Z])/g, " $1")}</label>
//             {field === "familyMembers" ? (
//               <input
//                 type="number"
//                 name={field}
//                 value={form[field]}
//                 onChange={handleChange}
//                 required
//               />
//             ) : (
//               <textarea
//                 name={field}
//                 value={form[field]}
//                 onChange={handleChange}
//                 required
//               />
//             )}
//           </div>
//         ))}

//         <div className="form-group">
//           <label className="required">Capture Proof Images (Camera + Location)</label>
//           {!cameraOpen && (
//             <button
//               type="button"
//               className="btn"
//               onClick={() => setCameraOpen(true)}
//             >
//               Open Camera
//             </button>
//           )}

//           {cameraOpen && (
//             <div style={{ marginTop: "10px" }}>
//               <Camera
//                 onTakePhoto={(dataUri) => handleTakePhoto(dataUri)}
//                 idealResolution={{ width: 640, height: 480 }}
//                 isFullscreen={false}
//               />
//               <button
//                 type="button"
//                 className="btn"
//                 onClick={() => setCameraOpen(false)}
//                 style={{ marginTop: "5px" }}
//               >
//                 Cancel
//               </button>
//             </div>
//           )}

//           {form.proofImages.length > 0 && (
//             <ul>
//               {form.proofImages.map((item, idx) => (
//                 <li key={idx}>
//                   <img src={item.url} width={80} /> - {item.location.lat},{" "}
//                   {item.location.lng}
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>

//         <button type="submit" className="btn next" disabled={loading}>
//           {loading ? "Checking..." : "Review & Continue"}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default FloodReliefForm;
