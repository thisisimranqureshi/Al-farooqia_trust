import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import './css/ReliefSlider.css'

const slides = [
  {
    id: 1,
    title_ur: "سیلاب زدگان کے لیے ریلیف رجسٹریشن فارم",
    text_en:
      "The Disaster Relief Registration Form helps affected individuals provide essential details,timely support, aid distribution and during emergencies.",
    button: "Donate Now",
    img: "flood5.jpg",
  },
  {
    id: 2,
    title_ur: "یتیم بچوں کی تعلیم کے لیے تعاون کریں",
    text_en:
      "Your donations ensure every orphan gets education, shelter, and hope for a better future.",
    button: "Donate Now",
    img: "/Projects/Orphan/O1.jpg",
  },
  {
    id: 3,
    title_ur: "صاف پانی کی فراہمی کا مشن",
    text_en:
      "Help us bring clean and safe drinking water to families in rural areas.",
    button: "Donate Now",
    img: "/Projects/Water/w_main.jpg",
  },
];

const ReliefSlider = () => {
  return (
    <section className="home-relief-slider">
      <Swiper
        modules={[ Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000 }}
        loop
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
          <div className="home-relief-slide">
            <div className="home-relief-overlay">
              <div className="home-relief-text">
                <span className="home-releif-help-badge">Go For Help</span>
                <h2 className="title-ur">{slide.title_ur}</h2>
                <p className="text-en">{slide.text_en}</p>
                <button className="relief-btn">{slide.button} »</button>
              </div>
            </div>
            <div className="home-relief-image">
              <img src={slide.img} alt={slide.title_ur} />
            </div>
          </div>
        </SwiperSlide>
        
        ))}
      </Swiper>
    </section>
  );
};

export default ReliefSlider;
