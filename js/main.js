//app is for general control over the application
//and connections between the other components
const APP = {
  KEY: "527917a705e7338ceca3903f95d79899",
  baseURL: "https://api.themoviedb.org/3/",
  imageURL: "http://image.tmdb.org/t/p/w500",

  init: () => {
    //this function runs when the page loads
    history.replaceState({}, "", "#");
    window.addEventListener("popstate", NAV.nav);
    let search = document.getElementById("btnSearch");
    search.addEventListener("click", SEARCH.getInput);
  },
};

//search is for anything to do with the fetch api
const SEARCH = {
  results: [],
  input: "",

  getInput: (ev) => {
    ev.preventDefault();
    SEARCH.input = document.getElementById("search").value;
    history.pushState({}, "", `#${SEARCH.input}`);
    let input = location.hash;
    SEARCH.searchFunction(input);
  },

  searchFunction: (input) => {
    let key = STORAGE.baseKey + input;
    // check if it is a valid input
    if (!input) {
      alert("Empty input, please try it again.");
    } else {
      if (key in localStorage) {
        ACTORS.actors = localStorage.getItem(key);
        ACTORS.getActor(JSON.parse(ACTORS.actors));
      } else {
        SEARCH.fetchData();
      }
    }
  },

  fetchData() {
    let loader = document.querySelector(".loader");
    loader.classList.add("active");
    let url = `${APP.baseURL}search/person?api_key=${APP.KEY}&query=${SEARCH.input}`;
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("API response was not ok, Please try again.");
        } else {
          return response.json();
        }
      })
      .then((data) => {
        loader.classList.remove("active");
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
  sortedActors: [],
  sortedPop: [],
  getActor: (actors) => {
    let instructionSection = document.getElementById("instructions");
    let actorSection = document.getElementById("actors");
    let mediaSection = document.getElementById("media");
    let backBtn = document.getElementById("btnBack");

    // show actor page
    instructionSection.style.display = "none";
    mediaSection.style.display = "none";
    actorSection.style.display = "block";
    backBtn.style.display = "none";

    let removeData = document.getElementById("actorContent");
    removeData.textContent = "";

    let sortName = document.getElementById("sortName");
    let sortPop = document.getElementById("sortPop");
    sortName.addEventListener("click", ACTORS.sortName);
    sortPop.addEventListener("click", ACTORS.sortPopularity);

    let df = document.createDocumentFragment();

    actors.forEach((actor) => {
      let card = document.createElement("div");
      card.className = "card ";

      // click actor card to media page
      card.addEventListener("click", MEDIA.history);
      card.setAttribute("id", actor.id);

      // actor image
      let image = document.createElement("img");
      image.className = "card-img";

      // check if actor has a image, if not, give a not found image
      if (actor.profile_path) {
        image.src = APP.imageURL + actor.profile_path;
      } else {
        image.src = "./img/imageNotFound.png";
      }

      image.alt = actor.name;

      let cardBody = document.createElement("div");
      cardBody.className = "card-body";

      // actor name
      let actorName = document.createElement("h3");
      actorName.className = "card-title";
      actorName.textContent = `${actor.name}`;

      // actor info
      let pop = document.createElement("p");
      pop.className = "card-text";
      pop.textContent = `Popularity: ${actor.popularity}`;
      let known = document.createElement("p");
      known.className = "card-text";
      known.textContent = `Known for: ${actor.known_for_department}`;

      // append card
      cardBody.append(actorName, pop, known);
      card.append(image, cardBody);
      df.append(card);
    });

    let actorDiv = document.getElementById("actorContent");
    actorDiv.append(df);
  },

  sortName: () => {
    let name = document.getElementById("sortName");
    name.classList.toggle("activeName");
    let key = STORAGE.baseKey + SEARCH.input;
    let storage = JSON.parse(localStorage.getItem(key));
    let sortedName = [...storage];

    let sortName = sortedName.sort((a, b) => {
      let actorA = a.name;
      let actorB = b.name;
      if (name.classList.contains("activeName")) {
        //console.log("sorted a-z");
        if (actorA < actorB) {
          return -1;
        }
        if (actorA > actorB) {
          return 1;
        }
        return 0;
      } else {
        // console.log("sorted z-a");
        if (actorA < actorB) {
          return 1;
        }
        if (actorA > actorB) {
          return -1;
        }
        return 0;
      }
    });
    ACTORS.sortedActors = sortName;
    ACTORS.getActor(ACTORS.sortedActors);
  },

  sortPopularity: (ev) => {
    let pop = document.getElementById("sortPop");
    pop.classList.toggle("activePop");
    let key = STORAGE.baseKey + SEARCH.input;
    let storage = JSON.parse(localStorage.getItem(key));
    let sortedPop = [...storage];

    let sortPop = sortedPop.sort((a, b) => {
      let popUp = a.popularity;
      let popDown = b.popularity;
      if (pop.classList.contains("activePop")) {
        if (popUp < popDown) {
          return -1;
        }
        if (popUp > popDown) {
          return 1;
        }
        return 0;
      } else {
        if (popUp < popDown) {
          return 1;
        }
        if (popUp > popDown) {
          return -1;
        }
        return 0;
      }
    });
    ACTORS.sortedPop = sortPop;
    ACTORS.getActor(ACTORS.sortedPop);
  },
};

//media is for changes connected to content in the media section
const MEDIA = {
  movies: [],

  history: (ev) => {
    let getId = ev.target.closest(".card");
    let actorId = getId.getAttribute("id");
    history.pushState({}, "", `${location.hash}/${actorId}`);
    MEDIA.favMovie(actorId);
  },

  favMovie: (actorId) => {
    let actorPage = document.getElementById("actors");
    let mediaPage = document.getElementById("media");
    let backButton = document.getElementById("btnBack");

    // Show media page
    actorPage.style.display = "none";
    mediaPage.style.display = "block";

    // show back button
    backButton.addEventListener("click", MEDIA.backActorPage);
    backButton.style.display = "block";

    let key = STORAGE.baseKey + SEARCH.input;

    //  check if in the local storage or fetch from database
    if (key in localStorage) {
      MEDIA.movies = localStorage.getItem(key);
    } else {
      MEDIA.movies = SEARCH.fetchData();
    }

    let df = document.createDocumentFragment();
    let movieData = JSON.parse(localStorage.getItem(key));

    movieData.forEach((person) => {
      if (actorId == person.id) {
        person.known_for.forEach((actor) => {
          let card = document.createElement("div");
          card.className = "card";

          // movie poster
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
            movieName.textContent = `${actor.original_title}`;
          } else {
            movieName.textContent = `${actor.name}`;
          }

          // movie info
          let voteAvg = document.createElement("p");
          voteAvg.className = "card-text";
          voteAvg.textContent = `Vote average: ${actor.vote_average}`;
          let voteCount = document.createElement("p");
          voteCount.className = "card-text";
          voteCount.textContent = `Vote count: ${actor.vote_count}`;

          // append cards
          cardBody.append(movieName, voteAvg, voteCount);
          card.append(image, cardBody);
          df.append(card);
        });

        // refresh page
        let movie = document.getElementById("movies");
        movie.textContent = "";
        movie.append(df);
      }
    });
  },
  // back to actor page
  backActorPage: (ev) => {
    ev.preventDefault();
    window.history.back();
  },
};

//storage is for working with localstorage
const STORAGE = {
  keys: [],
  baseKey: "searchActorName=",

  localStorage: (input, result) => {
    let key = STORAGE.baseKey + input;
    STORAGE.keys.push(key);
    localStorage.setItem(key, JSON.stringify(result));
  },
};

//nav is for anything connected to the history api and location
const NAV = {
  nav: () => {
    let input = location.hash.replace("#", "");

    if (!input) {
      let homePage = document.getElementById("instructions");
      let actorPage = document.getElementById("actors");
      let mediaPage = document.getElementById("media");
      homePage.style.display = "block";
      actorPage.style.display = "none";
      mediaPage.style.display = "none";
    } else {
      // regular expression check if the input has digit (actor ID) then split the url.
      if (/\d/.test(input)) {
        let actor = input.split("/")[1];
        MEDIA.favMovie(actor);
      } else {
        SEARCH.input = input;
        SEARCH.searchFunction(input);
      }
    }
  },
};

//Start everything running
document.addEventListener("DOMContentLoaded", APP.init());
