import React, {useContext, useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import { BrowserRouter as Router, Route, Redirect, useLocation} from 'react-router-dom';
import io from "socket.io-client";

const serverPath = "/";


function Card(props) {
  let suitClass = (props.isSelected ? "isSelected " : "").concat(props.isSelectedPlayer ? props.suit : "hiddenCard")
  return (
    <div className="cardHolder">
      <button className={suitClass + " card"} id={props.id} onClick={props.isSelectedPlayer ? props.onClick : null}>
        {props.isSelectedPlayer ? 
          <img src={process.env.PUBLIC_URL + "/images/" + props.name + ".jpg"}  alt={props.suit}/> : 
          <img src={process.env.PUBLIC_URL + "/images/cardBack.jpg"} alt="hidden card"/>
        }
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
            isSelectedPlayer={this.props.isSelectedPlayer}
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
            isSelectedPlayer={this.props.isSelectedPlayer}
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
            isSelectedPlayer={this.props.isSelectedPlayer}
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
            <div className="discardNameHolder discardCountHolder">
              {"Player " + String(this.props.discardid + 1) + " Discard. Count: " + String(this.props.count)}

            </div>
            <ul>{this.renderDiscard()}</ul>          
          </div>
      );
  }
}  

class Board extends React.Component {
  render() {
    return (
      <div className="gameBoard">
       <div className="pileList">
          <ul>{this.props.renderPileList()}</ul>
        </div>
        <div className="handList">
          <ul>{this.props.renderHandList()}</ul>
        </div>
        <div className="discardList">
          <ul>{this.props.renderDiscardList()}</ul>
        </div>

      </div>
    );
  }
}


class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "twocat", //Eventually figure out how to randomize this and have it be a new room in the place
      activePlayer: -1, 
      playerView: 0,
      winner: null,
      roundNumber: 0, 
      roundScores: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],// TODO same thing here, this will cause issues with memory, so we for now we're declaring it hardcoded Array(4).fill(Array(4).fill(0)),
      suitList : ["Cat", "Mirror", "Ladder"],
      overflowNumber : 14, //This means it can be UPTO 13, and goes away at 14
      numberList : [1, 1, 1, 2, 2, 2, 4, 4, 5, 5, 5, 7, 7, 7],
      numWilds : 8,
      wildValue : 4,
      maxRounds : 4,
      wildPoints : 2,
      //Moving this up from Board to Game class
      handList: null,
      pileList: null,
      discardList: null,
      selectedCard: {
        handIndex: null,
        cardIndex: null,
        history: []
      },
      //I'm actually thinking we only need historylength and not the full history so commenting it out for the time being
      //history: [],
      historyLength: 0,
    };

    /*
  let {pathname, search} = useLocation();
  this.gameName = pathname.slice(1,);
  console.log("NAME: ", gameName);
  */
 this.socket = io(serverPath);
 this.socket.on('UPDATE_STATE', (newState) => {
   this.setState({ ...newState, 
    playerView: this.state.playerView,
   });
  });
  
  
  }
  componentDidMount( ) {
    /*
    TODO this should be gotten from the props instead of state,
    and at that point, the state wouldn't even need to exists for Game, 
    it could all just be passed between functions and gotten from the server
    */
    this.socket.emit('GET_PLACE', this.state.name);
  }
  componentWillUnmount() {
    this.socket.emit('REMOVE_PLACE', this.state.name);
  }

  sendState = (tempState) => {
    let newHistory = tempState.historyLength + 1;
    let serverHistory = false;

    while (!serverHistory) {
      serverHistory = fetch("/" + tempState.name)
      .then( response => {
        console.log("New Client history is: " + newHistory)
        let tempResponse = response.text().then( (data) => {
            console.log("Got history of: " + data.toString());
            return data.toString();
          }
        );
      })
      .catch( (error) => {
        //If we can't get the history, then don't write to the server?????
        //... or maybe check again?
        console.log(error.text());
        return false;
      });
    }
    
    if (serverHistory >= newHistory) {
      console.log("The client was behind the server somehow");
      //If the client is behind the server, we should run update server
      this.socket.emit("UPDATE_STATE", tempState.name)
      return;
    } else {
      //Here we need to modify tempState to update the history, and then write the new state to the server
      tempState.historyLength = newHistory;
      //I'm actually thinking we only need historylength and not the full history so commenting it out for the time being
      //tempState.history.push(tempState)
      this.socket.emit("CHANGE_STATE", tempState);
    
    }
    return;
  }

  //Bringing these functions up from Board to Game----------
  handlePileClick(pileIndex) {
    //First check to make sure a card is selected before acting on a Pile Click
    let selectedCard = this.state.selectedCard;
    let activePlayer = this.state.activePlayer;

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
    let tempHandList = this.state.handList.slice();
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
    if (currentCount + tempCard.value < this.state.overflowNumber) { 
      //If we're good, just push that card, and set state for the new pile cardlist and update the count
      tempCardList.push(tempCard);
      currentCount += tempCard.value;
      
    } else {
      //Otherwise we need to discard the current cards in the pile, clear the pile and add the new card
      tempDiscardList[handIndex].cardList = tempCardList.concat(tempDiscardList[handIndex].cardList);
      tempDiscardList[handIndex].count += tempCardList.length;

      tempCardList = [tempCard];
      currentCount = tempCard.value;
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
    /*this.setState({
      pileList: tempPileList,
      discardList: tempDiscardList,
      handList: tempHandList,
      selectedCard: selectedCard,
    });*/

    //Update the server
    let tempState = {
      ...this.state,
      pileList: tempPileList,
      discardList: tempDiscardList,
      handList: tempHandList,
      selectedCard: selectedCard,
    };
    //Instead of emitting here, I'm passing the tempState to the handleTurnEnd so we don't have the issue of dealing with the race condition
    //this.socket.emit("CHANGE_STATE", tempState);

    //And call the Game class method of ending the turn
    this.handleTurnEnd(tempHandList, tempDiscardList, tempState);
    return;

  }

  handleHandClick(handIndex, cardIndex) {
    //So i is the hand id and j is the card index in the hand
    let tempHandList = this.state.handList.slice();
    let activePlayer = this.state.activePlayer;

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
    /*this.setState({
      handList: tempHandList,
      selectedCard: selectedCard,
    });*/

    //Update the server
    let tempState = {
      ...this.state,
      handList: tempHandList,
      selectedCard: selectedCard,
    };
    
    //What I really should do is create a CHANGE_STATE function that checks the history to make sure things are good, then returns
    //I'll write it here, then abstract it up there

    //Now we need to call the changestate function
    this.sendState(tempState);

    


    return;
  }
    
  // We'll need three render functions as well as three onClicks for each of the cards in the piles... Not ENTIRELY sure if those should be defined in this class or the Game class
  renderHand(i){
    let isActivePlayer = (i === this.state.activePlayer) ? "active-player" : "inactive-player";
    let className = "handHolder".concat(" ").concat(isActivePlayer); 
    
    return ( 
      <li className="hand" key={"Hand".concat(String(i))}>
        <div className={className}>
          <Hand 
            className={isActivePlayer}
            playerid={i}
            isSelectedPlayer={(i === this.state.playerView)}
            cardList={this.state.handList[i]}
            onClick={(i, cardIndex) => this.handleHandClick(i, cardIndex)}
          />
        </div>
      </li>
    );
  }
  renderPile(i){
    let className = "pileHolder";
    return ( 
      <li className="pile" key={"Pile".concat(String(i))}>
        <div className={className}>
          <Pile 
            pileid={i}
            isSelectedPlayer={true} //This one's gotta be true otherwise we would occasionally accidentally hide the piles
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
      <li className="discard" key={"Discard".concat(String(i))}>
        <div className={className}>
          <Discard 
            discardid={i}
            isSelectedPlayer={(i === this.state.playerView)}
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
    if (this.state.pileList !== null) {
      for (i = 0; i < this.state.pileList.length; i++) {
        pileList.push( this.renderPile(i) );
      } 
    }
    return(
      pileList
    );
  }

  renderHandList() {
    let i, handList = [], playerView = this.state.playerView;
    if (this.state.handList !== null) {
      
      //First render the selected player's hand     
      for (i = 0; i < this.state.handList.length; i++) {
        
          handList.push( this.renderHand( (playerView + i) % this.state.handList.length) );
      }
    }
    return(
      handList
    );
  }

  renderDiscardList(){
    let i, discardList = [], playerView = this.state.playerView;
    if (this.state.discardList !== null) {
      //First render the selected players' discardList
      for (i = 0; i < this.state.discardList.length; i++) {
          discardList.push( this.renderDiscard( (playerView + i) % this.state.discardList.length) );
      }   
    }
    return(
      discardList
    );
  }
  //End of functions brought up from Board to Game -------------


  checkWinner(tempState) {
    //Assuming the game IS over, let's check the scores and return the winning player
    let finalScores = [0, 0, 0, 0];
    let i, j, tempScoreList;
    let tempRoundScores = tempState.roundScores.slice();
    for (i = 0; i < tempRoundScores.length; i++) {
      tempScoreList = tempRoundScores[i].slice();

      for (j = 0; j < tempScoreList.length; j++) {
        finalScores[j] += tempScoreList[j];
      }
    }
    let min = Math.min.apply(null, finalScores);
    let winner = finalScores.indexOf( min );
    return winner;

  };

//This should check if it's the end of the round, and if so call handleRoundEnd, which will check if it's the end of the game, otherwise increment the activePlayer
  handleTurnEnd(handList, discardList, passedState) {
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
      this.handleRoundEnd(passedState, tempDiscardList)
    } else {
    
      //Regardless, let's increment the active player and return
      let activePlayer = passedState.activePlayer;
      activePlayer = (activePlayer + 1) % tempHandList.length;
      /*this.setState({
        activePlayer: activePlayer,
      });*/

      //Update the server
      passedState = {
        ...passedState,
        activePlayer: activePlayer,
      };
      this.sendState(passedState);
    }
    return;
  }

  handleRoundEnd( tempState, discardList ) {
    //first slice out the pileList
    let thisRound = tempState.roundNumber;
    let scoreList = tempState.roundScores.slice();
    let thisRoundList = scoreList[thisRound].slice();
    let tempDiscardList = discardList.slice();

    //first check if any players have the highest # of a card color
    let suitList = tempState.suitList.slice();
    let topPlayers = [ { mostCards: 0, player: -1, }, { mostCards: 0, player: -1, }, { mostCards: 0, player: -1, } ];
    //let tempScores = Array(discardList.length).fill(0);
    //I need to loop through the discardPiles to figure out how scoring works
    //let suitCardList = Array(suitList.length).fill( Array(tempDiscardList.length).fill(0).slice() );
    //TODO figure out a way to make this programmatically create an array, but without creating one that has references to all the same ones
    let suitCardList = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    let wildCards = Array(tempDiscardList.length).fill(0);
    let tempCard;

    let i, j, tempIdx;

    for (i = 0; i < tempDiscardList.length; i++) { 
      //Distribute each card appropriately
      while (tempDiscardList[i].cardList.length > 0) {
        //First check for wild
        tempCard = tempDiscardList[i].cardList.pop();
        if (tempCard.suit === "Wild") {
          wildCards[i] += this.state.wildPoints;
        } else {
          tempIdx = suitList.indexOf( tempCard.suit );

          suitCardList[tempIdx][i] += 1;
        }
      }

      //Check to see if any are longer than the current best: 
      for (j = 0; j < topPlayers.length; j++) {

        if ( suitCardList[ j ][i] > topPlayers[j].mostCards ) {
          topPlayers[j].mostCards = suitCardList[ j ][i] ;
          topPlayers[j].player = i;
          
        } else if (suitCardList[j][i] === topPlayers[j].mostCards ) {
          topPlayers[j].player = -1;
        }
      }
    }
    
    for (i = 0; i < suitCardList.length; i++) {
      for (j = 0; j < suitCardList[i].length; j++) {
      }
    }

    //Now we know who to subtract points from -- let's compute the scores
    for (i = 0; i < thisRoundList.length; i++) {
      //For each player, add their wild card scores
      thisRoundList[i] += wildCards[i];

      //Then loop through each suit score and then add them
      for (j = 0; j < suitList.length; j++) {
        thisRoundList[i] += suitCardList[j][i];
      }
    }

    //Then loop through the best players and subtract scores from them
    for (i = 0; i < topPlayers.length; i++) {
      if (topPlayers[i].player >= 0) {
        thisRoundList[topPlayers[i].player] -= topPlayers[i].mostCards; 
      }
    }


    //Update the round numbers, scores, etc.
    scoreList[thisRound] = thisRoundList;
    thisRound += 1; 
    //Set active player to be the round (to pass the deal)
    let activePlayer = thisRound;

   //Update the server
    tempState = {
      ...tempState,
      roundNumber: thisRound,
      activePlayer: activePlayer,
      roundScores: scoreList,
    };

    let winner = tempState.winner;

    //Also need to check if it's the final round, at which point I need to pass end of game
    if (thisRound >= this.state.maxRounds) {
      console.log("We've said there is a winner");
      winner = this.checkWinner(tempState);
    }
    
   //Update the server
    tempState = {
      ...tempState,
      winner: winner,
    };

  //If there isn't a winner yet:
  if (winner === null) {
    //reset the board for the next round
    this.resetBoard(tempState);
  } else {
    this.sendState(tempState);
  }

  return;
}

  initializeDeck() {
    
    //First fill the card list with wild cards
    let cardList = [];
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

  dealCards( deck, startingPlayer ) {
    //need to distribute the cards to each empty hand....
    let tempHandList = [[], [], [], []];
    let currentHand = startingPlayer; 
    let maxHand = 4;
    
    while (deck.length > 0) {

      //Push the popped deck card into the appropriate player list
      tempHandList[currentHand].push( deck.pop() )
      
      //Now cycle the player
      currentHand = (currentHand + 1) % maxHand;

    }

    return tempHandList;
  }

  initializePiles() {
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
    return pileList;
  }

  initializeDiscards() {
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
    ];

    return discardList;
  }
  resetBoard(tempState) {
    let orderedDeck = this.initializeDeck();
    let shuffledDeck = this.shuffleDeck( orderedDeck.slice() );
    let playerHands = this.dealCards(shuffledDeck, tempState.roundNumber);
    let tempPlayer = tempState.activePlayer;
    let tempPileList = this.initializePiles();
    let tempDiscardList = this.initializeDiscards();
    /*this.setState({
      handList: playerHands,
      pileList: this.initializePiles(),
      discardList: this.initializeDiscards(),
    });*/

    //Update the server
    tempState = {
      ...tempState,
      activePlayer: tempPlayer > 0 ? tempPlayer : 0,
      handList: playerHands,
      pileList: tempPileList,
      discardList: tempDiscardList,
    };
    this.sendState(tempState);
    return;
  }
  
  render() {
    
    let winnerNumber = this.state.winner;
    

    //Set the state before starting the game
    
    

    return (
      <div className="board">
        <span className="playerselect">
          <button name="player1" className={(this.state.playerView === 0) ? "selectedPlayer" : "unselectedPlayer"} onClick={() => this.setState({playerView: 0})}>Player 1</button>
          <button name="player2" className={(this.state.playerView === 1) ? "selectedPlayer" : "unselectedPlayer"} onClick={() => this.setState({playerView: 1})}>Player 2</button>
          <button name="player3" className={(this.state.playerView === 2) ? "selectedPlayer" : "unselectedPlayer"} onClick={() => this.setState({playerView: 2})}>Player 3</button>
          <button name="player4" className={(this.state.playerView === 3) ? "selectedPlayer" : "unselectedPlayer"} onClick={() => this.setState({playerView: 3})}>Player 4</button>
        </span>
        { winnerNumber !== null &&

          <h2>Congratualtions, Player {this.state.winner + 1} </h2>

        }
        <div classname="gameInfo">
          <div>Active Player: {this.state.activePlayer + 1}</div>
          {
            (this.state.activePlayer === this.state.playerView) && <b color="red">Your Turn!</b>
          }
          <div>ScoreList [Round {this.state.roundNumber + 1}]: </div>
            {this.state.roundScores.map((scoreArray, roundNumber) => (
              roundNumber <= this.state.roundNumber &&
              <div key={"RoundScores".concat(roundNumber)}>{scoreArray.map((score, scoreIndex) => (
                <span key={"Score".concat(scoreIndex)}>{score}   </span>
              ))}</div>
            ))}
        </div>
        <Board 
          //I think all these things should be put into the Board Class
          playerHandList={this.state.handList} 
          pileList={this.state.pileList}
          discardList={this.state.discardList}
          //activePlayer can be passed so that we can update the class of the boards
          //
          activePlayer={this.state.activePlayer}
          suitOrder={this.state.suitList}
          overflowNumber={this.state.overflowNumber}
          onTurnEnd={(handList, discardList) => this.handleTurnEnd(handList, discardList)}
          renderPileList={() => this.renderPileList()}
          renderHandList={() => this.renderHandList()}
          renderDiscardList={() => this.renderDiscardList()}

        />
        <button name="Reset" onClick={() => this.resetBoard(this.state)}>RESET BOARD</button>
      </div>
    );
  }
}


ReactDOM.render(
  <Router onUpdate={() => window.scrollTo(0, 0)}>
  {
    //This is where I would add logic to check what routes are there and how to deal with it...
    //For now I guess we'll just leave it -- I suppose I could pass this down? Can routes live below the top level component?

  }
    <Route path="/" component={ Game } />
  </Router>,
  document.getElementById("root")
);


/*import React, {useContext, useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import './index.css';


import { BrowserRouter as Router, Route, Redirect, useLocation} from 'react-router-dom';
import Store, {Context} from './Store';

import io from "socket.io-client";

//so this one is going to be the top level? 
//It's going to store the counter

const Game = () => {
  //const {state, dispatch} = useContext(Context);  
  const {pathname, searc} = useLocation();
  const name = pathname.slice(1,)
  console.log("NAME: ", name)
  const socket = io('localhost:5000');
  const [state, setState] = useState(0);

  useEffect(() => {
    socket.emit('GET_COUNT', {
      name: name,
    });
  });

  socket.on('UPDATE_COUNT', (newCount) => {
    setState(newCount);
  });
  
  const incrementCount = (name) => {
    socket.emit('INCREMENT_COUNT', {
      name: name,
    });
  }

  return (
          <div className="Game">
          <h3> Welcome to page {name}</h3>
          {//<h3>The count is {state.stateHolder[props.name].count}</h3>
          }
          <h3>The count is {state}</h3>
          <button onClick={() => {
              //dispatch({type: 'INCREMENT_COUNT', payload: props.name}); 
              incrementCount(name);
            }  
          }>Click to raise count</button>
          </div>
      );
  };



const Controller = () => {
  //const {stateHolder, dispatch} = useContext(Context);

  const socket = io('localhost:5000');

  let wordArray = [
    'first',
    'second', 
    'third',
    'fourth',
    'fifth',
  ];

  const randomName = () => {
      
    let i, wordURL="", tempRand, tempLength;
    tempLength = wordArray.length;


    for (i = 0; i < 2; i++) {
      tempRand = Math.floor(Math.random() * tempLength);

        wordURL += wordArray[tempRand];
        
    }
    return wordURL;
  }

  const [textValue, setTextValue] = useState(randomName);

  
  return ( 

      <div>
        <div>Enter Room Code:
              <input type="text" name="inputtext" value={textValue} onChange={
                (event) => {
                  setTextValue(event.target.value);
                }}/>
              <button onClick={() => {
                alert("Clicked");
                //dispatch({type: 'ADD_PLACE', payload: textValue});
                socket.emit('ADD_PLACE', {
                  name: textValue,
                });
                return(
                  <Redirect to={"/"+textValue} />
                );
            }}>Start Game</button>     
        </div>               
      </div>
    
    );
  }

const App = () => {
  //const {stateHolder, dispatch} = useContext(Context);
  //DECLARE ALL THE SOCKETS TO UPDATE THE STATE LIST
  const socket = io('localhost:5000');
  const [state, setState] = useState({});

  socket.on('RECEIVE_PLACE', (stateHolder) => {
    setState(stateHolder);
  });  
  socket.on('UPDATE_PLACE', (stateHolder) => {
    setState(stateHolder);
  });  
  let returnList = [];
  if (state) {

    const stateList = Object.entries(state);


    returnList = Object.keys(state).map((key) => {
      return(
        <Route exact
          key={String(key)}
          path={"/"+String(key)} 
          component={ Game }
      />
      );
    });
  }

  return(
    <Router onUpdate={() => window.scrollTo(0, 0)}>
      <Route exact path="/" component={ Controller } />
      {returnList}
    </Router>
  );
};

ReactDOM.render(
      <App />,
  document.getElementById("root")
);

*/

