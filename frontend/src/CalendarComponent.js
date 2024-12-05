import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";

const CLIENT_ID = "16844726883-nktuvt7v0fvoua9h948nvvl5ljddau9p.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar";

function CalendarComponent() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [availableTimes, setAvailableTimes] = useState([]);
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    email: "",
  });

  const rooms = [
    { id: "room10", name: "Salle 10", times: ["09:00", "10:00", "11:00"] },
    { id: "room20", name: "Salle 20", times: ["12:00", "13:00", "14:00"] },
  ];

  // Charger les événements depuis Flask
  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/api/reservations")
      .then((response) => {
        const formattedEvents = response.data.map((event) => ({
          title: `Salle ${event.room_id} - Réservé par ${event.email}`, 
          start: event.start_time,
          end: event.end_time,
        }));
        setEvents(formattedEvents);
      })
      .catch((error) => {
        console.error("Erreur lors du chargement des réservations depuis Flask :", error);
        setError("Erreur lors du chargement des réservations.");
      });
  }, []);

  // Vérification du token stocké dans localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("googleToken");

    if (storedToken) {
      setToken(storedToken);  // Définir le token pour l'utiliser dans la page du calendrier
    } else {
      setError("Vous devez être connecté pour accéder au calendrier.");
      window.location.href = "/login";  // Rediriger vers la page de login si le token n'existe pas
    }
  }, []);

  // Ajouter une réservation à Flask
  const addReservationToFlask = (reservation) => {
    axios
      .post("http://127.0.0.1:5000/api/reservations", reservation)
      .then((response) => {
        const data = response.data;
        setEvents((prevEvents) => [
          ...prevEvents,
          {
            title: `Salle ${data.room_id} - Réservé par ${data.email}`, 
            start: data.start_time,
            end: data.end_time,
          },
        ]);
      })
      .catch((error) => {
        console.error("Erreur lors de l'ajout de la réservation dans Flask :", error);
        setError("Erreur lors de l'ajout de la réservation.");
      });
  };

  // Gérer le changement de salle
  const handleRoomChange = (e) => {
    const room = rooms.find((r) => r.id === e.target.value);
    setSelectedRoom(room.id);
    setAvailableTimes(room.times);
  };

  // Gérer la soumission du formulaire de réservation
  const handleReservation = (e) => {
    e.preventDefault();

    if (!token) {
      setError("Vous devez être connecté pour ajouter une réservation.");
      return;
    }

    const newReservation = {
      room_id: selectedRoom,
      email: formData.email,
      start_time: `${formData.date}T${formData.time}`, 
      end_time: `${formData.date}T${parseInt(formData.time.split(":")[0]) + 1}:00:00`, 
    };

    addReservationToFlask(newReservation);
    setFormData({ date: "", time: "", email: "" });
  };

  return (
    <div>
      <h1>Réservations de salles</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleReservation}>
        <label>Salle : </label>
        <select onChange={handleRoomChange} value={selectedRoom} required>
          <option value="" disabled>
            Sélectionnez une salle
          </option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name}
            </option>
          ))}
        </select>
        <label>Date : </label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
        <label>Heure : </label>
        <select
          value={formData.time}
          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          required
        >
          <option value="" disabled>
            Sélectionnez une heure
          </option>
          {availableTimes.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
        <label>Email : </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <button type="submit">Réserver</button>
      </form>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,dayGridWeek,dayGridDay",
        }}
      />
    </div>
  );
}

export default CalendarComponent;
