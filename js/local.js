var Local = function () {
  // 游戏对象
  var game;

  // 定时器
  var INTERVAL = 200;
  var timer = null;

  // 绑定键盘事件
  var bindKeyEvent = function () {
    document.onkeydown = function (e) {
      if (e.keyCode == 38) { // up
        game.rotate();
      } else if (e.keyCode == 39) { // right
        game.right();
      } else if (e.keyCode == 40) { // down
        game.down();
      } else if (e.keyCode == 37) { // left
        game.left();
      } else if (e.keyCode == 32) { // space
        game.fall();
      }
    }
  }
  // 移动
  var move = function() {
    if (!game.down()) {
      game.fixed();
      game.checkClear();
      game.performNext(generateType(), 3);
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
  // 开始
  var start = function () {
    var doms = {
      gameDiv: document.getElementById('game'),
      nextDiv: document.getElementById('next')
    }
    game = new Game();
    game.init(doms);
    bindKeyEvent();
    timer = setInterval(move, INTERVAL);
  }

  this.start = start;
}