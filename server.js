/*jshint esversion: 6 */
// server.js

const express = require('express');
const SocketServer = require('ws').Server;
const WebSocket = require('ws');
const uuid = require('node-uuid');

// Set the port to 4000
const PORT = 4000;

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new SocketServer({ server });

// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.

let counter = 0;
wss.on('connection', (ws) => {
  console.log('Client connected');
  counter += 1;
  broadcast(JSON.stringify({type: 'users', userCount: counter}));
  ws.on('message', function incoming(message) {
    let messageJson = JSON.parse(message);
    switch(messageJson.type) {
      case 'postMessage':
        messageJson.id = uuid.v1();
        messageJson.type = 'incomingMessage';
        let newMessage = JSON.stringify(messageJson);
        broadcast(newMessage);
        break;
      case 'postNotification':
        messageJson.id = uuid.v1();
        messageJson.type = 'incomingNotification';
        let newUser = JSON.stringify(messageJson);
        broadcast(newUser);
        break;
      default:
        throw new Error('Unknown event type ' + data.type);
    }
  });
  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => {
    counter -= 1;
    broadcast(JSON.stringify({type: 'users', userCount: counter}));
  });
});

function broadcast(data) {
  wss.clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  });
}