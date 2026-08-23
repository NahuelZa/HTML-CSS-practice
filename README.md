## Weather Favourites App

### Requirements 1

1. A search bar should be displayed to search for a location
2. Add a button called "search" to display searched locations
3. Display the locations in a list and next to the location name, add a button called "display"
4. A map should be displayed to show the searched location, when the user clicked on display button
5. When a location is loaded on the map, add a button caled "save" under the map. This should save the location to the local storage
6. Under the map a table should be shown with all the saved locations and near the locations a button called "delete" should be displayed, and a button called "display" to display the location on the map
7. in between the map and the saved locations a weather forecast should be displayed from the displayed location

#### Extras

- handle the different errors
- add pagination to the saved locations

## Elements

- Map: https://leafletjs.com
- Weather API: https://open-meteo.com/
- Location API: https://nominatim.org/
- localstorage: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

### Requirements 2

In this face we are going to implement a backend to save the locations into a sqllite database. Therefore the src directory
was divided into fronend and backend.

Following are the requirements:

1. create a new directory called db inside the project and create a sqllite database called app.db
2. create a table called saved_location with the following columns:
   - id
   - name
   - lat
   - lon
3. inside the db directory also create a .sql file with the necesary queries to initialize the database 
4. create an new API GET endpoint called /api/location that retrieves all the saved locations from the database
5. create an new API POST endpoint called /api/location that saves a new location to the database
6. create an new API DELETE endpoint called /api/location that deletes a location from the database
7. the backend should use simething alike MVC to organize the code
8. replace the localstorage implementation on the frontend with the API calls (do not delete the localstorage implementation)

Important points:

- ignore the API security, dont use api-tokens
- to connect to the database you need a sql client, like https://nodejs.org/api/sqlite.html
- the .sql file's role is to initialize the database for someone that doesnt have it and needs to start working with this project
- for the backend express is used, https://expressjs.com/
