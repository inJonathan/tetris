var app = require('http').createServer();
var io = require('socket.io')(app);

var PORT = 3000;

// 客户端计数
var clientCount = 0;

// 存储客户端socket
var socketMap = {};

app.listen(PORT);

var bindListener = function (socket, event) {
  socket.on(event, function(data) {
    if (socket.clientNum % 2 == 0) {
      if (socketMap[socket.clientNum - 1])
        socketMap[socket.clientNum - 1].emit(event, data);
    } else {
      if (socketMap[socket.clientNum + 1])
        socketMap[socket.clientNum + 1].emit(event, data);
    }
  });
}

io.on('connection', function(socket) {

  clientCount += 1;
  socket.clientNum = clientCount;
  socketMap[clientCount] = socket;

  if (clientCount % 2 == 1) {
    socket.emit('waiting', '等待玩家加入...');
  } else {
    if (socketMap[(clientCount - 1)]) {
      socket.emit('start');
      socketMap[(clientCount - 1)].emit('start'); // 给对方socket发送开始的消息
    } else {
      socket.emit('leave');
    }
  }

  // 事件转发
  bindListener(socket, 'init');
  bindListener(socket, 'next');
  bindListener(socket, 'rotate');
  bindListener(socket, 'right');
  bindListener(socket, 'down');
  bindListener(socket, 'left');
  bindListener(socket, 'fall');
  bindListener(socket, 'fixed');
  bindListener(socket, 'line');
  bindListener(socket, 'time');
  bindListener(socket, 'lose');
  bindListener(socket, 'bottomLines');
  bindListener(socket, 'addBotLine');

  socket.on('disconnect', function() {
    if (socket.clientNum % 2 == 0) {
      if (socketMap[socket.clientNum - 1])
        socketMap[socket.clientNum - 1].emit('leave');
    } else {
      if (socketMap[socket.clientNum + 1])
        socketMap[socket.clientNum + 1].emit('leave');
    }
    delete(socketMap[socket.clientNum]);
  });

});

console.log('websocket listening on port ' + PORT);