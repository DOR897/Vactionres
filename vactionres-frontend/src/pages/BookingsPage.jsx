import { useEffect, useState } from "react";
import { fetchBookings, deleteBooking } from "../utils/api";
import { useNavigate } from "react-router-dom";

const BookingsPage = ({ user }) => {
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
    // delete the existing booking, then go back to search
    const type = booking.hotel ? "hotels" : "flights";
    deleteBooking(booking.id, type)
      .then(() => {
        localStorage.setItem("updateBooking", JSON.stringify(booking));
        navigate("/search");
      })
      .catch(console.error);
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">My Bookings</h2>
      {bookings.length === 0 ? (
        <p className="text-center">No bookings found.</p>
      ) : (
        bookings.map((b) => (
          <div key={b.id} className="card mb-3 p-3">
            {b.flight && (
              <div className="mb-2">
                <h5>✈️ Flight Booking</h5>
                <p>
                  <strong>{b.flight.airline}</strong> —{" "}
                  {b.flight.flight_number}
                </p>
                <p>Departure: {b.flight.departure_time}</p>
                <p>Arrival: {b.flight.arrival_time}</p>
                <p>
                  Duration:{" "}
                  {Math.floor(b.flight.total_duration / 60)}h{" "}
                  {b.flight.total_duration % 60}m
                </p>
                <p>Price: ${b.flight.price}</p>
                <a
                  href={b.flight.google_flights_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-info btn-sm"
                >
                  View on Google Flights
                </a>
              </div>
            )}
            {b.hotel && (
              <div className="mb-2">
                <h5>🏨 Hotel Booking</h5>
                <p>
                  <a
                    href={b.hotel.link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {b.hotel.name}
                  </a>
                </p>
                <p>Rating: ⭐ {b.hotel.overall_rating}</p>
                <p>Rate per night: ${b.hotel.price}</p>
                <p>
                  Amenities: {b.hotel.amenities?.slice(0, 5).join(", ")}
                  {b.hotel.amenities?.length > 5 && "..."}
                </p>
                {b.hotel.images?.length ? (
                  <img
                    src={b.hotel.images[0].thumbnail}
                    alt={b.hotel.name}
                    className="img-fluid mt-1"
                    style={{ maxHeight: "150px" }}
                  />
                ) : (
                  <div className="text-muted">No image</div>
                )}
              </div>
            )}
            <div className="d-flex justify-content-end">
              <button
                className="btn btn-danger btn-sm me-2"
                onClick={() =>
                  handleDelete(b.id, b.hotel ? "hotels" : "flights")
                }
              >
                Delete
              </button>
              <button
                className="btn btn-warning btn-sm"
                onClick={() => handleUpdate(b)}
              >
                Update
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default BookingsPage;