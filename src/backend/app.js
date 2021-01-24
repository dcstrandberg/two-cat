var express = require('express');
const cors = require('cors');
var socket = require('socket.io');

var app = express();

app.use(express.static("./build/"));


var starterGame = {
        peopleOnline: 0,
        activePlayer: 0, 
        winner: null,
        roundNumber: 0, 
        roundScores: Array(4).fill(Array(4).fill(0)),
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
        },    
}

var serverPlaces = {
    twocat: { 
    },
};

app.use(cors());
app.options('*', cors());
app.set('port', process.env.PORT || 5000);

server = app.listen(app.get('port'), () => {
    console.log("server is runining on port: ", app.get('port'));
});

const io = socket(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

io.on('connection', socket => {
    console.log(socket.id);
    
    socket.on('ADD_PLACE', data => {
        if (serverPlaces[dataname].peopleOnline <= 0) {
            serverPlaces[data.name] = {
                ...starterGame
            }
        }

        serverPlaces[data.name].peopleOnline = serverPlaces[data.name].peopleOnline + 1;
        io.emit('UPDATE_PLACE', serverPlaces); 
        
    });

    socket.on('REMOVE_PLACE', name => {
        serverPlaces[name].peopleOnline = serverPlaces[name].peopleOnline - 1;
    });

    socket.on('GET_PLACE', (name) => {
        io.emit('UPDATE_STATE', serverPlaces[name]);
    });

    //when they click the counter
    socket.on('CHANGE_STATE', data => {
        let tempState = {
            ...data,
        };
        
        serverPlaces[data.name] = {...tempState};
        io.emit('UPDATE_STATE', serverPlaces[data.name])
    });

    socket.on('GET_STATE', data => {
        io.emit('RECEIVE_STATE', serverPlaces[data.name]);
    });
    
});
