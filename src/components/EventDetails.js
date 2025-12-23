import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { useFirebase } from "../context/FirebaseContext";
import "./css/EventDetail.css";

const EventDetails = () => {
  const { id } = useParams();
  const { db } = useFirebase();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const docRef = doc(db, "events", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setError("Event not found.");
          return;
        }

        const data = docSnap.data();

        setEvent({
          id: docSnap.id,
          ...data,
          images: data.images || [], // already full URLs
        });
      } catch (err) {
        console.error("Error fetching event from Firebase:", err);
        setError("Unable to load event. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [db, id]);

  if (loading) return <p>Loading event details...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!event) return null;

  const numImages = event.images.length;
  let imagesClass = "images-1";
  if (numImages === 2) imagesClass = "images-2";
  else if (numImages === 3) imagesClass = "images-3";
  else if (numImages === 4) imagesClass = "images-4";
  else if (numImages >= 5) imagesClass = "images-6-plus";

  return (
    <div className="event-detail">
      <h2>{event.title}</h2>
      <p className="event-date">{event.date}</p>

      {numImages > 0 && (
        <div className={`event-images-gallery ${imagesClass}`}>
          {event.images.map((img, i) => (
            <img
              key={i}
              src={img} // already full URL from Firestore
              alt={`${event.title} ${i + 1}`}
              className="event-detail-img"
            />
          ))}
        </div>
      )}

      <p className="event-description">{event.description}</p>

      {/* Full details */}
      {event.details && (
        <div
          className="event-explanation"
          dangerouslySetInnerHTML={{ __html: event.details }}
        />
      )}
    </div>
  );
};

export default EventDetails;
