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

    // this.camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 10, new BABYLON.Vector3(0, 0, 0), this.scene);
    // this.camera.attachControl(this.canvas, true);

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

    var ground = BABYLON.Mesh.CreateGround("ground", 500, 500, 2, this.scene);
    ground.checkCollisions = true;


    const wallHeight = 2;
    const wallThickness = wallHeight / 5;
    const wallParams = { wallHeight: wallHeight, wallThickness: wallThickness }



    //только против часовой стрелки рисовать иначе нормаль для внутренних поверхностей смотрит внутрь фигуры
    const simpleRoomData = [
      -1.0, +3.0,
      -3.0, +3.0,
      -4.0, +2.0,
      -4.0, -2.0,
      //
      +4.0, -2.0,
      +4.0, +2.0,
      +3.0, +3.0,
      +1.0, +3.0,
    ];

    let homepageRoom = new Wall2(simpleRoomData);
    let homepageRoomMesh = homepageRoom.createMesh(wallParams);
    this.attachTexture(homepageRoomMesh, require("./images/papers.jpg"));
    this.scene.addMesh(homepageRoomMesh);


    const landingLeftWallData = [
      -1.0, +10.0,
      -1.0, +0.0,
    ];

    let landingLeftWall = new Wall2(landingLeftWallData);
    let landingLeftWallMesh = landingLeftWall.createMesh(wallParams);

    this.attachTexture(landingLeftWallMesh, require("./images/sky.jpg"));
    landingLeftWallMesh.position.z = 3 + wallThickness;
    this.scene.addMesh(landingLeftWallMesh);

    const landingRightWallData = [
      +1.0, +0.0,
      +1.0, +10.0
    ];

    let landingRightWall = new Wall2(landingRightWallData);
    let landingRightWallMesh = landingRightWall.createMesh(wallParams);

    this.attachTexture(landingRightWallMesh, require("./images/sky.jpg"));
    landingRightWallMesh.position.z = 3 + wallThickness;
    this.scene.addMesh(landingRightWallMesh);





    this.scene.addMesh(homepageRoomMesh);

    this.initPlayer();
  }

  attachTexture = (mesh: BABYLON.Mesh, url: string) => {
    var mat = new BABYLON.StandardMaterial("material", this.scene);

    mat.diffuseTexture = new BABYLON.Texture(url, this.scene);
    mat.diffuseTexture.hasAlpha = false;
    mat.backFaceCulling = false;

    mesh.material = mat;
  }


  initPlayer = (): void => {
    const spawnPoint = new BABYLON.Vector3(0, 1, 0);
    this.playerCamera = new BABYLON.FreeCamera("camera", spawnPoint, this.scene);

    this.playerCamera.attachControl(this.canvas);
    this.playerCamera.ellipsoid = new BABYLON.Vector3(0.5, 0.5, 0.5);

    this.playerCamera.checkCollisions = true;
    this.playerCamera.applyGravity = true;

    this.playerCamera.keysUp = [87]; // W
    this.playerCamera.keysDown = [83]; // S
    this.playerCamera.keysLeft = [65]; // A
    this.playerCamera.keysRight = [68]; // D

    this.playerCamera.speed = 1;
    this.playerCamera.inertia = 0.5;
    this.playerCamera.angularSensibility = 500;
  }
}

const app = new Application();