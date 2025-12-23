const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const { jsPDF } = require("jspdf");
require("jspdf-autotable");
const cors = require("cors")({ origin: true });

admin.initializeApp();

exports.generateAppPDF = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const appId = req.query.appId;
      if (!appId) return res.status(400).send("Missing document ID");

      const docSnap = await admin.firestore().collection("applications").doc(appId).get();
      if (!docSnap.exists) return res.status(404).send("Application not found");

      const app = docSnap.data();
      const doc = new jsPDF();
      let y = 20;

      doc.autoTable({
        startY: y,
        body: [
          ["Name", app.name || ""],
          ["Father Name", app.fatherName || ""],
          ["Phone", app.phone || ""],
          ["CNIC", app.cnicNumber || ""],
        ],
        styles: { fontSize: 9 },
      });

      y = doc.lastAutoTable.finalY + 10;

      const images = [
        { url: app.selfieUrl, label: "Selfie" },
        { url: app.cnicFrontUrl, label: "CNIC Front" },
        { url: app.cnicBackUrl, label: "CNIC Back" },
      ];

      for (const img of images) {
        if (!img.url) continue;
        const response = await axios.get(img.url, { responseType: "arraybuffer" });
        const base64Image = Buffer.from(response.data).toString("base64");
        doc.text(img.label, 14, y);
        y += 5;
        doc.addImage(base64Image, "JPEG", 14, y, 80, 60);
        y += 70;
      }

      const pdfBuffer = doc.output("arraybuffer");

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${app.name || "application"}_details.pdf`
      );

      res.send(Buffer.from(pdfBuffer));
    } catch (err) {
      console.error(err);
      res.status(500).send("PDF generation failed");
    }
  });
});
