// src/pages/AboutUs.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { FaHandsHelping,FaHeartbeat,FaProcedures,FaAmbulance,FaHospital ,FaBriefcaseMedical } from "react-icons/fa";
import "../components/css/AboutUs.css";

const AboutUs = () => {
  const navigate = useNavigate();

  const handleGetInvolved = () => {
    navigate("/contactus"); 
  };
  const teamMembers = [
    {
      id: 1,
      name: "MUHAMMAD ARSHAD",
      image: "chairman.jpeg",
      role: "Chairman",
    },
    {
      id: 2,
      name: "ZUBAIR AHMAD SIDDIQUI",
      image: "President.jpg",
      role: "President",
    },
    {
      id: 3,
      name: "MUHAMMAD TAYYAB MOAVIA",
      image: "Muhammad tayyab moavia.jpg",
      role: "Community Outreach",
    },
    {
      id: 4,
      name: "MUHAMMAD UMAIR SIDDIQI",
      image: "general Secretary.jpg",
      role: "General Secretary",
    },
  ];

  return (
    <div className="about-us-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>About Us</h1>
          <p className="about-hero-tagline">
            "Al Farooqia Trust is dedicated to reaching underprivileged families in Every corner of Pakistan,ensure that support is tailored to real needs"
          </p>
          <p className="about-hero-description">
          At our trust, every donation becomes a story of hope and humanity.
We believe in changing lives — one kind act at a time.
          </p>
        </div>
      </section>

       {/* About Al-Farooqia Section */}
       <section className="about-section">
  <div className="about-image">
    <img src="Building.jpg" alt="Al Farooqia Trust" />
  </div>

  <div className="about-content">
    <h2>
      AL FAROOQIA TRUST IS <span>NONPROFIT ORGANIZATION</span><br />
      FOR <span>HELP</span> COMMUNITY SUPPORT.
    </h2>
    <p>
      At Al Farooqia Trust, we believe in the power of compassion and
      collective effort to transform lives. Founded with the vision of
      building a better society, our mission is to serve humanity by addressing
      critical social and medical needs.
    </p>

    <div className="about-icons">
      <div className="about-icon">
      <FaHandsHelping size={40} color="#e63946" />
        <h4>Health Care</h4>
      </div>
      <div className="about-icon">
      <FaHeartbeat size={40} color="#1d3557" />
        <h4>Disaster Relief</h4>
      </div>
    </div>
  </div>
</section>


      {/* Chairman Section */}
      <section className="chairman-section">
        <div className="chairman-container">
          <h2 className="section-title">Message from Chairman</h2>

          <div className="chairman-content">
            <div className="chairman-image-wrapper">
              <div className="chairman-image-container">
                <div className="chairman-image-glow"></div>
                <img
                  src="/chairman.jpeg"
                  alt="Chairman"
                  className="chairman-image"
                />
              </div>
              <div className="chairman-info">
                <h3 className="chairman-name">MUHAMMAD ARSHAD</h3>
                <p className="chairman-title">Chairman & Founder</p>
              </div>
            </div>

            <div className="chairman-message">
              <span className="quote-open">"</span>
              <p>
                Dear Supporters, At Al Farooqia Trust, our mission has always
                been to serve humanity with compassion, dedication, and
                integrity. We believe that every individual, regardless of their
                circumstances, deserves access to basic necessities such as
                healthcare, clean water, education, and dignity in times of
                need. Our journey began with a vision to create meaningful
                change in the lives of the underprivileged. Over the years, with
                your unwavering support, we have been able to transform this
                vision into reality through our various initiatives, including
                free dialysis services, disaster relief programs, orphan
                support, widow assistance, and more. We remain committed to
                transparency and accountability in every project we undertake.
                Each donation and act of kindness entrusted to us is treated as
                a sacred responsibility, ensuring that your contributions
                directly benefit those in need. As we move forward, our focus
                will remain on expanding our reach and deepening our impact.
                Together, we can continue to make a difference in countless
                lives and build a society where no one is left behind. Thank you
                for standing with us in this noble cause. Your trust and support
                inspire us to do more every day.
                <br />
                With gratitude,
                <br />
                MUHAMMAD ARSHAD
                <br />
                Chairman, Al Farooqia Trust
              </p>
              <span className="quote-close">"</span>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="team-container">
          <h2 className="section-title">Our Team</h2>
          <p className="team-intro">
            Meet the dedicated professionals behind our mission
          </p>

          <div className="team-grid">
            {teamMembers.map((member) => (
              <div key={member.id} className="team-member">
                <div className="team-member-overlay"></div>

                <img
                  src={member.image}
                  alt={member.name}
                  className="team-member-image"
                />

                <div className="team-member-info">
                  <h3 className="team-member-name">{member.name}</h3>
                  <p className="team-member-role">{member.role}</p>
                </div>

                <div className="team-member-check">✓</div>
              </div>
            ))}
          </div>
        </div>
      </section>

     
    </div>
  );
};

export default AboutUs;
