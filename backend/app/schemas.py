from pydantic import BaseModel
from datetime import date
from typing import Optional,List,Dict


# --- User Schemas ---

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class GoogleUserCreate(BaseModel):
    id: str  # Google user ID
    email: str
    name: str

class User(BaseModel):
    id: str  # Changed to str to accommodate Google user IDs
    username: str
    email: str
    is_active: bool

    class Config:
        orm_mode = True

# --- Hotel Schemas ---

class HotelBase(BaseModel):
    name: str
    location: str
    price: int
    available_rooms: int
    check_in_date: date
    check_out_date: date

class HotelCreate(HotelBase):
    link: Optional[str]                 = None
    overall_rating: Optional[float]     = None
    reviews: Optional[int]              = None
    amenities: Optional[List[str]]      = None
    images: Optional[List[Dict[str,str]]] = None


    class Config:
        orm_mode = True
    

   
class HotelUpdate(BaseModel):
    name:            Optional[str] = None
    location:        Optional[str] = None
    price:           Optional[int] = None          
    available_rooms: Optional[int] = None
    link:            Optional[str] = None          
    overall_rating:  Optional[float] = None
    reviews:         Optional[int]   = None

    class Config:
        orm_mode = True

class Hotel(HotelBase):
    id: int
    link: Optional[str] 
    overall_rating:   Optional[float] 
    reviews: Optional[int]   
    rate_per_night: Optional[dict] = None
    amenities: Optional[list[str]] = []
    images: Optional[list[dict]] =[]
    

    class Config:
        orm_mode = True

# --- Flight Schemas ---

class FlightBase(BaseModel):
    departure_id: str
    arrival_id: str
    outbound_date: date
    return_date: date
    price: int

class FlightCreate(FlightBase):
    airline: Optional[str] = None
    flight_number: Optional[str] = None
    departure_time: Optional[str] = None
    arrival_time: Optional[str] = None
    total_duration: Optional[int] = None
    google_flights_url: Optional[str] = None
  
    class Config:
        orm_mode = True


class FlightUpdate(BaseModel):
    airline: Optional[str] 
    departure: Optional[str] 
    arrival: Optional[str] 
    price: Optional[float]
    available_seats: Optional[int] 

    class Config:
        orm_mode = True

class Flight(FlightBase):
    id: int
    airline: Optional[str] 
    flight_number: Optional[str] 
    departure_time: Optional[str] 
    arrival_time: Optional[str]
    total_duration: Optional[int] 
    google_flights_url: Optional[str] 

    class Config:
        orm_mode = True

# --- Booking Schemas ---

class BookingBase(BaseModel):
    user_id: str
    hotel_id: Optional[int] = None
    flight_id: Optional[int] = None

class BookingCreate(BookingBase):
     user_id: str
     flight_id: Optional[int] = None
     hotel_id:  Optional[int] = None

class Booking(BaseModel):
    id: int
    user_id: str
    flight_id: Optional[int] 
    hotel_id:  Optional[int] 
    booking_date: date

    # ← new nested objects
    flight: Optional[Flight] 
    hotel:  Optional[Hotel]  
    class Config:
        orm_mode = True

