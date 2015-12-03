/*
 *  Player object. Should probably be inheriting a collidable/generic entity object. TODO.
 */

define(['three', 'keyboard', 'textureAnimator', 'actor'], function(THREE, THREEx, TextureAnimator, Actor) {

  // Private static.
  var numPlayers = 0;

  // We should probably define typical player THREEJS geometry/colors/etc as private statics here, and jjust copy the right ones in rendinit based on the kind of player.

  var warriorRightMap = THREE.ImageUtils.loadTexture( "assets/player/warriorRight.png" );
  var warriorLeftMap = THREE.ImageUtils.loadTexture( "assets/player/warriorLeft.png" );
  warriorRightMap.magFilter = THREE.NearestFilter;
  warriorLeftMap.magFilter = THREE.NearestFilter;
  var warriorSpriteMat = new THREE.SpriteMaterial( { map: warriorRightMap, color: 0xffffff, fog: false, sizeAttenuation: false, size: 32} );
  var keyboard = new THREEx.KeyboardState();

  var attackSound = new Audio('assets/player/sounds/swordSwing.wav');
  var hitSound = new Audio('assets/player/sounds/swordStrike.wav');
  var hurtSound = new Audio('assets/player/sounds/hurt.wav');
  var deathSound = new Audio('assets/player/sounds/death.wav');

  // Constructor. Inherits Actor.
  function Player(x, y) {
    Actor.call(this); // Call the parent constructor
    this.name="player";
    numPlayers++;
    this.attackDelay = 30;
    this.damage = 100;
    this.initX = x || 0;
    this.initY = y || 0;
    this.position.x = x;
    this.position.y = y;
    //console.log('Player INITX AND Y',this.initX,this.initY);
  };

  Player.prototype = Object.create(Actor.prototype); // is-a actor inheritance.

  Player.prototype.destroyPlayer = function() {
    console.log('removing player');
    this.scene.remove(this.sprite);
    this.scene.remove(this.sphere);
  }

  Player.prototype.move = function() {

    // console.log(this.canMove);
    if(keyboard.pressed('up') && this.canMove.up) {
      this.direction.y = 1;
      this.position.y += (5 * (60/this.fps));
    }
    if(keyboard.pressed('left') && this.canMove.leftDir) {
      // if(this.direction.x == 1) {
        this.sprite.material.map = warriorLeftMap;
      // }
      this.direction.x = -1;
      this.position.x -= (5 * (60/this.fps));
    }
    if(keyboard.pressed('right') && this.canMove.rightDir) {
      // if(this.direction.x == -1) {
        this.sprite.material.map = warriorRightMap;
      // }
      this.direction.x = 1;
      this.position.x += (5 * (60/this.fps));
      
    }
    if(keyboard.pressed('down') && this.canMove.down) {
      this.direction.y = -1;
      this.position.y -= (5 * (60/this.fps));
    }
    if(keyboard.pressed('space') && this.attackCooldown <= 0) {
      this.attack(this.scene);
    }

    // Update timing variables

    //console.log(this.canMove.leftDir);
  }

  // --------- Below functions are overrides or extensions of parent methods.

  // For when it's first being added to a scene.
  Player.prototype.rendInit = function(scene) {
    // http://threejs.org/docs/#Reference/Objects/Sprite
    var sprite = new THREE.Sprite( warriorSpriteMat );



    sprite.position.set(this.initX,this.initY,this.parallax);
    sprite.scale.set(this.scale,this.scale,1);
    sprite.name = "playerSprite"; //TODO: random GUID? store them. also.
    this.sprite = sprite;
    console.log("init player sprite");
    this.scene = scene;
    this.sprite.obj = this;

    this.scale.x *= -1;


    var geometry = new THREE.SphereGeometry( 5, 32, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    this.sphere = new THREE.Mesh( geometry, material );
    scene.add( this.sphere );

    scene.add(sprite);
    // this.showRaycastLines();
  };

  

  // Updates geometry related to this.
  Player.prototype.rendUpdate = function(scene) {
    // Call the parent's.
    Actor.prototype.rendUpdate.call(this, scene);
    this.sphere.position.set(this.position.x, this.position.y, this.parallax);

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
