var express = require('express');
var moment = require('moment');
var path = require('path');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var mysql = require('mysql');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');

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
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/join', authenticate, function (req, res) {
    console.log(req.token);
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/main', authenticate, function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('*', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.post('/register', function (req, res) {
    con.query('SELECT * FROM users WHERE email = ?',
        [req.body.email], function (err, row) {
            if(err) {
                console.log(err);
            }

            if(row.length > 0) {
                res.json({
                    type: 'ERR',
                    message: 'Email đã tồn tại'
                });
            } else {
                bcrypt.genSalt(10, function (err, salt) {
                   bcrypt.hash(req.body.password, salt, function (err, hash) {
                       var token = jwt.sign({
                           username: req.body.username,
                           email: req.body.email
                       }, 'secretstring', {
                           expiresIn: 15 * 60
                       });

                       var data = {
                           username: req.body.username,
                           email: req.body.email,
                           password: hash,
                           token: token
                       };

                       con.query('INSERT INTO users SET ?', data, (err, result) => {
                           if(err) throw err;

                           console.log('Last insert ID:', result.insertId);

                           res.json({
                               type: 'OK',
                               token: token,
                               user: {
                                   username: req.body.username,
                                   email: req.body.email
                               }
                           })
                       });
                   });
                });

            }
        });
});

app.post('/login', function (req, res) {
    console.log(req.body.email);
    con.query('SELECT * FROM users WHERE email = ?',
    [req.body.email], function (err, rows) {
        if(err) {
            res.json({
                type: 'ERR',
            });
        } else {
            var token = jwt.sign({
                username: rows[0].username,
                email: rows[0].email
            }, 'secretstring', {
                expiresIn: 15 * 60
            });
            if(rows.length === 1) {
                bcrypt.compare(req.body.password, rows[0].password, function (err, result) {
                   if(err) {
                       res.json({
                           type: 'ERR',
                           data: 'Sai mật khẩu'
                       });
                   } else {
                       if(result) {
                           res.json({
                               type: 'OK',
                               token: token,
                               user: {
                                   username: rows[0].username,
                                   email: rows[0].email
                               }
                           });
                       } else {
                           res.json({
                               type: 'ERR',
                               data: 'Sai mật khẩu'
                           });
                       }
                   }
                });
            } else {
                res.json({
                   type: 'ERR',
                   data: 'Sai email và mật khẩu'
                });
            }

        }
    });
    console.log(req.body.password);
});

function authenticate(req, res, next) {
    var bearerToken;
    var bearerHeader = req.headers["authorization"];
    console.log(bearerHeader);
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        // res.send(403);
        res.redirect('/');
    }
}

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

     var messagesInRoom = messages.filter(function (message) {
         return message.room === data.room;
     });
      
     io.to(data.room).emit('all-messages-received', messagesInRoom);
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