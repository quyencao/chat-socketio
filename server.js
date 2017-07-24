var express = require('express');
var moment = require('moment');
var path = require('path');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var mysql = require('mysql');

var con = mysql.createConnection({
   host: 'localhost',
   user: 'root',
   password: '',
   database: 'chat'
});

var port = 3000;
var users = [];
var messages = [];
var rooms = ['Html', 'Javascript', 'Angular', 'PHP'];

app.use(express.static(path.join(__dirname, "public")));

app.get('*', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket) {
  console.log('new connection made');

  socket.on('new-room', function (data) {

     var room = { name: data.room };

     con.query('INSERT INTO rooms SET ?', room, function(err, res) {
         if(err) {
             console.log(err);
         }
     });

     rooms.unshift(data.room);
  });

  socket.on('all-rooms', function () {

      con.query('SELECT * FROM rooms', function (err, rows) {
          if(err) {
              console.log(err);
          }
          console.log('Data received\n');

          rooms = rows.map(function (row) {
              return row.name;
          });

          console.log(rooms);

          socket.emit('all-rooms-received', rooms);
      });

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
         id: socket.id,
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

    var userExist = users.filter(function (user) {
        return user.id == socket.id;
    });

    if(userExist.length === 0) {
        var userObj = {
            username: data.username,
            id: socket.id,
            room: data.room
        };

        users.push(userObj);

        socket.emit('new-user', userObj);
    } else {
        var userObj = userExist[0];
        var room = userObj.room;
        userObj.username = data.username;
        userObj.room = data.room;

        var userInRoom = users.filter(function (user) {
            return user.room == room;
        });

        io.in(room).emit('all-users', userInRoom);

        socket.emit('new-user', userObj);
    }

    // console.log(users);

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