import React from "react";
import "./css/PopupModal.css";

const PopupModal = ({ visible, onClose, downloadUrl }) => {
  if (!visible) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <h2>Download Required</h2>
        <p>To apply for Widow Application, please download our mobile app.</p>

        <a href={downloadUrl} className="download-btn" download>
          Download Mobile App
        </a>

        <button className="close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default PopupModal;
