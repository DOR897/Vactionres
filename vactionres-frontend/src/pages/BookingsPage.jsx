import { useEffect, useState } from 'react';
import { fetchBookings, deleteBooking } from '../utils/api';

const BookingsPage = ({ user }) => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const data = await fetchBookings(user.id);
        setBookings(data);
      } catch (err) {
        console.error('Failed to load bookings:', err);
      }
    };
    loadBookings();
  }, [user.id]);

  const handleDelete = async (type, id) => {
    try {
      await deleteBooking(type, id);
      setBookings(bookings.filter(b => b.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">My Bookings</h2>
      {bookings.length === 0 ? (
        <p className="text-muted text-center">No bookings found.</p>
      ) : (
        bookings.map((booking) => (
          <div key={booking.id} className="card mb-3 shadow-sm p-3">
            <h5>{booking.type === 'flight' ? 'Flight Booking' : 'Hotel Booking'}</h5>
            <p><strong>ID:</strong> {booking.id}</p>
            <pre className="bg-light p-2 rounded small">{JSON.stringify(booking.details, null, 2)}</pre>
            <button className="btn btn-danger mt-2" onClick={() => handleDelete(booking.type === 'flight' ? 'flights' : 'hotels', booking.id)}>
              Cancel Booking
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default BookingsPage;
