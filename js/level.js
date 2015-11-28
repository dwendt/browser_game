/*
 *  Level object. TODO: decide how we want to make levels infinite/random
 */

define(['three'], function(THREE) {

  // Private static.
  // Grass texture for the default backing. TODO: loading screen instead?
  var grassMap = THREE.ImageUtils.loadTexture( "js/assets/grass.png" );
  grassMap.wrapS = grassMap.wrapT = THREE.RepeatWrapping;
  grassMap.repeat.set( 40, 40 ); // Larger values mean tinier texture.

  // Properties for the backing.
  var backGeo = new THREE.PlaneGeometry(10000, 10000, 1); // TODO: planegeometry or sprite better?
  var backMat = new THREE.MeshLambertMaterial( { map: grassMap, color: 0xffffff, shading: THREE.FlatShading, overdraw: 0.5 } );
  


  // Constructor.
  function Level() {
    this.rendInitted = false;
    this.cells = [];
    this.walls = [];
    this.numCells = 30;
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
    this.generateMaze(scene);
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

  Level.prototype.generateMaze = function(scene) {
    
    var visited = [];

    for(var i = 0; i < this.numCells; i++) {
      this.cells[i] = [];
      visited[i] = [];
      for(var j = 0; j < this.numCells; j++) {
        this.cells[i][j] = {up:false, left:false};
        visited[i][j] = false;
      }
    }

    var startX = this.cells.length - 2;
    var startY = this.cells.length - 2;

    var cell = {x: startX, y: startY};
    //visited[startX][startY] = true;
    var cellStack = new Array();
    cellStack.push(cell);

    while(cellStack.length > 0) {
      cell = cellStack.pop();
      if(visited[cell.x][cell.y]) continue;
      visited[cell.x][cell.y] = true;
      var randInts = window.crypto.getRandomValues(new Uint8Array(2));
      if(cell.x > 1 ) {
        if(!visited[cell.x-1][cell.y]){
          cellStack.push({x: cell.x - 1, y: cell.y});
        }
        var upperHole = (randInts[0] >= 128) ? true : false;
        this.cells[cell.x][cell.y].up = upperHole;
      }
      if(cell.y > 1 ) {
        if(!visited[cell.x][cell.y-1]){
          cellStack.push({x: cell.x, y: cell.y - 1});
        }
        if(upperHole) {
          this.cells[cell.x][cell.y].left = (randInts[1] >= 128) ? true : false;
        }
      }
    }
    console.log(this.cells);
    console.log('finished generating level');
    this.addWallsToScene(scene);
  }

  Level.prototype.addWallsToScene = function(scene) {
    var wallSize = 50;
    var boxGeometry = new THREE.BoxGeometry(wallSize,wallSize,wallSize);
    var boxMaterial =  new THREE.MeshBasicMaterial({color: 0x00ffff});
    for(var i = 1; i < this.cells.length-1; i++) {

        var wall1 = new THREE.Mesh(boxGeometry, boxMaterial);
        wall1.position.set(2*i*wallSize, wallSize, 0);
        wall1.name = 'wall';
        this.walls.push(wall1);
        scene.add(wall1);

        var wall2 = new THREE.Mesh(boxGeometry, boxMaterial);
        wall2.position.set(((2*i+1)*wallSize), wallSize, 0);
        wall2.name = 'wall';
        this.walls.push(wall2);
        scene.add(wall2);

        var wall3 = new THREE.Mesh(boxGeometry, boxMaterial);
        wall3.position.set(wallSize, 2*i*wallSize, 0);
        wall3.name = 'wall';
        this.walls.push(wall3);
        scene.add(wall3);

        var wall4 = new THREE.Mesh(boxGeometry, boxMaterial);
        wall4.position.set(wallSize, (2*i+1)*wallSize, 0);
        wall4.name = 'wall';
        this.walls.push(wall4);
        scene.add(wall4);

        var wall5 = new THREE.Mesh(boxGeometry, boxMaterial);
        wall5.position.set(2*i*wallSize, (2*this.cells.length-2)*wallSize, 0);
        wall5.name = 'wall';
        this.walls.push(wall5);
        scene.add(wall5);

        var wall6 = new THREE.Mesh(boxGeometry, boxMaterial);
        wall6.position.set(((2*i+1)*wallSize), (2*this.cells.length-2)*wallSize, 0);
        wall6.name = 'wall';
        this.walls.push(wall6);
        scene.add(wall6);

        var wall7 = new THREE.Mesh(boxGeometry, boxMaterial);
        wall7.position.set((2*this.cells.length-2)*wallSize, 2*i*wallSize, 0);
        wall7.name = 'wall';
        this.walls.push(wall7);
        scene.add(wall7);

        var wall8 = new THREE.Mesh(boxGeometry, boxMaterial);
        wall8.position.set((2*this.cells.length-2)*wallSize, (2*i+1)*wallSize, 0);
        wall8.name = 'wall';
        this.walls.push(wall8);
        scene.add(wall8);

    }
    console.log(this.cells);
    for(var i = 0; i < this.cells.length; i++) {
      for(var j = 0; j < this.cells.length; j++) {
        if(this.cells[i][j].up) {
          //console.log('Adding up wall');
          var wall = new THREE.Mesh(boxGeometry, boxMaterial);
          wall.position.set((2*i+1)*wallSize, 2*j*wallSize, 0);
          wall.name = 'wall';
          this.walls.push(wall);
          scene.add(wall);
        }
        if(this.cells[i][j].left) {
          //console.log('Adding left wall');
          var wall = new THREE.Mesh(boxGeometry, boxMaterial);
          wall.position.set((2*i*wallSize), (2*j+1)*wallSize, 0);
          wall.name = 'wall';
          this.walls.push(wall);
          scene.add(wall);
        }
        if(this.cells[i][j].up && this.cells[i][j].left) {
          var wall = new THREE.Mesh(boxGeometry, boxMaterial);
          wall.position.set((2*i*wallSize), (2*j)*wallSize, 0);
          wall.name = 'wall';
          this.walls.push(wall);
          scene.add(wall);
        }
      }
    }
    console.log(this.walls);
  }

  return Level;
});
