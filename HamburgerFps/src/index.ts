import * as BABYLON from 'babylonjs';
import { WallCorner } from './wallCorner';
import { Wall } from './wall';
import { Wall2 } from './wall2';
import { StandardMaterial, Texture } from 'babylonjs';

//decalrations
declare function require(name: string);

const wallHeight = 2;
const wallThickness = wallHeight / 5;
const gap = 0.001;

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



    // Add and manipulate meshes in the scene
    // var sphere = BABYLON.MeshBuilder.CreateBox("sphere", { width: 2 }, this.scene);

    var ground = BABYLON.Mesh.CreateGround("ground", 500, 500, 2, this.scene);
    ground.checkCollisions = true;
    ground.position.y = -0.01;



    //только против часовой стрелки рисовать иначе нормаль для внутренних поверхностей смотрит внутрь фигуры
    this.addHomeRoom();
    this.addLandingRoom();



    const aboutRoomTextureYrl = require("./images/brick2.jpg");

    const aboutUsFrontWall = this.createWallMesh(
      [
        -12.0, +8.0,
        -12.0, +4.0,
        +12.0, +4.0,
        +12.0, +8.0,
      ],
      aboutRoomTextureYrl
    );

    const aboutUsBackLeftWall = this.createWallMesh(
      [
        -15.0 + 1.5 * wallThickness, +8.0,
        -15.0 + 1.5 * wallThickness, +0.0,
        -1.0, +0.0
      ],
      aboutRoomTextureYrl
    );

    const aboutUsBackRightWall = this.createWallMesh(
      [
        +1.0, +0.0,
        +14.0, +0.0,
        +14.0, +8.0,
      ],
      aboutRoomTextureYrl
    );

    const newOrigin = new BABYLON.Vector3(0, 0, 21 + 2 * wallThickness + 2);

    aboutUsFrontWall.position.copyFrom(newOrigin);
    aboutUsBackLeftWall.position.copyFrom(newOrigin);
    aboutUsBackRightWall.position.copyFrom(newOrigin);

    ((aboutUsFrontWall.material as StandardMaterial).diffuseTexture as Texture).vOffset = 0.09;
    ((aboutUsBackLeftWall.material as StandardMaterial).diffuseTexture as Texture).vOffset = 0.09;
    ((aboutUsBackRightWall.material as StandardMaterial).diffuseTexture as Texture).vOffset = 0.09;


    const floor = this.createFloor(40, 20, require("./images/marble_red2.jpg"));
    floor.position.z += 20 / 2 + 23 + wallThickness;

    const texture = ((floor.material as StandardMaterial).diffuseTexture as Texture);
    texture.uScale = 20;
    texture.vScale = 10;

    const ceiling = this.createCeiling(40, 20, require("./images/laminate_wood.jpg"));
    ceiling.position.z += 20 / 2 + 23 + wallThickness;
    ceiling.position.y += wallHeight;

    const ceilingTexture = ((ceiling.material as StandardMaterial).diffuseTexture as Texture);
    ceilingTexture.uScale = 10;
    ceilingTexture.vScale = 5;

    this.scene.addMesh(floor);
    this.scene.addMesh(ceiling);

    this.initPlayer();
  }

  attachTexture = (mesh: BABYLON.Mesh, url: string) => {
    const mat = new BABYLON.StandardMaterial("material", this.scene);

    mat.diffuseTexture = new BABYLON.Texture(url, this.scene);
    mat.diffuseTexture.hasAlpha = false;
    mat.backFaceCulling = false;
    mat.emissiveColor = new BABYLON.Color3(1, 1, 1);
    mat.cameraExposure = 1;
    mat.specularPower = 1;
    mat.disableLighting = true;
    mesh.material = mat;
  }

  createWallMesh = (cornerData: number[], textureUrl: string): BABYLON.Mesh => {
    const wall = new Wall2(cornerData);

    const wallParams = {
      wallHeight: wallHeight,
      wallThickness: wallThickness
    };

    const wallMesh = wall.createMesh(wallParams);
    this.attachTexture(wallMesh, textureUrl);

    return wallMesh;
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

  createFloor = (floorWidth: number, floorHeight, textureUrl: string): BABYLON.Mesh => {
    const sourcePlane = new BABYLON.Plane(0, -1, 0, 0);
    sourcePlane.normalize();

    const options = {
      width: floorWidth,
      height: floorHeight,
      sourcePlane: sourcePlane
    };

    const floor = BABYLON.MeshBuilder.CreatePlane("floor", options, this.scene);
    floor.position.y = 0.01;
    this.attachTexture(floor, textureUrl);
    return floor;
  }

  createCeiling = (ceilingWidth: number, ceilingHeight, textureUrl: string): BABYLON.Mesh => {
    const sourcePlane = new BABYLON.Plane(0, 1, 0, 0);
    sourcePlane.normalize();

    const options = {
      width: ceilingWidth,
      height: ceilingHeight,
      sourcePlane: sourcePlane
    };

    const ceiling = BABYLON.MeshBuilder.CreatePlane("floor", options, this.scene);
    ceiling.position.y = 0.01;
    this.attachTexture(ceiling, textureUrl);
    return ceiling;
  }

  addHomeRoom = (): void => {
    const homepageRoomMesh = this.createWallMesh(
      [
        -1.0, +3.0,
        -3.0, +3.0,
        -4.0, +2.0,
        -4.0, -2.0,
        //
        +4.0, -2.0,
        +4.0, +2.0,
        +3.0, +3.0,
        +1.0, +3.0,
      ],
      require("./images/papers3.jpg")
    );
    // this.scene.addMesh(homepageRoomMesh);

    const floorWidth = 9;
    const floorHeight = 6;

    const floor = this.createFloor(floorWidth, 6, require("./images/red_wood_floor.jpg"));
    floor.position.z += wallThickness;

    const floorTexture = ((floor.material as StandardMaterial).diffuseTexture as Texture);
    floorTexture.uScale = floorWidth;
    floorTexture.vScale = floorHeight;


    const ceiling = this.createCeiling(floorWidth, 6, require("./images/wood4.jpg"));
    ceiling.position.y += wallHeight;
    ceiling.position.z += wallThickness;

    const ceilingTexture = ((ceiling.material as StandardMaterial).diffuseTexture as Texture);
    ceilingTexture.uScale = floorWidth / 2;
    ceilingTexture.vScale = floorHeight / 2;


    //внешний контур дома
    const homepageOuterRoomMesh = this.createWallMesh(
      [
        -1.0, +4.0 + wallThickness + gap,
        -1.0, +3.0 + wallThickness + gap,
        -5.0, +3.0 + wallThickness + gap,
        -5.0, -4.0,
        //
        +5.0, -4.0,
        +5.0, +3.0,
        +1.0, +3.0 + wallThickness + gap,
        +1.0, +4.0 + wallThickness + gap,
      ],
      require("./images/brick3.jpg")
    );

    this.scene.addMesh(floor);
    this.scene.addMesh(ceiling);

    var light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 0, 0), this.scene);
    light1.radius = 10;
    light1.intensity = 1;

    var light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(0, 1.85, 0), this.scene);
    light2.radius = 10;
    light2.intensity = 0.1;
  }

  addLandingRoom = (): void => {
    const landingLength = 20;
    const landingWidth = 10;

    const landingWallMatUrl: string = require("./images/night_sky.jpg");

    let landingLeftWallMesh = this.createWallMesh(
      [
        -landingWidth / 2, landingLength,
        -landingWidth / 2, + 0.0,
      ],
      landingWallMatUrl
    );

    let landingRightWallMesh = this.createWallMesh(
      [
        landingWidth / 2, +0.0,
        landingWidth / 2, landingLength
      ],
      landingWallMatUrl
    );

    const newOrigin = new BABYLON.Vector3(0, 0, 3 + wallThickness);

    landingLeftWallMesh.position.copyFrom(newOrigin);
    landingRightWallMesh.position.copyFrom(newOrigin);

    // this.scene.addMesh(landingLeftWallMesh);
    // this.scene.addMesh(landingRightWallMesh);

    const floor = this.createFloor(2, landingLength, require("./images/asphalt.jpg"));
    ((floor.material as StandardMaterial).diffuseTexture as Texture).vScale = 10;
    floor.position.z += landingLength / 2 + 3 + wallThickness;
    this.scene.addMesh(floor);

    const grass = this.createFloor(landingWidth, landingLength, require("./images/ground.jpg"));
    ((grass.material as StandardMaterial).diffuseTexture as Texture).uScale = landingWidth / 2 / 2;
    ((grass.material as StandardMaterial).diffuseTexture as Texture).vScale = landingLength / 2;
    grass.position.z += landingLength / 2 + 3 + wallThickness;
    grass.position.y = -0.001;
    this.scene.addMesh(grass);

    const cosmos = this.createCeiling(landingWidth, landingLength, require("./images/night_sky.jpg"));
    ((cosmos.material as StandardMaterial).diffuseTexture as Texture).uScale = landingWidth / 2 / 6;
    ((cosmos.material as StandardMaterial).diffuseTexture as Texture).vScale = landingLength / 6;
    cosmos.position.z += landingLength / 2 + 3 + wallThickness;
    cosmos.position.y = wallHeight;
    this.scene.addMesh(cosmos);


  }
}

const app = new Application();