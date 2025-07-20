import requests
import os
from fastapi import HTTPException
from datetime import date
import httpx
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from app import models, schemas, crud
from app.crud import delete_flight_booking as crud_delete_flight_booking
from app.crud import delete_hotel_booking as crud_delete_hotel_booking
from datetime import datetime



load_dotenv()

# Load API keys from environment variables
SERPAPI_API_KEY = os.getenv("SERPAPI_API_KEY")
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")

# API URLs

SERPAPI_API_URL = "https://serpapi.com/search.json"
WEATHER_API_URL = "http://api.openweathermap.org/data/2.5/forecast"

def _normalize_date(s: str) -> str:
    """
    Take various common user‐entered formats (e.g. "2025-06-22", "22/06/2025", "06/22/2025")
    and return exactly "YYYY-MM-DD", or throw a 400 if we can't parse it.
    """
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%d\\%m\\%Y"):
        try:
            return datetime.strptime(s, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    raise HTTPException(400, detail=f"Invalid date format: {s!r}. Use YYYY-MM-DD.")


def search_flights(origin: str, destination: str, departure_date: str, return_date: str = None):
    """
    Searches for flights using SerpAPI (Google Flights).
    """
    # Check if API key is available
    if not SERPAPI_API_KEY:
        raise HTTPException(status_code=500, detail="SerpAPI key is missing. Please configure your environment variables.")

    params = {
        "engine": "google_flights",
        "departure_id": origin,
        "arrival_id": destination,
        "outbound_date": departure_date,
        "return_date": return_date or "",
        "api_key": SERPAPI_API_KEY,
        "hl": "en",
        "currency": "USD",
        "gl": "us",
        "type": "1",  # Round trip flights
        "sort_by": "2",  # Sort by price
        "deep_search": "true",
        "no_cache": "true",
    }

    try:
        response = requests.get(SERPAPI_API_URL, params=params)
        response.raise_for_status()  # Raise an error for HTTP errors

        results = response.json()

        # Ensure API response is valid
        if "search_metadata" not in results or results["search_metadata"].get("status") != "Success":
            raise HTTPException(status_code=404, detail=f"API Error: {results}")

        best_flights = results.get("best_flights", [])
        other_flights = results.get("other_flights", [])

        # If no flights are found, return a clearer error message
        if not best_flights and not other_flights:
            raise HTTPException(status_code=404, detail=f"No flights found for {origin} to {destination} on {departure_date}")

        all_flights = []

        # Extract Best Flights
        for flight_option in best_flights:
            flight_segments = flight_option.get("flights", [])
            if not flight_segments:
                continue

            flight_details = {
                "total_duration": flight_option.get("total_duration", "N/A"),
                "price": flight_option.get("price", "N/A"),
                "airline": flight_segments[0].get("airline", "Unknown Airline"),
                "flight_number": flight_segments[0].get("flight_number", "N/A"),
                "departure_time": flight_segments[0].get("departure_airport", {}).get("time", "N/A"),
                "arrival_time": flight_segments[-1].get("arrival_airport", {}).get("time", "N/A"),
                "google_flights_url": results["search_metadata"].get("google_flights_url", "")
            }
            all_flights.append(flight_details)

        # Extract Other Flights
        for flight_option in other_flights:
            flight_segments = flight_option.get("flights", [])
            if not flight_segments:
                continue

            flight_details = {
                "total_duration": flight_option.get("total_duration", "N/A"),
                "price": flight_option.get("price", "N/A"),
                "airline": flight_segments[0].get("airline", "Unknown Airline"),
                "flight_number": flight_segments[0].get("flight_number", "N/A"),
                "departure_time": flight_segments[0].get("departure_airport", {}).get("time", "N/A"),
                "arrival_time": flight_segments[-1].get("arrival_airport", {}).get("time", "N/A"),
                "google_flights_url": results["search_metadata"].get("google_flights_url", "")
            }
            all_flights.append(flight_details)

        return all_flights

    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error fetching flight data: {str(e)}")

    except KeyError as e:
        raise HTTPException(status_code=500, detail=f"Data Parsing Error: Missing expected data field {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error occurred: {str(e)}")

def search_hotels(
    query: str,
    check_in: str,
    check_out: str,
    adults: int = 2,
    currency: str = "USD"
):
    if not SERPAPI_API_KEY:
        raise HTTPException(500, detail="SerpAPI_API_KEY is missing.")

    # 1) normalize user input into ISO yyyy-mm-dd
    ci = _normalize_date(check_in)
    co = _normalize_date(check_out)

    params = {
        "engine": "google_hotels",
        "q": query,
        "check_in_date": ci,
        "check_out_date": co,
        "adults": adults,
        "currency": currency,
        "gl": "us",
        "hl": "en",
        "api_key": SERPAPI_API_KEY,
    }

    try:
        resp = httpx.get(SERPAPI_API_URL, params=params, timeout=10.0)
        if resp.status_code != 200:
            # bubble up SerpAPI’s own error, so you can debug
            raise HTTPException(
                status_code=resp.status_code,
                detail=f"SerpAPI hotels error ({resp.status_code}): {resp.text}"
            )
        data = resp.json()
        return data.get("properties", [])
    except httpx.RequestError as e:
        raise HTTPException(502, detail=f"Network error contacting SerpAPI: {e}")
    except ValueError:
        raise HTTPException(502, detail="SerpAPI returned invalid JSON.")
    
def book_flight(db: Session, user_id: str, flight_id: int):
    """
    Books a flight for the user.
    """
    booking_data = schemas.BookingCreate(
    user_id=user_id,
    flight_id=flight_id,
    hotel_id=None
)
    return crud.create_booking(db, booking_data)


def book_hotel(db: Session, user_id: str, hotel_id: int):
    """
    Books a hotel for the user.
    """
    booking_data = schemas.BookingCreate(
    user_id=user_id,
    flight_id=None,
    hotel_id=hotel_id
)
    return crud.create_booking(db, booking_data)


def delete_flight_booking(db: Session, booking_id: int):
    return crud_delete_flight_booking(db, booking_id)

def delete_hotel_booking(db: Session, booking_id: int):
    return crud_delete_hotel_booking(db, booking_id)

def get_weather(city_name: str):
    """
    Fetches a 5-day weather forecast for a given city using OpenWeather API.
    """
    try:
        url = f"{WEATHER_API_URL}?q={city_name}&appid={WEATHER_API_KEY}&units=metric"
        response = requests.get(url)

        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to fetch weather data")

        data = response.json()
        forecast = [
            {
                "datetime": item.get("dt_txt", "N/A"),
                "temperature": item.get("main", {}).get("temp", "N/A"),
                "weather": item.get("weather", [{}])[0].get("description", "Unknown"),
                "wind_speed": item.get("wind", {}).get("speed", "N/A"),
                "humidity": item.get("main", {}).get("humidity", "N/A")
            }
            for item in data.get("list", [])
        ]

        return forecast

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error while fetching weather: {str(e)}")
