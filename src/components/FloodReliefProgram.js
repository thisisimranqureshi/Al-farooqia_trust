import React from "react";
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './css/FloodReliefProgram.css'

const FloodReliefProgram = () => {
    const navigate=useNavigate()
    const changeonSubmit=()=>{
        navigate('/contactus')

    }
  const images = [
    "/flood1.jpeg",
    "/flood2.jpg",
    "/flood3.jpg",
    "/flood4.jpg",
    "/flood5.jpg",
    "/flood6.jpg",
    "/flood7.jpg",
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
  };

  return (
    <div className="flood-relief-container">
      <div className="flood-relief-left">
        <Slider {...settings}>
          {images.map((src, index) => (
            <div key={index} className="flood-relief-slide">
              <img src={src} alt={`Flood Relief ${index}`} />
            </div>
          ))}
        </Slider>
      </div>

      <div className="flood-releif-right">
        <h1 className="flood-relief-title">Flood Relief Program</h1>
        <p className="flood-description">
          Natural disasters like floods devastate lives, and our{" "}
          <b>Flood Relief Program</b> provides critical assistance to affected
          families.
        </p>

        <div className="flood-section">
          <h3 className="flood-subtitle">What We Do</h3>
          <ul className="flood-list">
            <li>Emergency shelters and food distribution.</li>
            <li>Provision of essential items like clothing and blankets.</li>
            <li>
              Rehabilitation support for rebuilding homes and livelihoods.
            </li>
          </ul>
        </div>

        <div className="flood-section">
          <h3 className="flood-subtitle">Impact</h3>
          <p className="flood-impact">
            Helping families recover and rebuild their lives means standing
            beside them in their most difficult times, providing support,
            shelter, and resources. It is about restoring hope, dignity, and
            strength so they can face tomorrow with courage and renewed
            confidence.
          </p>
        </div>

        <div className="flood-buttons">
          <button className="donate-btn">DONATE NOW</button>
          <button className="flood-submit-btn" onClick={changeonSubmit}>Submit Form</button>
        </div>
      </div>
    </div>
  );
};

export default FloodReliefProgram;
