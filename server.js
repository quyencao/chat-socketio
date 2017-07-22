var express = require('express');
var moment = require('moment');
var path = require('path');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var port = 8080;
var users = [];
var messages = [];
var rooms = ['Html', 'Javascript', 'Angular', 'PHP'];

app.use(express.static(path.join(__dirname, "public")));

io.on('connection', function(socket) {
  console.log('new connection made');

  socket.on('new-room', function (data) {
     rooms.unshift(data.room);
  });

  socket.on('all-rooms', function () {
     socket.emit('all-rooms-received', rooms);
  });

  socket.on('all-users', function (data) {
     var userInRoom = users.filter(function (user) {
         return user.room == data.room
     });
     socket.emit('all-users', userInRoom);
  });

  socket.on('all-messages', function (data) {
     var messagesInRoom = messages.filter(function (message) {
        return message.room == data.room;
     });

     socket.emit('all-messages-received', messagesInRoom);
  });

  socket.on('send-message', function (data) {
     var newMessage = {
         from: data.from,
         message: data.message,
         room: data.room,
         createdAt: moment(new Date().getTime()).format('MMMM Do YYYY, h:mm:ss a')
     };

     messages.push(newMessage);

     io.to(data.room).emit('message-received', newMessage);
  });

  socket.on('join', function (data) {
    socket.room = data.room;
    var userObj = {
      username: data.username,
      id: socket.id,
      room: data.room
    };

    users.push(userObj);

    socket.emit('new-user', userObj);

    socket.join(data.room);

    var userInRoom = users.filter(function (user) {
        return user.room == data.room
    });

    io.in(data.room).emit('all-users', userInRoom);
  });

  socket.on('disconnect', function () {
      users = users.filter(function (user) {
         return user.id !== socket.id;
      });

      var userInRoom = users.filter(function (user) {
          return user.room == socket.room
      });

      io.in(socket.room).emit('all-users', userInRoom);
  });
});

server.listen(port, function() {
  console.log("Listening on port " + port);
});