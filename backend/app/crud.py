from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.models import User, Hotel, Flight, Booking
from app.schemas import UserCreate, HotelCreate, FlightCreate, BookingCreate , HotelUpdate, FlightUpdate
from datetime import date

# User 
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_user(db: Session, username_or_email: str):
    return db.query(User).filter(User.email == username_or_email).first()


def create_user(db: Session, user: UserCreate):
    hashed_password = hash_password(user.password)
    db_user = User(username=user.username, email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user




# Hotel CRUD
def get_hotels(db: Session, skip: int = 0, limit: int = 10):
    return db.query(Hotel).offset(skip).limit(limit).all()

def create_hotel(db: Session, hotel: HotelCreate):
    db_hotel = Hotel(**hotel.dict())
    db.add(db_hotel)
    db.commit()
    db.refresh(db_hotel)
    return db_hotel

def update_hotel(db: Session, hotel_id: int, hotel_data: HotelUpdate):
    db_hotel = db.query(Hotel).filter(Hotel.id == hotel_id).first()
    if not db_hotel:
        return None
    for key, value in hotel_data.dict(exclude_unset=True).items():
        setattr(db_hotel, key, value)
    db.commit()
    db.refresh(db_hotel)
    return db_hotel



# Flight CRUD
def get_flights(db: Session, skip: int = 0, limit: int = 10):
    return db.query(Flight).offset(skip).limit(limit).all()

def create_flight(db: Session, flight: FlightCreate):
    db_flight = Flight(**flight.dict())
    db.add(db_flight)
    db.commit()
    db.refresh(db_flight)
    return db_flight

def update_flight(db: Session, flight_id: int, flight_data: FlightUpdate):
    db_flight = db.query(Flight).filter(Flight.id == flight_id).first()
    if not db_flight:
        return None
    for key, value in flight_data.dict(exclude_unset=True).items():
        setattr(db_flight, key, value)
    db.commit()
    db.refresh(db_flight)
    return db_flight


# Booking CRUD
def create_booking(db: Session, booking: BookingCreate):
    db_booking = Booking(**booking.dict(), booking_date=date.today())
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking

def get_bookings(db: Session, user_id: int, skip: int = 0, limit: int = 10):
    return db.query(Booking).filter(Booking.user_id == user_id).offset(skip).limit(limit).all()

def delete_flight_booking(db: Session, booking_id: int):
    booking = db.query(Booking).filter(Booking.id == booking_id, Booking.flight_id.isnot(None)).first()
    if booking:
        db.delete(booking)
        db.commit()
        return {"message": "Flight booking deleted successfully"}
    return {"error": "Flight booking not found"}

# Delete Hotel Booking
def delete_hotel_booking(db: Session, booking_id: int):
    booking = db.query(Booking).filter(Booking.id == booking_id, Booking.hotel_id.isnot(None)).first()
    if booking:
        db.delete(booking)
        db.commit()
        return {"message": "Hotel booking deleted successfully"}
    return {"error": "Hotel booking not found"}