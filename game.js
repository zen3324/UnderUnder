enchant();

var game;
var stage;
var map;

var Player = Class.create(Sprite, {
  initialize : function() {
    Sprite.call(this, 32, 32);
    this.x = 160;
    this.y = 0;
    // 速度
    this.vx = 0;
    // 重力
    this.vy = 0;
    // 加速度
    var ax = 0;
    // ポーズの初期化
    this.pose = 0;
    this.image = game.assets['chara1.png'];
    stage.addChild(this);
  },
  onenterframe : function() {
    ax = 0;
    // 右入力時に加速度をプラス
    if (game.input.right) {
      ax += 1;
    }
    // 左入力時に加速度をマイナス
    if (game.input.left) {
      ax -= 1;
    }
    // 向きの変更
    if (ax > 0) {
      this.scaleX = 1;
    }
    if (ax < 0) {
      this.scaleX = -1;
    }
    
    // アニメーションの設定
    if (ax != 0) {
      if (game.frame % 3 == 0) {
        this.pose + 1;
        this.pose %= 2;
      }
      this.frame = this.pose + 1;
      console.log(this.frame);
    } else {
      this.frame = 0;
    }

    // 加速度の自然減少
    if (this.vx > 0.5) {
      ax -= 0.5;
    } else if (this.vx > 0) {
      ax -= this.vx;
    }
    if (this.vx < -0.5) {
      ax += 0.5;
    } else if (this.vx < 0) {
      ax -= this.vx;
    }

    if (!this.jumping) {
      this.vy = 0;
      this.jumping = true;
    }
    this.vy += 0.5;

    // 加速度をthisオブジェクトの位置に加算
    this.vx += ax;
    this.vx = Math.min(Math.max(this.vx, -2), 2);
    this.x += this.vx;

    var dx = this.x + this.vx + 5;
    var dy = this.y + this.vy;
    if (map.hitTest(dx, dy + this.height) || map.hitTest(dx + this.width - 10, dy + this.height)) {
      dy = Math.floor((dy + this.height) / 16) * 16 - this.height;
      this.vy = 0;
      this.jumping = false;
    }
    this.x = dx - 5;
    this.y = dy;

    // 横壁判定
    if (this.x < 0) {
      this.x = 0;
    }
    if (this.x > 290) {
      this.x = 290;
    }
  }
});

// マップ配列を元に当たり判定を返す
function replaceCol(map){
  switch(map) {
    case -1:
      return 0;
      break;
    case 0:
      return 1;
      break;
  }
}

window.onload = function() {
  // Gameオブジェクト
  game = new Game(320, 320);
  // FPSを設定
  game.fps = 28;
  // 画像をプリロード
  game.preload('chara1.png', 'map2.gif');
  stage = new Group();

  game.onload = function() {
    map = new Map(16, 16);
    map.image = game.assets['map2.gif'];

    // マップの組み立て
    var mapLine0 = [ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ];
    var mapLine = [ [ 0, 0, 0, 0, 0, 0, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
        [ -1, 0, 0, 0, 0, 0, 0, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
        [ -1, -1, 0, 0, 0, 0, 0, 0, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
        [ -1, -1, -1, -1, 0, 0, 0, 0, 0, 0, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
        [ -1, -1, -1, -1, -1, -1, 0, 0, 0, 0, 0, 0, 0, -1, -1, -1, -1, -1, -1, -1 ],
        [ -1, -1, -1, -1, -1, -1, -1, -1, 0, 0, 0, 0, 0, 0, 0, -1, -1, -1, -1, -1 ],
        [ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 0, 0, 0, 0, 0, 0, -1, -1, -1 ],
        [ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 0, 0, 0, 0, 0, 0, -1 ],
        [ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 0, 0, 0, 0, 0, 0 ] ];

    var mapBlock = new Array();
    for ( var i = 0; i < 100; i++) {
      mapBlock.push(mapLine[Math.floor(Math.random() * 8) + 1]);
      var rand = Math.floor(Math.random() * 3) + 1;
      for( var j = 0; j < rand; j++){
        mapBlock.push(mapLine0);
      }
    }

    map.loadData(mapBlock);

    var colDate = new Array();
    for( var i = 0, n = mapBlock.length; i < n; i++){
      var repMapLine = mapBlock[i];
      var colDataLine = new Array();
      for( var j = 0; j < 20; j++){
        colDataLine[j] = replaceCol(repMapLine[j]);
      }
      colDate[i] = colDataLine;
    }

    map.collisionData = colDate;

    var bear = new Player();
    var label = new Label();
    label.font = "bold 24px 'Impact'";

    // gameオブジェクトのイベントリスナー
    game.addEventListener('enterframe', function() {
      label.text = bear.pose;
    });

    // mapオブジェクトのイベントリスナー
    map.addEventListener('enterframe', function() {
//      stage.y -= 1;
    })

    stage.addChild(map);
    stage.addChild(label);

    game.rootScene.addChild(stage);
  };
  game.debug();
};
