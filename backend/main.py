from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.services import search_flights, search_hotels, get_weather
from app.database import SessionLocal, engine 
from app import models, schemas, services ,crud
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, get_db
from datetime import datetime
from typing import Optional


# Create the database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Allow frontend to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["*"] for all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# User Endpoints
@app.get("/")
def read_root():
    return {"message": "Welcome to our FastAPI reservation system!"}

@app.post("/login/")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user(db, form_data.username)
    if not user or not crud.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    return {"message": "Login successful", "user_id": user.id, "email": user.email}

@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.create_user(db=db, user=user)


# Hotel Endpoints
@app.post("/hotels/", response_model=schemas.Hotel)
def create_hotel(hotel: schemas.HotelCreate, db: Session = Depends(get_db)):
    return crud.create_hotel(db=db, hotel=hotel)


@app.get("/hotels/", response_model=list[schemas.Hotel])
def get_hotels(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return crud.get_hotels(db=db, skip=skip, limit=limit)

@app.put("/hotels/{hotel_id}", response_model=schemas.Hotel)
def update_hotel(hotel_id: int, hotel_data: schemas.HotelUpdate, db: Session = Depends(get_db)):
    updated_hotel = crud.update_hotel(db, hotel_id, hotel_data)
    if not updated_hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return updated_hotel


@app.get("/search-hotels")
def search_hotels_endpoint(
    destination: str,
    check_in: str,
    check_out: str,
    adults: int = 2,
    currency: str = "USD"
):
    """API endpoint to search for hotels"""
    # SerpAPI expects MM/DD/YYYY, not ISO
    ci = datetime.strptime(check_in,  "%Y-%m-%d").strftime("%m/%d/%Y")
    co = datetime.strptime(check_out, "%Y-%m-%d").strftime("%m/%d/%Y")
    hotels = services.search_hotels(destination, ci, co, adults, currency)
    return {"hotels": hotels}

# Flight Endpoints
@app.post("/flights/", response_model=schemas.Flight)
def create_flight(flight: schemas.FlightCreate, db: Session = Depends(get_db)):
    return crud.create_flight(db=db, flight=flight)


@app.get("/flights/", response_model=list[schemas.Flight])
def get_flights(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return crud.get_flights(db=db, skip=skip, limit=limit)


@app.put("/flights/{flight_id}", response_model=schemas.Flight)
def update_flight(flight_id: int, flight_data: schemas.FlightUpdate, db: Session = Depends(get_db)):
    updated_flight = crud.update_flight(db, flight_id, flight_data)
    if not updated_flight:
        raise HTTPException(status_code=404, detail="Flight not found")
    return updated_flight

@app.get("/search_flights/")
async def search_flights_endpoint(
    origin: str = Query(..., description="Departure airport IATA code"),
    destination: str = Query(..., description="Arrival airport IATA code"),
    departure_date: str = Query(..., description="Departure date (YYYY-MM-DD)"),
    return_date: str = Query(None, description="Return date (YYYY-MM-DD) - optional")
):
    """
    API endpoint to search for flights using SerpAPI.
    """
    try:
        flights = search_flights(origin, destination, departure_date, return_date)
        return {"flights": flights}
    except HTTPException as http_exc:
        raise http_exc  # Re-raise known exceptions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error occurred: {str(e)}")




# Booking endpoints
@app.post("/bookings/flights/",response_model=schemas.Booking)
def book_flight(
    user_id: int   = Query(..., description="ID of the user"),
    flight_id: int = Query(..., description="ID of an existing flight"),
    db: Session    = Depends(get_db),
):
    return services.book_flight(db, user_id, flight_id)


@app.post("/bookings/hotels/",response_model=schemas.Booking)
def book_hotel(
    user_id: int = Query(..., description="ID of the user"),
    hotel_id: int  = Query(..., description="ID of an existing hotel"),
    db: Session    = Depends(get_db),
):
    return services.book_hotel(db, user_id, hotel_id)

@app.delete("/bookings/flights/{booking_id}")
def delete_flight_booking(booking_id: int, db: Session = Depends(get_db)):
    return crud.delete_flight_booking(db, booking_id)

@app.delete("/bookings/hotels/{booking_id}")
def delete_hotel_booking(booking_id: int, db: Session = Depends(get_db)):
    return crud.delete_hotel_booking(db, booking_id)

@app.get("/bookings/{user_id}", response_model=list[schemas.Booking])
def get_user_bookings(
    user_id: int,
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
): 
    return crud.get_bookings(db, user_id, skip, limit)


# Weather Endpoint
@app.get("/weather/")
def get_weather_endpoint(city_name: str):
    return services.get_weather(city_name)


