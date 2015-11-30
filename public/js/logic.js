/**
 *  Game logic controller to handle game state, objects, and updating the renderer.
 */

define(["three", "level", "player", "skeleton", "keyboard", "jquery", "bootstrap"], function(THREE, Level, Player, Skeleton, THREEx, $) {

  $('#submissionForm').on('submit', function(e) {
    e.preventDefault();
    var name = $("#usernameinput").val();
    console.log(name);
    var score = parseInt($("#modalScore").val());
    console.log(score);
    console.log(name+" "+ score);
    $.ajax({
      url : "/score",
      type: "POST",
      data: {username:name, userscore:score},
      success: function (data) {
          $("#modalScore").html(data);
      },
      error: function (jXHR, textStatus, errorThrown) {
          alert(errorThrown);
      }
    });
  });

  // Constructor for this.
  function GameLogic(renderer) {
    // JQuery is present in this function for UI updates
    this.renderer = renderer;       // Given to us by the main controller.
    console.log("setting callback...");
    renderer.setCallback(this);

    // Player creation moved to InitLevel

    // Variables used for game state
    this.inMenu = true;
    this.curLevel = 1;              // Should determine difficulty, stage contents, loot...
    this.actors = new Array();      // Monsters/AI on stage for logic ticking/rendering.
    this.score = 0;
    this.pausedHealth = 100;

    // TODO: since we have no menu, just init a new level.
    this.level = null;
    this.levelHist = new Array();   // Past levels, for going back?
    this.initLevel();
    
    this.currentZoom = 8000;
    this.zl = 12;

    this.clock = new THREE.Clock(true);

    this.keyboard = new THREEx.KeyboardState();

    return this;
  };

  // Instanced functions
  GameLogic.prototype = {
    // Creates a new level, positions the player.
    initLevel: function() {
      this.level = new Level(this.curLevel);

      // Custom async controller because reasons
      var monsterInterval = setInterval(function(level, f, th){
        if(th.level.finishedLoading) {
          th.initPlayer();
          th.createMonsters();
          clearInterval(monsterInterval);
        }
      }, 50, this.level, this.createMonsters, this);
    },
    // Handle things we need to do when we transition off our current level.
    storeLevel: function() {
      this.levelHist.push(this.level.walls);
    },
    tick: function() {

    },
    nextLevel: function() {
      this.curLevel++;
      console.log('going to next level');
      this.storeLevel();
      this.pausedHealth = this.player.health;
      this.level.destroyLevel();
      this.player.destroyPlayer();
      this.initLevel(this.curLevel);
    },

    // Called when a new frame is rendered, should make renderables update geometry/color/etc.
    rendUpdate: function(scene) {
      var fps = Math.round(1 / this.clock.getDelta());

      if(this.keyboard.pressed('z')) {
        this.zl++;
        this.currentZoom = this.level.zoomLevels[(Math.floor(this.zl/3)) % this.level.zoomLevels.length];
      }

      if (this.player) {
        this.player.fps = fps;
        this.player.rendUpdate(scene);
        this.renderer.setCameraPos(this.player.position.x, this.player.position.y, this.currentZoom);
        $('#playerHealth').text(this.player.health + " / " + 100);
        if(this.player.removal) {
          // Gameover code goes here
          this.player.deathSound.play();
          this.player.destroyPlayer();
          this.player = undefined;
          this.gameOver();
        }
      }

      if (this.level) {
        this.level.rendUpdate(scene);
      }

      // Update entity renderstuff.
      for (var i = 0; i < this.actors.length; i++) {
        if(this.actors[i]) {
          this.actors[i].fps = fps;
          this.actors[i].rendUpdate(scene);
        }

        // remove from scene if necessary
        if(this.actors[i].removal) {
          if(this.actors[i].deathSound) {
            this.actors[i].deathSound.play();
          }
          this.actors[i] = null;
          this.actors.splice(i--,1);
          if(this.player.health > 0) {
            this.score += 10;
          }
          $('#playerScore').text("Score: " + this.score);
          $('#hiddenScoreDiv').text(this.score);
          $('#modalScore').val(this.score);
          $('#monsterText').text(this.actors.length + " Monsters remain.");
          if(this.actors.length == 0 && this.player.health > 0) { // Only the player is left
            setTimeout(function(th) {
              th.nextLevel();
            }, 1000, this);
          }
        }

      }

      
    },

    createMonsters: function() {
      this.initSkeletons();
      $('#monsterText').text(this.actors.length + " Monsters remain.");
    },

    initPlayer: function() {
      var newX = Math.floor(Math.random()*this.level.numCells);
      var newY = Math.floor(Math.random()*this.level.numCells);

      //Make sure there's no wall where we want to place the Player
      while(this.level.cells[newX][newY].filled) {
        newX = Math.floor(Math.random()*this.level.numCells);
        newY = Math.floor(Math.random()*this.level.numCells);
      }
      this.player = new Player((newX*2*this.level.wallSize) - this.level.offset, newY*2*this.level.wallSize - this.level.offset);
      this.renderer.setCameraLookAt(this.player.position);
      this.player.health = this.pausedHealth;
    },

    initSkeletons: function() {
      var numSkeletons = Math.floor(Math.random() * 10 + 5);
      for(var i = 0; i < numSkeletons; i++) {
        var newX = Math.floor(Math.random()*this.level.numCells);
        var newY = Math.floor(Math.random()*this.level.numCells);

        //Make sure there's no wall where we want to place the skeleton
        while(this.level.cells[newX][newY].filled) {
          newX = Math.floor(Math.random()*this.level.numCells);
          newY = Math.floor(Math.random()*this.level.numCells);
        }
        this.actors.push(new Skeleton((newX*2*this.level.wallSize) - this.level.offset, newY*2*this.level.wallSize - this.level.offset));
        this.actors[this.actors.length-1].player = this.player;
        this.actors[this.actors.length-1].health *= this.curLevel;
      }
    },

    gameOver: function() {
      console.log('game over');
      $('#modal-button').click();
    }

    
  };

  // Static functions
  //GameLogic.someFunc = function() {....};

  return GameLogic;
});
