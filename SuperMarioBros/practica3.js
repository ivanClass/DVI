window.addEventListener("load",function() {
	var Q = window.Q = Quintus({ audioSupported: ['mp3', 'ogg'] })
	.include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX, Audio")
	.setup({ width: 320, height: 480})
	.controls().touch()
	.enableSound();

	///////////////////////////////////////////////////
	//LOAD & START GAME
	//////////////////////////////////////////////////

	Q.load(["mario_small.png","mario_small.json", "goomba.png", "goomba.json", "bloopa.png", "bloopa.json", "princess.png", "mainTitle.png", "coin.png", "coin.json", "coin.mp3", "coin.ogg", "music_die.mp3", "music_die.ogg", "music_level_complete.mp3", "music_level_complete.ogg", "music_main.mp3", "music_main.ogg"], function(){
		Q.compileSheets("mario_small.png","mario_small.json");
		Q.compileSheets("goomba.png", "goomba.json");
		Q.compileSheets("bloopa.png", "bloopa.json");
		Q.compileSheets("coin.png", "coin.json");
		Q.loadTMX("level.tmx", function() {
			Q.stageScene("startGame");

		});		
	});

	///////////////////////////////////////////////////
	//SPRITES
	//////////////////////////////////////////////////

	Q.Sprite.extend("Mario",{
		
		init: function(p){
			this._super(p, {
				sheet: "marioR",			
				sprite: "MarioAnim",
				jumpSpeed: -550,
				speed: 300,
				death: 0

			});

			this.add('2d, platformerControls, animation, tween');
			this.hasEntered = 0;
		},

		step: function(dt) {
			if(this.p.y > 1000){
				this.p.x = 20;
				this.p.y = 450;
				Q.state.dec("hp", 1);
			}

			if( Q.state.p.hp > 0){
				if(this.p.vx > 0) {
					this.play("run_right"); 
				} else if(this.p.vx < 0) {
					this.play("run_left");
				} else {
					this.play("stand_" + this.p.direction);
				}

				if(this.p.jumping && this.p.landed < 0){
					this.play("jmp_" + this.p.direction);
				}		    	
			}
			else {
				if(this.hasEntered == 0) {
					this.hasEntered = 1;
					this.marioDelete();
				}	
			}

		},

		marioDelete: function(){
			this.del('platformerControls');

			Q.audio.play("music_die.mp3");
			this.play("death");
			

			this.animate({ y: this.p.y - 70 }, 1/3, Q.Easing.Quadratic.InOut, { callback: function() {this.destroy()}});
			Q.stageScene("endGame", 1, { label: "You Died" });
			
		}		
	});

	Q.Sprite.extend("Goomba",{
		init: function(p) {
			this._super(p, { 
				sheet: "goomba",
				sprite: "GoombaAnim",
				vx: 100
			});

			this.add('2d, aiBounce, animation, defaultEnemy');
			this.play("mv");

		}
	});

	Q.Sprite.extend("Bloopa",{
		init: function(p) {
			this._super(p, { 
				sheet: "bloopa",
				sprite: "BloopaAnim", 
				vy: -100
			});

			this.add('2d, aiBounce, animation, defaultEnemy');
			this.on("bump.bottom",this,"stomp");
			

		},

		stomp: function(collision) {
			this.p.vy = -500;
			this.play("jmp");	
		}

	});

	Q.Sprite.extend("Coin", {
		init: function(p){
			this._super(p, {
				sheet: "coin",
				sprite: "CoinAnim",
				gravity: 0
			});

			this.add('2d, animation, tween');

			this.on("bump.left, bump.right, bump.bottom, bump.top",function(collision) {
				if(collision.obj.isA("Mario")) {
					Q.audio.play("coin.mp3");
					this.p.collisionMask = 0;
					this.del('2d');
					this.animate({ y: this.p.y - 100 }, 1/4, Q.Easing.Quadratic.InOut, { callback: function() {this.destroy()}});
					Q.state.inc("score", 1);
				}
			});

			this.play("shine");			
		}	
	});

	Q.Sprite.extend("Princess",{
		init: function(p){
			this._super(p, {
				asset: "princess.png"
			});

			this.add('2d, aiBounce');

			this.on("bump.left, bump.right, bump.bottom, bump.top",function(collision) {
				if(collision.obj.isA("Mario")) {
					Q.stage().pause();
					Q.audio.play("music_level_complete.mp3");
					Q.stageScene("endGame",1, { label: "You Win" });
				}
			});
		},	
	});

	///////////////////////////////////////////////////
	//COMPONENTS
	//////////////////////////////////////////////////

	Q.component("defaultEnemy", {
		added: function(){
			this.entity.on("bump.left,bump.right,bump.bottom",function(collision) {
				if(collision.obj.isA("Mario")) { 
					Q.state.dec("hp", 1);
					if( Q.state.p.hp != 0){
						collision.obj.p.x = 20;
						collision.obj.p.y = 500;
					}
				}
			});

			this.entity.on("bump.top",function(collision) {
				if(collision.obj.isA("Mario")) { 
					this.play("death");
					collision.obj.p.vy = -300;
				}
			});

			this.entity.on("death", function(){ 
				this.destroy(); 
			});
		},
	});

	///////////////////////////////////////////////////
	//ANIMATIONS
	//////////////////////////////////////////////////

	Q.animations("MarioAnim", {
		run_right: { frames: [1, 2, 3], rate: 1/10 },
		jmp_right: { frames: [4], loop: false },
		run_left: { frames: [15,16,17], rate: 1/10 },
		jmp_left: { frames: [18], loop: false },
		stand_right: { frames: [0], loop: false },
		stand_left: { frames: [14], loop: false },
		death: { frames: [12], loop: false, rate: 1/4 }
	});

	Q.animations("GoombaAnim", {
		mv: { frames: [0, 1], rate: 0.80 },
		death: { frames: [2], loop: false, rate : 1/15, trigger: "death"}
	});

	Q.animations("BloopaAnim", {
		jmp: { frames: [0, 1, 0], rate: 1/4, loop: false },
		death: { frames: [0, 1, 2], loop: false, rate : 1/15, trigger: "death"}
	});

	Q.animations("CoinAnim", {
		shine: { frames: [0, 1, 2], rate: 1/15 }
	});

	///////////////////////////////////////////////////
	//SCENES
	//////////////////////////////////////////////////

	Q.scene("level",function(stage) {
		Q.stageTMX("level.tmx",stage);
		Q.state.reset({ hp: 4, score: 0});

		Q.audio.stop();

		var mario = new Q.Mario({x: 20, y: 380});
		var goomba = new Q.Goomba({x: 340, y: 380});
		var goomba2 = new Q.Goomba({x: 800, y: 380});
		var goomba3 = new Q.Goomba({x: 600, y: 380});
		var bloopa = new Q.Bloopa({x: 310, y: 380});
		var bloopa2 = new Q.Bloopa({x: 420, y: 380});
		var princess = new Q.Princess({x: 1900, y: 380});
		var coin = new Q.Coin({x: 150, y: 380});
		var coin2 = new Q.Coin({x: 800, y: 150});
		var coin3 = new Q.Coin({x: 850, y: 150});
		var coin4 = new Q.Coin({x: 900, y: 150});

		stage.insert(mario);
		stage.insert(goomba);
		stage.insert(goomba2);
		stage.insert(goomba3);
		stage.insert(bloopa);
		stage.insert(bloopa2);
		stage.insert(princess);
		stage.insert(coin);
		stage.insert(coin2);
		stage.insert(coin3);
		stage.insert(coin4);
		stage.add("viewport").follow(mario);
		stage.viewport.offsetX = -100;
		stage.viewport.offsetY = 140;
	});

	Q.scene('endGame',function(stage) {
		var box = stage.insert(new Q.UI.Container({
			x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
		}));

		var button = box.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#00BFFF",
			label: "Play Again" }));         
		var label = box.insert(new Q.UI.Text({x:10, y: -10 - button.p.h, color: "#E56328",
			label: stage.options.label }));
		button.on("click",function() {
			Q.clearStages();
			Q.stageScene("startGame");
		});
		Q.audio.stop('music_main.mp3');
		box.fit(20);
	});

	Q.scene('startGame', function(stage){
		var box = stage.insert(new Q.UI.Container({
			x: Q.width/2, y: Q.height/2
		}));

		var button = box.insert(new Q.UI.Button({ asset: "mainTitle.png" }));

		Q.input.on("confirm", button, function(){
			Q.clearStages();
			Q.stageScene("level");
			Q.stageScene("score", 2);
			Q.stageScene("hp", 3);

			Q.audio.play("music_main.mp3", { loop: true});
		});

		button.on("click",function() {
			Q.clearStages();
			Q.stageScene("level");
			Q.stageScene("score", 2);
			Q.stageScene("hp", 3);

			Q.audio.play("music_main.mp3", { loop: true});
		});
	});

	Q.scene('score', function(stage){
		var label = stage.insert(new Q.UI.Text({x: 60, y: 0, label: "score: 0"}));
		Q.state.on("change.score", this, function( score ) {
			label.p.label = "score: " + score;
		});	
	});

	Q.scene('hp', function(stage){
		var label = stage.insert(new Q.UI.Text({x: 280, y: 0, label: "hp: " + Q.state.p.hp}));
		Q.state.on("change.hp", this, function( hp ) {
			label.p.label = "hp: " + hp;
		});	
	});
});