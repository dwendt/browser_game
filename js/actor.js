/*
 *  Actor object. Holds generic methods for players/enemies/etc.
 */

define(['three', 'keyboard', 'textureAnimator'], function(THREE, THREEx, TextureAnimator) {

  // Private static vars.
  var numActors = 0; // Count of actors in total.

  // Constructor.
  function Actor() {
    numActors++;
    
    this.parallax = 10; // How much should this thing parallax? Must be >= 1. Affects scale.
    this.position = new THREE.Vector3(0,0,0); // 
    this.rendInitted = false; // Have we rendered it once yet?
    // Raycaster and  Ray in each direction for collision detection
    this.caster = new THREE.Raycaster();
    this.rays = [new THREE.Vector3(0, 0, 1),new THREE.Vector3(1, 0, 1),new THREE.Vector3(1, 0, 0),new THREE.Vector3(1, 0, -1),new THREE.Vector3(0, 0, -1),new THREE.Vector3(-1, 0, -1),new THREE.Vector3(-1, 0, 0),new THREE.Vector3(-1, 0, 1)];
    this.direction = {};
  };

  // Instanced destructor...
  Actor.prototype.onRemove = function() {
    numActors--;
  };

  // For when it's first being added to a scene.
  // We don't need any objects for the stock actor.
  // Should be overridden by children.
  Actor.prototype.rendInit = function(scene) {
    // THIS FUNCTION MUST BE OVERRIDEN.
    // IT MUST DEFINE this.sprite
  };

  // Called for movement updates. 
  Actor.prototype.move = function() {
    // override-me
  };

  // Updates geometry related to this.
  Actor.prototype.rendUpdate = function(scene) {
    if (!this.rendInitted) {
      this.rendInit(scene);
      this.rendInitted = true;
    }

    if (this.animator) {
      var delta = this.clock.getDelta();
      this.animator.update(delta*this.animRate);
    }
    this.collision(scene);
    this.move();

    // Update the position
    this.sprite.position.set(this.position.x, this.position.y, this.parallax);

    // Add some vibration for good measure. Threejsing intensifies.
    //ourSprite.position.set(this.position.x + Math.random()*10, this.position.y, this.parallax);

    // Or we can shift to the Astral Plane
    // ourSprite.position.set(this.position.x + Math.random()*100 - 150, this.position.y + Math.random() * 25, this.parallax + Math.random() * 5);    

    // Random X scale flip. Could be used for "unaware" enemies?
    // if(Math.random() > .95) this.sprite.scale.x = this.sprite.scale.x * ( ( Math.random() > .5) ? 1 : -1 );
  };

  Actor.prototype.collision = function(scene) {
    var collisions, i,
    // Maximum distance from the origin before we consider collision
    distance = this.sprite.size,
    // Get the obstacles array from our world
    obstacles = scene.children;
    // For each ray
    for (i = 0; i < this.rays.length; i += 1) {
      // We reset the raycaster to this direction
      this.caster.set(this.position, this.rays[i]);
      // Test if we intersect with any obstacle mesh
      collisions = this.caster.intersectObjects(obstacles);
      // And disable that direction if we do
      if (collisions.length > 0 && collisions[0].distance <= distance) {
        // Yep, this.rays[i] gives us : 0 => up, 1 => up-left, 2 => left, ...
        if ((i === 0 || i === 1 || i === 7) && this.direction.z === 1) {
          this.direction.z = 0;
        } else if ((i === 3 || i === 4 || i === 5) && this.direction.z === -1) {
          this.direction.setZ(0);
        }
        if ((i === 1 || i === 2 || i === 3) && this.direction.x === 1) {
          this.direction.setX(0);
        } else if ((i === 5 || i === 6 || i === 7) && this.direction.x === -1) {
          this.direction.setX(0);
        }
      }
    }
  }

  // For when this is removed from a scene.
  Actor.prototype.rendKill = function(scene) {
    if (!this.rendInitted) { return; } // never initted, nothing to kill
  };

  return Actor;
});
