/*
 *  Player object. Should probably be inheriting a collidable/generic entity object. TODO.
 */

define(['three', 'keyboard'], function(THREE, THREEx) {

  // Private static.
  var numPlayers = 0;
  // We should probably define typical player THREEJS geometry/colors/etc as private statics here, and jjust copy the right ones in rendinit based on the kind of player.

  var warriorMap = THREE.ImageUtils.loadTexture( "js/assets/warrior.png" );
  warriorMap.magFilter = THREE.NearestFilter;
  var warriorSpriteMat = new THREE.SpriteMaterial( { map: warriorMap, color: 0xffffff, fog: false, sizeAttenuation: false, size: 32} );
  var keyboard = new THREEx.KeyboardState();

  // Constructor.
  function Player() {
    numPlayers++;
    
    this.parallax = 10; // How much should this thing parallax? Must be >= 1. Affects scale.
    this.position = new THREE.Vector3(0,0,0); // 
    this.rendInitted = false; // Have we rendered it once yet?
  };

  // Instanced destructor...
  Player.prototype.onRemove = function() {
    numPlayers--;
  };

  // For when it's first being added to a scene.
  Player.prototype.rendInit = function(scene) {
    // http://threejs.org/docs/#Reference/Objects/Sprite
    var sprite = new THREE.Sprite( warriorSpriteMat );

    sprite.position.set(0,0,this.parallax);
    sprite.scale.set(150,150,1);
    sprite.name = "playerSprite"; //TODO: random GUID? store them. also.

    scene.add(sprite);
  };

  // Updates geometry related to this.
  Player.prototype.rendUpdate = function(scene) {
    if (!this.rendInitted) {
      this.rendInit(scene);
      this.rendInitted = true;
    }

    var ourSprite = scene.getObjectByName("playerSprite");

    // Add some vibration for good measure. Threejsing intensifies.
    if(keyboard.pressed('up')) {
      this.direction = 'up';
      this.position.y += 5;
    }
    if(keyboard.pressed('left')) {
      this.direction = 'left';
      this.position.x -= 5;
    }
    if(keyboard.pressed('right')) {
      this.direction = 'right';
      this.position.x += 5;
    }
    if(keyboard.pressed('down')) {
      this.direction = 'down';
      this.position.y -= 5;
    }

    ourSprite.position.set(this.position.x + Math.random()*10, this.position.y, this.parallax);
  };

  // For when this is removed from a scene.
  Player.prototype.rendKill = function(scene) {
    if (!this.rendInitted) { return; } // never initted, nothing to kill
  };

  return Player;
});
