/**
 *  Game logic controller to handle game state, objects, and updating the renderer.
 */

define(["three", "level", "player", "skeleton", "jquery"], function(THREE, Level, Player, Skeleton, $) {

  // Constructor for this.
  function GameLogic(renderer) {
    // JQuery is present in this function for UI updates
    this.renderer = renderer;       // Given to us by the main controller.
    console.log("setting callback...");
    renderer.setCallback(this);
    this.player = new Player();         // Create a new player object.

    // Variables used for game state
    this.inMenu = true;
    this.curLevel = 0;              // Should determine difficulty, stage contents, loot...
    this.actors = new Array();      // Monsters/AI on stage for logic ticking/rendering.
    this.actors.push(new Skeleton());
    this.actors.push(new Skeleton());
    this.actors.push(new Skeleton());
    this.actors.push(new Skeleton());
    this.actors.push(new Skeleton());
    this.score = 0;

    // TODO: since we have no menu, just init a new level.
    this.level = null;
    this.levelHist = new Array();   // Past levels, for going back?
    this.initLevel();

    return this;
  };

  // Instanced functions
  GameLogic.prototype = {
    // Creates a new level, positions the player.
    initLevel: function() {
      this.level = new Level();
    },
    // Handle things we need to do when we transition off our current level.
    storeLevel: function() {
      this.levelHist.push(this.level.walls);
    },
    tick: function() {

    },
    nextLevel: function() {
      this.storeLevel();
    },
    // Called when a new frame is rendered, should make renderables update geometry/color/etc.
    rendUpdate: function(scene) {
      if (this.player) {
        this.player.rendUpdate(scene);
        this.renderer.setCameraPos(this.player.position.x, this.player.position.y, 20000);
        //console.log(this.renderer.camera);
      }

      if (this.level) {
        this.level.rendUpdate(scene);
      }

      // Update entity renderstuff.
      for (var i = 0; i < this.actors.length; i++) {
        if(this.actors[i]) {

          this.actors[i].rendUpdate(scene);
          // if(this.actors[i].name == 'player'){
            console.log($('#playerHealth'));
            $('#playerHealth').text(this.actors[i].health + " / " + 100);
          // }
        }

        // remove from scene if necessary
        if(this.actors[i].removal) {
          if(this.actors[i].name === 'player') {
            //Gameover
          }
          else {
            this.actors[i] = null;
            this.actors.splice(i--,1);
            this.score += 10;
            $('#playerScore').text("Score: " + this.score);
          }
        }

      }

      if(this.actors.length == 1) { // Only the player is left
        this.nextLevel();
      }
    }

    
  };

  // Static functions
  //GameLogic.someFunc = function() {....};

  return GameLogic;
});
