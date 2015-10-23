/*
 *  Player object. Should probably be inheriting a collidable/generic entity object. TODO.
 */

define(['three', 'keyboard', 'textureAnimator'], function(THREE, THREEx, TextureAnimator) {

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
    // Raycaster and  Ray in each direction for collision detection
    this.caster = new THREE.Raycaster();
    this.rays = [new THREE.Vector3(0, 0, 1),new THREE.Vector3(1, 0, 1),new THREE.Vector3(1, 0, 0),new THREE.Vector3(1, 0, -1),new THREE.Vector3(0, 0, -1),new THREE.Vector3(-1, 0, -1),new THREE.Vector3(-1, 0, 0),new THREE.Vector3(-1, 0, 1)];
    this.direction = {};
  };

  // Instanced destructor...
  Player.prototype.onRemove = function() {
    numPlayers--;
  };

  // For when it's first being added to a scene.
  Player.prototype.rendInit = function(scene) {
    // http://threejs.org/docs/#Reference/Objects/Sprite
    var sprite = new THREE.Sprite( warriorSpriteMat );
    console.log(scene);
    sprite.position.set(0,0,this.parallax);
    sprite.scale.set(150,150,1);
    sprite.name = "playerSprite"; //TODO: random GUID? store them. also.
    this.sprite = sprite;

    scene.add(sprite);
  };

  // Updates geometry related to this.
  Player.prototype.rendUpdate = function(scene) {
    if (!this.rendInitted) {
      this.rendInit(scene);
      this.rendInitted = true;
    }


    this.collision(scene);
    this.move();

    // Add some vibration for good measure. Threejsing intensifies.
    //ourSprite.position.set(this.position.x + Math.random()*10, this.position.y, this.parallax);

    // Standard no vibration
    this.sprite.position.set(this.position.x, this.position.y, this.parallax);

    // Or we can shift to the Astral Plane
    // ourSprite.position.set(this.position.x + Math.random()*100 - 150, this.position.y + Math.random() * 25, this.parallax + Math.random() * 5);    

    // Random X scale flip. Could be used for "unaware" enemies?
    // if(Math.random() > .95) this.sprite.scale.x = this.sprite.scale.x * ( ( Math.random() > .5) ? 1 : -1 );
  };

  Player.prototype.move = function() {
    if(keyboard.pressed('up')) {
      this.direction.y = 1;
      this.position.y += 5;
    }
    if(keyboard.pressed('left')) {
      this.direction.x = -1;
      this.position.x -= 5;
      this.sprite.scale.x = -150;
    }
    if(keyboard.pressed('right')) {
      this.direction.x = 1;
      this.position.x += 5;
      this.sprite.scale.x = 150;
    }
    if(keyboard.pressed('down')) {
      this.direction.y = -1;
      this.position.y -= 5;
    }
  }

  Player.prototype.collision = function(scene) {
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
  Player.prototype.rendKill = function(scene) {
    if (!this.rendInitted) { return; } // never initted, nothing to kill
  };

  return Player;
});
