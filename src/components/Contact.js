// src/pages/Contact.js
import React, { useState } from "react";
import "../components/css/Contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    information: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setSuccessMsg("Thank you! Your message has been sent.");
      setFormData({
        fullName: "",
        phone: "",
        email: "",
        information: "",
        message: "",
      });
    } catch (err) {
      setErrorMsg(err.message);
      console.error("Contact form error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="contact-hero-content">
          <h1>Get In Touch</h1>
          <p>
            We'd love to hear from you! Whether you have questions, want to
            volunteer, or need assistance, our team is here to help.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="contact-content">
        <div className="contact-grid">

          {/* Contact Form */}
          <div className="contact-form-section">
            <h2 className="form-title">
              Send Us a <span className="highlight">Message</span>
            </h2>
            <p className="form-subtitle">
              Fill out the form below and we'll get back to you as soon as
              possible.
            </p>

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name *</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="information">Subject</label>
                  <input
                    type="text"
                    id="information"
                    name="information"
                    value={formData.information}
                    onChange={handleChange}
                    placeholder="What is this regarding?"
                  />
                </div>
              </div>

              <div className="form-group form-group-full">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  required
                />
              </div>

              {successMsg && <p className="success-msg">{successMsg}</p>}
              {errorMsg && <p className="error-msg">{errorMsg}</p>}

              <button type="submit" className="contact-submit-btn" disabled={loading}>
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
