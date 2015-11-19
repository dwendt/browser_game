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

    numSkeletons++;
  };

  Skeleton.prototype = Object.create(Enemy.prototype); // is-a Enemy inheritance.

  Skeleton.prototype.move = function() {

    if(Math.random() > .95) {
      this.direction.x *= -1;
      //this.animator = new TextureAnimator( (( this.direction.x > 0) ? skeletonMapRightWalk : skeletonMapLeftWalk ), 9, 1, 9, 75);
      this.sprite.scale.x *= -1;
    }

    if(Math.random() > .95) {
      this.direction.y *= -1;
    }

    this.position.x += this.direction.x * 2;
    this.position.y += this.direction.y * 2;
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

    sprite.position.set(0,0,this.parallax);
    sprite.scale.set(150,150,1);
    sprite.name = "playerSprite"; //TODO: random GUID? store them. also.
    this.sprite = sprite;
    this.direction.x = 1;
    this.direction.y = -1;
    this.clock = new THREE.Clock();
    this.animator = new TextureAnimator(skeletonMap, 9, 1, 9, 75);
    this.animRate = 1000;
    
    scene.add(sprite);
  };

  // Updates geometry related to this.
  Skeleton.prototype.rendUpdate = function(scene) {
    Enemy.prototype.rendUpdate(this, scene);
  };

  // For when this is removed from a scene.
  Skeleton.prototype.rendKill = function(scene) {
    if (!this.rendInitted) { return; } // never initted, nothing to kill
  };

  return Skeleton;
});
