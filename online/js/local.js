var Local = function (socket) {
  // 游戏对象
  var game;

  // 时间间隔
  var INTERVAL = 300;

  // 定时器
  var timer = null;

  // 时间计数器
  var time = 0;
  var timeCount = 0;

  // 绑定键盘事件
  var bindKeyEvent = function () {
    document.onkeydown = function (e) {
      if (e.keyCode == 38) { // up
        game.rotate();
        socket.emit('rotate');
      } else if (e.keyCode == 39) { // right
        game.right();
        socket.emit('right');
      } else if (e.keyCode == 40) { // down
        game.down();
        socket.emit('down');
      } else if (e.keyCode == 37) { // left
        game.left();
        socket.emit('left');
      } else if (e.keyCode == 32) { // space
        game.fall();
        socket.emit('fall');
      }
    }
  }

  // 移动
  var move = function () {
    timeFunc();
    if (!game.down()) {
      game.fixed();
      socket.emit('fixed');
      var line = game.checkClear();
      if (line) {
        game.addScore(line);
        socket.emit('line', line);
        if (line > 1) {
          var bottomLines = generateBotLine(line);
          socket.emit('bottomLines', bottomLines);
        }
      }
      var gameOver = game.checkGameOver();
      if (gameOver) {
        game.onGameOver(false);
        document.getElementById('remote_gameover').innerHTML = '胜利 (^_^)∠※';
        socket.emit('lose');
        stop();
      } else {
        var nextType = generateType();
        var nextDir = generateDir();
        game.performNext(nextType, nextDir);
        socket.emit('next', {type: nextType, dir: nextDir});
      }
    } else { // 如果判断可以向下移动，则发送移动的消息
      socket.emit('down');
    }
  }
  // 随机生成干扰行
  var generateBotLine = function (lineNum) {
    var lines = [];
    for (var i = 0; i < lineNum; i++) {
      var line = [];
      for (var j = 0; j < 10; j++) {
        line.push(Math.ceil(Math.random() * 2) - 1); // 生成 0 1 随机数
      }
      lines.push(line);
    }
    return lines;
  }
  // 计时函数
  var timeFunc = function () {
    timeCount += 1;
    if (timeCount == 5) {
      timeCount = 0;
      time += 1;
      game.setTime(time);
      socket.emit('time', time);
    }
  }
  // 随机生成一个方块种类
  var generateType = function () {
    return Math.ceil(Math.random() * 7) - 1;
  }
  // 随机生成一个旋转次数
  var generateDir = function () {
    return Math.ceil(Math.random() * 4) - 1;
  }
  // 结束
  var stop = function () {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    document.onkeydown = null;
  }
  // 开始
  var start = function () {
    var doms = {
      gameDiv: document.getElementById('local_game'),
      nextDiv: document.getElementById('local_next'),
      timeDiv: document.getElementById('local_time'),
      scoreDiv: document.getElementById('local_score'),
      resultDiv: document.getElementById('local_gameover'),
    }
    game = new Game();

    var type = generateType();
    var dir = generateDir();
    game.init(doms, type, dir);
    socket.emit('init', {type: type, dir: dir});
    bindKeyEvent();
    
    var nextType = generateType();
    var nextDir = generateDir();
    game.performNext(nextType, nextDir);
    socket.emit('next', {type: nextType, dir: nextDir});

    timer = setInterval(move, INTERVAL);
  }

  var onlineStatus = true;

  socket.on('start', function() {
    document.getElementById('waiting').innerHTML = '';
    document.getElementById('mask_title_wrap').style.display = 'none';
    document.getElementById('countdown_wrap').style.display = 'block';

    // 游戏开始倒计时
    var count = 4;
    var timer = setInterval(function () {
      if (onlineStatus) {
        if (count == 0) {
          document.getElementById('mask').style.display = 'none';
          clearInterval(timer);
          start();
        }
        document.getElementById('countdown').innerHTML = count--;
      } else {
        document.getElementById('mask_title_wrap').style.display = 'block';
        document.getElementById('mask_title').innerHTML = '对方掉线<a href="javascript:;" onclick="location.reload()">[重新匹配]</a>';
        document.getElementById('countdown_wrap').style.display = 'none';
        clearInterval(timer);
      }
    }, 1000);
  });

  // 对方输了
  socket.on('lose', function() {
    game.onGameOver(true);
    stop();
  });

  // 对方掉线
  socket.on('leave', function() {
    document.getElementById('local_gameover').innerHTML = '对方掉线';
    document.getElementById('remote_gameover').innerHTML = '已掉线';
    document.getElementById('mask_title').innerHTML = '对方掉线<a href="javascript:;" onclick="location.reload()">[重新匹配]</a>';
    onlineStatus = false;
    stop();
  });

  socket.on('bottomLines', function(data) {
    game.addBotLine(data); // 在我方页面的对方区域增加干扰行
    socket.emit('addBotLine', data); // 在对方页面的我方区域增加干扰行
  });
}