// AddEventForm.jsx
import React, { useState } from "react";
import "../components/css/Addeventform.css";

const AddEventForm = ({ onClose, onAddEvent }) => {
  const [event, setEvent] = useState({
    title: "",
    description: "",
    explanation:"",
    date: "",
    time: "",
    images: [],
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "images") {
      setEvent({ ...event, images: Array.from(files) });
    } else {
      setEvent({ ...event, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append("title", event.title);
      formData.append("description", event.description);
      formData.append("explanation", event.explanation);
      formData.append("date", event.date);
      formData.append("time", event.time);

      // Append each image file
      event.images.forEach((file) => {
        formData.append("images", file);
      });

      // Send to backend
      const res = await fetch("http://localhost:5000/api/events", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to add event");

      const data = await res.json();
      onAddEvent(data);
      onClose();
    } catch (err) {
      console.error("Error adding event:", err);
      alert("Failed to add event. Check console for details.");
    }
  };

  return (
    <div className="event-modal">
      <div className="event-modal-content">
        <h2>Add New Event</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Event Title"
            value={event.title}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Event Description"
            value={event.description}
            onChange={handleChange}
            required
          ></textarea>
          <div className="add-form-group">
            <label>Explanation (Detailed Info)</label>
            <textarea style={{color:"black"}}
              name="explanation"
              value={event.explanation}
              onChange={handleChange}
              rows="4"
              placeholder="Write detailed explanation here..."
            ></textarea>
          </div>

          <div className="date-time-group">
            <input
              type="date"
              name="date"
              value={event.date}
              onChange={handleChange}
              required
            />
            <input
              type="time"
              name="time"
              value={event.time}
              onChange={handleChange}
              required
            />
          </div>

          <input
            type="file"
            name="images"
            accept="image/*"
            onChange={handleChange}
            multiple
            required
          />

          <div className="form-actions">
            <button type="submit" className="submit-btn">
              Add Event
            </button>
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEventForm;
