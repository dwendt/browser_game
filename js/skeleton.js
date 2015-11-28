/*
 *  Skeleton object. Should probably be inheriting a collidable/generic entity object. TODO.
 */

define(['three', 'keyboard', 'textureAnimator', 'enemy'], function(THREE, THREEx, TextureAnimator, Enemy) {

  // Private static.
  var numSkeletons = 0;

  var skeletonMap = THREE.ImageUtils.loadTexture( "js/assets/skeleton/right.png" );
  skeletonMap.magFilter = THREE.NearestFilter;

  var skeletonSpriteMat = new THREE.SpriteMaterial( { map: skeletonMap, color: 0xffffff, fog: false, sizeAttenuation: false, size: 32} );

  // Constructor.
  function Skeleton() {
    Enemy.call(this); // Call the parent constructor
    this.name="skeleton";
    numSkeletons++;
    this.attackDelay = Math.floor(Math.random() * 100) + 50;
  };

  Skeleton.prototype = Object.create(Enemy.prototype); // is-a Enemy inheritance.

  Skeleton.prototype.move = function() {

    // Simulate taking damage to test scene removal on death
    // this.health -= 1;

    if(Math.random() > .95) {
      this.direction.x *= -1;
      //this.animator = new TextureAnimator( (( this.direction.x > 0) ? skeletonMapRightWalk : skeletonMapLeftWalk ), 9, 1, 9, 75);
      this.sprite.scale.x *= -1;
    }

    if(Math.random() > .95) {
      this.direction.y *= -1;
    }

    if( this.attackCooldown == 0 ) {
      this.attack(this.scene);
    }

    // Update timing variables
    this.attackCooldown -= (this.attackCooldown > 0 ? 1 : 0);

    // if(!this.canMove.rightDir || !this.canMove.leftDir || !this.canMove.up || !this.canMove.down) console.log(this.canMove);

    if(this.canMove.rightDir && this.direction.x > 0)  this.position.setX(this.position.x + this.direction.x * 3);
    if(this.canMove.leftDir && this.direction.x < 0)  this.position.setX(this.position.x + this.direction.x * 3);
    if(this.canMove.up && this.direction.y > 0)  this.position.setY(this.position.y + this.direction.y * 3);
    if(this.canMove.down && this.direction.y < 0)  this.position.setY(this.position.y + this.direction.y * 3);

  };

  // --------- Below functions are overrides or extensions of parent methods.

  // Instanced destructor...
  Skeleton.prototype.onRemove = function() {
    Enemy.prototype.onRemove.call(this);
    numSkeletons--;
  };

  // For when it's first being added to a scene.
  Skeleton.prototype.rendInit = function(scene) {
    // http://threejs.org/docs/#Reference/Objects/Sprite
    var sprite = new THREE.Sprite( skeletonSpriteMat );
    console.log("initting skele");

    sprite.scale.set(150,150,1);
    sprite.name = "skeletonSprite"; //TODO: random GUID? store them. also.
    this.sprite = sprite;
    this.sprite.obj = this;
    this.position.set(30,220,0);
    //this.sprite.position = (this.position);
    this.direction.x = 1;
    this.direction.y = -1;
    this.position.z = 10;
    this.clock = new THREE.Clock();
    this.animator = new TextureAnimator(skeletonMap, 9, 1, 9, 75);
    this.animRate = 1000;

    
    this.attackSound = new Audio('js/assets/player/sounds/swordSwing.wav');
    this.hitSound = new Audio('js/assets/player/sounds/swordStrike.wav');
    this.hurtSound = new Audio('js/assets/player/sounds/hurt.wav');


    this.health = 100;
    
    scene.add(sprite);

  };

  // Updates geometry related to this.
  Skeleton.prototype.rendUpdate = function(scene) {
    Enemy.prototype.rendUpdate.call(this, scene);
  };

  // For when this is removed from a scene.
  Skeleton.prototype.rendKill = function(scene) {
    if (!this.rendInitted) { return; } // never initted, nothing to kill
  };

  return Skeleton;
});
