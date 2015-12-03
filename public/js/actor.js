 /*
 *  Actor object. Holds generic methods for players/enemies/etc.
 */

define(['three', 'keyboard', 'textureAnimator', 'assets'], function(THREE, THREEx, TextureAnimator, Assets) {

  // Private static vars.
  var numActors = 0; // Count of actors in total.

  // Constructor.
  function Actor() {
    numActors++;
    
    this.radius = 50; // radius to consider collisions within
    this.parallax = 1; // How much should this thing parallax? Must be >= 1. Affects scale.
    this.position = new THREE.Vector3(0,0,0); // 
    this.rendInitted = false; // Have we rendered it once yet?
    this.health = 100;
    this.damage = 10;
    this.removal = false;

    this.fps = 60;

    this.scale = this.radius*2;
    
    // Raycaster and  Ray in each direction for collision detection
    this.rays = [new THREE.Vector3(0, 1, 0),new THREE.Vector3(1, 1, 0),new THREE.Vector3(1, 0, 0),new THREE.Vector3(1, -1, 0),new THREE.Vector3(0, -1, 0),new THREE.Vector3(-1, -1, 0),new THREE.Vector3(-1, 0, 0),new THREE.Vector3(-1, 1, 0)];
    // this.rays = [new THREE.Vector3(0, 1, 0),new THREE.Vector3(1, 0, 0),new THREE.Vector3(0, -1, 0),new THREE.Vector3(-1, 0, 0)];
    this.caster = new THREE.Raycaster(this.position, this.rays[0], 0, this.radius*2);
    this.direction = {};
    this.canMove = {'up':true, 'rightDir': true, 'down': true, 'leftDir': true};
    this.attackCooldown = 0;
    // Classes must override this.attackDelay with ms delay >= 100
  };

  Actor.prototype.showRaycastLines = function() {
    var mat = new THREE.LineBasicMaterial({color: 0x0000ff});
    for(var i = 0; i < this.rays.length; i++) {
      var geometry = new THREE.Geometry();
      geometry.vertices.push(
        new THREE.Vector3( 0, 0, 0 ),
        this.rays[i]
      );
      // geometry.vertices[1].multiplyScalar(this.radius);
      this.sprite.add(new THREE.Line(geometry,mat));
    }
  }

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
    if (this.animator2) {
      var delta = this.clock.getDelta();
      this.animator2.update(delta*this.animRate);
    }


    if(this.health <= 0) {
      this.onRemove();
    }

    // Update timing variables


    this.attackCooldown -= (this.attackCooldown > 0) ? (60/this.fps) : 0;

    this.collision(scene);
    this.move();

    // Update the position
    this.sprite.position.set(this.position.x, this.position.y, this.parallax);
    //console.log(this.name,this.sprite.position.x,this.sprite.position.y);
    
  };

  Actor.prototype.collision = function(scene) {

    // if(this.name=='skeleton') return;

    // this.canMove = {'up':true, 'right': true, 'down': true, 'left': true};
    var collisions, i, distance, obstacles;
    // Maximum distance from the origin before we consider collision
    distance = this.radius;
    // Get the obstacles array from our world
    obstacles = scene.children;
    // For each ray
    this.newCanMoveVals = {'up':true, 'rightDir': true, 'down': true, 'leftDir': true};
    for (i = 0; i < this.rays.length; i += 1) {
      if(1%2 == 0) continue;
      // We reset the raycaster to this direction
      this.caster.set(this.position, this.rays[i]);
      // Test if we intersect with any obstacle mesh
      collisions = this.caster.intersectObjects(obstacles);
      // And disable that direction if we do
      var collObject;
      while(collisions.length > 0 && collisions[0].object.material.type == "SpriteMaterial") {
        collisions.shift();
      }
      collObject = collisions[0];

      // console.log(collObject);

      if (collisions.length > 0 && collObject.distance <= distance && collObject.object.name === 'wall') {
        //console.log(this.name,this.caster.ray.origin);
        // console.log(i, collObject.distance);
        // Yep, this.rays[i] gives us : 0 => up, 1 => up-left, 2 => left, ...
        if ((i === 0 || i === 1 || i === 7)) {
          this.newCanMoveVals.up = false;
          this.position.y -= 3;

          // do something on collision.
        } else if ((i === 3 || i === 4 || i === 5)) {
          this.newCanMoveVals.down = false;
          this.position.y += 3;

          // do something on collision.
        }
        if ((i === 1 || i === 2 || i === 3)) {
          this.newCanMoveVals.rightDir = false;
          this.position.x -= 3;

          // do something on collision.
        } else if ((i === 5 || i === 6 || i === 7)) {

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
    var collObj;
    for (i = 0; i < this.rays.length; i += 1) {
      if(objHit) break;
      // We reset the raycaster to this direction
      this.caster.set(this.position, this.rays[i]);
      // Test if we intersect with any obstacle mesh
      collisions = this.caster.intersectObjects(obstacles);
      // And disable that direction if we do

      for (var j = 0; j < collisions.length; j++) {
        if (collisions[j].object.name === 'wall') break;
        if (collisions[j].distance <= distance && this.validObject(collisions[j].object)) {
          //console.log(this.name, collisions[j].object.obj.name, collisions[j].distance);

          collObj = collisions[j].object.obj;

          if ((i === 1 || i === 2 || i === 3) && this.direction.x === 1) {
            // do something on collision.
            collObj.health -= this.damage;
            collObj.position.x += 20;
            if(collObj.hurtSound) {
              collObj.hurtSound.play();
            }
            objHit=true;
            break;
          } else if ((i === 5 || i === 6 || i === 7) && this.direction.x === -1) {
            // do something on collision.

            collObj.health -= this.damage;
            collObj.position.x -= 20;
            if(collObj.hurtSound) {
              collObj.hurtSound.play();
            }            
            objHit=true;
            break;
          }
          if ((i === 0 || i === 1 || i === 7) && this.direction.y === 1) {
            // do something on collision.

            collObj.health -= this.damage;
            collObj.position.y += 20;
            if(collObj.hurtSound) {
              collObj.hurtSound.play();
            }
            objHit=true;
            break;
          } else if ((i === 3 || i === 4 || i === 5) && this.direction.y === -1) {
            // do something on collision.

            collObj.health -= this.damage;
            collObj.position.y -= 20;
            if(collObj.hurtSound) {
              collObj.hurtSound.play();
            }
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
    if(obj.name === 'wall') return false;
    if(obj.obj != undefined) {
      if(obj.obj.name === this.name+"Sprite") {
        return false;
      }
      if(obj.obj.name === this.name) {
        return false;
      }
    }
    if(obj.name === 'attackarc') return false;

    if(this.position.distanceTo(obj.position) > this.radius*2) return false;

    return true;
  }

  Actor.prototype.drawArc = function(scene) {
    var curve;
    if(this.direction.x > 0) {  // Draw arc to the right
        curve = new THREE.EllipseCurve(
          this.position.x, this.position.y,             // ax, aY
          this.radius*1.5, this.radius*1.5,            // xRadius, yRadius
          -Math.PI/3, Math.PI/3, // aStartAngle, aEndAngle
          false             // aClockwise
      );
    }
    else {
      curve = new THREE.EllipseCurve(
          this.position.x, this.position.y,             // ax, aY
          this.radius*1.5, this.radius*1.5,            // xRadius, yRadius
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


  // actor-specific damage code, overrideme.
  Actor.prototype.takeDamage = function(amount) {
  }

  return Actor;
});
