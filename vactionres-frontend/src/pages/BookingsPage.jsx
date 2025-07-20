import { useEffect, useState } from "react";
import { fetchBookings, deleteBooking } from "../utils/api";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

const BookingsPage = ({ user, onLogout }) => {
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        const data = await fetchBookings(user.id);
        setBookings(data);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      }
    };
    load();
  }, [user]);

  const handleDelete = async (id, type) => {
    try {
      await deleteBooking(id, type);
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Error deleting booking:", err);
    }
  };

  const handleUpdate = (booking) => {
    const type = booking.hotel ? "hotels" : "flights";
    deleteBooking(booking.id, type)
      .then(() => {
        localStorage.setItem("updateBooking", JSON.stringify(booking));
        navigate("/search");
      })
      .catch(console.error);
  };

  return (
    <div
      className="container d-flex flex-column align-items-center text-center"
      style={{
        minHeight: "100vh",
        padding: "2rem 1rem",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
         <Header onLogout={onLogout} />
      
      <h2
        className="mb-4"
        style={{
          color: "white",
          fontSize: "2.5rem",
          fontWeight: "700",
          textShadow: "0 2px 4px rgba(0,0,0,0.3)",
          marginBottom: "2rem",
        }}
      >
        📋 My Bookings
      </h2>

      {bookings.length === 0 ? (
        <div
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "20px",
            padding: "3rem",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            maxWidth: "600px",
            width: "100%",
          }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📭</div>
          <p style={{ fontSize: "1.2rem", color: "#7f8c8d", margin: 0 }}>
            No bookings found. Start planning your next adventure!
          </p>
        </div>
      ) : (
        <div style={{ width: "100%", maxWidth: "800px" }}>
          {bookings.map((b) => (
            <div
              key={b.id}
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                borderRadius: "20px",
                padding: "2rem",
                marginBottom: "2rem",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => (e.target.style.transform = "translateY(-5px)")}
              onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
            >
            {b.flight && (
                <div
                  style={{
                    background: "linear-gradient(135deg, #4a5568, #2d3748)",
                    borderRadius: "15px",
                    padding: "1.5rem",
                    marginBottom: "1rem",
                    color: "white",
                  }}
                >
                  <h5 style={{ fontSize: "1.3rem", fontWeight: "600", marginBottom: "1rem" }}>
                    ✈️ Flight Booking
                  </h5>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                    <div>
                      <p style={{ margin: "0.5rem 0", fontSize: "1.1rem" }}>
                        <strong>{b.flight.airline}</strong> — {b.flight.flight_number}
                </p>
                      <p style={{ margin: "0.5rem 0", opacity: "0.9" }}>
                        🕐 Departure: {b.flight.departure_time}
                      </p>
                      <p style={{ margin: "0.5rem 0", opacity: "0.9" }}>
                        🕐 Arrival: {b.flight.arrival_time}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: "0.5rem 0", opacity: "0.9" }}>
                        ⏱️ Duration: {Math.floor(b.flight.total_duration / 60)}h{" "}
                  {b.flight.total_duration % 60}m
                </p>
                      <p style={{ margin: "0.5rem 0", fontSize: "1.2rem", fontWeight: "600" }}>
                        💰 Price: ${b.flight.price}
                      </p>
                <a
                  href={b.flight.google_flights_url}
                  target="_blank"
                  rel="noreferrer"
                        style={{
                          display: "inline-block",
                          background: "rgba(255, 255, 255, 0.2)",
                          color: "white",
                          padding: "8px 16px",
                          borderRadius: "8px",
                          textDecoration: "none",
                          fontSize: "0.9rem",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => (e.target.style.background = "rgba(255, 255, 255, 0.3)")}
                        onMouseLeave={(e) => (e.target.style.background = "rgba(255, 255, 255, 0.2)")}
                >
                        🔗 View on Google Flights
                </a>
                    </div>
                  </div>
              </div>
            )}

            {b.hotel && (
                <div
                  style={{
                    background: "linear-gradient(135deg, #00b894, #00a085)",
                    borderRadius: "15px",
                    padding: "1.5rem",
                    marginBottom: "1rem",
                    color: "white",
                  }}
                >
                  <h5 style={{ fontSize: "1.3rem", fontWeight: "600", marginBottom: "1rem" }}>
                    🏨 Hotel Booking
                  </h5>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
                    <div>
                      <p style={{ margin: "0.5rem 0", fontSize: "1.1rem" }}>
                  <a
                    href={b.hotel.link}
                    target="_blank"
                    rel="noreferrer"
                          style={{ color: "white", textDecoration: "none", fontWeight: "600" }}
                  >
                    {b.hotel.name}
                  </a>
                </p>
                      <p style={{ margin: "0.5rem 0", opacity: "0.9" }}>
                        ⭐ Rating: {b.hotel.overall_rating}
                      </p>
                      <p style={{ margin: "0.5rem 0", fontSize: "1.1rem", fontWeight: "600" }}>
                        💰 Rate per night: ${b.hotel.price}
                      </p>
                      <p style={{ margin: "0.5rem 0", opacity: "0.9", fontSize: "0.9rem" }}>
                        🛎️ Amenities: {b.hotel.amenities?.slice(0, 3).join(", ")}
                        {b.hotel.amenities?.length > 3 && "..."}
                </p>
                    </div>
                    <div style={{ textAlign: "center" }}>
                {b.hotel.images?.length ? (
                  <img
                    src={b.hotel.images[0].thumbnail}
                    alt={b.hotel.name}
                          style={{
                            maxHeight: "120px",
                            borderRadius: "10px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                          }}
                  />
                ) : (
                        <div
                          style={{
                            height: "120px",
                            background: "rgba(255, 255, 255, 0.2)",
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "2rem",
                          }}
                        >
                          🏨
                        </div>
                )}
                    </div>
                  </div>
              </div>
            )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "1rem",
                  marginTop: "1rem",
                }}
              >
              <button
                  className="btn"
                  onClick={() => handleDelete(b.id, b.hotel ? "hotels" : "flights")}
                  style={{
                    borderRadius: "10px",
                    padding: "10px 20px",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    background: "linear-gradient(135deg, #e74c3c, #c0392b)",
                    border: "none",
                    color: "white",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => (e.target.style.transform = "translateY(-2px)")}
                  onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
                >
                  🗑️ Delete
              </button>
              <button
                  className="btn"
                onClick={() => handleUpdate(b)}
                  style={{
                    borderRadius: "10px",
                    padding: "10px 20px",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    background: "linear-gradient(135deg, #f39c12, #e67e22)",
                    border: "none",
                    color: "white",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => (e.target.style.transform = "translateY(-2px)")}
                  onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
                >
                  ✏️ Update
              </button>
            </div>
          </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingsPage;