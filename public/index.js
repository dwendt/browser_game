var express = require('express');
var redis = require('redis');
var client = redis.createClient();
var app = express();
//server
var http = require('http').Server(app);
//io
var io = require('socket.io')(http);

var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

//serve public folder
//app.configure(function() {
  app.use('/public', express.static(__dirname + 'public'));
  app.use('/node_modules', express.static(__dirname + 'node_modules'));
  app.use('/js', express.static(__dirname + 'js'));
//});

//routing
app.get('/', function(req, res){
  //serve index.html
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/game', function(req, res) {
  res.sendFile(__dirname + '/index.html');
})

// Store a new high score
app.post('/score', function(req, res){
  client.rpush(['scores', JSON.stringify(req.body)], function(err, reply) {
    if(err){
     console.log(err);
    }
    else {
      res.status(200).end();
    }
  });
});

app.get('/score', function(req, res) {
  client.lrange('scores', 0, -1, function(err, reply) {
    console.log(reply);
    res.status(200).json(reply).end();
  });
});

app.get('/flushDB', function(req, res) {
  client.flushall();
  client.keys('*', function(err, reply) {
    console.log(reply);
    res.status(200).json(reply);
  });
})

//socket io

// Chatroom

// usernames which are currently connected to the chat
var usernames = {};
var numUsers = 0;



io.on('connection', function (socket) {
  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
    console.log('Message sent from ' +  socket.username + 'Message: ' + data);
  });

  socket.emit('logged users', {
    numUsers: numUsers
  });
  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    // we store the username in the socket session for this client
    socket.username = username;
    // add the client's username to the global list
    usernames[username] = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    // remove the username from global usernames list
    if (addedUser) {
      delete usernames[socket.username];
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});

//listening event on port 3000
http.listen(3000, function(){
  console.log('listening on port 3000');
});
