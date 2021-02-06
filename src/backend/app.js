var express = require('express');
const cors = require('cors');
var socket = require('socket.io');

var app = express();

app.use(express.static("./build/"));

//I don't think starter game actually does anything -- but actually that might be fine for our purposes
var starterGame = {
        name: "twocat", //Eventually figure out how to randomize this and have it be a new room in the place
        peopleOnline: 0,
        activePlayer: 0, 
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
        },
        //I'm actually thinking we only need historylength and not the full history so commenting it out for the time being
        //history: [],
        historyLength: 0,
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
    
    //currently ADD_PLACE doesn't ever get called
    socket.on('ADD_PLACE', name => {
        /* 
        //I don't think we need this check because "GET_PLACE" already does it?
        if (serverPlaces[name].peopleOnline <= 0) {
        */
            //Also I don't think this is a deep copy, so the arrays from the starter game would in theory link to every other game? 
            //Unclear
            //Though I think passing things between client & server should fix that issue?
            // Possibly
            serverPlaces[name] = Object.assign({}, starterGame);

        // }
      

        serverPlaces[name].peopleOnline = serverPlaces[name].peopleOnline + 1;
        //I guess this is where we send a message to all clients so they can update their routes
        //But I feel like it should also... lost my train of thought, but I think it should do something else
        io.emit('UPDATE_PLACE', serverPlaces); 
        
    });

    socket.on('REMOVE_PLACE', name => {
        serverPlaces[name].peopleOnline = serverPlaces[name].peopleOnline - 1;
    });

    socket.on('GET_PLACE', (name) => {
        //first check to see if it exists
        if(serverPlaces[name]) {
            io.emit('UPDATE_STATE', serverPlaces[name]);
        } else {
            io.emit('ADD_PLACE', name)
        }

        // respond with the history length when a GET request is made to the URL of the specific game
        app.get('/' + name, (req, res) => {
            //In addition to sending this, let's also log to the console so we know what's whata
            console.log("In the appget, for the name: " + name);
            historyText = serverPlaces[name].historyLength.toString();
            console.log("server historylength is: " + serverPlaces[name].historyLength);
            console.log("Converted to string: " + historyText);
            res.send(historyText);

        });


    });

    //when they click the counter
    socket.on('CHANGE_STATE', data => {
        let tempState = {
            ...data,
        };
        
        serverPlaces[data.name] = {...tempState};
        io.emit('UPDATE_STATE', serverPlaces[data.name])
    });

    socket.on('GET_STATE', name => {
        io.emit('UPDATE_STATE', serverPlaces[name]);
    });
    
});
