import { useState } from "react";
import { useNavigate } from "react-router-dom";
import iataData from "../iata_to_city.json";

const SearchPage = ({ user, onLogout }) => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [flights, setFlights] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [weather, setWeather] = useState(null);
  const navigate = useNavigate();

  const handleSearch = async () => {
    const cityName = iataData[destination] || destination;

    try {
      const [flightsRes, hotelsRes, weatherRes] = await Promise.all([
        fetch(`http://localhost:8800/search_flights/?origin=${origin}&destination=${destination}&departure_date=${departureDate}`),
        fetch(`http://localhost:8800/search-hotels?destination=${cityName}&check_in=${departureDate}&check_out=${departureDate}&adults=2&currency=USD`),
        fetch(`http://localhost:8800/weather/?city_name=${cityName}`),
      ]);

      setFlights(await flightsRes.json());
      setHotels(await hotelsRes.json());
      setWeather(await weatherRes.json());
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  const handleBooking = async (flight, hotel) => {
    try {
      if (flight?.id) {
        await fetch(`http://localhost:8800/bookings/flights/?user_id=${user.id}&flight_id=${flight.id}`, {
          method: "POST",
        });
      }

      if (hotel?.id) {
        if (!flight?.id) {
          alert("You must select a flight before booking a hotel.");
          return;
        }
        await fetch(`http://localhost:8800/bookings/hotels/?user_id=${user.id}&hotel_id=${hotel.id}`, {
          method: "POST",
        });
      }

      navigate("/bookings");
    } catch (err) {
      console.error("Booking failed:", err);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">Search Flights & Hotels</h2>

      <div className="row mb-4 justify-content-center">
        <div className="col-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="From (IATA)"
            value={origin}
            onChange={(e) => setOrigin(e.target.value.toUpperCase())}
          />
        </div>
        <div className="col-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="To (IATA)"
            value={destination}
            onChange={(e) => setDestination(e.target.value.toUpperCase())}
          />
        </div>
        <div className="col-md-3">
          <input
            type="date"
            className="form-control"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <input
           type="date"
           className="form-control"
           placeholder="Return Date"
           value={returnDate}
           onChange={(e) => setReturnDate(e.target.value)}
          />
        </div>
        
  
        <div className="col-md-2">
          <button className="btn btn-primary w-100" onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>

      {weather && (
        <div className="alert alert-info text-center">
          <h5>Weather in {iataData[destination] || destination}</h5>
          <ul className="list-unstyled">
            {weather.slice(0, 5).map((w, index) => (
              <li key={index}>
                {w.datetime} - {w.weather}, Temp: {w.temperature}°C, Wind: {w.wind_speed} m/s, Humidity: {w.humidity}%
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="row">
        <div className="col-md-6">
          <h4>Flights</h4>
          {flights.map((flight) => (
            <div key={flight.id} className="card mb-3 p-3 shadow-sm">
              <p><strong>{flight.airline}</strong> — {flight.flight_number}</p>
              <p>{flight.departure_airport} ➜ {flight.arrival_airport}</p>
              <button className="btn btn-outline-primary w-100" onClick={() => handleBooking(flight, null)}>
                Book Flight Only
              </button>
            </div>
          ))}
        </div>

        <div className="col-md-6">
          <h4>Hotels</h4>
          {hotels.map((hotel) => (
            <div key={hotel.id} className="card mb-3 p-3 shadow-sm">
              <h5>{hotel.name}</h5>
              <p>{hotel.address}</p>
              <div className="d-flex gap-2 flex-wrap justify-content-center">
                <button className="btn btn-outline-secondary" onClick={() => handleBooking(flights[0], hotel)}>
                  Book with Flight
                </button>
                <button className="btn btn-success" onClick={() => handleBooking(null, hotel)}>
                  Book Hotel Only
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
