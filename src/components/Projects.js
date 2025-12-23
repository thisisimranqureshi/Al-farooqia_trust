// src/components/Projects.js
import React from "react";
import { useNavigate } from "react-router-dom";
import projectsData from "./ProjectsData";
import "./css/Projects.css";

const Projects = () => {
  const navigate = useNavigate();

  return (
    <div className="projects-page">
      <h1 className="projects-title">Our Projects</h1>
      <p className="projects-subtitle">
        Explore our humanitarian efforts across Pakistan — each project is a story of hope and compassion.
      </p>

      <div className="projects-grid">
        {projectsData.map((project) => (
          <div
            key={project.id}
            className="project-card"
            onClick={() => navigate(`/projects/${project.id}`)}
          >
            <img
              src={project.mainImage}
              alt={project.title}
              className="project-image"
            />
            <div className="project-info">
              <h3>{project.title}</h3>
              <p>{project.description.slice(0, 100)}...</p>
              <button className="view-more-btn">View Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;
