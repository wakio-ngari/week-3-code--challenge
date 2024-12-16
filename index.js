// Select  Buy Ticket button
const buyTicketButton = document.getElementById("buy-ticket");

// Variables to hold the movie details
let availableTickets = 0;
let movieId = null;  //sets movie ID depending on movie


function fetchMovies() {
    console.log("Fetching movies...");
    fetch("http://localhost:3000/films") // Fetch movie data from server
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Passes the response as JSON
      })
      .then(data => {
        console.log(data); // Log the response .
        if (Array.isArray(data)) { // Checks  if it  is an array 
          const filmsList = document.getElementById("films");
          filmsList.innerHTML = ""; // Clears list
          data.forEach(movie => { // Loop through films array in JSON
            const li = document.createElement("li");
            li.textContent = movie.title; // Display movie title
            li.className = "film item";


            //  if tickets are all sold out:
            if (movie.capacity - movie.tickets_sold === 0) {
              li.classList.add("sold-out");
            }
            li.addEventListener("click", () => fetchMovieDetails(movie.id)); // Fetch details on click
            filmsList.appendChild(li);
          });

          // Automatically load details for the first movie
          if (data.length > 0) {
            fetchMovieDetails(data[0].id);
          }
        } else {
          console.error("Invalid data format: films array is missing or not an array.");
        }
      })
      .catch(error => console.error("Failed to fetch movies:", error.message));
}

// Fetch and Display Movie Data on Page
function fetchMovieDetails(movieId) {
    console.log(`Fetching details for movie Id:${movieId}`)
  fetch(`http://localhost:3000/films/${movieId}`) // Fetch details for selected movie
    .then(response => response.json())
    .then(movie => {
        console.log(movie);
      // Display movie details
      document.getElementById("movie-title").textContent = movie.title;
      document.getElementById("movie-description").textContent = movie.description;
      document.getElementById("movie-runtime").textContent = movie.runtime;
      document.getElementById("movie-showtime").textContent = movie.showtime;
      document.getElementById("movie-tickets").textContent = movie.capacity - movie.tickets_sold;
      document.getElementById("movie-poster").src = movie.poster;  // Display poster image

      // Set available tickets
      availableTickets = movie.capacity - movie.tickets_sold;
      movieId = movie.id; // Store the selected movie ID

      // Enable or disable button based on ticket availability
      if (availableTickets === 0) {
        buyTicketButton.textContent = "Sold Out";
        buyTicketButton.disabled = true;
      } else {
        buyTicketButton.textContent = "Buy Ticket";
        buyTicketButton.disabled = false;
      }
    })
    .catch(error => console.error("Failed to fetch movie details:", error.message));
}

// Update tickets sold on the backend
function updateTicketsSold(newTicketsSold) {
  fetch(`http://localhost:3000/films/${movieId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      tickets_sold: newTicketsSold
    })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to update tickets.");
      }
      return response.json();
    })
    .then(updatedMovie => {
      console.log("Tickets updated:", updatedMovie);
    })
    .catch(error => console.error("Error updating tickets:", error));
}

// Event listener for Buy Ticket button
buyTicketButton.addEventListener("click", () => {
  if (availableTickets > 0) {
    // Decreases available tickets depending on the tickets purchased.
    availableTickets -= 1;

    // Update frontend display of available tickets
    document.getElementById("movie-tickets").textContent = availableTickets;

    // Persist the updated tickets sold count to the backend
    updateTicketsSold(availableTickets);

    // when tickets are sold out, disable button
    if (availableTickets === 0) {
      buyTicketButton.textContent = "Sold Out";
      buyTicketButton.disabled = true;
    }
  }
});


fetchMovies(); // fetches the list of movies and populates the sidebar
