/*
  The reason I do this DOMManager thing is to make code more readable and to have a handy
  list of elements. It would also be easy to dynamically assign these things but I don't want EVERY
  element here, just the ones I might manipulate or reference in code at some point. 
  Seeing DOMManager.elElement stands out in code a lot better than repeated document.querySelector
  calls AND it reduces the number of function calls and DOM searches. Keep all of the DOM manipulation
  stuff in one place.
  Ideally, all of this will be converted to react components and reside in separate js and css files. Someday.
  Even more ideally, in addition, we would use BabylonJS and do it all in 3D. A gitHub branch someday?
*/
const DOMManager = {
  elHome : document.querySelector("#home"),
  elBrand : document.querySelector("#brand"),
  elContent : document.querySelector("#content"),
  elGame : document.querySelector("#game"),
  elHeader : document.querySelector("#header"),
  elSplash : document.querySelector("#splash"),
  elHistoryItems : document.querySelector("#historyItems"),
  elResults : document.querySelector("#results"),
  elResultsStats : document.querySelector("#resultsStats"),
  elNewGameButton : document.querySelector("#newGame"),
  elTimer : document.querySelector("#timer"),
  elGameOptionsDiv : document.querySelector("#gameOptionsDiv"),
  elEmojis : document.querySelector("#emojis"),
  elPairs : document.querySelector("#pairs"),
  delay : 1000,
  history : [], //History of games from/to local storage
  maxHistory : 5,
  initialize : function() {
    window.removeEventListener("DOMContentLoaded", DOMManager.initialize);
    DOMManager.elNewGameButton.addEventListener("click", DOMManager.newGameClicked);
    DOMManager.elContent.addEventListener("click", DOMManager.contentClicked);
    DOMManager.elGameOptionsDiv.addEventListener("click", DOMManager.gameOptionsClicked)
    DOMManager.elHome.addEventListener("click", DOMManager.splashMode);
    DOMManager.elEmojis.addEventListener("click", DOMManager.emojiSelect);
    //Here we assign all properties and functions of the Game class to the HTML element referenced by DOMManager.elGame
    //effectively extending the HTMLElement (div) with additional functionality
    Object.assign(DOMManager.elGame, Game);
    DOMManager.splashMode();
  },
  splashMode : function() {
    DOMManager.elGame.remove();
    DOMManager.elResults.remove();
    DOMManager.removeTimer();
    DOMManager.loadHistory();
    DOMManager.elHome.innerText = "Memory";
    if(DOMManager.elSplash.parentElement == null)DOMManager.elContent.append(DOMManager.elSplash);
    if(DOMManager.elNewGameButton.parentElement == null)DOMManager.elHeader.append(DOMManager.elNewGameButton);
   },
  resultsMode : function() {
    DOMManager.elGame.remove();
    DOMManager.elSplash.remove();
    DOMManager.elContent.append(DOMManager.elResults);
    if(DOMManager.elNewGameButton.parentElement == null)DOMManager.elHeader.append(DOMManager.elNewGameButton);
    DOMManager.elHome.innerText = "Click for all results";
  },
  gameMode : function() {
    DOMManager.elSplash.remove();
    DOMManager.elResults.remove();
    if(DOMManager.elGame.parentElement == null)DOMManager.elContent.append(DOMManager.elGame);
    DOMManager.elNewGameButton.remove(); 
    DOMManager.elHeader.append(DOMManager.elTimer);
    DOMManager.elHome.innerText = "Click to Quit";
  },

  removeTimer : function() {
    if(Game.timer != null) {
      clearInterval(Game.timer);
    }
    DOMManager.elTimer.remove();
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
  
  emojiSelect : function(event) {
    let options = DOMManager.elPairs.querySelectorAll("option");
    for(option of options) {
      option.disabled = ((DOMManager.elEmojis.checked == false) ? (option.value == "5" ? false : true) : false);
    }
    if(DOMManager.elEmojis.checked == false)DOMManager.elPairs.value = "5";
  },

  clearHistory : function() {
    DOMManager.history = [];
    window.localStorage.clear();
    DOMManager.elHistoryItems.innerHTML = "";
    DOMManager.loadHistory();
  },

  loadHistory : function() {
    let games = window.localStorage.getItem("history");
    if(games == null)return null;
    DOMManager.history = JSON.parse(games);
    DOMManager.elHistoryItems.innerHTML = "";
    for(let index = 0; index < DOMManager.history.length; index ++) {
      let obj = Game.formatStats(true, DOMManager.history[index]);
      DOMManager.elHistoryItems.innerHTML += "<hr />" + obj;
    }
    return DOMManager.history;
  },

  saveHistory : function() {
    let strHistory = JSON.stringify(DOMManager.history);
    window.localStorage.setItem("history", strHistory);
  },

  timerDisplay : function(event) {
    let elapsed = (Date.now() - Game.gameLog.startTime) / 1000;
    DOMManager.elTimer.innerText = elapsed.toFixed(0);
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
  "this" which is used to reference itself.
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
        this.dataset.clicks++;  //We only add to the "clicks" count if the card is actually revealed.
      }
      if(this.classList.contains("cardDown")) {
        this.classList.remove("cardDown");
      }
    },
    flipDown: function() {
      if(this.isFaceDown() || this.dataset.status <= 0) {
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
  gameLog : {
    startTime: 0,
    endTime: 0,
    elapsed: 0,
    cards : [],   //The cards (as indexes into CardObjectManager colorSymbols)
    clickLog : [],  //An array of each click and which card (index it was)
    misguess : 0, //When the second card had not been clicked before it was a guess.
    forgot: 0,  //When the second card had been clicked before but was mismatched anyway we forgot.
    lucky: 0, //When the second card has never been seen before it's not memory, it's luck.
    memory: 0 //When the second card has been seen before it's assumed to be memory. Could still be just a guess though, in reality.
  },
  cardTimer : null, //Used for waiting when two cards are flipped up
  numPairs : 0,
  bEmojis : true,
  bRandom : true,
  cards : [], //An array of HTMLElement (div) objects representing cards
  cardUp : [null, null],
  matches : 0,
  timer : null,

  clearData : function() {
    Game.gameLog.startTime = 0;
    Game.gameLog.elapsed = 0;
    Game.gameLog.cards = [];
    Game.gameLog.endTime = 0;
    Game.gameLog.clickLog = [];
    Game.gameLog.misguess = 0;
    Game.gameLog.forgot = 0;
    Game.gameLog.lucky = 0;
    Game.gameLog.memory = 0;
    Game.gameLog.cardUp = [null, null];
    Game.gameLog.matches = 0;
    Game.gameLog.cards = [];
    Game.matches = 0;
    Game.cards = [];
    Game.cardUp = [null, null];
    Game.timer = null;
    DOMManager.elGame.innerHTML = "";
  },

  newGame : function(gameDataObject) {
    Game.clearData();
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
    Game.gameLog.startTime = Date.now();
    DOMManager.gameMode();
    Game.timer = setInterval(DOMManager.timerDisplay, 1000)
  },

  cardClicked : function(card) {
    if(card.isFaceUp()) {
      console.log("Stop clicking cards which are already face up!. Strike against you!");
      return; //We're done here.
    }
    if(Game.cardUp[0] == null) {
      //We don't have a card up already so we'll set it
      Game.cardUp[0] = card;
      card.flipUp();
      Game.gameLog.clickLog.push(this.dataset.index);
      return; //We're done here. We should now have only one card face up.
    }
    //At this point there is already a card up and we have clicked a face-down card.
    if(Game.cardUp[1] != null) {
      //Now we have a problem. There was already TWO cards up and we clicked another one.
      //We have to compare to see if the new card matches the SECOND card, not the first.
      //Also, if the card has never been clicked, just ignore it; it's not memory.
      //Otherwise we'll just swap them and continue.
      if(card.dataset.clicks == 0) {
        let temp = Game.cardUp[0];
        Game.cardUp[0] = Game.cardUp[1];
        Game.cardUp[1] = temp;
      }
      else {
        //Ok, there was already two cards up and we clicked a third which had never been clicked before.
        return; //We're done here. Make them wait.
      }
    }
    //At this point cardUp[0] is the last card clicked before this card.
    if(card.dataset.symbol == Game.cardUp[0].dataset.symbol) {
      //We have a match. Even if there are already two cards up we still don't wait.
      //Remember, at this point we still haven't flipped up the latest card so technically we still have two or fewer cards showing.
      if(Game.cardTimer != null) {
        //This would only happen if there had already been two cards and the previous one matched the new one AND the new one was remembered (previously clicked at least once)
        window.clearTimeout(Game.cardTimer);
        Game.cardTimer = null;
      }
      if(Game.cardUp[1] != null) { //In the case that we were still waiting while 2 cards were up.
        Game.cardUp[1].flipDown();
      }
      console.log("Matched a pair of cards");
      if(card.dataset.clicks == 0) {
        Game.gameLog.lucky++;
      }
      else {
        Game.gameLog.memory++;
      }
      Game.matches ++;
      Game.gameLog.clickLog.push(this.dataset.index);
      card.flipUp();
      card.setMatched();
      Game.cardUp[0].setMatched();
      if(Game.matches == Game.numPairs) {
        //We have a winner
        console.log("Game has been completed");
        Game.gameLog.endTime = Date.now();
        Game.winGame();
        return; //We won the game. Let's just get out of here now.
      }
      Game.cardUp[0]  = null;
      Game.cardUp[1] = null;
      return; //We're done here. We have a match.
    }
    //We have a mismatch. We must wait until the timeout has completed or else we'll get too many faceUps.
    if(card.dataset.clicks == 0)Game.gameLog.misguess ++;  //Only call it a misguess if we've seen the card before.
    else Game.gameLog.forgot++; //We had previously seen the card so it is no longer a guess but a forget.
    if(Game.cardUp[1] == null) {
      Game.cardUp[1] = card;
      Game.gameLog.clickLog.push(this.dataset.index);
      card.flipUp();
    }
    Game.cardTimer = window.setTimeout(function(event) {
      console.log("Mismatch");
      if(Game.cardUp[0] != null)Game.cardUp[0].flipDown();
      if(Game.cardUp[1] != null)Game.cardUp[1].flipDown();
      Game.cardUp[0] = Game.cardUp[1] = null;
    }, 1000);
  },

  winGame : function() {
    clearInterval(Game.timer);
    DOMManager.elResultsStats.innerText = "";
    Game.gameLog.elapsed = Game.gameLog.endTime - Game.gameLog.startTime;
    DOMManager.elResultsStats.innerHTML = Game.formatStats();
    Game.save();
    setTimeout(function(event) {
      DOMManager.resultsMode();
    }, DOMManager.delay);
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
    if(gameLogData == null) {
      gameLogData = Game.gameLog;
    }
    let len = DOMManager.history.unshift(gameLogData);
    if(len > DOMManager.maxHistory)DOMManager.history.pop();
    DOMManager.saveHistory();
  },
  
  //This will play back a game from Game.gameLogData
  playBack: function() {
    Game.newGame(Game.gameLogData);
    handle = window.setInterval(function(event) {
      Game.clickLog[index].flipUp();
    }, 500);
  },

  formatStats : function(forHistory = false, gameLogData = null) {
    if(gameLogData == null)gameLogData = Game.gameLog;
    elapsedStr = new Date((gameLogData.endTime - gameLogData.startTime)).toISOString().substr(14, 5);
    if(forHistory == false) {
      elapsed = `<div id="elapsed">Total time elapsed: ${elapsedStr}</div>`;
      clicked = `<div id="clicked">You clicked ${gameLogData.clickLog.length} times.</div>`;
      misguess = `<div id="misguess">You were unlucky and guessed wrong ${gameLogData.misguess} times.</div>`;
      lucky = `<div id="lucky">You got lucky ${gameLogData.lucky} times.</div>`;
      memory = `<div id="memory">You remembered a previously selected card ${gameLogData.memory} times</div>`;
      forgot = `<div id="forgot">You forgot the value of a previously selected card ${gameLogData.forgot} times</div>`;
    }
    else {
      //We're formatting this to display it on the game history page
      elapsed = `<div>Total time elapsed: ${elapsedStr}</div>`;
      clicked = `<div>Clicks: ${gameLogData.clickLog.length}</div>`;
      misguess = `<div>Misguess: ${gameLogData.misguess}</div>`;
      lucky = `<div>Lucky: ${gameLogData.lucky}</div>`;
      memory = `<div>Remembered: ${gameLogData.memory}</div>`;
      forgot = `<div>Forgot: ${gameLogData.forgot}</div>`;
    }
    return `${elapsed}${clicked}${misguess}${lucky}${memory}${forgot}`;
  }


}







window.addEventListener("DOMContentLoaded", DOMManager.initialize);
