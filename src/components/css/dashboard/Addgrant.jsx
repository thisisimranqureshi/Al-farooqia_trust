import React, { useState } from "react";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { useFirebase } from '../../../context/FirebaseContext';
import * as XLSX from "xlsx";
import "../../css/Addgrant.css";

const AddGrantModal = ({ application, onClose }) => {
  const { db } = useFirebase();
  const [totalAmount, setTotalAmount] = useState("");
  const [installments, setInstallments] = useState([{ amount: "", dueDate: "" }]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentIndex, setPaymentIndex] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState({ name: "", bankName: "", accountNumber: "" });

  const handleAddInstallment = () => {
    setInstallments([...installments, { amount: "", dueDate: "" }]);
  };

  const handleInstallmentChange = (index, field, value) => {
    const updated = [...installments];
    updated[index][field] = value;
    setInstallments(updated);
  };




  const handleSaveGrant = async () => {
    const grantData = {
      totalAmount: Number(totalAmount),
      remainingAmount: Number(totalAmount),
      installments: installments.map(i => ({ ...i, paid: false, paymentDetails: {} })),
    };

    await updateDoc(doc(db, "applications", application.id), {
      grants: arrayUnion(grantData),
    });

    onClose();
  };

  // Excel download
  const downloadExcel = () => {
    const rows = [];
    application.grants?.forEach((grant, gIndex) => {
      grant.installments.forEach((inst) => {
        rows.push({
          "Grant #": gIndex + 1,
          "Total Amount": grant.totalAmount,
          "Remaining Amount": grant.remainingAmount,
          "Installment Amount": inst.amount,
          "Status": inst.paid ? "PAID" : "PENDING",
          "Paid By": inst.paymentDetails?.name || "",
          "Bank": inst.paymentDetails?.bankName || "",
          "Account Number": inst.paymentDetails?.accountNumber || "",
          "Paid Date": inst.paymentDetails?.date ? new Date(inst.paymentDetails.date).toLocaleDateString() : ""
        });
      });
    });
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Grants");
    XLSX.writeFile(workbook, `grants_${application.name}.xlsx`);
  };

  const handlePayInstallment = (grantIndex, instIndex) => {
    setPaymentIndex({ grantIndex, instIndex });
    setShowPaymentForm(true);
  };

  const submitPayment = async () => { const grants = application.grants || []; const { grantIndex, instIndex } = paymentIndex; const updatedGrants = [...grants]; const grant = updatedGrants[grantIndex]; const noRealInstallments = !grant.installments || grant.installments.length === 0 || grant.installments.every(inst => !inst.amount || Number(inst.amount) === 0); if (noRealInstallments) { grant.installments = [ { amount: grant.totalAmount, paid: true, paymentDetails: { ...paymentDetails, date: new Date().toISOString() }, }, ]; grant.remainingAmount = 0; } else { const installment = grant.installments[instIndex]; grant.installments[instIndex] = { ...installment, paid: true, paymentDetails: { ...paymentDetails, date: new Date().toISOString() }, }; grant.remainingAmount = grant.totalAmount - grant.installments.filter(i => i.paid).reduce((sum, i) => sum + Number(i.amount), 0); } await updateDoc(doc(db, "applications", application.id), { grants: updatedGrants, }); setShowPaymentForm(false); setPaymentDetails({ name: "", bankName: "", accountNumber: "" }); };
  

  return (
    <div className="approve-modal">
      <div className="add-modal-content">
        {/* Close button top-right */}
        <button className="close-btn" onClick={onClose}>&times;</button>

        <h3>Add Grant for {application.name}</h3>

        <input
          type="number"
          placeholder="Total Grant Amount"
          value={totalAmount}
          onChange={(e) => setTotalAmount(e.target.value)}
        />

        <h4>Installments</h4>
        {installments.map((inst, i) => (
          <div key={i} className="installment-row">
            <input
              type="number"
              placeholder="Amount"
              value={inst.amount}
              onChange={(e) => handleInstallmentChange(i, "amount", e.target.value)}
            />
            <input
              type="date"
              value={inst.dueDate}
              onChange={(e) => handleInstallmentChange(i, "dueDate", e.target.value)}
            />
          </div>
        ))}

        {/* Add Installment + Save Grant in one row */}
        <div className="button-row">
          <button onClick={handleAddInstallment}>Add Another Installment</button>
          <button onClick={handleSaveGrant}>Save Grant</button>
        </div>

        {/* Excel download */}
        <div className="button-row">
          <button onClick={downloadExcel}>Download Excel</button>
        </div>

        {/* Full Pay + Edit Total */}
        <div className="button-row">
       

        <button
  className="edit-total-btn"
  onClick={async () => {
    const newTotal = prompt("Enter new Total Grant Amount for the entire application");
    if (!newTotal || isNaN(newTotal)) return;

    const grantsCopy = [...application.grants];
    if (grantsCopy.length > 0) {
      const grant = grantsCopy[0];

      // Directly replace totalAmount and remainingAmount
      grant.totalAmount = Number(newTotal);
     

      // Do NOT change installments
    }

    await updateDoc(doc(db, "applications", application.id), {
      grants: grantsCopy,
    });
  }}
>
  Edit Total
</button>

        </div>

        {/* Display grants */}
        {application.grants?.map((g, grantIndex) => (
          <div key={grantIndex} className="grant-section">
            <h4>Grant {grantIndex + 1} - Total: {g.totalAmount} | Remaining: {g.remainingAmount}</h4>
            {g.installments.map((inst, instIndex) => (
              <div key={instIndex} className="installment-row">
                <span>
                  Amount: {inst.amount} | Due: {inst.dueDate} | Status: {inst.paid ? "Paid" : "Pending"}
                </span>
                {inst.paid && inst.paymentDetails && (
                  <div className="payment-info">
                    <p>Paid By: {inst.paymentDetails.name}</p>
                    <p>Bank Name: {inst.paymentDetails.bankName}</p>
                    <p>Account Number: {inst.paymentDetails.accountNumber}</p>
                    <p>Date: {new Date(inst.paymentDetails.date).toLocaleDateString()}</p>
                  </div>
                )}
                {!inst.paid && inst.amount && Number(inst.amount) > 0 && (
                  <button onClick={() => handlePayInstallment(grantIndex, instIndex)}>Pay</button>
                )}
              </div>
            ))}
          </div>
        ))}

        {/* Payment form */}
        {showPaymentForm && (
          <div className="payment-form">
            <input type="text" placeholder="Name" value={paymentDetails.name} onChange={(e) => setPaymentDetails({ ...paymentDetails, name: e.target.value })} />
            <input type="text" placeholder="Bank Name" value={paymentDetails.bankName} onChange={(e) => setPaymentDetails({ ...paymentDetails, bankName: e.target.value })} />
            <input type="text" placeholder="Account Number" value={paymentDetails.accountNumber} onChange={(e) => setPaymentDetails({ ...paymentDetails, accountNumber: e.target.value })} />
            <button onClick={submitPayment}>Submit Payment</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddGrantModal;
