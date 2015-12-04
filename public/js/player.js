/*
 *  Player object. Should probably be inheriting a collidable/generic entity object. TODO.
 */

define(['three', 'keyboard', 'textureAnimator', 'actor', 'assets'], function(THREE, THREEx, TextureAnimator, Actor, Assets) {

  // Private static.
  var numPlayers = 0;

  // We should probably define typical player THREEJS geometry/colors/etc as private statics here, and jjust copy the right ones in rendinit based on the kind of player.

  var warriorRightMap = Assets.warriorRightMap;
  var warriorLeftMap = Assets.warriorLeftMap;
  warriorRightMap.magFilter = THREE.NearestFilter;
  warriorLeftMap.magFilter = THREE.NearestFilter;
  var warriorSpriteMat = new THREE.SpriteMaterial( { map: warriorLeftMap, color: 0xffffff, fog: false, sizeAttenuation: false, size: 32} );
  var keyboard = new THREEx.KeyboardState();
  var wizardRightMap = Assets.wizardRightMap;
  // var wizardLeftMap = Assets.wizardLeftMap;
  warriorRightMap.magFilter = THREE.NearestFilter;
  warriorLeftMap.magFilter = THREE.NearestFilter;
  var wizardRightSpriteMat = new THREE.SpriteMaterial( { map: wizardRightMap, color: 0xffffff, fog: false, sizeAttenuation: false, size: 32} );
  // var wizardLeftSpriteMat = new THREE.SpriteMaterial( { map: wizardLeftMap, color: 0xffffff, fog: false, sizeAttenuation: false, size: 32} );

  // Constructor. Inherits Actor.
  function Player(x, y, c) {
    Actor.call(this); // Call the parent constructor
    this.name="player";
    numPlayers++;
    this.attackDelay = 30;
    this.damage = 100;
    this.initX = x || 0;
    this.initY = y || 0;
    this.position.x = x;
    this.position.y = y;
    this.distance = 8;
    this.startHealth = 100;
    this.wasHit = false;
    //console.log('Player INITX AND Y',this.initX,this.initY);
    this.class = c;
    this.attackSound = Assets.plyAttack;
    this.hitSound = Assets.plyHit;
    this.hurtSound = Assets.plyHurt;
    this.deathSound = Assets.plyDeath;
  };

  Player.prototype = Object.create(Actor.prototype); // is-a actor inheritance.

  Player.prototype.destroyPlayer = function() {
    console.log('removing player');
    this.scene.remove(this.sprite);
  }

  Player.prototype.move = function() {

    // console.log(this.canMove);
    if(keyboard.pressed('up') && this.canMove.up) {
      this.direction.y = 1;
      this.position.y += (this.distance * (60/this.fps));
    }
    if(keyboard.pressed('left') && this.canMove.leftDir) {
      // if(this.direction.x == 1) {
        // if(this.class == 1){
        //   this.sprite.material.map = warriorLeftMap;
        // }
        // else {
        //   this.sprite.material.map = wizardLeftMap;
        // }
        if(this.direction.x > 0 && this.sprite.scale.x > 0) this.sprite.scale.x *= -1;
      // }
      this.direction.x = -1;
      this.position.x -= (this.distance * (60/this.fps));
    }
    if(keyboard.pressed('right') && this.canMove.rightDir) {
      // if(this.direction.x == -1) {
       // if(this.class == 1){
       //    this.sprite.material.map = warriorRightMap;
       //  }
       //  else {
       //    this.sprite.material.map = wizardRightMap;
       //  }
      // }
        if(this.direction.x < 0 && this.sprite.scale.x < 0) this.sprite.scale.x *= -1;
      this.direction.x = 1;
      this.position.x += (this.distance * (60/this.fps));
      
    }
    if(keyboard.pressed('down') && this.canMove.down) {
      this.direction.y = -1;
      this.position.y -= (this.distance * (60/this.fps));
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
    var sprite;
    if(this.class == 1) {
      sprite = new THREE.Sprite( warriorSpriteMat );
    }
    else {
      sprite = new THREE.Sprite( wizardRightSpriteMat );
      this.clock = new THREE.Clock();
      this.animator = new TextureAnimator(wizardRightMap, 4, 1, 4, 75);
      this.animRate = 1000;
      this.distance = 10;
      this.startHealth = 30;
      this.health = 30;
      this.damage *= (2/3);
    }

    sprite.position.set(this.initX,this.initY,this.parallax);
    sprite.scale.set(this.scale,this.scale,1);
    sprite.name = "playerSprite"; //TODO: random GUID? store them. also.
    this.sprite = sprite;
    console.log("init player sprite");
    this.scene = scene;
    this.sprite.obj = this;

    this.updateHealth = true;

    // this.scale.x *= -1;


    var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );

    scene.add(sprite);
    // this.showRaycastLines();
  };

  // Updates geometry related to this.
  Player.prototype.rendUpdate = function(scene) {
    // Call the parent's.
    Actor.prototype.rendUpdate.call(this, scene);

    // If we have any player-on-render stuff to do it'd go below.
    // this.move(); // keyboard state based movement
  };

  Player.prototype.takeDamage = function(amount) {
    Actor.prototype.takeDamage.call(this, amount);
    this.updateHealth = true;
  }

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
