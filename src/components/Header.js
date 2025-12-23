import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFirebase } from "../context/FirebaseContext";
import "../components/css/Header.css";
import logo from "../components/Applications/logo.png"
const Header = () => {
  const [visible, setVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useFirebase();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setVisible(scrollTop === 0);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      alert("You have been logged out.");
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header
      className="header"
      style={{
        transform: visible ? "translateY(0)" : "translateY(-100%)",
        transition: "transform 0.3s ease",
      }}
    >
      <div className="header-container">
        {/* Logo */}
        <div className="logo-section" onClick={()=>navigate('/')}>
          <img src={logo} alt="Donation Logo" className="logo-img" />
        </div>

        {/* Hamburger */}
        <div
          className={`hamburger ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* Navigation */}
        <div className={`nav-wrapper ${menuOpen ? "open" : ""}`}>
          <nav>
            <ul className="header-nav-list">
              <li><Link to="/" className="header-nav-link">Home</Link></li>
              <li><Link to="/AboutUs" className="header-nav-link">About</Link></li>
              <li><Link to="/projects" className="header-nav-link">Projects</Link></li>
              <li><Link to="/events" className="header-nav-link">Events</Link></li>
              <li><Link to="/contactus" className="header-nav-link">Contact</Link></li>
              <li><Link to="/services" className="header-nav-link">Services</Link></li>
            </ul>
          </nav>

          <div className="header-buttons">
            {user ? (
              <button
                onClick={handleLogout}
                className="header-donate-btn"
                
              >
                Logout
              </button>
            ) : (
              <Link to="/login" className="header-donate-btn">
                Login
              </Link>
            )}
             <a
    href="/downloads/myapp.apk" 
    download                     
    className="header-donate-btn"
    style={{ marginLeft: "10px" }}
  >
    Download App
  </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
