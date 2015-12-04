/*
 *  Methods to set up HUD during gameplay
 */


define(['jquery','assets'], function($, Assets) {

  function Hud() {
    var self = this; // preserve this for callbacks

    var mainHudBody = (""+
    "<div id='hud'>"+
      "<div id='health-container' class='hud health container'>"+
        "<div id='health-text' class='health text'> 30 / 30 </div>"+
        "<div id='health-current' class='health current'></div>"+
      "</div>"+

      "<div id='score-container' class='hud scorecontainer'></div>"+
        "<div id='score' class='hud score'></div>"+
      "</div>"+
    "</div>"+
    "");

    $(document.body).append(mainHudBody);

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
    $('.health.current').innerWidth((100*health/maxHealth)+'%');
    $('.health.text').text(health+' / '+maxHealth);
  };


  return Hud;
});
