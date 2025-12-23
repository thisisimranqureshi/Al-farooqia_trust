import React, { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faBars,
  faXmark,
  faChevronDown,
  faChevronRight,
  faCalendar,
  faImage,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import AddEventForm from "./Addeventform";
import "./css/Dashboard.css";

const Dashboard = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleAddEvent = (eventData) => {
    console.log("Event added successfully:", eventData);
  };

  // Check if we are on the main dashboard route
  const isDashboardHome = location.pathname === "/dashboard";

  return (
    <div className="dashboard-container">
      {/* ===== SIDEBAR ===== */}
      <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          {isOpen ? (
            <>
              <span className="sidebar-title">Dashboard</span>
              <button onClick={toggleSidebar} className="icon-btn">
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </>
          ) : (
            <button onClick={toggleSidebar} className="icon-btn center">
              <FontAwesomeIcon icon={faBars} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          <NavItem to="/" label="Home" icon={faHouse} isOpen={isOpen} />

          <SidebarDropdown
            label="Events"
            icon={faCalendar}
            isOpen={isOpen}
            items={[
              { label: "All Events", to: "/events" },
              { label: "Add Event", action: () => setShowForm(true) },
            ]}
          />

          <SidebarDropdown
            label="Applications"
            icon={faCalendar}
            isOpen={isOpen}
            items={[
              { label: "Pending", to: "/dashboard/applications/pending" },
              { label: "Approved", to: "/dashboard/applications/approved" },
              { label: "Rejected", to: "/dashboard/applications/rejected" },
            ]}
          />

          
         <SidebarDropdown
            label="Verifier"
            icon={faCalendar}
            isOpen={isOpen}
            items={[
              { label: "Verifiers", to: "/dashboard/verifier/allverifier" },
              { label: "Create Verifier", to: "/dashboard/verifier/create" },
             
            ]}
          />
        </nav>
      </div>

     
      <div className="main-content">
        {isDashboardHome ? (
          <>
            <h1 className="main-title">Admin Dashboard</h1>
            <p className="main-subtitle">
              Welcome to the Al-Farooqia Admin Panel.
            </p>
            {/* <button className="add-btn" onClick={() => setShowForm(true)}>
              <FontAwesomeIcon icon={faPlus} className="icon-left" />
              Add Event
            </button> */}
          </>
        ) : (
          // ✅ Render child routes (Applications list, Review, etc.)
          <div className="dashboard-outlet">
            <Outlet />
          </div>
        )}

        {showForm && (
          <AddEventForm
            onClose={() => setShowForm(false)}
            onAddEvent={handleAddEvent}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;

//
// ===== Helper Components =====
//
const NavItem = ({ to, label, icon, isOpen }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `nav-item ${isOpen ? "open" : "closed"} ${isActive ? "active" : ""}`
    }
  >
    <FontAwesomeIcon icon={icon} className="nav-icon" />
    {isOpen && <span className="nav-label">{label}</span>}
  </NavLink>
);

const SidebarDropdown = ({ label, icon, items, isOpen }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="dropdown">
      <button
        onClick={() => setOpen(!open)}
        className={`dropdown-btn ${open ? "active" : ""} ${
          isOpen ? "open" : "closed"
        }`}
      >
        <FontAwesomeIcon icon={icon} className="nav-icon" />
        {isOpen && <span className="nav-label">{label}</span>}
        {isOpen && (
          <FontAwesomeIcon
            icon={open ? faChevronDown : faChevronRight}
            className="chevron"
          />
        )}
      </button>

      {open && (
        <div className="dropdown-items">
        {items.map((item, i) =>
  item.action ? (
    <button key={i} onClick={item.action} className="dropdown-item">
      {isOpen && <span>{item.label}</span>}
    </button>
  ) : (
    <NavLink
      key={i}
      to={item.to}
      className={({ isActive }) =>
        `dropdown-item ${isActive ? "active" : ""}`
      }
    >
      {isOpen && <span>{item.label}</span>}
    </NavLink>
  )
)}

        </div>
      )}
    </div>
  );
};
