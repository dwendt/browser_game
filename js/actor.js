 /*
 *  Actor object. Holds generic methods for players/enemies/etc.
 */

define(['three', 'keyboard', 'textureAnimator'], function(THREE, THREEx, TextureAnimator) {

  // Private static vars.
  var numActors = 0; // Count of actors in total.

  // Constructor.
  function Actor() {
    numActors++;
    
    this.radius = 100; // radius to consider collisions within
    this.parallax = 10; // How much should this thing parallax? Must be >= 1. Affects scale.
    this.position = new THREE.Vector3(0,0,0); // 
    this.rendInitted = false; // Have we rendered it once yet?
    this.health = 100;
    this.damage = 10;
    this.removal = false;
    
    // Raycaster and  Ray in each direction for collision detection
    this.rays = [new THREE.Vector3(0, 1, 0),new THREE.Vector3(1, 1, 0),new THREE.Vector3(1, 0, 0),new THREE.Vector3(1, -1, 0),new THREE.Vector3(0, -1, 0),new THREE.Vector3(-1, -1, 0),new THREE.Vector3(-1, 0, 0),new THREE.Vector3(-1, 1, 0)];
    this.caster = new THREE.Raycaster(this.position, this.rays[0]);
    this.direction = {};
    this.canMove = {'up':true, 'rightDir': true, 'down': true, 'leftDir': true};
    this.attackCooldown = 0;
    // Classes must override this.attackDelay with ms delay >= 100
  };

  // Instanced destructor...
  Actor.prototype.onRemove = function() {
    numActors--;
    this.removal = true;
    this.scene.remove(this.sprite);
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
    if (undefined === scene) {
      console.log("rendUpdate being called from Actor subclass without passing scene!");
    }
    if (!this.rendInitted) {
      this.scene = scene;
      this.rendInit(scene);
      this.rendInitted = true;
    }

    if (this.animator) {
      var delta = this.clock.getDelta();
      this.animator.update(delta*this.animRate);
    }

    if(this.health <= 0) {
      this.onRemove();
    }
    this.collision(scene);
    this.move();

    // Update the position
    this.sprite.position.set(this.position.x, this.position.y, this.parallax);
    //console.log(this.name,this.sprite.position.x,this.sprite.position.y);

    // Add some vibration for good measure. Threejsing intensifies.
    //ourSprite.position.set(this.position.x + Math.random()*10, this.position.y, this.parallax);

    // Or we can shift to the Astral Plane
    // ourSprite.position.set(this.position.x + Math.random()*100 - 150, this.position.y + Math.random() * 25, this.parallax + Math.random() * 5);    

    // Random X scale flip. Could be used for "unaware" enemies?
    // if(Math.random() > .95) this.sprite.scale.x = this.sprite.scale.x * ( ( Math.random() > .5) ? 1 : -1 );
  };

  Actor.prototype.collision = function(scene) {
    // this.canMove = {'up':true, 'right': true, 'down': true, 'left': true};
    var collisions, i, distance, obstacles;
    // Maximum distance from the origin before we consider collision
    distance = this.radius;
    // Get the obstacles array from our world
    obstacles = scene.children;
    // For each ray
    this.newCanMoveVals = {'up':true, 'rightDir': true, 'down': true, 'leftDir': true};
    for (i = 0; i < this.rays.length; i += 1) {
      // We reset the raycaster to this direction
      this.caster.set(this.position, this.rays[i]);
      // Test if we intersect with any obstacle mesh
      collisions = this.caster.intersectObjects(obstacles);
      // And disable that direction if we do
      if (collisions.length > 0 && collisions[0].distance <= distance && collisions[0].object.name === 'wall') {
        //console.log(this.name,this.caster.ray.origin);
        // console.log(i, collisions[0].distance);
        // Yep, this.rays[i] gives us : 0 => up, 1 => up-left, 2 => left, ...
        if ((i === 0 /*|| i === 1 || i === 7*/) && (this.name+"Sprite" !== collisions[0].object.name)) {
          this.newCanMoveVals.up = false;
          this.position.y -= 3;

          // do something on collision.
        } else if ((/*i === 3 ||*/ i === 4 /*|| i === 5*/)  && (this.name+"Sprite" !== collisions[0].object.name)) {
          this.newCanMoveVals.down = false;
          this.position.y += 3;

          // do something on collision.
        }
        if ((i === 1 || i === 2 || i === 3)  && (this.name+"Sprite" !== collisions[0].object.name)) {
          this.newCanMoveVals.rightDir = false;
          this.position.x -= 3;


          // do something on collision.
        } else if ((i === 5 || i === 6 || i === 7)  && (this.name+"Sprite" !== collisions[0].object.name)) {

          this.newCanMoveVals.leftDir = false;
          this.position.x += 3;
          

          // do something on collision.
        }
      }
      //console.log(this.name, this.newCanMoveVals.leftDir);
      this.canMove = this.newCanMoveVals;
      //console.log(this.canMove);
    }
  }

  Actor.prototype.attack = function(scene) {
    this.attackSound.play();
    // console.log(this.name,'attacking');
    this.attackCooldown += this.attackDelay;
    // this.canMove = {'up':true, 'right': true, 'down': true, 'left': true};
    var collisions, i, distance, obstacles;
    // Maximum distance from the origin before we consider collision
    distance = this.radius * 1.5;
    // Get the obstacles array from our world
    obstacles = scene.children;
    // For each ray
    var objHit = false;
    for (i = 0; i < this.rays.length; i += 1) {
      if(objHit) break;
      // We reset the raycaster to this direction
      this.caster.set(this.position, this.rays[i]);
      // Test if we intersect with any obstacle mesh
      collisions = this.caster.intersectObjects(obstacles);
      // And disable that direction if we do

      for (var j = 0; j < collisions.length; j++) {
        if (collisions.length > 0 && collisions[j].distance <= distance && this.validObject(collisions[j].object)) {
          if ((i === 1 || i === 2 || i === 3) && this.direction.x === 1 && (this.name+"Sprite" !== collisions[j].object.name)) {
            // do something on collision.
            collisions[j].object.obj.health -= this.damage;
            collisions[j].object.obj.position.x += 20;
            collisions[j].object.obj.hurtSound.play();
            objHit=true;
            break;
          } else if ((i === 5 || i === 6 || i === 7) && this.direction.x === -1 && (this.name+"Sprite" !== collisions[j].object.name)) {
            // do something on collision.

            collisions[j].object.obj.health -= this.damage;
            collisions[j].object.obj.position.x -= 20;
            collisions[j].object.obj.hurtSound.play();
            objHit=true;
            break;
          }
          if ((i === 0 || i === 1 || i === 7) && this.direction.y === 1 && (this.name+"Sprite" !== collisions[j].object.name)) {
            // do something on collision.

            collisions[j].object.obj.health -= this.damage;
            collisions[j].object.obj.position.y += 20;
            collisions[j].object.obj.hurtSound.play();
            objHit=true;
            break;
          } else if ((i === 3 || i === 4 || i === 5) && this.direction.y === -1 && (this.name+"Sprite" !== collisions[j].object.name)) {
            // do something on collision.

            collisions[j].object.obj.health -= this.damage;
            collisions[j].object.obj.position.y -= 20;
            collisions[j].object.obj.hurtSound.play();
            objHit=true;
            break;
          }
        }
      }
    }
    if(objHit) this.hitSound.play();
    this.drawArc(scene);
  }

  // For when this is removed from a scene.
  Actor.prototype.rendKill = function(scene) {
    if (!this.rendInitted) { return; } // never initted, nothing to kill
  };

  Actor.prototype.validObject = function(obj) {
    return ( obj.name !== 'wall' && 
            (this.name+"Sprite" !== obj.name)  && 
            (obj.name !== 'attackarc'));
  }

  Actor.prototype.drawArc = function(scene) {
    var curve;
    if(this.direction.x > 0) {  // Draw arc to the right
        curve = new THREE.EllipseCurve(
          this.position.x, this.position.y,             // ax, aY
          this.radius, this.radius,            // xRadius, yRadius
          -Math.PI/3, Math.PI/3, // aStartAngle, aEndAngle
          false             // aClockwise
      );
    }
    else {
      curve = new THREE.EllipseCurve(
          this.position.x, this.position.y,             // ax, aY
          this.radius, this.radius,            // xRadius, yRadius
          2*Math.PI/3, 4*Math.PI/3, // aStartAngle, aEndAngle
          false             // aClockwise
      );
    }

    var points = curve.getSpacedPoints( 20 );

    var path = new THREE.Path();
    var geometry = path.createGeometry( points );

    var material = new THREE.LineBasicMaterial( { color : 0xff0000 } );

    var line = new THREE.Line( geometry, material );
    line.name = 'attackarc';

    scene.add( line );
    setTimeout(function() {
      scene.remove(line);
    }, 200, line);
  }

  return Actor;
});
