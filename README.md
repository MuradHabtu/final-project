# final-project

# ShowFinder

## Description

ShowFinder is a web application that helps users decide what TV show to watch. Users can search for shows, view trending shows, compare ratings, and save favorite shows.

The application uses the TVMaze API to retrieve show information such as titles, images, genres, ratings, summaries, and schedules. It also uses Supabase to store favorite shows.

## Target Browsers

ShowFinder is designed for modern desktop browsers, including:

- Google Chrome
- Microsoft Edge
- Firefox
- Safari

## Deployed Application

https://final-project-eight-liart.vercel.app/

## Developer Manual

### How to Install the Application

git clone https://github.com/MuradHabtu/final-project.git
cd final-project
npm install

### How to Run the Application Locally

Create a .env file with:

SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

Then run:

npm start

Open:

http://localhost:3000

### How to Run Tests

There are currently no automated tests.

### API Endpoints

GET /api/shows/search?q=showname  
Searches TVMaze for shows matching the user query.

GET /api/shows/trending  
Gets shows currently airing in the United States.

GET /api/favorites  
Gets saved favorite shows from Supabase.

POST /api/favorites  
Saves a selected show to the Supabase favorites table.

### Known Bugs

- Duplicate favorites can currently be saved more than once.
- Some TVMaze shows do not have ratings or images.
- Favorites require the Supabase table and environment variables to be configured correctly.
