const { v4: uuidv4 } = require('uuid');
const webSocketsServerPort = 8000;
const webSocketServer = require('websocket').server;
const http = require('http');
// Spinning the http server and the websocket server.
const server = http.createServer();
server.listen(webSocketsServerPort);
const wsServer = new webSocketServer({
  httpServer: server
});

// Maintaining all active connections in this object
const clients = {};
// Maintaining all active users in this object
const users = {};
// User activity history.
let userActivity = [];


const sendMessage = (json) => {
  //Sending the current data to all connected clients
  Object.keys(clients).map((client) => {
    clients[client].sendUTF(json);
  });
}

wsServer.on('request', function(request) {
  //create unique id for new user
  var userID = uuidv4(); 

  console.log((new Date()) + ' Recieved a new connection from origin ' + request.origin + '.');


//Create a new connection
  const connection = request.accept(null, request.origin);

  //assign the new user with a unique id
  clients[userID] = connection;

  //output a connected message to verify new connection
  console.log('connected: ' + userID );

  //listen for incoming messages
  connection.on('message', function(message) {

     if (message.type === 'utf8') {


       //broadcast the message to all connected clients
for (key in clients){
  clients[key].sendUTF(message.utf8Data)
  console.log('Sent message to : ', key )
}
     }
  });

 
  // user disconnected
  connection.on('close', function(connection) {
    console.log((new Date()) + " Peer " + userID + " disconnected.");
    const json = { type: 'board-data'};
    userActivity.push(`${users[userID]} left the document`);
    json.data = { users, userActivity };
    clients[userID];
    delete users[userID];
    sendMessage(JSON.stringify(json));
  });
});
