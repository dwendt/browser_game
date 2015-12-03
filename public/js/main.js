/**
 *  Main JS file to load and initiate game logic/renderer.
 */

require.config({
  paths: {
    three: 'vendor/three.min',
    canvasrenderer: 'vendor/examples/renderers/CanvasRenderer',
    projector: 'vendor/examples/renderers/Projector',
    keyboard: 'vendor/threex.keyboardstate',
    textureAnimator: 'vendor/ThreeTextureAnimator',
    bootstrap :  "//netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min",
    jquery: 'vendor/jquery',
    "socket.io-client": 'vendor/socket.io'
  },
  shim: {
    three: {
      exports: 'THREE'
    },
    canvasrenderer: {
      deps: ['three']
    },
    projector: {
      deps: ['three']
    },
    keyboard: {
      exports: 'THREEx'
    },
    textureAnimator: {
      deps: ['three'],
      exports: 'TextureAnimator'
    },
    bootstrap : { "deps" :['jquery'] }
  }
});

requirejs(['renderer', 'logic'], function(Renderer, GameLogic){
  console.log("Initializing renderer...");

  // This will initialize our renderer with the body contents.
  var core_renderer = new Renderer();

  // Logic needs a reference to the renderer to handle draws.
  var core_logic = new GameLogic(core_renderer);
  core_renderer.animate();

  // Shows rendering stats. Click to go FPS / ms per render / memory usage
  (function(){var script=window.document.createElement('script');script.onload=function(){var stats=new Stats();stats.domElement.style.cssText='position:fixed;left:0;top:0;z-index:10000';window.document.body.appendChild(stats.domElement);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='//rawgit.com/mrdoob/stats.js/master/build/stats.min.js';window.document.head.appendChild(script);})()
});

