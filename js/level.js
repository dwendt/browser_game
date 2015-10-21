/*
 *  Level object. TODO: decide how we want to make levels infinite/random
 */

define(['three'], function(THREE) {

  // Private static.
  // Grass texture for the default backing. TODO: loading screen instead?
  var grassMap = THREE.ImageUtils.loadTexture( "js/assets/grass.png" );
  grassMap.wrapS = grassMap.wrapT = THREE.RepeatWrapping;
  grassMap.repeat.set( 10, 10 ); // Larger values mean tinier texture.

  // Properties for the backing.
  var backGeo = new THREE.PlaneGeometry(3000, 3000, 1); // TODO: planegeometry or sprite better?
  var backMat = new THREE.MeshLambertMaterial( { map: grassMap, color: 0xffffff, shading: THREE.FlatShading, overdraw: 0.5 } );
  


  // Constructor.
  function Level() {
    this.rendInitted = false;
  };

  // Instanced destructor...
  Level.prototype.onRemove = function() {
    // ....non-scene related removal stuff here? 
  };

  // For when it's first being added to a scene.
  Level.prototype.rendInit = function(scene) {
    console.log("creating backing...");
    var newBack = new THREE.Mesh( backGeo, backMat );
    newBack.position.x = 0;
    newBack.position.y = 0;
    newBack.position.z = 0;
    newBack.name = "backing"; // TODO: unique name GUIDs !!IMPORTANT!! !!HOW DO WE DO THIS!!

    /*
    // random colored lights?
    var ambientLight = new THREE.AmbientLight( 0.5 * 0x10 );
    scene.add( ambientLight );
    var directionalLight = new THREE.DirectionalLight( Math.random() * 0xffffff );
    directionalLight.position.x = Math.random() - 0.5;
    directionalLight.position.y = Math.random() - 0.5;
    directionalLight.position.z = Math.random() - 0.5;
    directionalLight.position.normalize();
    scene.add( directionalLight );
    */

    scene.add(newBack);
  };

  // Updates geometry related to this.
  Level.prototype.rendUpdate = function(scene) {
    if (!this.rendInitted) {
      this.rendInit(scene);
      this.rendInitted = true;
    }
  };

  // For when this is removed from a scene.
  Level.prototype.rendKill = function(scene) {
    if (!this.rendInitted) { return; } // this was never initted, nothing to kill

    var obj = scene.getObjectByName("backing");
    scene.remove(obj);
  };

  return Level;
});
