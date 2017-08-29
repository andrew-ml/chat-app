const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');

const config = require('./config');

const { Message } = require('./controllers');

// const routes = require('./routes/index');
const users = require('./routes/user');
const rooms = require('./routes/room');

let onlineUsers = new Set();

mongoose.Promise = Promise;
mongoose.connect(config.database.local, {
  useMongoClient: true,
});
mongoose.connection.on('error', console.error);

app.use(cors());

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(cookieParser());

app.use(passport.initialize());
require('./config/passport')(passport);

app.use('/users', users);
app.use('/rooms', rooms);

io.on('connection', (socket) => {
  onlineUsers.add(socket.handshake.query.id);
  io.emit('online users', Array.from(onlineUsers));
  socket.on('online users', ({ friends, id }) => {
    const res = friends.reduce((acc, friendId) => {
      if (onlineUsers.has(friendId)) {
        return acc.concat(friendId);
      };
      return acc;
    }, []);
    io.emit(`online users ${id}`, res);
  })

  socket.on('chat message', (chatMessage) => {
    Message.create({ sender: chatMessage.userId, text: chatMessage.text, date: chatMessage.date, chatId: chatMessage.chatId }, (err, message) => {
      if (err) {
        return;
      }
      io.emit(`message response ${chatMessage.chatId}`, message);
    });
  });
  socket.on('get messages', (id) => {
    Message.find({ chatId: id }, (err, messages) => {
      socket.emit('messages response', messages);
    })
  })
  socket.on('get last message', (id) => {
    Message.findLast(id, (err, message) => {
      socket.emit(`last message ${id}`, message);
    })
  })

  socket.on('disconnect', () => {
    onlineUsers.delete(socket.handshake.query.id);
    io.emit('online users', Array.from(onlineUsers));
  })
});


app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});


server.listen(3000);
