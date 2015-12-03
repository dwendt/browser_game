/*
 *  Level object. TODO: decide how we want to make levels infinite/random
 */

define(['three', 'assets'], function(THREE, Assets) {

  // Private static.
  // Grass texture for the default backing. 
  var grassMap = Assets.grassMap;
  grassMap.wrapS = grassMap.wrapT = THREE.RepeatWrapping;
  grassMap.repeat.set( 40, 40 ); // Larger values mean tinier texture.

  var wallSize = 250;

  // Properties for the backing.
  var backGeo = new THREE.PlaneGeometry(30000, 30000, 0); // TODO: planegeometry or sprite better?
  var backMat = new THREE.MeshLambertMaterial( { map: grassMap, color: 0xffffff, shading: THREE.FlatShading, overdraw: 0.5 } );
  var wallMap = Assets.wallMap;

  var wallGeo = new THREE.BoxGeometry(wallSize, wallSize, 3*wallSize);
  var wallMat =  new THREE.MeshBasicMaterial({map: wallMap, color: 0xffffff, overdraw: .5});
  var wallSpriteMat = new THREE.SpriteMaterial( { map: wallMap, color: 0xffffff, fog: false, sizeAttenuation: false, size: 32} );
  var wallSprite = new THREE.Sprite(wallSpriteMat);

  // Constructor.
  function Level(curLevel, onLoadCB) {
    this.curLevel = curLevel;
    console.log(this.curLevel);
    this.rendInitted = false;
    this.cells = [];
    this.walls = [];
    this.walls2 = new Array();
    this.wallSize = wallSize;
    this.numCells = Math.floor(Math.random()*10 + 5);
    this.zoomLevels = [2000, 4000, 8000, 16000, 32000];
    

    if (onLoadCB === undefined) {
      onLoadCB = function(){}; // if no callback do nothing
    }
    this.onLoadCallback = onLoadCB;
  };

  // Instanced destructor...
  Level.prototype.onRemove = function() {
    // ....non-scene related removal stuff here? 
  };

  Level.prototype.destroyLevel = function() {

    if(this.newBack) {
      this.scene.remove(this.newBack);
    }

    if(this.innerBack) {
      this.scene.remove(this.innerBack);
    }

    for(var i = this.walls2.length - 1; i >= 0; i--) {
      this.scene.remove(this.walls2[i]);
      this.walls2.splice(i,1);
    }
  }

  // For when it's first being added to a scene.
  Level.prototype.rendInit = function(scene) {
    this.scene = scene;
    console.log("creating backing...");
    console.log(this.curLevel);
    if(this.curLevel == 1) {
      this.newBack = new THREE.Mesh( backGeo, backMat );
      this.newBack.position.x = 0;
      this.newBack.position.y = 0;
      this.newBack.position.z = 0;
      this.newBack.name = "backing"; // TODO: unique name GUIDs !!IMPORTANT!! !!HOW DO WE DO THIS!!
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
      console.log('adding newBack');
      scene.add(this.newBack);
    }

    
    var innerBackGeo = new THREE.PlaneGeometry( 2 * this.numCells * this.wallSize, 2 * this.numCells * this.wallSize, 1);
    
    var innerBackMap = Assets.innerBackMap;
    if(this.curLevel <= 3) {
      innerBackMap = Assets.woodFloor;
    }

    innerBackMap.wrapS = innerBackMap.wrapT = THREE.RepeatWrapping;
    innerBackMap.repeat.set( this.numCells, this.numCells ); 

    var innerBackMat = new THREE.MeshLambertMaterial( { map: innerBackMap, color: 0xffffff, shading: THREE.FlatShading, overdraw: 0.5 } );
    this.innerBack = new THREE.Mesh( innerBackGeo, innerBackMat );

    this.innerBack.position.set(((this.numCells-1)*this.wallSize)/2, ((this.numCells-1)*this.wallSize)/2 ,1);

    console.log(this.innerBack);
    console.log(this.wallSize);
    scene.add(this.innerBack);
    
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

    if(this.curLevel > 2) {
      wallMap = Assets.darkBricks;
    }

    for(var i = 0; i < this.numCells; i++) {
      this.cells[i] = [];
      visited[i] = [];
      for(var j = 0; j < this.numCells; j++) {
        this.cells[i][j] = {up:true, left:true, down:true, right:true, filled:false};
        visited[i][j] = false;
      }
    }

    this.carve(0,0,visited,scene);

    // var startX = this.cells.length - 2;
    // var startY = this.cells.length - 2;

    // var cell = {x: startX, y: startY};
    // //visited[startX][startY] = true;
    // var cellStack = new Array();
    // cellStack.push(cell);

    // while(cellStack.length > 0) {
    //   cell = cellStack.pop();
    //   if(visited[cell.x][cell.y]) continue;
    //   visited[cell.x][cell.y] = true;
    //   var randInts = window.crypto.getRandomValues(new Uint8Array(2));
    //   if(cell.x > 1 ) {
    //     if(!visited[cell.x-1][cell.y]){
    //       cellStack.push({x: cell.x - 1, y: cell.y});
    //     }
    //     var upperHole = (randInts[0] <= 50) ? true : false;
    //     this.cells[cell.x][cell.y].up = upperHole;
    //   }
    //   if(cell.y > 1 ) {
    //     if(!visited[cell.x][cell.y-1]){
    //       cellStack.push({x: cell.x, y: cell.y - 1});
    //     }
    //     if(upperHole) {
    //       this.cells[cell.x][cell.y].left = (randInts[1] <= 50) ? true : false;
    //     }
    //   }
    // }
    console.log('finished generating level');
    this.addWallsToScene(scene);
  }

  Level.prototype.carve = function(cx, cy, visited, scene) {
    

    var stack = new Array();
    stack.push({x:cx,y:cy});

    while(stack.length > 0){
      var cur = stack.pop();
      cx = cur.x;
      cy = cur.y;

      var dir = [{x:-1,y:0},{x:0,y:-1},{x:1,y:0},{x:0,y:1}];
      dir = shuffle(dir);

      for(var i = 0; i < dir.length; i++) {
        var nx = cx + dir[i].x;
        var ny = cy + dir[i].y;

        //console.log('new location',nx,ny);

        if(ny >= 0 && ny <= this.cells.length - 1 && nx >= 0 && nx <= this.cells.length - 1 && !visited[nx][ny]) {
            if(dir[i].x == -1) {
              this.cells[cx][cy].left = false;
              this.cells[nx][ny].right = false;
            }
            if(dir[i].x == 1) {
              this.cells[cx][cy].right = false;
              this.cells[nx][ny].left = false;
            }
            if(dir[i].y == 1) {
              this.cells[cx][cy].up = false;
              this.cells[nx][ny].down = false;
            }
            if(dir[i].y == -1) {
              this.cells[cx][cy].down = false;
              this.cells[nx][ny].up = false;
            }
            visited[nx][ny] = true;
            stack.push({x:nx,y:ny});
        }
      }
    }

    this.addWallsToScene(scene);

  }

  function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

  Level.prototype.newWall = function(x, y, z) {
    /*
    var wallCpy =  new THREE.Sprite(wallSpriteMat);
    wallCpy.name = 'wall';
    wallCpy.scale = 40;
    wallCpy.position.set(x,y,1000);
    this.walls2.push(wallCpy);
    return;
    */
    var wallSize = this.wallSize;
    var wall = new THREE.Mesh(wallGeo, wallMat);

    wall.position.set(x,y,z);
    wall.name = 'wall';
    this.walls2.push(wall);
  }


  Level.prototype.addWallsToScene = function(scene) {
    var wallSize = this.wallSize;
    var mergedGeo = new THREE.Geometry();
    var offset = wallSize*this.cells.length/2;
    this.offset = offset;
    for(var i = 0; i < this.cells.length; i++) {
        this.walls.push(this.newWall(2*i*wallSize - offset, -wallSize - offset, 0));
        this.walls.push(this.newWall(((2*i+1)*wallSize) - offset, -wallSize - offset, 0));
        this.walls.push(this.newWall(-wallSize - offset, 2*i*wallSize - offset, 0));
        this.walls.push(this.newWall(-wallSize - offset, (2*i+1)*wallSize - offset, 0));
        this.walls.push(this.newWall(2*i*wallSize - offset, (2*this.cells.length-1)*wallSize - offset, 0));
        this.walls.push(this.newWall(((2*i+1)*wallSize) - offset, (2*this.cells.length-1)*wallSize - offset, 0));
        this.walls.push(this.newWall((2*this.cells.length-1)*wallSize - offset, 2*i*wallSize - offset, 0));
        this.walls.push(this.newWall((2*this.cells.length-1)*wallSize - offset, (2*i+1)*wallSize - offset, 0));


    }
    for(var i = 0; i < this.cells.length; i++) {
      for(var j = 0; j < this.cells.length; j++) {
        var numWalls = 0;
        if(this.cells[i][j].up) {
          numWalls++;

          this.walls.push(this.newWall((2*i)*wallSize - offset, (2*j+1)*wallSize - offset, 0));

        }
        if(this.cells[i][j].left) {
          numWalls++;

          this.walls.push(this.newWall((2*i-1)*wallSize - offset, (2*j)*wallSize - offset, 0));

        }
        if(this.cells[i][j].right) {
          numWalls++;
          
          this.walls.push(this.newWall((2*i+1)*wallSize - offset, 2*j*wallSize - offset, 0));
    
        }
        if(this.cells[i][j].down) {
          numWalls++;

          this.walls.push(this.newWall((2*i*wallSize) - offset, (2*j-1)*wallSize - offset, 0));

        }

        if(this.cells[i][j].up && this.cells[i][j].left) {
          
          this.walls.push(this.newWall((2*i-1)*wallSize - offset, (2*j+1)*wallSize - offset, 0));
          
        }

        if(this.cells[i][j].up && this.cells[i][j].right) {
          this.walls.push(this.newWall((2*i+1)*wallSize - offset, (2*j+1)*wallSize - offset, 0));
          
        }

        if(this.cells[i][j].right && this.cells[i][j].down) {
          this.walls.push(this.newWall((2*i+1)*wallSize - offset, (2*j-1)*wallSize - offset, 0));
          
        }
        
        if(this.cells[i][j].left && this.cells[i][j].down) {
          this.walls.push(this.newWall((2*i-1)*wallSize - offset, (2*j-1)*wallSize - offset, 0));
          
        }

        if(numWalls >= 3){
          this.cells[i][j].filled = true;
          this.walls.push(this.newWall((2*i*wallSize) - offset, 2*j*wallSize - offset, 0));
        }
      }
    }

    console.log("wall count:", this.walls2.length);
    for(var i = 0; i < this.walls2.length; i++) {
      this.walls2[i].updateMatrix();
      //scene.add(this.walls2[i]);

      //THREE.GeometryUtils.merge(mergedGeo, this.walls2[i].geometry);
      mergedGeo.merge(this.walls2[i].geometry, this.walls2[i].matrix);
    }


    var boxMaterial =  new THREE.MeshBasicMaterial({map: wallMap, color: 0xffffff});


    mergedGeo.mergeVertices();
    var buffGeo = new THREE.BufferGeometry().fromGeometry( mergedGeo );
    var mesh = new THREE.Mesh(buffGeo, boxMaterial);

    mesh.name = 'wall';
    scene.add(mesh);
    this.finishedLoading = true;
    this.onLoadCallback();
  }

  // For placing stuff randomly.
  Level.prototype.getOpenSpot = function() {

    // Get a random cell entry
    var newX = Math.floor(Math.random() * this.numCells);
    var newY = Math.floor(Math.random() * this.numCells);
    
    while(this.cells[newX][newY].filled) {
      newX = Math.floor(Math.random()*this.numCells);
      newY = Math.floor(Math.random()*this.numCells);
    }

    // Account for cell sizes.
    newX = newX*2*this.wallSize;
    newY = newY*2*this.wallSize;

    // "offset" is pretty much radius of the level.
    newX = newX - this.offset;
    newY = newY - this.offset;

    return [newX, newY];
  }

  return Level;
});
