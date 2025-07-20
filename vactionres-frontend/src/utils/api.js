// src/utils/api.js
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8800';

// — Auth —

export const registerUser = async (userData) => {
  const res = await fetch(`${BASE_URL}/users/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Registration failed: ${err}`);
  }
  return await res.json();
};

export const loginUser = async (credentials) => {
  const form = new URLSearchParams();
  form.append('username', credentials.email); // FastAPI expects “username”
  form.append('password', credentials.password);

  const res = await fetch(`${BASE_URL}/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Login failed: ${err}`);
  }
  return await res.json();
};

export const createGoogleUser = async (userData) => {
  const res = await fetch(`${BASE_URL}/users/google/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google user creation failed: ${err}`);
  }
  return await res.json();
};

// — Bookings —

// This is the one that BookingsPage.jsx imports:
export const fetchBookings = async (userId) => {
  const res = await fetch(`${BASE_URL}/bookings/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch bookings');
  return await res.json();
};




// deleteBooking(id, type) where type is 'flights' or 'hotels'
export const deleteBooking = async (id, type) => {
  const res = await fetch(`${BASE_URL}/bookings/${type}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete booking');
  return await res.json();
};

// — Search —

export const searchFlights = async (origin, destination, departure_date, return_date) => {
  const url = new URL(`${BASE_URL}/search_flights/`);
  url.searchParams.set('origin', origin);
  url.searchParams.set('destination', destination);
  url.searchParams.set('departure_date', departure_date);
  if (return_date) url.searchParams.set('return_date', return_date);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Flight search failed');
  return await res.json();
};

export const searchHotels = async (destination, check_in, check_out, adults = 2, currency = 'USD') => {
  const url = new URL(`${BASE_URL}/search-hotels`);
  url.searchParams.set('destination', destination);
  url.searchParams.set('check_in', check_in);
  url.searchParams.set('check_out', check_out);
  url.searchParams.set('adults', adults);
  url.searchParams.set('currency', currency);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Hotel search failed');
  return await res.json();
};

export const getWeather = async (cityName) => {
  const url = new URL(`${BASE_URL}/weather/`);
  url.searchParams.set('city_name', cityName);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather fetch failed');
  return await res.json();
};

// — Book a Flight/Hotel with full details —

export const bookFlight = async (user_id, flight_id) => {
  const res = await fetch(
    `${BASE_URL}/bookings/flights/?user_id=${user_id}&flight_id=${flight_id}`,
    { method: 'POST' }
  );
  if (!res.ok) throw new Error('Flight booking failed');
  return res.json();
};

export const bookHotel = async (user_id, hotel_id) => {
  const res = await fetch(
    `${BASE_URL}/bookings/hotels/?user_id=${user_id}&hotel_id=${hotel_id}`,
    { method: 'POST' }
  );
  if (!res.ok) throw new Error('Hotel booking failed');
  return await res.json();
};

// — Create new flight in your DB —
export const createFlight = async (flightData) => {
  const res = await fetch(`${BASE_URL}/flights/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(flightData),
  });
  if (!res.ok) throw new Error("Flight creation failed");
  return await res.json();
};

// — Create new hotel in your DB —
export const createHotel = async (hotelData) => {
  const res = await fetch(`${BASE_URL}/hotels/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(hotelData),
  });
  if (!res.ok) throw new Error("Hotel creation failed");
  return await res.json();
};