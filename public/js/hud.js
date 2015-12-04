/*
 *  Methods to set up HUD during gameplay
 */


define(['jquery','assets'], function($, Assets) {

  function Hud() {
    var self = this; // preserve this for callbacks

    $('#hud').show();

  };

  // Clsas
  Hud.prototype.onClass = function() {
    $('.startmenu.mainmenu').hide();
    $('.classpick').hide();
    $('.settingsmenu').hide();
  };

  Hud.prototype.updateScore = function(score) {
    $('.score').text(score);
  };

  Hud.prototype.updateHealth = function(health, maxHealth) {
    $('.health.current').innerWidth((100*health/maxHealth)+"%");
    $('.health.text').text(health+" / "+maxHealth);
  };


  return Hud;
});
