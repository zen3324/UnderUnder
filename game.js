enchant();

var game;
var stage;
var map;

// マップタイル定数
const EMPTY_TILE = -1;
const NORMAL_TILE = 0;
const DAMAGE_TILE = 10;

// Playerクラス
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
    // 空中判定
    this.jumping = false;
    this.image = game.assets['chara1.png'];
    // 体力
    this.life = 7;
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
      if (game.frame % 7 == 0) {
        this.pose = (this.pose + 1) % 2;
      }
      this.frame = this.pose + 1;
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

    // 加速度を位置に加算
    this.vx += ax;
    this.vx = Math.min(Math.max(this.vx, -2), 2);
    this.x += this.vx;

    // 重力の加算
    this.vy += 0.5;

    var dx = this.x + this.vx + 5;
    var dy = this.y + this.vy;

    // マップの衝突判定
    if (map.hitTest(dx, dy + this.height) || map.hitTest(dx + this.width - 10, dy + this.height)) {
      dy = Math.floor((dy + this.height) / 16) * 16 - this.height;
      this.vy = 0;

      // マップタイル毎の処理
      if (this.jumping == true){
        var rightSideTile = map.checkTile(dx, dy + this.height, 0);
        var leftSideTile = map.checkTile(dx + this.width - 10, dy + this.height, 0);
        var targetTile = 0;

        if (EMPTY_TILE != rightSideTile){
          targetTile = rightSideTile;
        }else if(EMPTY_TILE != leftSideTile){
          targetTile = leftSideTile;
        }
        switch (targetTile) {
          // 通常タイル
          case NORMAL_TILE:
            if (this.life < 10) {
            this.life += 1;
          }
          break;
          // とげタイル
          case DAMAGE_TILE:
            this.life -= 4;
          break;
        }
      }

      this.jumping = false;
    }else{
      this.jumping = true;
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
function returnCol(map) {
  switch (map) {
    case -1:
      return 0;
    break;
    default:
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
  game.preload('chara1.png', 'map2.png');
  stage = new Group();

  game.onload = function() {
    map = new Map(16, 16);
    map.image = game.assets['map2.png'];

    // マップの部品
    var emptyLine = [ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ];
    var mapLine = [ [ 0, 0, 0, 0, 0, 0, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
      [ -1, 0, 0, 0, 0, 0, 0, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
      [ -1, -1, 0, 0, 0, 0, 0, 0, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
      [ -1, -1, -1, -1, 10, 10, 10, 10, 10, 10, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
      [ -1, -1, -1, -1, -1, -1, 0, 0, 0, 0, 0, 0, 0, -1, -1, -1, -1, -1, -1, -1 ],
      [ -1, -1, -1, -1, -1, -1, -1, -1, 0, 0, 0, 0, 0, 0, 0, -1, -1, -1, -1, -1 ],
      [ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 0, 0, 0, 0, 0, 0, -1, -1, -1 ],
      [ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 0, 0, 0, 0, 0, 0, -1 ],
      [ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 0, 0, 0, 0, 0, 0 ] ];

      mapData = new Array();
      for ( var i = 0; i < 100; i++) {
        mapData.push(mapLine[Math.floor(Math.random() * 8) + 1]);
        var rand = Math.floor(Math.random() * 3) + 1;
        for ( var j = 0; j < rand; j++) {
          mapData.push(emptyLine);
        }
      }

      map.loadData(mapData);

      var colDate = new Array();
      for ( var i = 0, n = mapData.length; i < n; i++) {
        var repMapLine = mapData[i];
        var colDataLine = new Array();
        for ( var j = 0; j < 20; j++) {
          colDataLine[j] = returnCol(repMapLine[j]);
        }
        colDate[i] = colDataLine;
      }

      map.collisionData = colDate;

      var player = new Player();
      var label = new Label();

      // gameオブジェクトのイベントリスナー
      game.addEventListener('enterframe', function() {
        // TODO 体力の表示
        label.text = player.life;

        // TODO 落下時のゲームストップ判定（仮）
        if (player.y > -stage.y + 320) {
          game.end();
        }
      });

      // mapオブジェクトのイベントリスナー
      map.addEventListener('enterframe', function() {
        // ステージを一定の距離移動させる
        stage.y -= 2;

        // ステージの移動に合わせてラベルを移動
        label.y += 2;
      })

      // stageオブジェクトに表示するオブジェクトを追加
      stage.addChild(map);
      stage.addChild(player);
      stage.addChild(label);

      game.rootScene.addChild(stage);
  };
  // gameスタート
  game.debug();
};
