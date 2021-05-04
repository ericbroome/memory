const content = document.querySelector("#content");
const game = document.querySelector("#game");
const header = document.querySelector("#header");
const splash = document.querySelector("#splash");
const results = document.querySelector("#results");
const newGameButton = document.querySelector("#newGame");
const cards = [];
const theseStats = {
  game: 0,
  elapsed: 0,
  clicked: 0,
  misguess: 0,
  forgot: 0,
  recall: 0
};

//Take 1 second to switch from splash to game, from game to results. No delay to start game.
const screenChangeDelay = 1000;
let canCheat = false;
//The last clicked card
let cardClicked = null;
//We have to wait if two unmatched cards are showing. Otherwise it might let more than 2 cards show.
let wait = false;
//We just shuffle these and assign indices to the cards rather than entire object
let shuffledColors = null;
//The number of cards remaining
let cardsRemaining = 0;

/*
  status can be 0 (face down), 1 (face up temporary), 2 (face up matched)
*/
const COLORS = [
  {element: null, color:"red", symbol:"&spades;", clicks:0, status:0},
  {element: null, color:"blue", symbol:"&hearts;", clicks:0, status:0},
  {element: null, color:"green", symbol:"&clubs;", clicks:0, status:0},
  {element: null, color:"orange", symbol:"&diams;", clicks:0, status:0},
  {element: null, color:"purple", symbol:"&Dagger;", clicks:0, status:0},
  {element: null, color:"red", symbol:"&spades;", clicks:0, status:0},
  {element: null, color:"blue", symbol:"&hearts;", clicks:0, status:0},
  {element: null, color:"green", symbol:"&clubs;", clicks:0, status:0},
  {element: null, color:"orange", symbol:"&diams;", clicks:0, status:0},
  {element: null, color:"purple", symbol:"&Dagger;", clicks:0, status:0}
];

// here is a helper function to shuffle an array
// it returns the same array with values shuffled
// it is based on an algorithm called Fisher Yates if you want ot research more
function shuffle(array) {
  let counter = array.length;
  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    let index = Math.floor(Math.random() * counter);
    // Decrease counter by 1
    counter--;
    // And swap the last element with it
    let temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }
  return array;
}

function newGame() {
  shuffledColors = shuffle(COLORS);
  let color = null;
  let card = null;
  for (let i = 0; i < shuffledColors.length; i++) {
    color = shuffledColors[i];
    card = cards[i];
    card.setAttribute("data-color", color.color);
    card.setAttribute("data-symbol", color.symbol);
    card.setAttribute("data-clicks", 0);
    card.setAttribute("data-status", 0);
    card.style.color = "transparent";
    if(canCheat == false) {
      card.innerText = "O";
    }
    else card.innerHTML = color.symbol;
  }
  cardsRemaining = shuffledColors.length;
  splash.remove();
  //results.remove();
  content.append(game);
  newGameButton.remove();
  theseStats.elapsed = 0;
  theseStats.clicked = 0;
  theseStats.forgot = 0;
  theseStats.misguess = 0;
  theseStats.recall = 0;
  theseStats.game = Date.now();
}


// TODO: Implement this function!
function handleCardClick(event) {
  let card = event.target;
  theseStats.clicked ++;
  card.dataset.clicks = Number(card.dataset.clicks) + 1;
  //We count clicks before checking face-up to punish player for clicking face-up cards.
  if(card.dataset.status != 0) {
    console.log("Do not pick cards which are already face up");
    return;
  }
  let color = card.dataset.color;
  if(cardClicked) //We're selecting a second card
  {
    //Wait for timeout to have completed and flipped the cards so we don't ever have more than two unguessed cards exposed
    if(wait == true)return;
    //Compare to see if the exact same object has been clicked twice
    card.dataset.status = 1;
    card.style.color = color;
    card.innerHTML = card.dataset.symbol;
    //Compare color values to find matches
    if(cardClicked.style.color == color) {
      console.log("We found a match");
      card.dataset.status = 2;
      cardClicked.dataset.status = 2;
      cardClicked = null;
      cardsRemaining -= 2;
      if(cardsRemaining <= 0) {
        //We get the elapsed time immediately, for better accuracy.
        theseStats.elapsed = Date.now() - theseStats.game;
        winGame();
      }
    }
    else {
      if(card.dataset.clicks == "0") {
        theseStats.misguesses ++;
      }
      else theseStats.forgot++;
      wait = true;
      setTimeout(function() {
        cardClicked.style.color = "transparent";
        card.style.color = "transparent";
        if(canCheat == false) {
          card.innerText = "X";
          cardClicked.innerText = "X";
        }
        cardClicked = null;
        wait = false;
      }, 1000);
    }
  }
  else {
    //No other card selected
    cardClicked = card;
    cardClicked.style.color = color;
    cardClicked.innerHTML = card.dataset.symbol;
  }
}

/*
  Card 1 should be the cardClicked card (global variable) but we pass it anyway in case we just want to cheat someday somehow
*/
function checkMatch(card1, card2) {
  if(card1.color == card2.color) {

  }
}

function displayCard(card, status = 1) {
  card.style.color = card.dataset.color;
  card.innerHTML = card.symbol;
  card.status = status;
}

/*
  Stats Object:
  -------------------
  game: timestamp
  elapsed: milliseconds
  clicked: integer
  misguess: integer
  forgot: integer
  recall: integer

*/

function formatStats(statsObject) {
  let game = `<div>Game: ${statsObject.game}</div>`;
  let elapsed = `<div>Total time elapsed: ${statsObject.elapsed}</div>`;
  let clicked = `<div>Total cards clicked: ${statsObject.clicked}</div>`;
  let misguess = `<div>Total misguesses: ${statsObject.misguess}</div>`;
  let forgot = `<div>Total mis-remembered: ${statsObject.forgot}</div>`;
  let recall = `<div>Total recall: ${statsObject.recall}</div>`;
  return [game, elapsed, clicked, misguess, forgot, recall];
}


function winGame() {
  let resultsData = formatStats(theseStats);
  results.innerText = "";
  for(stat in resultsData) {
    results.innerHTML += resultsData[stat];
  }
  setTimeout(function(event) {
    game.remove();
//    content.append(results);
    header.append(newGameButton);
  }, screenChangeDelay);
  
}

// When the DOMContentLoaded, create the cards and set up the interface for initial visit
window.addEventListener("DOMContentLoaded", function(event) {
  game.remove();
//  results.remove();
  let card = null;
  for (i = 0; i < COLORS.length; i++) {
    card = document.createElement("div");
    card.classList.add("card");
    card.addEventListener("click", handleCardClick);
    game.append(card);
    cards[i] = card;
  }
  newGameButton.addEventListener("click", function(event) {
    console.log(`Clicked ${event.target.tagName}`);
    canCheat = document.querySelector("#enableCheating").checked;
    if(event.target.tagName.toUpperCase() == "INPUT") {
      event.stopPropagation();
    }
    else {
      newGame();
    }
  });
});
