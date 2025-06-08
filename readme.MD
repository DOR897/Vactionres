### VACTIONRES ### 
An backend server  FastApi App where u can Register(if u aren't login already)/Login.
You can create a reservation of a flight/hotel or both  and delete if you want.
To create a hotel/flight reservation you need to create hotel/flight from a real data from the endpoint "search_flights/search_hotels" , before u do that you need to generate api key from serpapi to google flights and google hotels api"https://serpapi.com".
you can delete/update the created hotel/flight.
you can also fetch weather from the destination you flying to after you generate an api key from "https://openweathermap.org/api"

## HOW TO RUN THE APP ##
install wsl, the run the comand ``zsh`` in cmd.
You need to clone the repository:``git clone https://github.com/DOR897/Vactionres.git``

then go to the app name ``cd vactionres`` then ``cd backend``.
run these 3 commands: ``docker build -t my-fa -f./nginx.Dockerfile`` and ``docker build -t my-fastapi-app .`` after an image was set run  ``docker run -p 8800:8800 my-fastapi-app`` and go to  "http://localhost:8800/docs" you can see the backend app.
