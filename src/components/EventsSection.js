import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useFirebase } from "../context/FirebaseContext";
import "../components/css/EventsSection.css";

const EventsSection = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { db } = useFirebase();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const q = query(collection(db, "events"), orderBy("date", "desc"));
        const snapshot = await getDocs(q);

        const eventsData = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            images: data.images || [], // already full URLs
          };
        });

        setEvents(eventsData);
      } catch (err) {
        console.error("Error fetching events from Firebase:", err);
        setError("Unable to load events. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [db]);

  if (loading) return <p>Loading events...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <section id="events" className="events-section">
      <h2>Highlights of Our Past Initiatives</h2>
      <div className="events-grid">
        {events.length === 0 ? (
          <p>No events yet.</p>
        ) : (
          events.map(ev => (
            <div
              key={ev.id}
              className="event-card"
              onClick={() => navigate(`/event/${ev.id}`)}
              style={{ cursor: "pointer" }}
            >
              {ev.images.length > 0 && (
                <div className="event-images">
                  <img src={ev.images[0]} alt={ev.title} className="event-img" />
                </div>
              )}
              <div className="event-info">
                <h3>{ev.title}</h3>
                <p className="event-date">{ev.date}</p>
                <p className="event-description">
                  {ev.description?.length > 80
                    ? ev.description.slice(0, 80) + "..."
                    : ev.description}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default EventsSection;
