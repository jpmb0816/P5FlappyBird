let player, obs1, obs2, canRestart = true, restartCounter = 0;
let sfx = {
  wing: null,
  hit: null,
  point: null,
  die: null
};

function Bird(x, y, w, h, color) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.vx = 0;
  this.vy = 0;
  this.speed = 1;
  this.color = color;
  
  this.gravity = 0.2;
  this.flyForce = 4;
  
  this.origX = x;
  this.isAlive = false;
  this.score = 0;
  this.highScore = 0;
  this.recentlyStarted = true;
  this.angle = 0;
  this.angleIncrement = 0.2;
  
  this.update = function() {
    this.x += this.vx;
    this.y += this.vy;
    
    if (this.y + this.h > 285) {
      this.y = 285 - this.h;
      this.vy = 0;
    }
    else this.vy += this.gravity;
    
    if (this.isAlive) {
      if (this.y < 0) {
        this.y = 0;
      }
      else if (this.y === 285 - this.h) {
        this.isAlive = false;
        this.recordScore();
        sfx.hit.play();
      }
      
      this.checkGap(obs1);
      this.checkGap(obs2);
    }
  };
  
  this.draw = function() {
    noStroke();
    fill(color);
    
    push();
    translate(this.x + (this.w / 2), this.y + (this.h / 2));
    rotate(this.angle * (Math.PI / 180));
    rect(-(this.w / 2), -(this.h / 2), this.w, this.h);
    pop();
    
    this.angle += this.angleIncrement;
    this.angleIncrement += 0.2;
    
    if (this.angle > 90) this.angle = 90;
    if (this.angleIncrement > 10) this.angleIncrement = 10;
  };
  
  this.fly = function() {
    this.vy = 0;
    this.vy -= this.flyForce;
  };
  
  this.checkGap = function(twoObs) {
    const obs1 = twoObs.obs1;
    const obs2 = twoObs.obs2;
    
    if (player.isAlive) {
      if (this.x + this.w > obs1.x && this.x < obs1.x + obs1.w) {
        if ((this.y + this.h > obs1.y && this.y < obs1.y + obs1.h) || (this.y + this.h > obs2.y && this.y < obs2.y + obs2.h)) {
          this.isAlive = false;
          this.recordScore();
          sfx.hit.onended(() => sfx.die.play());
          sfx.hit.play();
        }
      }
    }
  };
  
  this.recordScore = function() {
    if (player.score > player.highScore) {
      player.highScore = player.score;
    }
  };
  
  this.reset = function() {
    this.isAlive = true;
    this.x = this.origX;
    this.y = 128;
    this.vx = 0;
    this.vy = 0;
    this.angle = 0;
  };
}

function Obstacle(x, y, w, h, color) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.vx = -2;
  this.color = color;

  this.update = function() {
    this.x += this.vx;
  };

  this.draw = function() {
    noStroke();
    fill(color);
    rect(this.x, this.y, this.w, this.h);
  };
}

function TwoObstacles(x, y, w, syMin, syMax, color, gap) {
  this.origX = x;
  this.gap = gap;
  this.canScore = true;
  this.obs1 = new Obstacle(x, y, w, random(syMin, syMax) - y, 'green');
  this.obs2 = new Obstacle(x, this.obs1.y + this.obs1.h + this.gap, w, height - (this.obs1.y + this.obs1.h + this.gap), 'green');
  
  this.update = function() {
    this.obs1.update();
    this.obs2.update();
    
    if (this.obs1.x < -this.obs1.w) {
      this.obs1.x = width;
      this.obs2.x = width;
      this.generateNewPos();
      this.canScore = true;
    }
    else if (player.isAlive && this.canScore && this.obs1.x + this.obs1.w < player.x) {
      this.canScore = false;
      player.score++;
      sfx.point.play();
    }
  };
  
  this.draw = function() {
    this.obs1.draw();
    this.obs2.draw();
  };
  
  this.generateNewPos = function() {
    this.obs1.h = random(syMin, syMax) - this.obs1.y;
    this.obs2.y = this.obs1.y + this.obs1.h + this.gap;
    this.obs2.h = height - this.obs2.y;
  };
  
  this.reset = function() {
    this.obs1.x = this.origX;
    this.obs2.x = this.origX;
    this.generateNewPos();
    this.canScore = true;
  };
}

function preload() {
  sfx.wing = loadSound('sounds/sfx_wing.ogg');
  sfx.hit = loadSound('sounds/sfx_hit.ogg');
  sfx.point = loadSound('sounds/sfx_point.ogg');
  sfx.die = loadSound('sounds/sfx_die.ogg');
}

function setup() {
  createCanvas(300, 300);
  player = new Bird(64, 128, 16, 16, 'red');
  obs1 = new TwoObstacles(width - 64, 0, 32, 64, height - 128, 'green', 80);
  obs2 = new TwoObstacles(width + 110, 0, 32, 64, height - 128, 'green', 80);
  textAlign(CENTER);
}

function draw() {
  background(150, 200, 230);
  
  if (player.isAlive || player.recentlyStarted) {
    obs1.update();
    obs2.update();
  }
  player.update();
  
  obs1.draw();
  obs2.draw();
  fill(150, 100, 50);
  rect(0, 285, 300, 15);
  fill('red');
  
  if (player.recentlyStarted) {
    textSize(30);
    text('Flappy Bird', 150, 100);
    textSize(10);
    text('[Touch the screen to start the game]', 150, 200);
  }
  else {
    player.draw();
    textSize(30);
    text(player.score, 150, 80);
    
    if (!player.isAlive) {
      // player.vx = -2;
      text('Game Over!', 150, 150);
      textSize(10);
      text('High Score: ' + player.highScore, 150, 170);
      text('[Touch the screen to restart the game]', 150, 200);
      
      if (canRestart) {
        restartCounter = 100;
        canRestart = false;
      }
      else if (restartCounter > 0) restartCounter--;
    }
  }
}

function mousePressed() {
  if (!player.recentlyStarted && player.isAlive) {
    player.fly();
    if (player.angle > -48) {
      player.angle -= 45;
      player.angleIncrement = -1;
    }
    sfx.wing.play();
  }
  else if (restartCounter === 0) {
    restartGame();
    canRestart = true;
  }
}

function restartGame() {
  if (player.recentlyStarted) player.recentlyStarted = false;
  player.score = 0;
  player.reset();
  obs1.reset();
  obs2.reset();
}