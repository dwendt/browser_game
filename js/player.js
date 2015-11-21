/*
 *  Player object. Should probably be inheriting a collidable/generic entity object. TODO.
 */

define(['three', 'keyboard', 'textureAnimator', 'actor'], function(THREE, THREEx, TextureAnimator, Actor) {

  // Private static.
  var numPlayers = 0;

  // We should probably define typical player THREEJS geometry/colors/etc as private statics here, and jjust copy the right ones in rendinit based on the kind of player.

  var warriorMap = THREE.ImageUtils.loadTexture( "js/assets/warrior.png" );
  warriorMap.magFilter = THREE.NearestFilter;
  var warriorSpriteMat = new THREE.SpriteMaterial( { map: warriorMap, color: 0xffffff, fog: false, sizeAttenuation: false, size: 32} );
  var keyboard = new THREEx.KeyboardState();

  // Constructor. Inherits Actor.
  function Player() {
    Actor.call(this); // Call the parent constructor
    this.name="player";
    numPlayers++;
  };

  Player.prototype = Object.create(Actor.prototype); // is-a actor inheritance.

  Player.prototype.move = function() {
    // console.log(this.canMove);
    if(keyboard.pressed('up') && this.canMove.up) {
      this.direction.y = 1;
      this.position.y += 5;
    }
    if(keyboard.pressed('left') && this.canMove.leftDir) {
      this.direction.x = -1;
      this.position.x -= 5;
      this.sprite.scale.x = -150;
    }
    if(keyboard.pressed('right') && this.canMove.rightDir) {
      this.direction.x = 1;
      this.position.x += 5;
      this.sprite.scale.x = 150;
    }
    if(keyboard.pressed('down') && this.canMove.down) {
      this.direction.y = -1;
      this.position.y -= 5;
    }

    //console.log(this.canMove.leftDir);
  }

  // --------- Below functions are overrides or extensions of parent methods.

  // For when it's first being added to a scene.
  Player.prototype.rendInit = function(scene) {
    // http://threejs.org/docs/#Reference/Objects/Sprite
    var sprite = new THREE.Sprite( warriorSpriteMat );

    sprite.position.set(0,0,this.parallax);
    sprite.scale.set(150,150,1);
    sprite.name = "playerSprite"; //TODO: random GUID? store them. also.
    this.sprite = sprite;
    console.log("init player sprite");

    scene.add(sprite);
  };

  // Updates geometry related to this.
  Player.prototype.rendUpdate = function(scene) {
    // Call the parent's.
    Actor.prototype.rendUpdate.call(this, scene);

    // If we have any player-on-render stuff to do it'd go below.
    // this.move(); // keyboard state based movement
  };

  // For when this is removed from a scene.
  Player.prototype.rendKill = function(scene) {
    if (!this.rendInitted) { return; } // never initted, nothing to kill

    // Call the parent's.
    Actor.prototype.rendKill.call(this);
  };

  // Instanced destructor...
  Player.prototype.onRemove = function() {
    // Call parent
    Actor.prototype.onRemove.call(this);

    numPlayers--;
  };


  return Player;
});
