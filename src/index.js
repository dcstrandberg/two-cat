import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


function Card(props) {
  let selectedClass = props.isSelected ? "isSelected " : "";
  let suitClass = props.suit + " " + selectedClass;
  return (
    <div className="cardHolder">
      <button className={suitClass + "card"} id={props.id} onClick={props.onClick}>
        {<img src={process.env.PUBLIC_URL + "/images/" + props.name + ".png"}  alt={props.name}/>}
      </button>
    </div>
    
  );
}

class Hand extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            //Don't think we actually need this in state 
            //playerNumber = null,
            cardList: this.props.cardList,
            selectedList: Array(this.props.cardList.length).fill(false),
        };
    }
    //Given a list of cards, render it within the hand (by iteratively calling the renderCard function)
    //pretty sure we'll want to put RenderCard in each class, so that it can get passed different onclick methods based on its parent
    renderCard(i) {
      return (
        <li key={"Card".concat(this.props.cardList[i].id)}> 
          <Card 
            id={this.props.cardList[i].id}
            name={this.props.cardList[i].name}
            value={this.props.cardList[i].value}
            suit={this.props.cardList[i].suit}
            image={this.props.cardList[i].name}
            isSelected={this.props.cardList[i].isSelected}
            onClick={() => this.props.onClick(this.props.playerid, i)}
          />
        </li>
      );
    }
    
    
    renderHand() {
      let tempList = this.props.cardList.slice();
      let i, handList = [];
      for (i = 0; i < tempList.length; i++) {
        handList.push( this.renderCard(i) );
      }
      return (
        handList
      );
    }
    
    render() {
        return (
            <div className="hand" playerid={this.props.playerid}>
                <ul>{this.renderHand()}</ul>
            </div>
        );
    }
}  

class Pile extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
          //Don't think we actually need this in state 
          //playerNumber = null,
          cardList: this.props.cardList,
          count: this.props.count,
      };
  }
  //Given a list of cards, render it within the hand (by iteratively calling the renderCard function)
  //pretty sure we'll want to put RenderCard in each class, so that it can get passed different onclick methods based on its parent
  renderCard(i) {
      return (
        <li key={"Card".concat(this.props.cardList[i].id)}> 
          <Card 
            id={this.props.cardList[i].id}
            name={this.props.cardList[i].name}
            value={this.props.cardList[i].value}
            suit={this.props.cardList[i].suit}
            image={this.props.cardList[i].name}
            isSelected={this.props.cardList[i].isSelected}
            //Pile doesn't need an onClick for the card -- just for the pile itself
            onClick={() => null} //this.props.onClick()}
          />
        </li>
      );
    }
  
  
  renderPile() {
    let tempList = this.props.cardList.slice();
    let i, pileList = [];
    for (i = 0; i < tempList.length; i++) {
      pileList.push( this.renderCard(i) );
    }
    return(
      pileList
    );
  }
  
  render() {
    const className = this.props.suit + " pile";
      return (
          <div className={className} pileid={this.props.pileid} onClick={() => this.props.onClick(this.props.pileid)}>
            <div className="pileNameHolder">
              {this.props.suit + " : " + this.props.count}
            </div>
              <ul>{this.renderPile()}</ul>
          </div>
      );
  }
}  

class Discard extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
          //Don't think we actually need this in state 
          //playerNumber = null,
          cardList: this.props.cardList,
          count: this.props.count,
      };
  }
  //Given a list of cards, render it within the hand (by iteratively calling the renderCard function)
  //pretty sure we'll want to put RenderCard in each class, so that it can get passed different onclick methods based on its parent
  renderCard(i) {
      return (
        <li key={"Card".concat(this.props.cardList[i].id)}> 
          <Card 
            id={this.props.cardList[i].id}
            name={this.props.cardList[i].name}
            value={this.props.cardList[i].value}
            suit={this.props.cardList[i].suit}
            image={this.props.cardList[i].name}
            isSelected={this.props.cardList[i].isSelected}
            //No onClick for the discard pile
            //onClick={i => this.props.onClick(i)}
          />
        </li>
      );
    }
  
  
  renderDiscard() {
    let tempList = this.props.cardList.slice();
    let i, discardList = [];
    for (i = 0; i < tempList.length; i++) {
      discardList.push( this.renderCard(i) );
    }
    return(
      discardList
    );
  }
  
  render() {
    const className = this.props.discardid + " discard";
      return (
          <div className={className} discardid={this.props.discardid}>
            <div className="discardNameHolder">
              {"Player " + String(this.props.discardid) + " Discard"}
            </div>
            <ul>{this.renderDiscard()}</ul>
            
            <div className="discardCountHolder">
              {"Count: " + String(this.props.count)}
            </div>
          
          </div>
      );
  }
}  

class Board extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      //First declare the empty piles of cards
      pileList: this.props.pileList, //this.props.piles, //NOT ENTIRELY SURE HOW TO DECLARE THE CLASSES
      discardList: this.props.discardList,
      
      //We'll get the shuffled deck from the Game class 
      //Think that playerhands will probably come from the game class too? -- so it's actually a props?
      playerHandList : this.props.playerHandList,
      selectedCard: {
        handIndex: null,
        cardIndex: null,
      }
    };
  }
  
  //We need two types of handleClick functions: one for each type of card aggregate (Hands, Play Piles)
  //Clicking on the hand will select the new card, and de-select the old card
  //Clicking on the play pile will play a card, (ASSUMING that a card from the hand has been selected, at which point it will also un-select that card)
  //Clicking on the discardPile won't do... anything?
  handlePileClick(pileIndex) {
    //First check to make sure a card is selected before acting on a Pile Click
    let selectedCard = this.state.selectedCard;
    let activePlayer = this.props.activePlayer;

    //We gotta check whether there's a currently selected card
    if (selectedCard.cardIndex == null || selectedCard.handIndex == null) {
      //And if not, then we're not doing ANYTHANG
      return;
    }
    
    //Theoretically this code should be unreachable, because no selected card should belong to a player other than the active player, but who knows...
    if (selectedCard.handIndex !== activePlayer) {
      return;
    } 

    //get copies of all the relevant data
    let handIndex = selectedCard.handIndex;
    let cardIndex = selectedCard.cardIndex;
    let tempHandList = this.state.playerHandList.slice();
    let tempHand = tempHandList[handIndex].slice();
    let tempCard = tempHand[cardIndex];

    let tempPileList = this.state.pileList.slice();
    let tempPile = tempPileList[pileIndex];
    let tempCardList = tempPile.cardList.slice();

    //We need these so that we can modify the discard state if needed
    let tempDiscardList = this.state.discardList.slice();
    


    //One final check to see if the current card CAN be placed on the selected Pile:
    if (tempCard.suit !== tempPile.suit && tempCard.suit !== "Wild") {
      return;
    }

    //Alright, it's a valid move, now let's get this card PLAYED!
    //Remove the card from the hand and update the hand
    tempCard = tempHand.splice(cardIndex, 1)[0];
    tempHandList[handIndex] = tempHand;

    //Check the count of the pile
    let currentCount = tempPile.count;

    //Check whether the new card would put pile over the edge
    if (currentCount + tempCard.value < this.props.overflowNumber) { 
      //If we're good, just push that card, and set state for the new pile cardlist and update the count
      tempCardList.push(tempCard);
      currentCount += tempCard.value;
      
    } else {
      //Otherwise we need to discard the current cards in the pile, clear the pile and add the new card
      tempDiscardList[handIndex].cardList = tempCardList.concat(tempDiscardList[handIndex].cardList);
      tempDiscardList[handIndex].count += tempCardList.length;

      tempCardList = [tempCard];
      currentCount = [tempCard.value]
    }

    //Now aggregate up the data structures
    tempPile.cardList = tempCardList;
    tempPile.count = currentCount;

    tempPileList[pileIndex] = tempPile;

    //And finally put Selected Card back to null, before writing state:
    selectedCard = {
      handIndex: null,
      cardIndex: null,
    };

    //Finally set the state regardless of what happened
    this.setState({
      pileList: tempPileList,
      discardList: tempDiscardList,
      playerHandList: tempHandList,
      selectedCard: selectedCard,
    });
    
    //And call the Game class method of ending the turn
    this.props.onTurnEnd(tempHandList, tempDiscardList);
    return;

  }

  handleHandClick(handIndex, cardIndex) {
    //So i is the hand id and j is the card index in the hand
    let tempHandList = this.state.playerHandList.slice();
    let activePlayer = this.props.activePlayer;

    //First check if it's a card in the hand of the selected player
    if (handIndex !== activePlayer) {
      return;
    }
    //We'll need these to make sure we take care of the selected values
    let selectedCard = this.state.selectedCard;

    //Before we do anything, we gotta check whether there's a currently selected card
    if (selectedCard.cardIndex != null && selectedCard.handIndex != null) {
      //And if so, we gotta set that card's isSelected attribute to false
      tempHandList[selectedCard.handIndex][selectedCard.cardIndex].isSelected = false;
    }

    //Now set the new card's value to selected
    let tempHand = tempHandList[handIndex].slice();
    tempHand[cardIndex].isSelected = true;
 
    //Set the selectedCard state to be the new hand/card index
    selectedCard = {
      handIndex: handIndex,
      cardIndex: cardIndex,
    };
    
    //Reaggregate the objects
    tempHandList[handIndex] = tempHand;

    

    //Finally set the state regardless of what happened
    this.setState({
      playerHandList: tempHandList,
      selectedCard: selectedCard,
    });
    return;
  }
    
  // We'll need three render functions as well as three onClicks for each of the cards in the piles... Not ENTIRELY sure if those should be defined in this class or the Game class
  renderHand(i){
    let isActivePlayer = (i === this.state.activePlayer) ? "active-player" : "inactive-player";
    let className = "handHolder".concat(" ").concat(isActivePlayer); 
    
    return ( 
      <li key={"Hand".concat(String(i))}>
        <div className={className}>
          <Hand 
            className={isActivePlayer}
            playerid={i}
            cardList={this.state.playerHandList[i]}
            onClick={(i, cardIndex) => this.handleHandClick(i, cardIndex)}
          />
        </div>
      </li>
    );
  }
  renderPile(i){
    let className = "pileHolder";
    return ( 
      <li key={"Pile".concat(String(i))}>
        <div className={className}>
          <Pile 
            pileid={i}
            suit={this.state.pileList[i].suit}
            count={this.state.pileList[i].count}
            cardList={this.state.pileList[i].cardList}
            onClick={(i) => this.handlePileClick(i)}
          />
        </div>
      </li>
    );
  }
  renderDiscard(i){
    let className = "discardHolder";
    return ( 
      <li key={"Discard".concat(String(i))}>
        <div className={className}>
          <Discard 
            discardid={i}
            count={this.state.discardList[i].count}
            cardList={this.state.discardList[i].cardList}
            //I don't think we need this...
            //onclick={() => this.handleDiscardClick()}
          />
        </div>
      </li>
    );
  }
 
  //Now this is the function that creates all the fucking things
  renderPileList(){
    //First render the three piles (including an empty one)
    //Then render the discards
    //Then the hands
    let i, pileList = [];
    for (i = 0; i < this.props.pileList.length; i++) {
      pileList.push( this.renderPile(i) );
    } 
    return(
      pileList
    );
  }

  renderHandList() {
    let i, handList = [];
    for (i = 0; i < this.props.playerHandList.length; i++) {
      handList.push( this.renderHand(i) );
    }
    return(
      handList
    );
  }

  renderDiscardList(){
    let i, discardList = [];
    for (i = 0; i < this.props.discardList.length; i++) {
      discardList.push( this.renderDiscard(i) );
    } 

    return(
      discardList
    );
  }

  render() {
    return (
      <div className="gameBoard">
        <div className="pileList">
          <ul>{this.renderPileList()}</ul>
        </div>
        <div className="handList">
          <ul>{this.renderHandList()}</ul>
        </div>
        <div className="discardList">
          <ul>{this.renderDiscardList()}</ul>
        </div>
      </div>
    );
  }
}


class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activePlayer: 0, 
      board: null,
      winner: null,
      roundNumber: 0, 
      roundScores: Array(4).fill(Array(4).fill(0)),
      suitList : ["Cat", "Mirror", "Ladder"],
      overflowNumber : 14, //This means it can be UPTO 13, and goes away at 14
      numberList : [1, 1, 1, 2, 2, 2, 4, 4, 4, 4, 5, 5, 5, 5, 7, 7],
      numWilds : 8,
      wildValue : 4,
      maxRounds : 4,
      wildPoints : 2,

    };
  }

  checkWinner() {
    //Assuming the game IS over, let's check the scores and return the winning player
    let finalScores = [0, 0, 0, 0];
    let i, j;
    for (i = 0; i < this.state.roundScores.length; i++) {
      for (j = 0; j < this.state.roundScores[i].length; j++) {
        finalScores[j] += this.state.roundScores[i][j];
      }
    }

    return finalScores.indexOf( Math.max.apply(null, finalScores) );

  };

//This should check if it's the end of the round, and if so call handleRoundEnd, which will check if it's the end of the game, otherwise increment the activePlayer
  handleTurnEnd(handList, discardList) {
    let tempHandList = handList.slice();
    let tempDiscardList = discardList.slice();

    let roundOver = true;
    //First we need to check to see if everyone's played all their cards
    let i;
    for (i = 0; i < tempHandList.length; i++) {
      if (tempHandList[i].length > 0) {
        roundOver = false;
      } 
    }

    if (roundOver === true) {
      this.handleRoundEnd(tempDiscardList)
    }
    
    //Regardless, let's increment the active player and return
    let activePlayer = this.state.activePlayer;
    activePlayer += 1;
    this.setState({
      activePlayer: activePlayer,
    });
    return;
  }

  handleRoundEnd(discardList) {
    //first slice out the pileList
    let thisRound = this.state.roundNumber
    let scoreList = this.state.roundScores.slice()
    let thisRoundList = scoreList[thisRound].slice()

    //first check if any players have the highest # of a card color
    let suitList = this.state.suitList.slice();
    let topPlayers = Array(this.state.suitList.length).fill({
      mostCards: 0, 
      player: -1,
    });
    //let tempScores = Array(discardList.length).fill(0);
    //I need to loop through the discardPiles to figure out how scoring works
    let suitCardList = Array(this.state.suitList.length).fill( Array(discardList.length).fill(0) );
    let wildCards = Array(discardList.length).fill(0);
    let tempCard;

    let i, j;
    for (i = 0; i < discardList.length; i++) { 
      //Distribute each card appropriately
      while (discardList[i].length > 0) {
        //First check for wild
        tempCard = discardList[i].pop();
        if (tempCard.suit === "Wild") {
          wildCards[i] += this.state.wildPoints;
        } else {
          suitCardList[ suitList.indexOf( tempCard.suit ) ][i] += 1
        }
      }
      
      //Check to see if any are longer than the current best: 
      for (j = 0; j < topPlayers.length; j++) {
        if ( suitCardList[ j ] > topPlayers[j].mostCards ) {
          topPlayers[j].mostCards = suitCardList[ j ] 
          topPlayers[j].player = i
          
        } else if (suitCardList[j] === topPlayers[j].mostCards ) {
          topPlayers[j].player = -1
        }
      }
    }
    
    //Now we know who to subtract points from -- let's compute the scores
    for (i = 0; i < thisRoundList.length; i++) {
      //For each player, add their wild card scores
      thisRoundList[i] += wildCards[i];

      //Then loop through each suit score and then add them
      for (j = 0; j < suitCardList.length; j++) {
        thisRoundList[i] += suitCardList[j][i];
      }
    }

    //Then loop through the best players and subtract scores from them
    for (i = 0; i < topPlayers.length; i++) {
      if (topPlayers[i].player >= 0) {
        thisRoundList[topPlayers[i].player] -= topPlayers[i].mostCards; 
      }
    }


    let winner = this.state.winner;

    //Also need to check if it's the final round, at which point I need to pass end of game
    if (thisRound >= this.state.maxRounds - 1) {
      
      winner = this.checkWinner();
    }
    
  //Update the round numbers, scores, etc.
  scoreList[thisRound] = thisRoundList;
  thisRound += 1; 
  

  this.setState({
    roundNumber: thisRound,
    roundScores: scoreList,
    winner: winner,
  });
  return;
}

  initializeDeck() {
    
    //First fill the card list with wild cards
    let cardList = []
    let suitList = this.state.suitList.slice();
    let numberList = this.state.numberList.slice();
    
    //Now create the card list
    let i, j;
    for (i = 0; i < suitList.length; i++) {
      for (j = 0; j < numberList.length; j++) {
        cardList.push(   
          {
            id: null,
            name: String(numberList[j]) + " " + suitList[i],
            value: numberList[j],
            suit: suitList[i],
            isSelected: false,
          }
        )
      }
    }

    //Now add the wild cards to the end
    for (i = 0; i < this.state.numWilds; i++) {
      cardList.push( 
        {
          id: null, 
          name: String(this.state.wildValue) + " Wild",
          value: this.state.wildValue,
          suit: 'Wild',
          isSelected: false,
        }
      );
    }

    //Now give each card a unique id for use later
    for (i = 0; i < cardList.length; i++) {
      cardList[i].id = i;
    }

    return cardList;
  }
  
  shuffleDeck( deck ) {
    //We need to randomly order the deck
    let tempDeck = [];
    let randInt = 0;

    while (deck.length > 0) {
      randInt = Math.floor(Math.random() * deck.length);

      //I THINK that I need this [0] index because splice produces an array????
      tempDeck.push( deck.splice( randInt, 1)[0] )

    }

    return tempDeck;
  }

  dealCards( deck ) {
    //need to distribute the cards to each empty hand....
    let tempHandList = [[], [], [], []];
    let currentHand = this.state.roundNumber; 
    let maxHand = 4;
    
    while (deck.length > 0) {

      //Push the popped deck card into the appropriate player list
      tempHandList[currentHand].push( deck.pop() )
      
      //Now cycle the player
      currentHand = (currentHand + 1) % maxHand;

    }

    return tempHandList;
  }

  render() {
    //We need to render the round number, whos turn it is, and the winner (conditionally)
    //We'll need a function for Play Card, which calls Next Turn, which then calls "Is Winner"
    //Also need a scoring function to be called at the end of each round
    //Need to modify checkWinner function to figure out each round's ending


    let orderedDeck = this.initializeDeck();
    let shuffledDeck = this.shuffleDeck( orderedDeck.slice() );

    let winnerNumber = this.state.winner;

    let pileList = [
      {
        name: "CatPile",
        suit: "Cat",
        count: 0,
        cardList: [],

      },
      {
        name: "MirrorPile",
        suit: "Mirror",
        count: 0,
        cardList: [],

      },
      {
        name: "LadderPile",
        suit: "Ladder",
        count: 0,
        cardList: [],

      },
    ];

    let discardList = [
      {
        count: 0,
        cardList: [],
      },
      {
        count: 0,
        cardList: [],
      },
      {
        count: 0,
        cardList: [],
      },
      {
        count: 0,
        cardList: [],
      },
    ]

    return (
      <div className="board">
        <h2>Active Player: {this.state.activePlayer}</h2>
        <Board 
          //I think all these things should be put into the Board Class
          playerHandList={this.dealCards(shuffledDeck)} 
          pileList={pileList}
          discardList={discardList}
          //activePlayer can be passed so that we can update the class of the boards
          //
          activePlayer={this.state.activePlayer}
          suitOrder={this.state.suitList}
          overflowNumber={this.state.overflowNumber}
          onTurnEnd={(handList, discardList) => this.handleTurnEnd(handList, discardList)}
          

        />


    
        { winnerNumber > 0 &&

          <h2>Congratualtions, Player {this.state.winner + 1} </h2>

        }
      </div>
    );
  }
}



ReactDOM.render(<Game />, document.getElementById("root"));


// This is the tutorial biz -- let's start figuring out how to to two cat
/*
function Square(props) {
    return (
      <button className="square" onClick={props.onClick}>
        {props.value}
      </button>
    );
  }
  
  class Board extends React.Component {
    renderSquare(i) {
      return (
        <Square
          value={this.props.squares[i]}
          onClick={() => this.props.onClick(i)}
        />
      );
    }
  
    render() {
      return (
        <div>
          <div className="board-row">
            {this.renderSquare(0)}
            {this.renderSquare(1)}
            {this.renderSquare(2)}
          </div>
          <div className="board-row">
            {this.renderSquare(3)}
            {this.renderSquare(4)}
            {this.renderSquare(5)}
          </div>
          <div className="board-row">
            {this.renderSquare(6)}
            {this.renderSquare(7)}
            {this.renderSquare(8)}
          </div>
        </div>
      );
    }
  }
  
  class Game extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        history: [
          {
            squares: Array(9).fill(null)
          }
        ],
        stepNumber: 0,
        xIsNext: true
      };
    }
  
    handleClick(i) {
      let history = this.state.history.slice(0, this.state.stepNumber + 1);
      let current = history[history.length - 1];
      let squares = current.squares.slice();
      if (calculateWinner(squares) || squares[i]) {
        return;
      }
      squares[i] = this.state.xIsNext ? "X" : "O";
      this.setState({
        history: history.concat([
          {
            squares: squares
          }
        ]),
        stepNumber: history.length,
        xIsNext: !this.state.xIsNext
      });
    }
  
    jumpTo(step) {
      this.setState({
        stepNumber: step,
        xIsNext: (step % 2) === 0
      });
    }
  
    render() {
      let history = this.state.history;
      let current = history[this.state.stepNumber];
      let winner = calculateWinner(current.squares);
  
      let moves = history.map((step, move) => {
        let desc = move ?
          'Go to move #' + move :
          'Go to game start';
        return (
          <li key={move}>
            <button onClick={() => this.jumpTo(move)}>{desc}</button>
          </li>
        );
      });
  
      let status;
      if (winner) {
        status = "Winner: " + winner;
      } else {
        status = "Next player: " + (this.state.xIsNext ? "X" : "O");
      }
  
      return (
        <div className="game">
          <div className="game-board">
            <Board
              squares={current.squares}
              onClick={i => this.handleClick(i)}
            />
          </div>
          <div className="game-info">
            <div>{status}</div>
            <ul>{moves}</ul>
          </div>
        </div>
      );
    }
  }
  
  // ========================================
  
  ReactDOM.render(<Game />, document.getElementById("root"));
  
  function calculateWinner(squares) {
    let lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      let [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  }
*/