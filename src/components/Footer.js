// src/components/Footer.js
import React from "react";
import logo from "../components/Applications/logo.png"
import "./css/Footer.css";
import { FaFacebookF, FaInstagram, FaWhatsapp,FaTwitter, FaTiktok, FaYoutube,FaMapMarkerAlt } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-decorative"></div>
      
      {/* Footer Top Section */}
      <div className="footer-top">
        <div className="footer-container">
          <div className="footer-grid">
            {/* About Section */}
            <div className="footer-about">
              <div className="footer-logo-section">
                <img src={logo}alt="Al Farooqia Trust Logo" className="footer-logo" />
                <h3 className="footer-logo-text">Al Farooqia Trust</h3>
              </div>
              <p className="footer-tagline">
                "Nonprofit Organization For Help Community Support"
              </p>
              <p className="footer-description">
                Al Farooqia Trust is dedicated to serving humanity through compassion and collective effort. 
                We provide healthcare services, disaster relief, and community support to build a better society for all.
              </p>

              {/* Social Links */}
              <div className="footer-social">
                <a 
                  href="https://www.youtube.com/@alfarooqiatrustshujabad" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-link"
                  aria-label="Youtube"
                >
                  <FaYoutube size={24} />
                </a>
                <a 
                  href="https://www.facebook.com/AlFarooqiaTrustShujabad?_rdc=1&_rdr#" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-link"
                  aria-label="Facebook"
                >
                  <FaFacebookF size={24} />
                </a>
                <a 
                  href="https://www.tiktok.com/@alfarooqiatrustshujabad" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-link"
                  aria-label="TikTok"
                >
                  <FaTiktok size={24} />
                </a>
                <a 
                  href="https://www.instagram.com/alfarooqiatrustshujabad/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-link"
                  aria-label="Instagram"
                >
                  <FaInstagram size={24} />
                </a>
              </div>
            </div>

            {/* Useful Links */}
            <div className="footer-section">
              <h3>Quick Links</h3>
              <ul className="footer-links">
                <li><a href="/">Home</a></li>
                <li><a href="/Aboutus">About Us</a></li>
                <li><a href="/projects">Projects</a></li>
                <li><a href="/events">Events</a></li>
                <li><a href="/contactus">Contact</a></li>
              </ul>
            </div>

            {/* Our Services */}
            <div className="footer-section">
              <h3>Our Services</h3>
              <ul className="footer-links">
                <li><a href="/">Health Care</a></li>
                <li><a href="/">Disaster Relief</a></li>
                <li><a href="/">Volunteer</a></li>
                <li><a href="/">Donate</a></li>
                <li><a href="/">Gallery</a></li>
              </ul>
            </div>

            {/* Contact Information */}
            <div className="footer-section">
              <h3>Contact Us</h3>
              <div className="footer-contact-info">
                <div className="contact-info-item">
                  <div className="contact-info-icon">📞</div>
                  <div className="contact-info-content">
                    <p className="contact-info-label">Phone</p>
                    <p className="contact-info-value">
                      <a href="tel:03004396067">0300 43 96 067</a>
                    </p>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-info-icon">✉️</div>
                  <div className="contact-info-content">
                    <p className="contact-info-label">Email</p>
                    <p className="contact-info-value">
                      <a href="mailto:info@alfarooqiatrust.org">
                        info@alfarooqiatrust.org
                      </a>
                    </p>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <FaMapMarkerAlt size={20} />
                  </div>
                  <div className="contact-info-content">
                    <p className="contact-info-label">Address</p>
                    <p className="contact-info-value">
                      Al Farooqia Trust Office<br />
                      Old Multan Road, Shujabad, Multan<br />
                      Pakistan
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom Section */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p className="footer-copyright">
            © 2025 <span>Al Farooqia Trust</span>. All Rights Reserved.
          </p>
          <div className="footer-bottom-links">
            <a href="/privacy-policy">Privacy Policy</a>
            <a href="/terms">Terms & Conditions</a>
            <a href="/sitemap">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;