/**
 * Renderer handles creating the canvas and defining methods to control the scene.
 *
 * Renderable objects have rendInit/rendKill/rendUpdate methods which are passed the scene.
 * Objects should store their geometry/etc in the scene with unique names.
 * We currently pass the scene to GameLogic.rendUpdate which decids what is rendered.
 */

define(['three'],function(THREE) {

  // Private vars for the renderer.
  var camera, canvRenderer;

  // Public var, the scene that other classes can add/remove/update stuff on.
  Renderer.scene = null;
  Renderer.logicCallback = null; // Callback to gamelogic rendUpdate. TODO: does this suck?

  // Creates the canvas/initializes rendering.
  function Renderer() {
    var canvWid = window.innerWidth;
    var canvHei = window.innerHeight;
    var aspectRatio = canvWid/canvHei;
    console.log("canv wid, hei, ratio: ", canvWid, canvHei, aspectRatio);

/*
    // Ortho camera is a box-shaped camera looking down Y axis.
    // Each value defines the position on an axis a boundary is at.
    camera = new THREE.OrthographicCamera(
    canvWid / -2,   // left boundary - x axis
    canvWid / 2,    // right         - x axis
    canvHei/2,                    // top           - y axis
    canvHei/-2,                    // bott          - y axis
    -1000,                        // near          - z axis
    1000);                        // far           - z axis
  */
    camera = new THREE.PerspectiveCamera( 5, aspectRatio, 1, 50000);
  
    camera.position.x = 0;
    camera.position.y = 100;
    camera.position.z = 1000;

    // Space for the camera to render.
    // This is passed to renderables like so:
    // rendInit - for creating the initial items in the scene to represent itself.
    // rendKill - for removing the items in the scene it created, on death.
    // rendUpdate - for updating the positions of the items that represent the object.
    Renderer.scene = new THREE.Scene();
    var scene = Renderer.scene;

    scene.add(new THREE.AmbientLight(0xFFFFFF));

/*
    // GRID ACROSS X-Y PLANE
        var size = 500, step = 50;

        var geometry = new THREE.Geometry();

        for ( var i = - size; i <= size; i += step ) {

          geometry.vertices.push( new THREE.Vector3( - size, i, 0 ) );
          geometry.vertices.push( new THREE.Vector3(   size, i, 0 ) );

          geometry.vertices.push( new THREE.Vector3( i, - size , 0) );
          geometry.vertices.push( new THREE.Vector3( i,   size , 0) );

        }

        var material = new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2 } );

        var line = new THREE.LineSegments( geometry, material );
        scene.add( line );
*/

    // Actual renderer
    canvRenderer = new THREE.WebGLRenderer();
    canvRenderer.setClearColor( 0xFFFFFF );
    canvRenderer.setPixelRatio( aspectRatio );
    canvRenderer.setSize( canvWid, canvHei );
    document.body.appendChild(canvRenderer.domElement);

    window.addEventListener( 'resize', function() {
      camera.left = window.innerWidth / -2;
      camera.right = window.innerWidth / 2;
      camera.top = window.innerHeight / 2;
      camera.bottom = window.innerHeight / -2;

      camera.updateProjectionMatrix();

      canvRenderer.setSize(window.innerWidth, window.innerHeight);
    }, false );

    return Renderer;
  };

  // Setter for camera.lookAt
  Renderer.setCameraLookAt = function(pos) {
    camera.lookAt(pos);
  };

  // Setter for camera position.
  Renderer.setCameraPos = function(x, y, z) {
    camera.position.x = x;
    camera.position.y = y;
    camera.position.z = z;
  };

  // Handles ensuring the canvas is updated.
  Renderer.animate = function() {
    // Browser builtin, takes callback for next frame.
    requestAnimationFrame( Renderer.animate );
  
    Renderer.renderScene();
  };

  // Could handle updating camera pos and stuff...we do that elsewhere.
  Renderer.renderScene = function() {
    Renderer.logicCallback.rendUpdate(Renderer.scene);
        var timer = Date.now() * 0.0001;

        //camera.position.x = Math.cos( timer ) * 200;
    camera.position.x = Math.sin(timer) * 200;
    camera.position.z = 7000;//Math.sin( (timer%(Math.PI)) ) * -2000;
    camera.position.y = 0;
/*
    camera.rotation.x = Math.PI / 2;
    camera.rotation.y = 0;
    camera.rotation.z = 0;
    camera.rotationAutoUpdate = false;
    var curZoom = 1;//Math.sin( timer ) * 0.1;
      camera.left = window.innerWidth / -2 * curZoom;
      camera.right = window.innerWidth / 2 * curZoom;
      camera.top = window.innerHeight / 2 * curZoom;
      camera.bottom = window.innerHeight / -2 * curZoom;

      camera.updateProjectionMatrix();
*/
    //camera.lookAt(Renderer.scene.position);
    camera.rotation.x = 0;// - Math.PI;
    camera.rotation.y = 0; //Math.PI;
    camera.rotation.z = 0;

    canvRenderer.render( Renderer.scene, camera );
  };

  // Set callback for new frame rendering.
  Renderer.setCallback = function(cb) {
    console.log("setting cb in renderer...");
    Renderer.logicCallback = cb;
  };

  // Instanced functions unnecessary - we only have one renderer.
  //Renderer.prototype = { };

  return Renderer;
});
