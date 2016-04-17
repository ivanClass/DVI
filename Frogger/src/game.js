var sprites = {
  frog: { sx: 0, sy: 0, w: 48, h: 48, frames: 1 },
  bg: { sx: 433, sy: 0, w: 320, h: 480, frames: 1 },
  car1: { sx: 143, sy: 0, w: 48, h: 48, frames: 1 },
  car2: { sx: 191, sy: 0, w: 48, h: 48, frames: 1 },  
  car3: { sx: 239, sy: 0, w: 96, h: 48, frames: 1 },
  car4: { sx: 335, sy: 0, w: 48, h: 48, frames: 1 },
  car5: { sx: 383, sy: 0, w: 48, h: 48, frames: 1 },
  trunk: { sx: 288, sy: 383, w: 142, h: 48, frames: 1 },
  death: { sx: 0, sy: 143, w: 48, h: 48, frames: 4 }
};

var enemies = {
  car1:   { row: 5,  vx: -40,   sprite: 'car1'},
  car2:   { row: 6,  vx: -50,   sprite: 'car2'},  
  car3:   { row: 3,   vx: 20,   sprite: 'car3'},  
  car4:   { row: 7,   vx: 35,   sprite: 'car4'},  
  car5:   { row: 8,   vx: -40,  sprite: 'car5'}             

};

var trunks = {
  trunk1:   { row: 1,  vx: -60,    sprite: 'trunk'},
  trunk2:   { row: 2,  vx: 40,     sprite: 'trunk'},
  trunk3:   { row: 3,  vx: 60,     sprite: 'trunk'}
};

var OBJECT_PLAYER = 1,
    OBJECT_ENEMY = 4;

var startGame = function() {
  Game.setBoard(0,new Background());
  var board = new GameBoard();
  board.add(new TitleScreen("FROGGER", 
                                  "PRESS ENTER TO START PLAYING",
                                  playGame));

  Game.setBoard(2, board);
  Game.points = 0; //PUNTOS DE LA PARTIDA
  Game.lifes = 3; //VIDAS DE LA RANA
  Game.win = 0; //INDICA SI LA RANA HA LLEGADO A HOME->SE INHABILITA EL MOVIMIENTO DE LA RANA
  //Game.time = 120; //2 MINUTOS, SI NO LA RANA PIERDE 1 VIDA
};


var playGame = function() {

  var board = new GameBoard();
  var car = new Car(enemies.car1);
  Game.win = 0;
  board.add(new Frog());
  
  board.add(new Spawner(new Car(enemies.car1), 5, 5));
  board.add(new Spawner(new Car(enemies.car2), 6, 5));
  board.add(new Spawner(new Car(enemies.car4, {x: -48}), 7, 5));
  board.add(new Spawner(new Car(enemies.car5), 8, 7));

  board.add(new Spawner(new Log(trunks.trunk1), 1, 9));
  board.add(new Spawner(new Log(trunks.trunk2, {x: -130}), 2, 9));
  board.add(new Spawner(new Log(trunks.trunk3, {x:-130}), 3, 9));

  if(Game.lifes == 0){
    Game.points = 0;
    Game.lifes = 3;
  }

  board.add(new GamePoints());
  board.add(new GameLifes());
  //board.add(new TimeToDeath());
  board.add(new Home());
  board.pushFront(new Water());  
  Game.setBoard(1,board);
};

var winGame = function() {
  var board = new GameBoard();
  board.add(new TitleScreen("You win!", 
                                  "Press enter to play again",
                                  playGame));
    Game.win = 1;
    
    Game.setBoard(2, board);
};

var loseGame = function() {
  var board = new GameBoard();

  board.add(new TitleScreen("You lose! Pts: " + Game.points, 
                                  "Press enter to play again",
                                  playGame));
  Game.setBoard(2, board);
};

var Frog = function() { 
  this.setup('frog', { reloadTime: 0.10 });

  this.reload = this.reloadTime;
  this.x = Game.width/2 - this.w/2;
  this.y = Game.height - this.h;
  this.vx = 0;
  this.tronco = false;

  this.step = function(dt) {
    this.reload-=dt;
    this.x += this.vx * dt
    if(this.reload < 0 && Game.win == 0){
      this.reload = this.reloadTime;
      if(Game.keys['left']) { this.dx = -48;}
      else if(Game.keys['right']) { this.dx = 48;}
      else{
        this.dx = 0;
      }
      if(Game.keys['down']) { this.dy = 48; }
      else if(Game.keys['up']) { this.dy = -48;Game.points += 10; }
      else {this.dy=0;}

      this.x += this.dx;
      this.y += this.dy;
      

      if(this.x < 0) { this.x = 0; }
      else if(this.x > Game.width - this.w) { 
        this.x = Game.width - this.w;
      }

      if(this.y < 0) { this.y = 0; }
      else if(this.y > Game.height - this.h) { 
        this.y = Game.height - this.h;
      }
    }
    this.vx = 0;
    this.tronco = false;
  };
};
Frog.prototype = new Sprite();
Frog.prototype.type = OBJECT_PLAYER;
Frog.prototype.hit = function(damage) {
  if(this.vx == 0){ //no esta encima de un tronco
    if(this.board.remove(this)) {
      this.board.add(new Death(this.x, this.y));
      Game.lifes--;
      if(Game.lifes == 0){
        loseGame();
      }
      else{
        playGame();
      }
    }
  }
};
Frog.prototype.onLog = function(vLog){
  this.vx = vLog;
};


var Car = function(blueprint,override){
  this.merge(this.baseParameters);
  this.setup(blueprint.sprite,blueprint);
  this.merge(override);
  this.y = (this.row*48);
}
Car.prototype = new Sprite();
Car.prototype.type = OBJECT_ENEMY;
Car.prototype.baseParameters = { x: 320, y: 0, vx: 100};
Car.prototype.step = function(dt){
  this.t += dt;
  this.y = (this.row*48);
  this.x += this.vx * dt;
  

  var collision = this.board.collide(this,OBJECT_PLAYER);
  if(collision) {
    collision.hit(this.damage);
    this.board.remove(this);
  }

  if(this.y > Game.height ||
     this.x < -this.w ||
     this.x > Game.width) {
       this.board.remove(this);
  }
};
Car.prototype.hit = function(damage){
  var collision = this.board.collide(this,OBJECT_PLAYER);
  if(collision) {
    this.board.remove(this);
    collision.hit(this.damage);
  }

  if(this.y > Game.height ||
     this.x < -this.w ||
     this.x > Game.width) {
       this.board.remove(this);
  }
};

var Log = function(blueprint, override){
  this.merge(this.baseParameters);
  this.setup(blueprint.sprite,blueprint);
  this.merge(override);
  this.y = (this.row*48);

};
Log.prototype = new Sprite();
Log.prototype.baseParameters = { x: 320, y: 0, vx: -100};
Log.prototype.step = function(dt){
  this.t += dt;
  this.y = (this.row*48);
  this.x += this.vx * dt;
  var collision = this.board.collide(this,OBJECT_PLAYER);
  if(collision) {
    collision.onLog(this.vx);
  }

  if(this.y > Game.height ||
     this.x < -this.w ||
     this.x > Game.width) {
       this.board.remove(this);
  }
};

var Water = function(){
  this.w = 48*7;
  this.h = 48*3;
  this.x = 0;
  this.y = 48;
};
Water.prototype = new Sprite();
Water.prototype.step = function(dt){
  var collision = this.board.collide(this,OBJECT_PLAYER);
  if(collision) {
    collision.hit(this.damage);
  }
};
Water.prototype.draw = function(ctx){

};


var Death = function(centerX,centerY){
  this.setup('death', { frame: 0, delayTime: 0.20});
  this.x = centerX;
  this.y = centerY;
  this.reload = this.delayTime;
};
Death.prototype = new Sprite();
Death.prototype.step = function(dt){

  this.reload-=dt;
  if(this.reload < 0){
    this.reload = this.delayTime;

    this.frame++;
    if(this.frame >= 4) {
      this.board.remove(this);
    }
  }
};

var Home = function(){
  this.w = 48*6;
  this.h = 48;
  this.x = 0;
  this.y = 0;
};
Home.prototype = new Sprite();
Home.prototype.step = function(dt){
  var collision = this.board.collide(this,OBJECT_PLAYER);
  if(collision) {
    this.board.remove(this);
    Game.points += 100;
    winGame();

  }
};
Home.prototype.draw = function(ctx){

};

window.addEventListener("load", function() {
  Game.initialize("game",sprites, startGame);
});

var Background = function Background() {
  this.setup('bg');
  this.x = 0;
  this.y = 0;  
};
Background.prototype = new Sprite();
Background.prototype.step = function(dt){};

var Spawner = function(object, row, reloadTime) {
  this.object = object;
  this.object.row = row;
  this.reloadTime = 0;
  this.delayTime = reloadTime;
};
Spawner.prototype.step = function(dt) {
  this.reloadTime-=dt;
  if(this.reloadTime < 0){
    this.reloadTime = this.delayTime;
    this.board.pushFront(Object.create(this.object));
  }
};
Spawner.prototype.draw = function(ctx) { };