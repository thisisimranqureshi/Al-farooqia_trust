// src/components/Home.js
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { useFirebase } from "../context/FirebaseContext"; 
import { useNavigate } from "react-router-dom";
import { FaHandsHelping,FaHeartbeat,FaProcedures,FaAmbulance,FaHospital ,FaBriefcaseMedical } from "react-icons/fa";
import EventsSection from "./EventsSection";
import ReliefSlider from "./ReliefSlider";
import FloodReliefProgram from "./FloodReliefProgram";
import VolunteerContact from "./VolunteerContact";
import Projects from "./Projects";

import "./css/Home.css";


const Home = () => {
  const { db, user } = useFirebase();
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();


  
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsCol = collection(db, "events"); // your collection name
        const eventsSnapshot = await getDocs(eventsCol);
        const eventsList = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEvents(eventsList);
      } catch (err) {
        console.error("Error fetching events:", err);
        setEvents([]);
      }
    };
    fetchEvents();
  }, []);
  

  const handleGetInvolved = () => {
    navigate("/contactus");
  };

  return (
    <div className="home-page">
      <div className="Home_feature_image">
        <img src="Feature_image.png"/>
      </div>
<ReliefSlider/>
     
    
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


      {/* -------- Feature Section -------- */}
<section className="feature-section">
  <div className="feature-container">
    {/* Left side */}
    <div className="feature-text">
      <div className="feature-tag">
        <span>FEATURE</span>
      </div>
      <h2 className="feature-heading">
        THE GREAT JOURNEY TO REBUILD LIVES BEGINS WITH A HELPING HAND AFTER DISASTER STRIKES.
      </h2>
      <p className="feature-description">
        Each of these projects is a step toward building a compassionate and equitable society. 
        With your support, we can expand our efforts and bring hope to even more lives.
      </p>
      <button className="donate-now-btn">DONATE NOW »</button>
    </div>

    {/* Right side */}
    <div className="feature-grid">
      <div className="feature-card">
        <div className="feature-icon">
        <FaProcedures  size={60}/>
        </div>
        <p>Free Dialysis Center</p>
      </div>
      <div className="feature-card">
        <div className="feature-icon">
        <FaAmbulance size={60} />
        </div>
        <p>Free Ambulance</p>
      </div>
      <div className="feature-card">
        <div className="feature-icon">
        <FaHospital size={60}/>
        </div>
        <p>Free Medical Camp</p>
      </div>
      <div className="feature-card">
        <div className="feature-icon">
        <FaBriefcaseMedical  size={60}/>
        </div>
        <p>Flood Relief Program</p>
      </div>
    </div>
  </div>
</section>
<FloodReliefProgram/>
<Projects/>
<VolunteerContact/>


     

      {/* Events Section */}
      <EventsSection events={events} />

     
    </div>
  );
};

export default Home;