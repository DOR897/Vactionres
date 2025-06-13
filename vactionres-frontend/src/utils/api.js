const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8800';

export const registerUser = async (userData) => {
  const payload = {
    username: userData.email, // Map email to username for FastAPI schema
    password: userData.password
  };

  const res = await fetch(`${BASE_URL}/users/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Registration failed: ${error}`);
  }

  return await res.json();
};

export const loginUser = async (credentials) => {
  const formData = new URLSearchParams();
  formData.append('username', credentials.email);  // again username
  formData.append('password', credentials.password);

  const res = await fetch(`${BASE_URL}/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData,
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Login failed: ${error}`);
  }

  return await res.json();
};

export const fetchBookings = async (userId) => {
  const res = await fetch(`${BASE_URL}/bookings/${userId}`);
  return res.json();
};

export const deleteBooking = async (type, id) => {
  const res = await fetch(`${BASE_URL}/bookings/${type}/${id}`, {
    method: 'DELETE'
  });
  return res.json();
};

export const searchFlights = async (origin, destination, departure_date) => {
  const res = await fetch(`${BASE_URL}/search_flights/?origin=${origin}&destination=${destination}&departure_date=${departure_date}`);
  return res.json();
};

export const searchHotels = async (destination, check_in, check_out, adults = 2, currency = 'USD') => {
  const res = await fetch(`${BASE_URL}/search-hotels?destination=${destination}&check_in=${check_in}&check_out=${check_out}&adults=${adults}&currency=${currency}`);
  return res.json();
};

export const getWeather = async (cityName) => {
  const res = await fetch(`${BASE_URL}/weather/?city_name=${cityName}`);
  return res.json();
};

export const bookFlight = async (user_id, flight_id) => {
  const res = await fetch(`${BASE_URL}/bookings/flights/?user_id=${user_id}&flight_id=${flight_id}`, {
    method: 'POST'
  });
  return res.json();
};

export const bookHotel = async (user_id, hotel_id) => {
  const res = await fetch(`${BASE_URL}/bookings/hotels/?user_id=${user_id}&hotel_id=${hotel_id}`, {
    method: 'POST'
  });
  return res.json();
};