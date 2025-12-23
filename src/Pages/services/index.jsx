import React from "react";
import { useNavigate } from "react-router-dom";
import { FaWater, FaHandHoldingUsd, FaHeartbeat, FaBook } from "react-icons/fa";
import "../../components/css/services.css";
import { faL } from "@fortawesome/free-solid-svg-icons";

const Services = () => {
  const navigate = useNavigate();

  const services = [
    {
      id: 1,
      slug: "general",
      name: "Application For General Services",
      description: "Emergency response and long-term support",
      icon: <FaWater className="service-icon" />,
      active: true,
    },
    {
      id: 2,
      slug: "house",
      name: "Application For House Construction (Flood Services)",
      description: "Support for families impacted by flood",
      icon: <FaHandHoldingUsd className="service-icon" />,
      active: true,
    },
    {
      id: 3,
      slug: "rashan",
      name: "Application For Rashan (Flood Services)",
      description: "Support for families impacted by flood",
      icon: <FaHandHoldingUsd className="service-icon" />,
      active: true,
    },
    {
      id: 4,
      slug: "masjid",
      name: "Application For Masjid Rebuild",
      description: "Support for rebuilding masjid",
      icon: <FaHandHoldingUsd className="service-icon" />,
      active: true,
    },
    {
      id: 5,
      slug: "water",
      name: "Application for Water Project",
      description: "Hand Pump, Motor or Water Filtration",
      icon: <FaHeartbeat className="service-icon" />,
      active: true,
    },
    {
      id: 6,
      slug: "widow",
      name: "Widow Application",
      description: "Widow application form for water and aid",
      icon: <FaBook className="service-icon" />,
      active: true,
    },
    {
      id: 7,
      slug: "Medical",
      name: "Medical Support",
      description: "Patient application form for medical Support",
      icon: <FaBook className="service-icon" />,
      active: false,
    },
    {
      id: 8,
      slug: "education",
      name: "Educational Support",
      description: "Scholarship books and tutuion fees for deserving students to continue their studies",
      icon: <FaHandHoldingUsd className="service-icon" />,
      active: false,
    },
    {
      id: 9,
      slug: "orphan",
      name: "Orphan Welfare",
      description: "Support for families impacted by flood",
      icon: <FaHandHoldingUsd className="service-icon" />,
      active: false,
    },
  ];
  

  return (
    <div className="services-page">
      <h1 className="services-title">Our Services</h1>

      <div className="services-grid">
        {services.map((service) => (
          <div key={service.id} className="service-card">
            <div className="service-icon-wrapper">{service.icon}</div>
            <h3>{service.name}</h3>
            <p>{service.description}</p>
            <button
              disabled={!service.active}
              className={`service-btn ${!service.active ? "disabled" : ""}`}
              onClick={() => navigate(`/form/${service.slug}`)}
            >
              Apply For Assistance
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Services;
