from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey,Float
from sqlalchemy.orm import relationship
from sqlalchemy import JSON
from app.database import Base
from datetime import date


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
    link            = Column(String)
    overall_rating  = Column(Float)
    reviews         = Column(Integer)
    check_in_date = Column(Date)
    check_out_date = Column(Date)
    amenities      = Column(JSON, nullable=True)
    images         = Column(JSON, nullable=True)
    bookings = relationship("Booking", back_populates="hotel")
    

# Flight Model
class Flight(Base):
    __tablename__ = "flights"

    id = Column(Integer, primary_key=True, index=True)
    departure_id = Column(String)
    arrival_id = Column(String)
    outbound_date = Column(Date)
    return_date = Column(Date)
    airline         = Column(String)
    flight_number   = Column(String)
    departure_time  = Column(String)
    arrival_time    = Column(String)
    total_duration  = Column(Integer)
    price           = Column(Float)
    google_flights_url = Column(String)
    bookings = relationship("Booking", back_populates="flight")

# Booking Model (For both Hotels and Flights)
class Booking(Base):
    __tablename__ = "bookings"

    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id"), nullable=False)
    flight_id    = Column(Integer, ForeignKey("flights.id"), nullable=True)
    hotel_id     = Column(Integer, ForeignKey("hotels.id"), nullable=True)
    booking_date = Column(Date, default=date.today)
    user = relationship("User", back_populates="bookings")

    # ← here are the relationships
    flight = relationship("Flight", back_populates="bookings",lazy="joined")
    hotel  = relationship("Hotel",  back_populates="bookings",lazy="joined")

