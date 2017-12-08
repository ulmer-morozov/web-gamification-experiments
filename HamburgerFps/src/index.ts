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