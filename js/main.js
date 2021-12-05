//app is for general control over the application
//and connections between the other components
const APP = {
  KEY: "527917a705e7338ceca3903f95d79899",
  baseURL: "https://api.themoviedb.org/3/",
  imageURL: "http://image.tmdb.org/t/p/w500",

  init: () => {
    //this function runs when the page loads
    let search = document.getElementById("btnSearch");
    search.addEventListener("click", SEARCH.searchFunction);
  },
};

//search is for anything to do with the fetch api
const SEARCH = {
  results: [],
  input: "",

  searchFunction: (ev) => {
    ev.preventDefault();
    SEARCH.input = document.getElementById("search").value;
    let key = STORAGE.baseKey + SEARCH.input;
    if (key in localStorage) {
      ACTORS.actors = localStorage.getItem(key);
      ACTORS.getActor(JSON.parse(ACTORS.actors));
    } else {
      SEARCH.fetchData();
    }
  },
  fetchData() {
    let url = `${APP.baseURL}search/person?api_key=${APP.KEY}&query=${SEARCH.input}`;
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not OK");
        } else {
          return response.json();
        }
      })
      .then((data) => {
        SEARCH.results = data.results;
        STORAGE.localStorage(SEARCH.input, data.results);
        ACTORS.getActor(data.results);
      })

      .catch((error) => {
        alert(`Error: ${error.name} ${error.message}`);
      });
  },
};

//actors is for changes connected to content in the actors section
const ACTORS = {
  actors: [],
  getActor: (actors) => {
    let instructionSection = document.getElementById("instructions");
    let actorSection = document.getElementById("actors");
    let mediaSection = document.getElementById("media");
    let backBtn = document.getElementById("btnBack");

    instructionSection.style.display = "none";
    mediaSection.style.display = "none";
    actorSection.style.display = "block";
    backBtn.style.display = "none";

    let removeData = document.getElementById("actorContent");
    removeData.textContent = "";

    let df = document.createDocumentFragment();

    actors.forEach((actor) => {
      let card = document.createElement("div");
      card.className = "card";

      card.addEventListener("click", MEDIA.favMovie);
      card.setAttribute("id", actor.id);

      let image = document.createElement("img");
      image.className = "card-img-top";
      if (actor.profile_path) {
        image.src = APP.imageURL + actor.profile_path;
      } else {
        image.src = "./img/imageNotFound.png";
      }

      image.alt = actor.name;

      let cardBody = document.createElement("div");
      cardBody.className = "card-body";

      // info contents
      let actorName = document.createElement("h3");
      actorName.className = "card-title";
      actorName.textContent = `Name: ${actor.name}`;

      let pop = document.createElement("p");
      pop.className = "card-text";
      pop.textContent = `Popularity: ${actor.popularity}`;

      let known = document.createElement("p");
      known.className = "card-text";
      known.textContent = `Known for: ${actor.known_for_department}`;

      cardBody.append(actorName, pop, known);
      card.append(image, cardBody);
      df.append(card);
    });

    let actorDiv = document.getElementById("actorContent");
    actorDiv.append(df);
  },
};

//media is for changes connected to content in the media section
const MEDIA = {
  movies: [],

  favMovie: (ev) => {
    let getId = ev.target.closest(".card");
    let actorId = getId.getAttribute("id");

    let actorPage = document.getElementById("actors");
    let mediaPage = document.getElementById("media");
    let backButton = document.getElementById("btnBack");

    actorPage.style.display = "none";
    mediaPage.style.display = "block";

    backButton.addEventListener("click", MEDIA.backActorPage);
    backButton.style.display = "block";

    let key = STORAGE.baseKey + SEARCH.input;

    // if (key in localStorage) {
    //   MEDIA.movies = localStorage.getItem(key);
    // } else {
    //   MEDIA.movies = SEARCH.fetchData();
    // }

    let movieData = JSON.parse(localStorage.getItem(key));

    let df = document.createDocumentFragment();

    movieData.forEach((person) => {
      if (actorId == person.id) {
        person.known_for.forEach((actor) => {
          let card = document.createElement("div");
          card.className = "card";
          console.log(actor);
          let image = document.createElement("img");
          image.className = "card-img-top";
          image.src = APP.imageURL + actor.poster_path;
          image.alt = actor.original_title;

          let cardBody = document.createElement("div");
          cardBody.className = "card-body";

          // card title
          let movieName = document.createElement("h3");
          movieName.className = "card-title";

          // check whether is a movie or is a tv shows
          if (actor.media_type === "movie") {
            movieName.textContent = `Name: ${actor.original_title}`;
          } else {
            movieName.textContent = `Name: ${actor.name}`;
          }

          // card text
          let voteAvg = document.createElement("p");
          voteAvg.className = "card-text";
          voteAvg.textContent = `Vote average: ${actor.vote_average}`;

          let voteCount = document.createElement("p");
          voteCount.className = "card-text";
          voteCount.textContent = `Vote count: ${actor.vote_count}`;

          cardBody.append(movieName, voteAvg, voteCount);
          card.append(image, cardBody);
          df.append(card);
        });

        let movie = document.getElementById("movies");
        movie.textContent = "";
        movie.append(df);
      }
    });
  },
  backActorPage: (ev) => {
    ev.preventDefault();
    let actorPage = document.getElementById("actors");
    let mediaPage = document.getElementById("media");
    let backButton = document.getElementById("btnBack");

    actorPage.style.display = "block";
    mediaPage.style.display = "none";
    backButton.style.display = "none";
  },
};

//storage is for working with localstorage
const STORAGE = {
  keys: [],
  baseKey: "search=",

  localStorage: (input, result) => {
    let key = STORAGE.baseKey + input;
    STORAGE.keys.push(key);
    localStorage.setItem(key, JSON.stringify(result));
  },
  //this will be used in Assign 4
};

//nav is for anything connected to the history api and location
const NAV = {
  //this will be used in Assign 4
};

//Start everything running
document.addEventListener("DOMContentLoaded", APP.init);
