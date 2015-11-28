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
  var backGeo = new THREE.PlaneGeometry(30000, 30000, 1); // TODO: planegeometry or sprite better?
  var backMat = new THREE.MeshLambertMaterial( { map: grassMap, color: 0xffffff, shading: THREE.FlatShading, overdraw: 0.5 } );
  var wallMap = THREE.ImageUtils.loadTexture( "js/assets/wall.jpg" );


  // Constructor.
  function Level() {
    this.rendInitted = false;
    this.cells = [];
    this.walls = [];
    this.walls2 = new Array();
    this.numCells = 10;
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
        this.cells[i][j] = {up:true, left:true, down:true, right:true};
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
    var wallSize = 100;
    var boxGeometry = new THREE.BoxGeometry(wallSize, wallSize, 3*wallSize);
    var boxMaterial =  new THREE.MeshBasicMaterial({map: wallMap, color: 0xffffff});
    var wall = new THREE.Mesh(boxGeometry, boxMaterial);

    wall.position.set(x,y,z);
    wall.name = 'wall';
    this.walls2.push(wall);
  }


  Level.prototype.addWallsToScene = function(scene) {
    var mergedGeo = new THREE.Geometry();
    var wallSize = 100;
    var offset = wallSize*this.cells.length/2;
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
          this.walls.push(this.newWall((2*i*wallSize) - offset, 2*j*wallSize - offset, 0));
        }
      }
    }

    for(var i = 0; i < this.walls2.length; i++) {
      this.walls2[i].updateMatrix();
      scene.add(this.walls2[i]);
      //mergedGeo.merge(this.walls2[i].geometry, this.walls2.matrix, 0);
    }

    var boxMaterial =  new THREE.MeshBasicMaterial({map: wallMap, color: 0xffffff});
    //mergedGeo.mergeVertices();
    var mesh = new THREE.Mesh(mergedGeo, boxMaterial);
    mesh.name = 'wall';
    scene.add(mesh);
  }

  return Level;
});
