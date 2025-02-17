from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

# User Model
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

    # Relationships
    bookings = relationship("Booking", back_populates="user")

# Hotel Model
class Hotel(Base):
    __tablename__ = "hotels"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    location = Column(String)
    price = Column(Integer)
    available_rooms = Column(Integer)
    check_in_date = Column(Date)
    check_out_date = Column(Date)

# Flight Model
class Flight(Base):
    __tablename__ = "flights"

    id = Column(Integer, primary_key=True, index=True)
    departure_id = Column(String)
    arrival_id = Column(String)
    outbound_date = Column(Date)
    return_date = Column(Date)
    price = Column(Integer)

# Booking Model (For both Hotels and Flights)
class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=True)
    flight_id = Column(Integer, ForeignKey("flights.id"), nullable=True)
    booking_date = Column(Date)

    # Relationships
    user = relationship("User", back_populates="bookings")
    hotel = relationship("Hotel")
    flight = relationship("Flight")

