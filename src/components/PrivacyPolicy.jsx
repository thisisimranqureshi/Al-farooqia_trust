import React from "react";
import "./css/PrivacyPolicy.css";

const PrivacyPolicy = () => {
  return (
    <div className="privacy-container">
      <h1>Privacy Policy</h1>
      <p>Last update: 23 November 2025</p>
      <p>
        Al Farooqia Trust ("we", "our", or "us") values your privacy. This Privacy Policy explains
        how we collect, use, disclose, retain and protect personal data when you use our mobile
        applications and services (the "Services").
      </p>

      <h2>Who We Are</h2>
      <p>
        <strong>Organization:</strong> Al Farooqia Trust <br />
        <strong>Contact:</strong> [insert contact email]
      </p>

      <h2>Scope</h2>
      <p>
        This Policy applies to all data collected via the mobile app and related backend services
        (Firebase Auth, Firestore, Storage) and any websites or admin portals we operate.
      </p>

      <h2>The Data We Collect</h2>
      <p>We collect personal and non-personal data necessary to provide the Services and operate securely:</p>
      <ul>
        <li><strong>Identity & Contact:</strong> name, father’s name, phone number, email.</li>
        <li><strong>National ID / Government ID:</strong> CNIC / national identity number for verification.</li>
        <li><strong>Location:</strong> live GPS coordinates (lat/lng) captured on demand.</li>
        <li><strong>Media:</strong> photos and short videos you capture with the app.</li>
        <li><strong>Application Data:</strong> application answers, checklist items, form fields.</li>
        <li><strong>Authentication Data:</strong> Firebase Auth identifiers (UIDs, provider tokens).</li>
        <li><strong>Device & Technical Data:</strong> device model, OS version, app version, IP address, analytics and crash data.</li>
        <li><strong>Local Storage:</strong> temporary drafts stored locally (SQFLITE) for offline use.</li>
      </ul>

      <h2>How We Use Your Data</h2>
      <ul>
        <li>To process and manage applications and submissions.</li>
        <li>To verify identity and prevent duplicates or fraud.</li>
        <li>To capture and store evidence (photos, video).</li>
        <li>To improve and operate the Services (analytics, performance).</li>
        <li>To communicate about status, support, or required actions.</li>
        <li>To meet legal or regulatory obligations.</li>
      </ul>

      <h2>Legal Basis</h2>
      <p>
        Processing is performed on one or more of the following bases: your consent; contractual
        necessity; compliance with legal obligations; and our legitimate interests (security,
        fraud prevention, service improvement).
      </p>

      <h2>Special / Sensitive Data</h2>
      <p>
        We do not intentionally collect sensitive categories of personal data (race, religion, etc.).
        If you submit such information inadvertently, contact us to request removal.
      </p>

      <h2>Cookies, SDKs and Similar Technologies</h2>
      <p>
        Our Services use SDKs and local storage to deliver features (Firebase Auth, Firestore,
        Storage, Analytics, geolocation libraries, image capture libraries). Some SDKs collect
        analytics, performance, and device identifiers. We only access aggregated reports.
      </p>

      <h2>Sharing & Disclosure</h2>
      <p>
        We do not disclose personal data except with your consent or where required by law. We
        may use processors to store and process data under confidentiality agreements. Data may
        transfer in case of business sale or merger. Law enforcement requests may require disclosure.
      </p>

      <h2>Data Retention</h2>
      <p>
        We retain personal data only as long as necessary to fulfill the purpose collected. When
        no longer needed, we delete or anonymize it.
      </p>

      <h2>Security</h2>
      <p>
        We implement technical and organizational measures to protect data (HTTPS, access controls,
        secure Firebase storage). Absolute security cannot be guaranteed.
      </p>

      <h2>Your Rights</h2>
      <p>
        Depending on your jurisdiction, you may have rights including access, correction, erasure,
        restriction, objection, data portability, withdrawal of consent, and lodging a complaint
        with a supervisory authority. Contact us to exercise these rights.
      </p>

      <h2>Children</h2>
      <p>
        Our Services are not intended for children under 13. Contact us if a child under 13 has
        submitted data for deletion.
      </p>

      <h2>Changes to this Policy</h2>
      <p>
        We may update this policy occasionally. Significant changes will be posted prominently
        in the app and the "Last update" date updated.
      </p>

      <h2>Contact</h2>
      <p>For privacy questions or rights requests: [insert contact email]</p>
    </div>
  );
};

export default PrivacyPolicy;
