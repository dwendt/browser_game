/**
 *  Main JS file to load and initiate game logic/renderer.
 */

require.config({
  paths: {
    three: 'vendor/three.min',
    canvasrenderer: 'vendor/examples/renderers/CanvasRenderer',
    projector: 'vendor/examples/renderers/Projector',
    keyboard: 'vendor/threex.keyboardstate',
    textureAnimator: 'vendor/ThreeTextureAnimator'
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
    }
  }
});

requirejs(['renderer', 'logic'], function(Renderer, GameLogic){
  console.log("Initializing renderer...");

  // This will initialize our renderer with the body contents.
  var core_renderer = new Renderer();

  // Logic needs a reference to the renderer to handle draws.
  var core_logic = new GameLogic(core_renderer);
  core_renderer.animate();
});

