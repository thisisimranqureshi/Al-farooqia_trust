import React from "react";
import ApplicationDetails from "./ApplicationDetails";
import "../../css/Applicationmodal.css";

const ApplicationModal = ({
  selectedApp,
  onClose,
  type,
  verifier,
  isAdmin,
  handleVerifierVerify,
  handleVerifierReject,
  handleAdminApprove,
  handleAdminReject,
}) => {
  if (!selectedApp) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-modal"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <h2>Application Details</h2>
        <div className="modal-content scrollable">
          <ApplicationDetails app={selectedApp} />
        </div>

        <div className="modal-actions">
          {type === "pending" && selectedApp.status === "under_review" && verifier && (
            <>
              <button className="verify" onClick={() => handleVerifierVerify(selectedApp.id)}>Verify</button>
              <button className="reject" onClick={() => handleVerifierReject(selectedApp.id)}>Reject</button>
            </>
          )}

          {type === "adminPending" && isAdmin && selectedApp.status === "verified" && (
            <>
              <button className="verify" onClick={() => handleAdminApprove(selectedApp.id)}>Approve</button>
              <button className="reject" onClick={() => handleAdminReject(selectedApp.id)}>Reject</button>
            </>
          )}

          <button className="close" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationModal;
