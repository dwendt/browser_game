/**
 *  Game logic controller to handle game state, objects, and updating the renderer.
 */

define(["three", "level", "player", "skeleton", "keyboard", "jquery", "bootstrap", "chat", "title"], function(THREE, Level, Player, Skeleton, THREEx, $, bootstrap, Chat, Title) {

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
    var self = this;

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

    this.level = null;
    this.levelHist = new Array();   // Past levels, for going back?
    
    // Set up zooms
    this.currentZoom = 8000;
    this.zl = 12;
    
    this.clock = new THREE.Clock(true);

    this.keyboard = new THREEx.KeyboardState();


    // 0 = menu
    // 1 = class select
    // 2 = playing
    //????? 3 = score submit?
    this.state = 0;

    // in pause menu
    this.paused = false;

    // Spawn a titlescreen with a func to call on start
    this.title = new Title(function(choice) {
      self.chat = new Chat();                    

      self.title.hideMenu();

      self.initLevel();
    });

    return this;
  };

  // Instanced functions
  GameLogic.prototype = {
    goTitleScreen: function() {

    },
    // Creates a new level, positions the player.
    initLevel: function() {
      var tempLogic = this;
      this.level = new Level(this.curLevel, function() {
        // Callback for level load finish.
        tempLogic.initPlayer();
        tempLogic.createMonsters();
      });

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

      // -----------------------
      // title/pause screen
      if (this.state === 0 || this.paused) {
        this.title.rendUpdate(scene, this.renderer);
      }
      // ------------------------


      var fps = Math.round(1 / this.clock.getDelta());

      if(this.keyboard.pressed('z')) {
        this.zl++;
        this.currentZoom = this.level.zoomLevels[(Math.floor(this.zl/3)) % this.level.zoomLevels.length];
      }

      if (this.player) {
        this.player.fps = fps;
        this.player.rendUpdate(scene);
        this.renderer.setCameraPos(this.player.position.x, this.player.position.y, this.currentZoom);
        $('#playerHealth').text(this.player.health + " / " + this.player.startHealth);
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
          if(Math.random() > .95) {
            this.chat.addChatMessage({username:'', message:'Item upgrade found! Attack Increased!'}, {color: '6f57fa'});
            this.player.damage *= 2;
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
      var randPos = this.level.getOpenSpot();

      this.player = new Player(randPos[0], randPos[1], this.title.choice);
      this.renderer.setCameraLookAt(this.player.position);
      this.player.health = this.pausedHealth;
    },

    initSkeletons: function() {
      var numSkeletons = Math.floor(Math.random() * 10 + 5);
      for(var i = 0; i < numSkeletons; i++) {
        var randPos = this.level.getOpenSpot();

        this.actors.push(new Skeleton(randPos[0], randPos[1]));

        this.actors[this.actors.length-1].player = this.player;
        this.actors[this.actors.length-1].health *= this.curLevel;
      }
    },

    gameOver: function() {
      $.ajax({
        url : "/score",
        type: "POST",
        data: {username:this.chat.username, userscore:this.score},
        success: function (data) {
        },
        error: function (jXHR, textStatus, errorThrown) {
            alert(errorThrown);
        }
        });
    }
  }

  // Static functions
  //GameLogic.someFunc = function() {....};

  return GameLogic;
});
