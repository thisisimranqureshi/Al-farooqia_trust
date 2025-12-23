import React from "react";
import { useParams } from "react-router-dom";
import projectsData from "./ProjectsData";
import "./css/ProjectDetail.css";

const ProjectDetail = () => {
  const { id } = useParams();
  const project = projectsData.find((p) => p.id === parseInt(id));

  if (!project) return <h2>Project not found</h2>;

  return (
    <div className="project-detail">
      {/* Main Section: Image + Info Side by Side */}
      <div className="project-main-section">
        <div className="main-image">
          <img src={project.mainImage} alt={project.title} />
        </div>

        <div className="project-info">
          <h1>{project.title}</h1>
          <p>{project.description}</p>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="project-gallery">
        {project.images.map((img, index) => (
          <div key={index} className="gallery-item">
            <img src={img} alt={`${project.title}-${index}`} />
          </div>
        ))}
      </div>

      {/* What We Provide Section */}
      <section className="project-provide">
        <h2>What We Provide</h2>
        <ul>
          {project.whatWeProvide.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </section>

      {/* Impact Section */}
      <section className="project-impact">
        <h2>Our Impact</h2>
        <p>{project.impact}</p>
      </section>
    </div>
  );
};

export default ProjectDetail;
