/**
 *  Game logic controller to handle game state, objects, and updating the renderer.
 */

define(["three", "level", "player"], function(THREE, Level, Player) {

  // Constructor for this.
  function GameLogic(renderer) {
    this.renderer = renderer;       // Given to us by the main controller.
    console.log("setting callback...");
    renderer.setCallback(this);

    this.player = new Player();         // Create a new player object.

    // Variables used for game state
    this.inMenu = true;
    this.curLevel = 0;              // Should determine difficulty, stage contents, loot...
    this.actors = new Array();      // Monsters/AI on stage for logic ticking/rendering.

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
    },
    tick: function() {

    },
    // Called when a new frame is rendered, should make renderables update geometry/color/etc.
    rendUpdate: function(scene) {
      if (this.player) {
        this.player.rendUpdate(scene);
        this.renderer.setCameraPos(this.player.position.x, this.player.position.y, 7000);
      }

      if (this.level) {
        this.level.rendUpdate(scene);
      }

      // Update entity renderstuff.
      for (var e in this.actors) {
        if(e) {
          e.rendUpdate(scene);
        }
      }
    }
  };

  // Static functions
//GameLogic.someFunc = function() {....};

  return GameLogic;
});
