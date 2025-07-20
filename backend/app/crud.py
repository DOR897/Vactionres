from sqlalchemy.orm import Session ,joinedload
from passlib.context import CryptContext
from app.models import User, Hotel, Flight, Booking
from app.schemas import UserCreate, GoogleUserCreate, HotelCreate, FlightCreate, BookingCreate , HotelUpdate, FlightUpdate
from datetime import date
import uuid

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def create_user(db: Session, user: UserCreate):
    # hash with bcrypt
    hashed_pw = pwd_context.hash(user.password)
    
    # Generate a unique ID for regular users (you can use UUID or a simple counter)
    user_id = str(uuid.uuid4())
    
    db_user = User(
        id=user_id,
        username=user.username,
        email=user.email,
        hashed_password=hashed_pw,
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_google_user(db: Session, user: GoogleUserCreate):
    # Check if user already exists
    existing_user = db.query(User).filter(User.id == user.id).first()
    if existing_user:
        return existing_user
    
    # Create new Google user
    db_user = User(
        id=user.id,
        username=user.name,
        email=user.email,
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# replace your old verify_password:
def verify_password(plain_password: str, hashed_password: str) -> bool:
    # now uses the same context
    return pwd_context.verify(plain_password, hashed_password)



def hash_password(password: str) -> str:
    return pwd_context.hash(password)



# Hotel CRUD
def get_hotels(db: Session, skip: int = 0, limit: int = 10):
    return db.query(Hotel).offset(skip).limit(limit).all()

def create_hotel(db: Session, hotel: HotelCreate):
    data = hotel.dict(exclude_none=True)
    db_hotel = Hotel(**data)
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

def get_bookings(db: Session, user_id: str, skip: int = 0, limit: int = 10):
    """
    Return list of Booking ORM objects with .flight and .hotel populated.
    FastAPI/Pydantic will automatically convert them according to your Booking schema.
    """
    return (
        db.query(Booking)
          .options(
            joinedload(Booking.flight),
            joinedload(Booking.hotel),
          )
          .filter(Booking.user_id == user_id)
          .offset(skip)
          .limit(limit)
          .all()
    )

def delete_flight_booking(db: Session, booking_id: int):
    booking = (
        db.query(Booking)
          .filter(Booking.id == booking_id,
                  Booking.flight_id != None)
          .first()
    )
    if booking:
        db.delete(booking)
        db.commit()
        return {"message": "Flight booking deleted"}
    return {"message": "Booking not found"}

def delete_hotel_booking(db: Session, booking_id: int):
    booking = (
        db.query(Booking)
          .filter(Booking.id == booking_id,
                  Booking.hotel_id != None)
          .first()
    )
    if booking:
        db.delete(booking)
        db.commit()
        return {"message": "Hotel booking deleted"}
    return {"message": "Booking not found"}