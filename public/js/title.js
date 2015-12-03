/*
 *  Methods to set up the background/menu buttons for titlescreen.
 */


define(['jquery','assets','player'], function($, Assets, Player) {

  var grassMap = Assets.grassMap;
  var backGeo = new THREE.PlaneGeometry(30000, 30000, 0);
  var backMat = new THREE.MeshLambertMaterial( { map: grassMap, color: 0xffffff, shading: THREE.FlatShading, overdraw: 0.5 } );
  grassMap.repeat.set( 140, 140 ); // Larger values mean tinier texture.

  function Title(finalizecb) {
    var self = this; // preserve this for callbacks

    // title camera pos
    this.campos = {x:0,y:0};

    // Create a backing plane
    this.newBack = new THREE.Mesh( backGeo, backMat );
    this.newBack.name = "titleback";

    // Create a little player to hang out
    this.ply = new Player(0,0,1); 

    // Create the buttons/text/font
    this.mainBody= $(""+
    "<div class='startmenu mainmenu'>"+
      "<div class='menuhead wobble'>Go End Moe</div>"+
      "<br /><div class='subhead'>a 2d top down browser game<br />by dwn, chris pirillo, jordan ponce, gabriel babilonia</div>"+
      "<div class='startbtn'>START</div>"+
      "<div class='settingsbtn'>settings</div>"+
    "</div>"+
    "");

    this.classPickBody = $(""+
    "<div class='classpick startmenu' style='display:none;'>"+
      "<div class='classlist'>"+
        "<div data-clsid='1' class='classbadge'>"+
          "<img class='classimg' src='assets/player/warriorLeft.png' />"+
          "<div class='classdesc'>The warrior uses melee to chop stuff up! He can take a lot of damage and moves fast.</div>"+
        "</div>"+
        "<div data-clsid='2' class='classbadge'>"+
          "<img class='classimg' src='assets/player/wizardFront.png' />"+
          "<div class='classdesc'>Wizards use <i>magic</i>. <b><u>MAGIC!</u></b> That means we don't need to explain how he works. Experienced players only.</div>"+
        "</div>"+
      "</div>"+
      "<div style='display:none;' class='finalizebtn'>-= START GAME =-</div>"+
      "<div class='backbtn'>{{ back }}</div>"+
    "</div>");

    this.settingsBody = $(""+
    "<div class='settingsmenu startmenu' style='display:none;'>"+
      "<div class='qualpicker'>"+
        "<div class='settingChoice'>Quality</div><br />"+
        "<div class='qualselect'><span class='lowqual'>Low</span> <span class='highqual qualselected'>High</span></div>"+
      "</div>"+
      "<div class='backbtn'>{{ back }}</div>"+
    "</div>");

    $(document.body).append(this.mainBody);
    $(document.body).append(this.classPickBody);
    $(document.body).append(this.settingsBody);



    $( ".classbadge" ).hover(
      function() {
        $( this ).addClass( "cbhover" );
      }, function() {
        $( this ).removeClass( "cbhover" );
      }
    );
    // class select click
    $(document).on("click", ".classbadge", function(e) {
      $(".classbadge").removeClass("cbselected");
      if(!!$(e.target).data("clsid")) {
        self.choice = $(e.target).data("clsid");
        $(e.target).addClass("cbselected");
      } else {
        self.choice = $(e.target).parent(".classbadge").data("clsid");
        $(e.target).parent(".classbadge").addClass("cbselected");
      }
      $(".finalizebtn").show();
      console.log("selected class...", self.choice);
    });

    $(document).on("click", ".settingsbtn", function() {
      self.onSettings();
    });

    $(document).on("click", ".startbtn", function() {
      self.onStart();
    });

    $(document).on("click", ".finalizebtn", function() {
      self.onFinalized(finalizecb);
    });

    $(document).on("click", ".backbtn", function() {
      self.home();
    });

    // some effects
    this.vib = false;
  };

  Title.prototype.rendUpdate = function(scene, renderer, delta) {
    if(!!this.removeObjects) {
      this.rendKill(scene);
      return;
    }
    if(!this.rendInitted) {
      this.rendInit(scene);
      this.rendInitted = true;
    }

    this.ply.position.x = this.campos.x + 190;
    this.ply.position.y = this.campos.y - 50;


    // Vibrate the player a little. I think it's a funny effect.
    var vibChance = Math.random();

    if (vibChance < 0.01) {
      this.vib = true; 
    }

    if (this.vib) {
      this.ply.position.y += (Math.random()-0.5)*50
      this.ply.position.x += (Math.random()-0.5)*50
      
      if (vibChance < 0.009) {
        this.vib = false;
      }
    }

    this.campos.x -= 5;
    this.ply.rendUpdate(scene);

    renderer.setCameraPos(this.campos.x, 0, 4000);

    if (this.campos.x < -10000) {
      this.campos.x = 0;
    }

  };

  Title.prototype.rendInit = function(scene) {
    scene.add(this.newBack);
  };

  Title.prototype.rendKill = function(scene) {
    var obj = scene.getObjectByName("titleback");
    scene.remove(obj);
  };


  Title.prototype.showPause = function() {

  };

  // Hide everything.
  Title.prototype.hideMenu = function() {
    // Scene stuff
    this.removeObjects = true;

    // Hide menus.
    $('.startmenu.mainmenu').hide();
    $('.classpick').hide();
    $('.settingsmenu').hide();
  };

  // Roll it all back to home.
  Title.prototype.home = function() {
    $(".settingsmenu").hide();
    $('.classpick').hide();
    $('.startmenu.mainmenu').show();
  };

  // yoyoyo
  Title.prototype.onSettings = function() {
    $('.classpick').hide();
    $('.startmenu.mainmenu').hide();
    $('.settingsmenu').show();

  };

  // Go to class select
  // Show the character classes as buttons, description box under.
  Title.prototype.onStart = function() {
    $('.startmenu.mainmenu').hide();
    $('.classpick').show();
    $('.settingsmenu').hide();
  };

  // Clsas
  Title.prototype.onClass = function() {
    $('.startmenu.mainmenu').hide();
    $('.classpick').hide();
    $('.settingsmenu').hide();
  };

  // They're done, go.
  Title.prototype.onFinalized = function(finalizecb) {
    finalizecb(this.choice);
    this.player.destroyPlayer();
  };


  return Title;
});
