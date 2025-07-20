import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import iataData from "../iata_to_city.json";
import Header from "../components/Header";
import {
  searchFlights,
  searchHotels,
  getWeather,
  bookFlight,
  bookHotel,
  createFlight,
  createHotel,
} from "../utils/api";

const SearchPage = ({ user, onLogout }) => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [flights, setFlights] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [weather, setWeather] = useState([]);
  const navigate = useNavigate();

  function normalizeDate(s) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const parts = s.split(/[\\/]/);
  if (parts.length === 3) {
      let [a, b, c] = parts.map((x) => x.padStart(2, "0"));
    return `${c}-${b}-${a}`;
  }
    return s;
}

  const handleSearch = async () => {
    if (!origin || !destination || !departureDate) {
      alert("Fill in origin, destination, departure date");
      return;
    }
    const cityName = iataData[destination] || destination;
    const ci = normalizeDate(departureDate);
    const co = normalizeDate(returnDate || departureDate);

    try {
      const flightRes = await searchFlights(
        origin,
        destination,
        departureDate,
        returnDate
      );
      const flightsArray = flightRes.flights || [];
      const withFlightId = flightsArray.map((f, i) => ({ ...f, id: i }));

      const hotelRes = await searchHotels(cityName, ci, co);
      const hotelsArray = hotelRes.hotels || [];
      const withHotelId = hotelsArray.map((h, i) => ({ ...h, id: i }));

      const weatherRes = await getWeather(cityName);

      setFlights(withFlightId);
      setHotels(withHotelId);
      setWeather(Array.isArray(weatherRes) ? weatherRes : []);
    } catch (err) {
      console.error(err);
      alert("Search failed: " + err.message);
    }
  };

  const handleBooking = async (flight, hotel) => {
  if (!user?.id) {
    alert("Please login first");
    return;
  }

  try {
    let dbFlight;

   if (flight) {
      const flightPayload = {
        departure_id: origin,
        arrival_id: destination,
        outbound_date: departureDate,
        return_date: returnDate || departureDate,
        price: flight.price,
        airline: flight.airline,
        flight_number: flight.flight_number,
        departure_time: flight.departure_time,
        arrival_time: flight.arrival_time,
      total_duration: flight.total_duration,
      google_flights_url: flight.google_flights_url,
      };
      dbFlight = await createFlight(flightPayload);
      await bookFlight(String(user.id), dbFlight.id);
    }

    if (hotel) {
      if (!dbFlight) {
        alert("You must book a flight before booking a hotel.");
        return;
      }
      const hotelPayload = {
          name: hotel.name,
          location: hotel.location || "",
          price: hotel.rate_per_night.extracted_lowest,
          available_rooms: 1,
          check_in_date: departureDate,
          check_out_date: returnDate || departureDate,
          link: hotel.link,
          overall_rating: hotel.overall_rating,
          reviews: hotel.reviews,
          amenities: hotel.amenities,
          images: hotel.images,
      };
      let dbHotel = await createHotel(hotelPayload);
      await bookHotel(String(user.id), dbHotel.id);
    }

    navigate("/bookings");
  } catch (err) {
    console.error(err);
    alert("Booking failed: " + err.message);
  }
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
      <div className="w-100" style={{ maxWidth: 800 }}>
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
          ✈️ Search Flights & Hotels
        </h2>
        <img
          src="/images/plane.png"
  alt="flight banner"
  className="img-fluid mb-3"
          style={{
            maxWidth: 600,
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
/>
<img
          src="/images/beach.png"
        alt="vacation banner"
        className="img-fluid mb-3"
          style={{
            maxWidth: 600,
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        />
      </div>
       <Header onLogout={onLogout} />
      
      {/* Search Form */}
      <div
        className="search-form-container mb-4"
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "20px",
          padding: "2rem",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          maxWidth: "800px",
          width: "100%",
        }}
      >
        <div className="row justify-content-center g-3">
        <div className="col-md-2">
          <input
            className="form-control"
            placeholder="From (IATA)"
            value={origin}
              onChange={(e) => setOrigin(e.target.value.toUpperCase().slice(0, 3))}
              maxLength={3}
              style={{
                borderRadius: "12px",
                border: "2px solid #e1e8ed",
                padding: "12px 16px",
                fontSize: "1rem",
                transition: "all 0.3s ease",
                textAlign: "center",
                fontWeight: "600",
                letterSpacing: "1px",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#4a5568")}
              onBlur={(e) => (e.target.style.borderColor = "#e1e8ed")}
          />
        </div>
        <div className="col-md-2">
          <input
            className="form-control"
            placeholder="To (IATA)"
            value={destination}
              onChange={(e) => setDestination(e.target.value.toUpperCase().slice(0, 3))}
              maxLength={3}
              style={{
                borderRadius: "12px",
                border: "2px solid #e1e8ed",
                padding: "12px 16px",
                fontSize: "1rem",
                transition: "all 0.3s ease",
                textAlign: "center",
                fontWeight: "600",
                letterSpacing: "1px",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#4a5568")}
              onBlur={(e) => (e.target.style.borderColor = "#e1e8ed")}
          />
        </div>
        <div className="col-md-2">
          <input
            type="date"
            className="form-control"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
              style={{
                borderRadius: "12px",
                border: "2px solid #e1e8ed",
                padding: "12px 16px",
                fontSize: "1rem",
                transition: "all 0.3s ease",
                color: "#2d3748",
                backgroundColor: "white",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#4a5568")}
              onBlur={(e) => (e.target.style.borderColor = "#e1e8ed")}
          />
        </div>
        <div className="col-md-2">
          <input
            type="date"
            className="form-control"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            placeholder="Return (opt.)"
              style={{
                borderRadius: "12px",
                border: "2px solid #e1e8ed",
                padding: "12px 16px",
                fontSize: "1rem",
                transition: "all 0.3s ease",
                color: "#2d3748",
                backgroundColor: "white",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#4a5568")}
              onBlur={(e) => (e.target.style.borderColor = "#e1e8ed")}
          />
        </div>
        <div className="col-md-2">
            <button
              className="btn w-100"
              onClick={handleSearch}
              style={{
                borderRadius: "12px",
                padding: "12px 24px",
                fontSize: "1rem",
                fontWeight: "600",
                background: "linear-gradient(135deg, #4a5568, #2d3748)",
                border: "none",
                color: "white",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(74, 85, 104, 0.4)",
              }}
              onMouseEnter={(e) => (e.target.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
            >
              🔍 Search
          </button>
          </div>
        </div>
      </div>

      {/* Weather */}
      {weather.length > 0 && (
        <div
          className="weather-container mb-4"
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "20px",
            padding: "2rem",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            maxWidth: "800px",
            width: "100%",
          }}
        >
          <h4
            style={{
              color: "#2c3e50",
              marginBottom: "1.5rem",
              fontSize: "1.8rem",
              fontWeight: "600",
            }}
          >
            🌤️ Weather in {iataData[destination] || destination}
          </h4>
          <div
            className="weather-scroll"
            style={{
              display: 'flex',
              overflowX: 'auto',
              gap: '1rem',
              paddingBottom: '1rem',
              marginBottom: '1rem'
            }}
          >
            {weather.map((w, i) => (
              <div
                key={i}
                style={{
                  minWidth: 140,
                  maxWidth: 160,
                  background: 'linear-gradient(135deg, #74b9ff, #0984e3)',
                  borderRadius: '12px',
                  padding: '1rem',
                  color: 'white',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  fontSize: '0.95rem'
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
                  {w.weather.includes("rain")
                    ? "🌧️"
                    : w.weather.includes("cloud")
                    ? "☁️"
                    : w.weather.includes("sun")
                    ? "☀️"
                    : w.weather.includes("snow")
                    ? "❄️"
                    : "🌤️"}
                </div>
                <div
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: "600",
                    marginBottom: "0.5rem",
                  }}
                >
                  {new Date(w.datetime).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: "bold",
                    marginBottom: "0.5rem",
                  }}
                >
                  {Math.round(w.temperature)}°C
                </div>
                <div style={{ fontSize: "0.9rem", opacity: "0.9" }}>
                  {w.weather}
                </div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    opacity: "0.8",
                    marginTop: "0.5rem",
                  }}
                >
                  💨 {w.wind_speed} m/s | 💧 {w.humidity}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="row g-4" style={{ maxWidth: "1200px", width: "100%" }}>
        {/* Flights */}
        <div className="col-md-6">
          <div
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              borderRadius: "20px",
              padding: "2rem",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              height: "fit-content",
            }}
          >
            <h4
              style={{
                color: "#2c3e50",
                marginBottom: "1.5rem",
                fontSize: "1.8rem",
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              ✈️ Flights
            </h4>
            {!flights.length && (
              <p style={{ textAlign: "center", color: "#7f8c8d" }}>
                No flights found.
              </p>
            )}
          {flights.map((flight) => (
              <div
                key={flight.id}
                style={{
                  background: "linear-gradient(135deg, #f8f9fa, #e9ecef)",
                  borderRadius: "15px",
                  padding: "1.5rem",
                  marginBottom: "1rem",
                  border: "1px solid #e9ecef",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => (e.target.style.transform = "translateY(-2px)")}
                onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
              >
                <h5>{flight.airline} — {flight.flight_number}</h5>
              <p>Departure: {flight.departure_time}</p>
              <p>Arrival: {flight.arrival_time}</p>
              <p>
                Duration: {Math.floor(flight.total_duration / 60)}h{" "}
                {flight.total_duration % 60}m
              </p>
              <p>Price: ${flight.price}</p>
              <a
                href={flight.google_flights_url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-link btn-sm"
              >
                View on Google Flights
              </a>
              <button
                  className="btn mt-2 w-100"
                onClick={() => handleBooking(flight, null)}
                  style={{
                    borderRadius: "10px",
                    padding: "10px 20px",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    background: "linear-gradient(135deg, #4a5568, #2d3748)",
                    border: "none",
                    color: "white",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => (e.target.style.transform = "translateY(-1px)")}
                  onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
                >
                  ✈️ Book Flight
              </button>
            </div>
          ))}
          </div>
        </div>

        {/* Hotels */}
        <div className="col-md-6">
          <div
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              borderRadius: "20px",
              padding: "2rem",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              height: "fit-content",
            }}
          >
            <h4
              style={{
                color: "#2c3e50",
                marginBottom: "1.5rem",
                fontSize: "1.8rem",
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              🏨 Hotels
            </h4>
            {!hotels.length && (
              <p style={{ textAlign: "center", color: "#7f8c8d" }}>
                No hotels found.
              </p>
            )}
          {hotels.map((hotel) => (
              <div
                key={hotel.id}
                style={{
                  background: "linear-gradient(135deg, #f8f9fa, #e9ecef)",
                  borderRadius: "15px",
                  padding: "1.5rem",
                  marginBottom: "1rem",
                  border: "1px solid #e9ecef",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => (e.target.style.transform = "translateY(-2px)")}
                onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
              >
              <div className="d-flex align-items-start">
                {hotel.images?.[0]?.thumbnail ? (
                <img
                src={hotel.images[0].thumbnail}
                alt={hotel.name}
                className="img-thumbnail me-3"
                style={{
                width: 120,
                height: 80,
                objectFit: "cover",
                }}
              />
              ) : null}
               
                <div>
                  <h5>
                    <a href={hotel.link} target="_blank" rel="noreferrer">
                      {hotel.name}
                    </a>
                  </h5>
                  <p>Type: {hotel.type}</p>
                  <p>
                    Rating: ⭐ {hotel.overall_rating} (
                    {hotel.reviews ?? 0} reviews)
                  </p>
                  <p>Rate/Night: {hotel.rate_per_night?.lowest}</p>
                  <p>
                    Amenities:{" "}
                    {hotel.amenities?.slice(0, 4).join(", ")}
                    {hotel.amenities?.length > 4 && "..."}
                  </p>
                  <div className="mt-2">
                    <button
                        className="btn me-2"
                      onClick={() => handleBooking(flights[0], hotel)}
                        style={{
                          borderRadius: "10px",
                          padding: "8px 16px",
                          fontSize: "0.85rem",
                          fontWeight: "600",
                          background: "linear-gradient(135deg, #00b894, #00a085)",
                          border: "none",
                          color: "white",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => (e.target.style.transform = "translateY(-1px)")}
                        onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
                      >
                        ✈️ Book w/ Flight
                    </button>
                    <button
                        className="btn"
                      onClick={() => handleBooking(null, hotel)}
                                              style={{
                        borderRadius: "10px",
                        padding: "8px 16px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        background: "linear-gradient(135deg, #4a5568, #2d3748)",
                        border: "none",
                        color: "white",
                        transition: "all 0.3s ease",
                      }}
                        onMouseEnter={(e) => (e.target.style.transform = "translateY(-1px)")}
                        onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
                      >
                        🏨 Book Hotel
                    </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
