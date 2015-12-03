/*
 *  Load all the assets here. PLEASE GOD.
 */

define(['three'], function(THREE) {

  // Static public vars.
  Assets.grassMap = THREE.ImageUtils.loadTexture( "assets/level/grass.png" );
  Assets.wallMap  = THREE.ImageUtils.loadTexture( "assets/level/wall.jpg" );
  Assets.innerBackMap = THREE.ImageUtils.loadTexture( "assets/level/darkWood.jpg" );  
  Assets.woodFloor = THREE.ImageUtils.loadTexture( "assets/level/woodFloor.jpg"); 
  Assets.darkBricks = THREE.ImageUtils.loadTexture( "assets/level/darkBricks.png" );

  Assets.skeletonRightMap = THREE.ImageUtils.loadTexture( "assets/skeleton/right.png" );
  Assets.skeletonLeftMap = THREE.ImageUtils.loadTexture( "assets/skeleton/left.png" );
  Assets.skeleAttack = new Audio('assets/skeleton/sounds/attackSound.wav');
  Assets.skeleHit = new Audio('assets/skeleton/sounds/hitSound.wav');
  Assets.skeleDeath = new Audio('assets/skeleton/sounds/deathSound.wav');

  Assets.warriorRightMap = THREE.ImageUtils.loadTexture( "assets/player/warriorRight.png" );
  Assets.warriorLeftMap = THREE.ImageUtils.loadTexture( "assets/player/warriorLeft.png" );
  Assets.wizardRightMap = THREE.ImageUtils.loadTexture( "assets/player/wizardRight.png" );
  Assets.wizardLeftMap = THREE.ImageUtils.loadTexture( "assets/player/wizardLeft.png" );


  Assets.plyAttack= new Audio('assets/player/sounds/swordSwing.wav');
  Assets.plyHit = new Audio('assets/player/sounds/swordStrike.wav');
  Assets.plyHurt = new Audio('assets/player/sounds/hurt.wav');
  Assets.plyDeath = new Audio('assets/player/sounds/death.wav');

  function Assets() {
  };

  return Assets;
});
