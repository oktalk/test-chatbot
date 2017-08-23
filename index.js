'use strict';

require('dotenv').config()

const APIAI_TOKEN = process.env.APIAI_TOKEN;
const APIAI_SESSION_ID = process.env.APIAI_SESSION_ID;

const express = require('express');
const app = express();
const apiai = require('apiai')(APIAI_TOKEN);
const server = app.listen(5000, () => {
  console.log('Listening on port 5000');
});
const io = require('socket.io')(server);

app.use(express.static(__dirname + '/views')); // html
app.use(express.static(__dirname + '/public')); // js, css, images

app.get('/', (req, res) => {
  res.sendFile('index.html');
});

io.on('connection', function(socket) {
  console.log('a user connected');
  socket.on('chat message', (text) => {
    console.log('Message: ' + text);

    // Get a reply from API.AI
    let apiaiReq = apiai.textRequest(text, {
      sessionId: APIAI_SESSION_ID
    });

    apiaiReq.on('response', (response) => {
      let aiText = response.result.fulfillment.speech;
      console.log('Bot reply: ' + aiText);
      socket.emit('bot reply', aiText); // Send the result back to the browser
    });

    apiaiReq.on('error', (error) => {
      console.log(error);
    });

    apiaiReq.end();
  });
});
