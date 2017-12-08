import * as BABYLON from 'babylonjs';
import { WallCorner } from './wallCorner';
import { Wall } from './wall';
import { Wall2 } from './wall2';

//decalrations
declare function require(name: string);

class Application {
  private canvas: HTMLCanvasElement;
  private engine: BABYLON.Engine;
  private scene: BABYLON.Scene;
  private camera: BABYLON.ArcRotateCamera;

  private playerCamera: BABYLON.FreeCamera;

  constructor() {
    this.initEngine();
    this.initAssets();
    this.initScene();
    this.render();
    this.bindEvents();
    this.run();
  }

  render = () => {
    this.scene.render();
    const fpsLabel = document.getElementById("fpsLabel");
    fpsLabel.innerHTML = this.engine.getFps().toFixed() + " fps";
  }

  run = (): void => {
    this.engine.runRenderLoop(this.render);
  }

  initEngine = (): void => {
    this.canvas = document.getElementById('glCanvas') as HTMLCanvasElement;
    this.engine = new BABYLON.Engine(this.canvas, true);
    this.scene = new BABYLON.Scene(this.engine);

    this.canvas.focus();

    this.camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 10, new BABYLON.Vector3(0, 0, 0), this.scene);
    this.camera.attachControl(this.canvas, true);

  }

  initAssets = (): void => {
    // let loader = new BABYLON.AssetsManager(this.scene);
    // let assets = {};

    // let meshTask = loader.addMeshTask("gun", "", "./assets/", "gun.babylon");
    // meshTask.onSuccess = (task: BABYLON.MeshAssetTask) => {
    //   _this._initMesh(task);
    // };
  }



  bindEvents = (): void => {
  }

  initScene = (): void => {
    // Add lights to the scene
    var light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), this.scene);
    var light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(0, 1, -1), this.scene);


    // Add and manipulate meshes in the scene
    // var sphere = BABYLON.MeshBuilder.CreateBox("sphere", { width: 2 }, this.scene);

    // The ground
    // var ground = BABYLON.Mesh.CreateGround("ground", 500, 500, 2, this.scene);
    // ground.checkCollisions = true;


    var buildFromPlan = (walls: Wall[], ply: number, height: Number, scene: BABYLON.Scene) => {
      var lineNormal;
      var outerData = [];
      var angle = 0;
      var direction = 0;

      var line = BABYLON.Vector3.Zero();
      walls[1].corner.subtractToRef(walls[0].corner, line);
      var nextLine = BABYLON.Vector3.Zero();
      walls[2].corner.subtractToRef(walls[1].corner, nextLine);
      var nbWalls = walls.length;

      for (var w = 0; w <= nbWalls; w++) {
        angle = Math.acos(BABYLON.Vector3.Dot(line, nextLine) / (line.length() * nextLine.length()));
        direction = BABYLON.Vector3.Cross(nextLine, line).normalize().y;
        lineNormal = new BABYLON.Vector3(line.z, 0, -1 * line.x).normalize();
        line.normalize();
        outerData[(w + 1) % nbWalls] = walls[(w + 1) % nbWalls].corner.add(lineNormal.scale(ply)).add(line.scale(direction * ply / Math.tan(angle / 2)));
        line = nextLine.clone();
        walls[(w + 3) % nbWalls].corner.subtractToRef(walls[(w + 2) % nbWalls].corner, nextLine);
      }

      var positions = [];
      var indices = [];

      for (let w = 0; w < nbWalls; w++) {
        const wallCorner = walls[w].corner;
        positions.push(wallCorner.x, wallCorner.y, wallCorner.z); // inner corners base
      }

      for (var w = 0; w < nbWalls; w++) {
        const wallOuterData = outerData[w];
        positions.push(wallOuterData.x, wallOuterData.y, wallOuterData.z); // outer corners base
      }

      for (var w = 0; w < nbWalls; w++) {
        indices.push(w, (w + 1) % nbWalls, nbWalls + (w + 1) % nbWalls, w, nbWalls + (w + 1) % nbWalls, w + nbWalls); // base indices
      }

      var currentLength = positions.length;  // inner and outer top corners
      for (var w = 0; w < currentLength / 3; w++) {
        positions.push(positions[3 * w]);
        positions.push(height);
        positions.push(positions[3 * w + 2]);
      }

      currentLength = indices.length;
      for (var i = 0; i < currentLength / 3; i++) {
        indices.push(indices[3 * i + 2] + 2 * nbWalls, indices[3 * i + 1] + 2 * nbWalls, indices[3 * i] + 2 * nbWalls); // top indices
      }

      for (var w = 0; w < nbWalls; w++) {
        indices.push(
          w, w + 2 * nbWalls, (w + 1) % nbWalls + 2 * nbWalls,
          w, (w + 1) % nbWalls + 2 * nbWalls, (w + 1) % nbWalls
        ); // inner wall indices

        indices.push((w + 1) % nbWalls + 3 * nbWalls, w + 3 * nbWalls, w + nbWalls, (w + 1) % nbWalls + nbWalls, (w + 1) % nbWalls + 3 * nbWalls, w + nbWalls); // outer wall indices
      }

      var normals = [];
      var uvs = [];

      BABYLON.VertexData.ComputeNormals(positions, indices, normals);
      // (BABYLON.VertexData as any)._ComputeSides(BABYLON.Mesh.FRONTSIDE, positions, indices, normals, uvs);


      //Create a custom mesh  
      var customMesh = new BABYLON.Mesh("custom", scene);

      //Create a vertexData object
      var vertexData = new BABYLON.VertexData();

      //Assign positions and indices to vertexData
      vertexData.positions = positions;
      vertexData.indices = indices;
      vertexData.normals = normals;
      vertexData.uvs = uvs;

      //Apply vertexData to custom mesh
      vertexData.applyToMesh(customMesh);

      return customMesh;
    }

    const homePageRoomData = [
      -5, 0,
      5, 0,
      5, 6,
      2, 6,
      2, 9,
      // -5, 9
    ];

    const corners = new Array<WallCorner>();

    for (let b = 0; b < homePageRoomData.length / 2; b++) {
      const x = homePageRoomData[2 * b];
      const y = homePageRoomData[2 * b + 1];

      const corner = new WallCorner(x, y);
      corners.push(corner);
    }

    var walls = new Array<Wall>();

    for (let c = 0; c < corners.length; c++) {
      walls.push(new Wall(corners[c]));
    }

    const wallThickness = 0.3;
    const wallHeight = 5;

    // var build = buildFromPlan(walls, wallThickness, wallHeight, this.scene)


    const simpleRoomData = [
      -5, +0,
      +5, +0,
      +5, +5,
      -3, +7,
      // -5, +0,      
    ];

    let wall2 = new Wall2(simpleRoomData);
    let wall2Mesh = wall2.createMesh();

    // let myMaterial = new BABYLON.StandardMaterial("myMaterial", this.scene);

    // myMaterial.diffuseTexture = new BABYLON.Texture(require("./images/brick.jpg"), this.scene);
    // wall2Mesh.material = myMaterial;

    var mat = new BABYLON.StandardMaterial("dog", this.scene);
    mat.diffuseTexture = new BABYLON.Texture(require("./images/papers.jpg"), this.scene);
    mat.diffuseTexture.hasAlpha = false;
    mat.backFaceCulling = false;

    var myMaterial3 = new BABYLON.StandardMaterial("myMaterial", this.scene);
    
    myMaterial3.diffuseColor = new BABYLON.Color3(0, 0, 1);
    // myMaterial3.specularColor = new BABYLON.Color3(0.5, 0.6, 0.87);
    // myMaterial3.emissiveColor = new BABYLON.Color3(1, 1, 1);
    // myMaterial3.ambientColor = new BABYLON.Color3(0.23, 0.98, 0.53);
    

    wall2Mesh.material = mat;

    this.scene.addMesh(wall2Mesh);

    this.initPlayer();
  }

  initPlayer = (): void => {
    const spawnPoint = new BABYLON.Vector3(0, 2, -20);
    this.playerCamera = new BABYLON.FreeCamera("camera", spawnPoint, this.scene);

    // this.playerCamera.attachControl(this.canvas);
    this.playerCamera.ellipsoid = new BABYLON.Vector3(2, 2, 2);

    this.playerCamera.checkCollisions = true;
    this.playerCamera.applyGravity = true;

    this.playerCamera.keysUp = [87]; // W
    this.playerCamera.keysDown = [83]; // S
    this.playerCamera.keysLeft = [65]; // A
    this.playerCamera.keysRight = [68]; // D

    this.playerCamera.speed = 5;
    this.playerCamera.inertia = 0.4;
    this.playerCamera.angularSensibility = 1100;
  }
}

const app = new Application();