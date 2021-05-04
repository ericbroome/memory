
const DOMManager = {
  elHome : document.querySelector("#home"),
  elContent : document.querySelector("#content"),
  elGame : document.querySelector("#game"),
  elHeader : document.querySelector("#header"),
  elSplash : document.querySelector("#splash"),
  elHistoryItems : document.querySelector("#historyItems"),
  elResults : document.querySelector("#results"),
  elNewGameButton : document.querySelector("#newGame"),
  elGameOptionsDiv : document.querySelector("#gameOptionsDiv"),
  elEmojis : document.querySelector("#emojis"),
  elPairs : document.querySelector("#pairs"),
  delay : 1000,
  history : [], //History of games from/to local storage
  initialize : function() {
    window.removeEventListener("DOMContentLoaded", DOMManager.initialize);
    DOMManager.elNewGameButton.addEventListener("click", DOMManager.newGameClicked);
    DOMManager.elContent.addEventListener("click", DOMManager.contentClicked);
    DOMManager.elGameOptionsDiv.addEventListener("click", DOMManager.gameOptionsClicked)
    DOMManager.elHome.addEventListener("click", DOMManager.splashMode);
    //Here we assign all properties and functions of the Game class to the HTML element referenced by DOMManager.elGame
    //effectively extending the HTMLElement (div) with additional functionality
    Object.assign(DOMManager.elGame, Game);
    DOMManager.splashMode();
  },
  splashMode : function() {
    DOMManager.elGame.remove();
    DOMManager.elResults.remove();
    DOMManager.loadHistory();
    if(DOMManager.elSplash.parentElement == null)DOMManager.elContent.append(DOMManager.elSplash);
    if(DOMManager.elNewGameButton.parentElement == null)DOMManager.elHeader.append(DOMManager.elNewGameButton);
   },
  resultsMode : function() {
    DOMManager.elGame.remove();
    DOMManager.elSplash.remove();
    DOMManager.elContent.append(DOMManager.elResults);
    if(DOMManager.elNewGameButton.parentElement == null)DOMManager.elHeader.append(DOMManager.elNewGameButton);
  },
  gameMode : function() {
    DOMManager.elSplash.remove();
    DOMManager.elResults.remove();
    if(DOMManager.elGame.parentElement == null)DOMManager.elContent.append(DOMManager.elGame);
    DOMManager.elNewGameButton.remove(); 
  },

  newGameClicked : function(event) {
    console.log(this);
    event.stopPropagation();
    //TODO: Get parameters for the Game object from input elements (numPairs, bEmojis, bRandom)
    Game.bEmojis = (DOMManager.elEmojis.checked ? true : false);
    Game.numPairs = DOMManager.elPairs.value;
    Game.newGame();
  },

  contentClicked : function(event) {
    console.log(event.target);
    if(event.target.classList.contains("card")) {
      DOMManager.elGame.cardClicked(event.target);
    }
  },

  gameOptionsClicked : function(event) {
    event.stopPropagation();
  },
  
  clearHistory : function() {
    DOMManager.history = [];
    DOMManager.saveHistory();
    DOMManager.loadHistory();
//    window.localStorage.clear();
  },

  loadHistory : function() {
    let games = window.localStorage.getItem("history");
    if(games == null)return null;
    DOMManager.history = JSON.parse(games);
    DOMManager.elHistoryItems.innerContent = "";
    for(let index = 0; index < DOMManager.history.length; index ++) {
      let obj = Game.formatStats(DOMManager.history[index]);
      for(let i = 0; i < obj.length; i++) {
        DOMManager.elHistoryItems.innerHTML += obj[i];
      }
    }
    return DOMManager.history;
  },

  saveHistory : function() {
    let strHistory = JSON.stringify(DOMManager.history);
    window.localStorage.setItem("history", strHistory);
  }

};

/*
  Use the CardObjectTemplate to define data for card elements (HTML) and as a reference
  Card status can be:
    0: face down (the only cards that can be clicked, having style .cardDown)
    1: face up unmatched (whether the first or second card, subject to timeout and applying .cardDown style on timeout)
    2: face up matched (in this case we leave it face up and give it .cardUp and .cardMatched styles)
*/
const CardObjectTemplate = {
  color: "data-color",
  symbol: "data-symbol",
  index: "data-index",
  clicks: "data-clicks",
  status: "data-status"
};

/*
  This object is used to perform basic tasks related to cards.
  If wanted, one could simply "install" the members to localStorage and load them
*/
const CardObjectManager = {
  nonEmoji : 5,
  colorSymbols : [
    {color: "red", symbol: "&hearts;"}, 
    {color: "blue", symbol: "&diams;"},
    {color: "green", symbol: "&clubs;"},
    {color: "orange", symbol: "&spades;"},
    {color: "purple", symbol: "&Dagger;"},
    {color: "black", symbol: "🍒"},
    {color: "black", symbol: "🍉"},
    {color: "black", symbol: "🥑"},
    {color: "black", symbol: "🍆"},
    {color: "black", symbol: "🥨"},
    {color: "black", symbol: "🍸"},
    {color: "black", symbol: "🚓"},
    {color: "black", symbol: "🗽"},
    {color: "black", symbol: "🗝️"},
    {color: "black", symbol: "🧲"},
    {color: "black", symbol: "🚬"},
    {color: "black", symbol: "🚻"},
    {color: "black", symbol: "🔆"},
    {color: "black", symbol: "🎵"},
    {color: "black", symbol: "📢"},
    {color: "black", symbol: "🏈"},
    {color: "black", symbol: "🎨"},
    {color: "black", symbol: "🎸"},
    {color: "black", symbol: "🎧"},
    {color: "black", symbol: "🎮"},
    
  ],
  /*
    Safely create a card having color and symbol from the collection of colorSymbols. Throw an error if out of range.
    Assign a set of functions to each card using Object.assign rather than individually assigning each function.
    This gives the ability for the function to be written once and use "this" to apply to the individual card without
    actually passing a reference to that card upon invocation of the function (explicitly).
  */
  createCard : function(indexColorSymbol) {
    if(indexColorSymbol >= CardObjectManager.colorSymbols.length) {
      throw new RangeError(`indexColorSymbol parameter of CardObjectManager.createCard must not meet or exceed the length of the CardObjectManager.colorSymbols array (length = ${CardObjectManager.colorSymbols.length})`);
    }
    //Our card object are actually dom elements, in this case DIV elements, extended with additional functionality rather than
    //creating and mapping separate javascript objects which is redundant as well as wasteful and prone to errors and debug-hell
    let card = document.createElement("div");
    card.setAttribute(CardObjectTemplate.color, 
      (indexColorSymbol < CardObjectManager.nonEmoji 
        ? card.style.color = CardObjectManager.colorSymbols[indexColorSymbol].color 
        : CardObjectManager.colorSymbols[indexColorSymbol].color));
    card.setAttribute(CardObjectTemplate.symbol, CardObjectManager.colorSymbols[indexColorSymbol].symbol);
    card.setAttribute(CardObjectTemplate.clicks, 0);
    card.setAttribute(CardObjectTemplate.status, 0);
    card.innerHTML = " ";
    card.classList.add("card", "cardDown");
    //Here we assign to every created card a set of functions defined as members of this class, rather than assign them individually.
    //This way we can just add and remove functions from the cardFunctions object and know that they will be applied to each card.
    Object.assign(card, CardObjectManager.cardFunctions);
    return card;
  },
/*
  Create a matching pair of cards. 
*/
  createPair : function(indexColorSymbol) {
    let cards = [
      CardObjectManager.createCard(indexColorSymbol), 
      CardObjectManager.createCard(indexColorSymbol)
    ];
    return cards;
  },
/*
  Create a set of cards, ensuring that each pair only appears once.
*/
  createSet : function(numPairs = CardObjectManager.nonEmoji, bEmojis=false, bRandom = true) {
    if(numPairs < CardObjectManager.nonEmoji) {
      console.log(`Must create at least ${CardObjectManager.nonEmoji} pairs of cards`);
      numPairs = CardObjectManager.nonEmoji;
    }
    else {
      //We'll default to non-emoji even if the number of cards is too high for non-emoji because non-emoji was specified
      if(numPairs > CardObjectManager.nonEmoji && bEmojis == false) {
        console.log(`If not using emojis, only ${CardObjectManager.nonEmoji} pairs of cards are allowed`);
        numPairs = CardObjectManager.nonEmoji;
      }
    }
    if(numPairs > CardObjectManager.colorSymbols.length - CardObjectManager.nonEmoji) {
      numPairs = CardObjectManager.colorSymbols.length - CardObjectManager.nonEmoji;
    }
    //Let's make it a multiple of 5
    if(numPairs % 5 != 0) numPairs -= numPairs %5;
    let totalCards = numPairs * 2;
    let indices = [];
    let temp = [];
    let cards = [];
    let cardsIndex = 0;
    let start = (bEmojis == true ? CardObjectManager.nonEmoji : 0);
    let limit = (bEmojis == true ? CardObjectManager.colorSymbols.length : CardObjectManager.nonEmoji);
    //Get an array of indexes to shuffle randomly. This allows us to get a subset of the emojis, if emojis are enabled.
    for(let index = start; index < limit; index ++) {
      indices.push(index);
    }
    //Pre-shuffle just to make it extra shuffle-y
    indices = CardObjectManager.shuffle(indices, 4);
    //Now load the cards array with newly created card objects which we can shuffle at will.
    for(let index = 0; index < numPairs; index ++){
      temp = CardObjectManager.createPair(indices[index]);
      cards.push(temp[0]);
      cards.push(temp[1]);
    }
    //Now let's shuffle four times more, just to get even extra-y shuffle-y
    cards = CardObjectManager.shuffle(cards, 4);
    for(let card in cards) {
      cards[card].setAttribute("data-index", card);
    }
    return cards;
  },

/*
  Shuffle an array of anything, not just cards. We can use this not only to shuffle sets of cards but also to shuffle
  a temporary array of indexes into the colorSymbols when making random sets of cards. This avoids duplicate pairs.
*/
  shuffle : function(array, nTimes = 1) {
    for(let i = 0; i < nTimes; i ++) {
      let counter = array.length;
      while (counter > 0) {
        let index = Math.floor(Math.random() * counter);
        counter--;
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
      }
    }
    return array;
  },

  /*
  Here is a set of functions which are assign(...)ed to each card created. Since the function is added to the card object, it has an implied
  "this" which is used to reference itself. Similar to old-school javascript apply/call/bind(...) but without explicit "this"
  */
  cardFunctions : {
    isFaceUp: function() {
      return (this.classList.contains("cardUp") ? true : false);
    },
    isFaceDown: function() {
      return (this.classList.contains("cardDown") ? true : false);
    },
    isMatch: function(card) {
      return (this.dataset.symbol == card.dataset.symbol ? true : false);
    },
    flipUp: function() {
      if(this.isFaceUp() || this.dataset.status >= 1) {
        console.log("Card is already face up");
        //If already face up with a status of 1 and we're trying to flip it up again then
        //it must be because we made a match. Check the gameManager to see if there is a pending match.
        if(this.dataset.status == 1) {
            //TODO: Check game manager to confirm pending match (sanity check)
            this.dataset.status = 2;
        }
      }
      else {
        this.classList.add("cardUp");
        this.innerHTML = this.dataset.symbol;
        this.dataset.status = 1;
      }
      if(this.classList.contains("cardDown")) {
        this.classList.remove("cardDown");
      }
    },
    flipDown: function() {
      if(this.isFaceDown() || this.dataset.status == 0) {
        console.log("Card is already face down");
      }
      else {
        this.classList.add("cardDown");
      }
      if(this.isFaceUp()) {
        this.classList.remove("cardUp");
      }
      this.dataset.status = 0;
      this.innerHTML = " ";
    },
    setMatched: function() {
      this.classList.add("cardMatched");
      this.dataset.status = 2;
    }
  }
};

const Game = {
  game : null,
  gameLog : {
    startTime: 0,
    endTime: 0,
    elapsed: 0,
    cards : [],   //The cards (as indexes into CardObjectManager colorSymbols)
    clickLog : [],  //An array of each click and which card (index it was)
    misguess : 0
  },
  numPairs : CardObjectManager.nonEmoji,
  bEmojis : true,
  bRandom : true,
  cards : [], //An array of HTMLElement (div) objects representing cards
  cardUp : null,
  matches : 0,
  wait : false,

  newGame : function(gameDataObject = null) {
    Game.cardUp = null;
    Game.matches = 0;
    Game.cards = [];
    DOMManager.elGame.innerHTML = "";
    if(gameDataObject == null)
    {
      Game.cards = CardObjectManager.createSet(Game.numPairs, Game.bEmojis, Game.bRandom);
      for(let index = 0; index < this.cards.length; index++) {
        Game.gameLog.cards.push(Game.cards[index].dataset.symbol);
      }
    }
    else {
      for(let index = 0; index < gameDataObject.cards.length; index++) {
        cards.push(CardObjectManager.createCard(gameDataObject.cards[index]));
        Game.gameLog.push(cards[index].dataset.symbol);
      }
    }
    for(let index = 0; index < Game.cards.length; index++) {
      DOMManager.elGame.append(Game.cards[index]);
    }
    Game.game = Game.gameLog.startTime = Date.now();
      DOMManager.gameMode();
  },

  cardClicked : function(card) {
    if(Game.wait == true)return;
    Game.gameLog.clickLog.push(card.dataset.index);
    if(card.isFaceDown()) {
      card.flipUp();
      if(Game.cardUp == null) {
        //We don't have a card up already so we'll set it
        Game.cardUp = card;
        card.dataset.status = 1;
      }
      else {
        Game.wait = true;
        //We DO already have a card facing up, unpaired
        if(card.dataset.symbol == Game.cardUp.dataset.symbol) {
          //We have a match
          console.log("Matched a pair of cards");
          card.setMatched();
          Game.cardUp.setMatched();
          Game.matches ++;
          if(Game.matches == Game.numPairs) {
            //We have a winner
            console.log("Game has been completed");
            Game.gameLog.endTime = Date.now();
            Game.winGame();
          }
          Game.cardUp = null;
          Game.wait = false;
        }
        else {
          //We have a mismatch. We must wait until the timeout has completed or else we'll get too many faceUps.
          Game.gameLog.misguess ++;
          window.setTimeout(function(event) {
            console.log("Mismatch");
            card.flipDown();
            Game.cardUp.flipDown();
            Game.cardUp = null;
            Game.wait = false;
          }, 1000);
        }
      }
    }
    else {
      console.log("Stop clicking cards which are already face up!. Strike against you!")
    }
  },

  winGame : function() {
    Game.gameLog.elapsed = new Date((Game.gameLog.endTime - Game.gameLog.startTime)).toISOString().substr(11, 8);
    let resultsData = Game.formatStats();
    DOMManager.elResults.innerText = "";
    for(stat in resultsData) {
      DOMManager.elResults.innerHTML += resultsData[stat];
    }
    setTimeout(function(event) {
      DOMManager.resultsMode();
    }, DOMManager.delay);
    Game.save();
  },
  quitGame : function() {

  },

  //This will load a game into gameLog data
  load : function(gameLogData = null, index = 0) {
    let result = [];
    if(gameLogData == null) {
        gameLogData = window.localStorage.getItem("gameLogData");
      if(gameLogData == null) { 
        return result;
      }
      result = JSON.parse(gameLogData);
    }
    if(Array.isArray(gameLogData) == false) {
      result.push(gameLogData);
    }
    Game.gameLog = result[index];
  },

  save : function(gameLogData = null) {
    let result = null;
    if(gameLogData == null) {
      result = Game.gameLog;
    }
    else {
      result = gameLogData;
    }
    DOMManager.history.push(result);
    DOMManager.saveHistory();
    return result;
  },
  
  //This will play back a game from Game.gameLogData
  playBack: function() {
    Game.newGame(Game.gameLogData);
    handle = window.setInterval(function(event) {
      Game.clickLog[index].flipUp();
    }, 500);
  },

  formatStats : function(gameLogData = null) {
    if(gameLogData == null)gameLogData = Game.gameLog;
    let start = `<div>Start: ${gameLogData.startTime}</div>`;
    let end = `<div>End: ${gameLogData.endTime}</div>`
    let elapsed = `<div>Total time elapsed: ${gameLogData.elapsed}</div>`;
    let clicked = `<div>Total cards clicked: ${gameLogData.clickLog.length}</div>`;
    let misguess = `<div>Total misguesses: ${gameLogData.misguess}</div>`;
    return [start, end, elapsed, clicked, misguess];
  }


}







window.addEventListener("DOMContentLoaded", DOMManager.initialize);
