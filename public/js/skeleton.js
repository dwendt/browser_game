/*
 *  Skeleton object. Should probably be inheriting a collidable/generic entity object. TODO.
 */

define(['three', 'keyboard', 'textureAnimator', 'enemy'], function(THREE, THREEx, TextureAnimator, Enemy) {

  // Private static.
  var numSkeletons = 0;

  var skeletonRightMap = THREE.ImageUtils.loadTexture( "js/assets/skeleton/right.png" );
  skeletonRightMap.magFilter = THREE.NearestFilter;
  var skeletonLeftMap = THREE.ImageUtils.loadTexture( "js/assets/skeleton/left.png" );
  skeletonLeftMap.magFilter = THREE.NearestFilter;

  var skeletonSpriteMat = new THREE.SpriteMaterial( { map: skeletonRightMap, color: 0xffffff, fog: false, sizeAttenuation: false, size: 32} );

  // Constructor.
  function Skeleton(x, y) {
    Enemy.call(this); // Call the parent constructor
    this.name="skeleton";
    numSkeletons++;
    this.initX = x || 0;
    this.initY = y || 0;
    this.attackDelay = Math.floor(Math.random() * 100) + 50;
  };

  Skeleton.prototype = Object.create(Enemy.prototype); // is-a Enemy inheritance.

  Skeleton.prototype.move = function() {

    // Simulate taking damage to test scene removal on death
    // this.health -= 1;

    if(Math.random() > .95) {
      this.direction.x *= -1;
      if(this.direction.x > 0) {
        this.sprite.material.map = skeletonRightMap;
      }
      else {
        this.sprite.material.map = skeletonLeftMap;
      }
      //this.animator = new TextureAnimator( (( this.direction.x > 0) ? skeletonMapRightWalk : skeletonMapLeftWalk ), 9, 1, 9, 75);
      //this.sprite.scale.x *= -1;
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

    if(this.canMove.rightDir && this.direction.x > 0)  this.position.setX((this.position.x + (this.direction.x * 3 * (60/this.fps)) ));
    if(this.canMove.leftDir && this.direction.x < 0)  this.position.setX((this.position.x + (this.direction.x * 3 * (60/this.fps)) ));
    if(this.canMove.up && this.direction.y > 0)  this.position.setY((this.position.y + (this.direction.y * 3 * (60/this.fps)) ));
    if(this.canMove.down && this.direction.y < 0)  this.position.setY((this.position.y + (this.direction.y * 3 * (60/this.fps)) ));

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
    sprite.scale.set(this.scale,this.scale,1);
    sprite.name = "skeletonSprite"; //TODO: random GUID? store them. also.
    this.sprite = sprite;
    this.sprite.obj = this;
    this.position.set(this.initX, this.initY, 0);
    //this.sprite.position = (this.position);
    this.direction.x = 1;
    this.direction.y = -1;
    this.position.z = 10;
    this.clock = new THREE.Clock();
    this.animator = new TextureAnimator(skeletonRightMap, 9, 1, 9, 75);
    this.animRate = 1000;
    this.animator2 = new TextureAnimator(skeletonLeftMap, 9, 1, 9, 75);
    // console.log(this.animator);
    // console.log(this.animator2);

    
    this.attackSound = new Audio('js/assets/player/sounds/swordSwing.wav');
    this.hitSound = new Audio('js/assets/player/sounds/swordStrike.wav');
    this.hurtSound = new Audio('js/assets/player/sounds/hurt.wav');


    this.health = 100;
    
    scene.add(sprite);
    // this.showRaycastLines();
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
