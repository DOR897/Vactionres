import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import iataData from "../iata_to_city.json";

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
  // "YYYY-MM-DD" is OK
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // "DD/MM/YYYY" or "MM/DD/YYYY"
  const parts = s.split(/[\\/]/);
  if (parts.length === 3) {
    let [a,b,c] = parts.map(x => x.padStart(2,"0"));
    // you can decide whether a=day or month; here we assume DD/MM/YYYY:
    return `${c}-${b}-${a}`;
  }
  return s; // let backend catch the invalid format
}



  const ci = normalizeDate(departureDate);
  const co = normalizeDate(returnDate || departureDate);

  const handleSearch = async () => {
    if (!origin || !destination || !departureDate) {
      alert("Fill in origin, destination, departure date");
      return;
    }
    const cityName = iataData[destination] || destination;
    const ci = normalizeDate(departureDate);
    const co = normalizeDate(returnDate || departureDate);

    try {
      // 1) Flights
      const flightRes = await searchFlights(
        origin,
        destination,
        departureDate,
        returnDate
      );
      const flightsArray = flightRes.flights || [];
      const withFlightId = flightsArray.map((f, i) => ({ ...f, id: i }));

      // 2) Hotels
      const hotelRes = await searchHotels(
        cityName,
        ci,
        co 
      );
      const hotelsArray = hotelRes.hotels || [];
      const withHotelId = hotelsArray.map((h, i) => ({ ...h, id: i }));

      // 3) Weather
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
    // 1) Save & book flight
    let dbFlight;

    //  Create the flight in your DB and grab its real id
   if (flight) {
      const flightPayload = {
      departure_id:   origin,
      arrival_id:     destination,
      outbound_date:  departureDate,
      return_date:    returnDate || departureDate,
      price:          flight.price,
      airline:        flight.airline,
      flight_number:  flight.flight_number,
      departure_time: flight.departure_time,
      arrival_time:   flight.arrival_time,
      total_duration: flight.total_duration,
      google_flights_url: flight.google_flights_url,
      };
      dbFlight = await createFlight(flightPayload);
      // 2) Book it
      await bookFlight(user.id, dbFlight.id);
    }

    // 3) Then do the hotel (if any)
    if (hotel) {
      if (!dbFlight) {
        alert("You must book a flight before booking a hotel.");
        return;
      }
      const hotelPayload = {
      name:            hotel.name,
      location:        hotel.location || "",
      price:           hotel.rate_per_night.extracted_lowest,
      available_rooms: 1,
      check_in_date:   departureDate,
      check_out_date:  returnDate || departureDate,
      link:            hotel.link,
      overall_rating:  hotel.overall_rating,
      reviews:         hotel.reviews,
      amenities:       hotel.amenities,
      images:          hotel.images,
      };
      let dbHotel = await createHotel(hotelPayload);
      await bookHotel(user.id, dbHotel.id);
    }

    navigate("/bookings");
  } catch (err) {
    console.error(err);
    alert("Booking failed: " + err.message);
  }
};

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between mb-4">
        <h2>Search Flights & Hotels</h2>
        <button className="btn btn-outline-danger" onClick={onLogout}>
          Logout
        </button>
      </div>

      {/* ── Search Form ── */}
      <div className="row mb-4">
        <div className="col-md-2">
          <input
            className="form-control"
            placeholder="From (IATA)"
            value={origin}
            onChange={(e) => setOrigin(e.target.value.toUpperCase())}
          />
        </div>
        <div className="col-md-2">
          <input
            className="form-control"
            placeholder="To (IATA)"
            value={destination}
            onChange={(e) => setDestination(e.target.value.toUpperCase())}
          />
        </div>
        <div className="col-md-2">
          <input
            type="date"
            className="form-control"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <input
            type="date"
            className="form-control"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            placeholder="Return (opt.)"
          />
        </div>
        <div className="col-md-2">
          <button className="btn btn-primary w-100" onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>

      {/* ── Weather ── */}
      {weather.length > 0 && (
        <div className="alert alert-info">
          <h5>Weather in {iataData[destination] || destination}</h5>
          <ul className="list-unstyled">
            {weather.map((w, i) => (
              <li key={i}>
                {w.datetime} — {w.weather}, {w.temperature}°C, wind{" "}
                {w.wind_speed} m/s, humidity {w.humidity}%
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="row">
        {/* ── Flights ── */}
        <div className="col-md-6">
          <h4>Flights</h4>
          {!flights.length && <p>No flights found.</p>}
          {flights.map((flight) => (
            <div key={flight.id} className="card mb-3 p-3 shadow-sm">
              <h5>
                {flight.airline} — {flight.flight_number}
              </h5>
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
                className="btn btn-outline-primary mt-2 w-100"
                onClick={() => handleBooking(flight, null)}
              >
                Book Flight
              </button>
            </div>
          ))}
        </div>

        {/* ── Hotels ── */}
        <div className="col-md-6">
          <h4>Hotels</h4>
          {!hotels.length && <p>No hotels found.</p>}
          {hotels.map((hotel) => (
            <div key={hotel.id} className="card mb-3 p-3 shadow-sm">
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
                      className="btn btn-outline-success me-2"
                      onClick={() => handleBooking(flights[0], hotel)}
                    >
                      Book w/ Flight
                    </button>
                    <button
                      className="btn btn-success"
                      onClick={() => handleBooking(null, hotel)}
                    >
                      Book Hotel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
