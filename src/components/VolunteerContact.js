import React from "react";
import "./css/VolunteerContact.css"

const VolunteerContact = () => {
  return (
    <section className="Home-volunteer-section">
      <div className="volunteer-left">
        <h2>
          If You Want To Join As a <br /> Volunteer. Contact Today!
        </h2>
      </div>

      <div className="volunteer-right">
        <div className="contact-item">
          <h3>Call Us!</h3>
          <p className="highlight">0300 4396067</p>
        </div>

        <div className="contact-item">
          <h3>E-mail Us!</h3>
          <p className="highlight">info@alfarooqiatrust.org</p>
        </div>
      </div>
    </section>
  );
};

export default VolunteerContact;
