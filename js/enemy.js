/*
 *  Enemy object. Handles attacking AI logic.
 */

define(['three', 'keyboard', 'textureAnimator', 'actor'], function(THREE, THREEx, TextureAnimator, Actor) {

  // Private static.
  var numEnemies = 0;

  // Constructor. Inherits Actor.
  function Enemy() {
    Actor.call(this); // Call the parent constructor

    numEnemies++;
  };

  Enemy.prototype = Object.create(Actor.prototype); // is-a actor inheritance.
  // --------- Below functions are overrides or extensions of parent methods.

  // For when it's first being added to a scene.
  Enemy.prototype.rendInit = function(scene) {
    // child MUST override and implement this.sprite.
  };

  // Updates geometry related to this.
  Enemy.prototype.rendUpdate = function(scene) {
    // Call the parent's.
    Actor.prototype.rendUpdate.call(this);

    // If we have any player-on-render stuff to do it'd go below.
  };

  // For when this is removed from a scene.
  Enemy.prototype.rendKill = function(scene) {
    if (!this.rendInitted) { return; } // never initted, nothing to kill

    // Call the parent's.
    Actor.prototype.rendKill.call(this);
  };

  // Instanced destructor...
  Enemy.prototype.onRemove = function() {
    // Call parent
    Actor.prototype.onRemove.call(this);

    numEnemies--;
  };


  return Enemy;
});
