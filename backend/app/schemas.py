from pydantic import BaseModel
from datetime import date
from typing import Optional

# User schema
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class User(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool

    class Config:
        orm_mode = True

# Hotel schema
class HotelBase(BaseModel):
    name: str
    location: str
    price: int
    available_rooms: int
    check_in_date: date
    check_out_date: date
    
class HotelUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    price_per_night: Optional[float] = None
    available_rooms: Optional[int] = None

    class Config:
        orm_mode = True

class FlightUpdate(BaseModel):
    airline: Optional[str] = None
    departure: Optional[str] = None
    arrival: Optional[str] = None
    price: Optional[float] = None
    available_seats: Optional[int] = None

    class Config:
        orm_mode = True

class HotelCreate(HotelBase):
    pass

class Hotel(HotelBase):
    id: int

    class Config:
        orm_mode = True

# Flight schema
class FlightBase(BaseModel):
    departure_id: str
    arrival_id: str
    outbound_date: date
    return_date: date
    price: int

class FlightCreate(FlightBase):
    pass

class FlightUpdate(BaseModel):
    airline: Optional[str] = None
    departure: Optional[str] = None
    arrival: Optional[str] = None
    price: Optional[float] = None
    available_seats: Optional[int] = None

    class Config:
        orm_mode = True

class Flight(FlightBase):
    id: int

    class Config:
        orm_mode = True

# Booking schema
class BookingBase(BaseModel):
    user_id: int
    hotel_id: Optional[int] = None
    flight_id: Optional[int] = None

class BookingCreate(BookingBase):
    pass

class Booking(BookingBase):
    id: int
    booking_date: date

    class Config:
        orm_mode = True
