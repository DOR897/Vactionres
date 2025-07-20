# Vactionres

A full-stack travel app where you can:
- Register/Login (email or Google)
- Search and book real flights and hotels
- View and manage your bookings
- See weather for your destination

## Features
- **User authentication** (email/password or Google)
- **Flight & hotel search** (real data via SerpAPI)
- **Weather forecast** (OpenWeatherMap API)
- **Modern UI** (React, Vite, beautiful design)

---

## How to Run the App

### 1. Clone the repository
```bash
git clone https://github.com/DOR897/Vactionres.git
cd Vactionres
```

---

### 2. Run the Backend (FastAPI)

```bash
cd backend
# Build Docker image
# (Make sure you have Docker installed)
docker build -t my-fastapi-app .
# Run the backend
# (Exposes docs at http://localhost:8800/docs)
docker run -p 8800:8800 my-fastapi-app
```

---

### 3. Run the Frontend (React/Vite)

#### Option A: With Docker
```bash
cd vactionres-frontend
docker build -t vactionres-frontend .
docker run -p 5173:5173 vactionres-frontend
```
- The app will be available at [http://localhost:5173](http://localhost:5173)

#### Option B: Without Docker
```bash
cd vactionres-frontend
npm install
npm run dev
```

---

### 4. Run Both (Frontend + Backend) with Docker Compose

```bash
docker-compose up --build
```
- This will start both backend and frontend containers.

---

### 5. Run Only the Frontend in Docker

```bash
cd vactionres-frontend
docker build -t vactionres-frontend .
docker run -p 5173:5173 vactionres-frontend
```

---

### 6. Google Authentication
- On the login/register page, you can sign in with Google (make sure your backend is configured for Google OAuth).

---

### 7. Weather API
- To fetch weather, you need an API key from [OpenWeatherMap](https://openweathermap.org/api).
- Set your API key in the backend `.env` file.

---

### 8. Demo Video

You can embed a demo video in your README like this:

#### If your video is on YouTube:
```markdown
[![Watch the demo](https://img.youtube.com/vi/YOUTUBE_VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=YOUTUBE_VIDEO_ID)
```
Replace `YOUTUBE_VIDEO_ID` with your actual video ID.

#### If you want to use a local video (not recommended for GitHub):
```markdown
<video src="path/to/video.mp4" controls width="600"></video>
```

---

## Notes
- Make sure to set up your API keys for SerpAPI and OpenWeatherMap in the backend `.env` file.
- For Google Auth, configure your Google credentials in the backend as well.

---

Enjoy your trip planning with **Vactionres**! ✈️🏨🌤️
