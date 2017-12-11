import * as BABYLON from 'babylonjs';
import { WallCorner } from './wallCorner';
import { Wall } from './wall';
import { Wall2 } from './wall2';
import { StandardMaterial, Texture } from 'babylonjs';

//decalrations
declare function require(name: string);

const wallHeight = 2.5;
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
    // this.scene.enablePhysics();
    this.canvas.focus();
    // this.camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 10, new BABYLON.Vector3(0, 0, 0), this.scene);
    // this.camera.attachControl(this.canvas, true);
  }

  initAssets = (): void => {

  }

  bindEvents = (): void => {
  }

  initPlayer = (): void => {
    const spawnPoint = new BABYLON.Vector3(0, 1.2, 20);
    this.playerCamera = new BABYLON.FreeCamera("camera", spawnPoint, this.scene);

    this.playerCamera.attachControl(this.canvas);
    this.playerCamera.ellipsoid = new BABYLON.Vector3(0.9, 0.6, 1.2);

    this.playerCamera.checkCollisions = true;
    this.playerCamera.applyGravity = true;

    this.playerCamera.keysUp = [87]; // W
    this.playerCamera.keysDown = [83]; // S
    this.playerCamera.keysLeft = [65]; // A
    this.playerCamera.keysRight = [68]; // D

    this.playerCamera.speed = 1.5;
    this.playerCamera.inertia = 0.5;
    this.playerCamera.angularSensibility = 500;
  }


  initScene = (): void => {
    const ground = BABYLON.Mesh.CreateGround("ground", 500, 500, 2, this.scene);
    ground.checkCollisions = true;
    ground.position.y = -0.01;

    this.addHomeRoom();
    this.addLandingRoom();
    this.addAboutRoom();



    this.initPlayer();
  }

  attachTexture = (url: string, params: { uOffset?: number, vOffset?: number } = undefined): BABYLON.StandardMaterial => {
    if (params == undefined)
      params = { uOffset: 0, vOffset: 0 };

    const texture = new BABYLON.Texture(url, this.scene);
    texture.uOffset = params.uOffset | 0;
    texture.vOffset = params.vOffset | 0;

    const material = new BABYLON.StandardMaterial("material", this.scene);

    material.diffuseTexture = texture
    material.diffuseTexture.hasAlpha = false;
    material.backFaceCulling = true;
    material.emissiveColor = new BABYLON.Color3(1, 1, 1);
    material.disableLighting = true;

    return material;
  }

  createWallMesh = (cornerData: number[]): BABYLON.Mesh => {
    const wall = new Wall2(cornerData);

    const wallParams = {
      wallHeight: wallHeight,
      wallThickness: wallThickness
    };

    const wallMesh = wall.createMesh(wallParams);

    wallMesh.physicsImpostor = new BABYLON.PhysicsImpostor(wallMesh, BABYLON.PhysicsImpostor.MeshImpostor, { mass: 0, friction: 0, restitution: 0.3 });
    wallMesh.checkCollisions = true;

    return wallMesh;
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
    floor.material = this.attachTexture(textureUrl);

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
    ceiling.material = this.attachTexture(textureUrl);
    return ceiling;
  }

  addHomeRoom = (): void => {
    const floorWidth = 9;
    const floorHeight = 6 + 6 * wallThickness;

    const homepageRoomMesh = this.createWallMesh(
      [
        -1.0, +3.0,
        -3.0, +3.0,
        -4.0, +2.0,
        -4.0, -4.0,
        //
        +4.0, -4.0,
        +4.0, +2.0,
        +3.0, +3.0,
        +1.0, +3.0,
      ],

    );
    homepageRoomMesh.material = this.attachTexture(require("./images/papers3.jpg"));

    const position = new BABYLON.Vector3(0, 0, -wallThickness);

    const floor = this.createFloor(floorWidth, floorHeight, require("./images/red_wood_floor.jpg"));
    floor.position.copyFrom(position);

    const floorTexture = ((floor.material as StandardMaterial).diffuseTexture as Texture);
    floorTexture.uScale = floorWidth;
    floorTexture.vScale = floorHeight;

    const ceiling = this.createCeiling(floorWidth, floorHeight, require("./images/wood4.jpg"));
    ceiling.position.copyFrom(position);
    ceiling.position.y = wallHeight - 2 * gap;

    const ceilingTexture = ((ceiling.material as StandardMaterial).diffuseTexture as Texture);
    ceilingTexture.uScale = floorWidth / 2;
    ceilingTexture.vScale = floorHeight / 2;

    //внешний контур дома
    const homepageOuterRoomMesh = this.createWallMesh(
      [
        -1.0, +4.0 + wallThickness + gap,
        -1.0, +3.0 + wallThickness + gap,
        -5.0, +3.0 + wallThickness + gap,
        -5.0, -5.0 + wallThickness - gap,
        //
        +5.0, -5.0 + wallThickness - gap,
        +5.0, +3.0 + wallThickness + gap,
        +1.0, +3.0 + wallThickness + gap,
        +1.0, +4.0 + wallThickness + gap,
      ]
    );

    homepageOuterRoomMesh.material = this.attachTexture(require("./images/brick3.jpg"));
  }

  addLandingRoom = (): void => {
    const landingLength = 30;
    const landingWidth = 16;

    const landingRoomOrigin = new BABYLON.Mesh("landingRoomOrigin", this.scene);
    landingRoomOrigin.position = new BABYLON.Vector3(0, 0, -2);


    let landingLeftWallMesh = this.createWallMesh(
      [
        -landingWidth / 2, landingLength,
        -landingWidth / 2, + 0.0,
        -5 - wallThickness, + 0.0,
      ]
    );

    let landingRightWallMesh = this.createWallMesh(
      [
        5 + wallThickness, + 0.0,
        landingWidth / 2, +0.0,
        landingWidth / 2, landingLength
      ]
    );

    const landingWallMaterial = this.attachTexture(require("./images/night_sky.jpg"));
    landingLeftWallMesh.material = landingWallMaterial;
    landingRightWallMesh.material = landingWallMaterial;

    const floor = this.createFloor(2, landingLength, require("./images/asphalt.jpg"));
    const floorTexture = ((floor.material as StandardMaterial).diffuseTexture as Texture);
    floorTexture.vScale = 10;
    floor.position.z = landingLength / 2;
    floor.position.y = - gap;

    const grass = this.createFloor(landingWidth, landingLength, require("./images/ground.jpg"));
    const grassTexture = ((grass.material as StandardMaterial).diffuseTexture as Texture);
    grassTexture.uScale = landingWidth / 2 / 2;
    grassTexture.vScale = landingLength / 2;
    grass.position.z = landingLength / 2;
    grass.position.y = -2 * gap;

    const ceiling = this.createCeiling(landingWidth, landingLength, require("./images/night_sky.jpg"));
    const ceilingMaterial = ((ceiling.material as StandardMaterial).diffuseTexture as Texture);
    ceilingMaterial.uScale = landingWidth / 2 / 2;
    ceilingMaterial.vScale = landingLength / 6;
    ceiling.position.z = landingLength / 2;
    ceiling.position.y = wallHeight;

    landingLeftWallMesh.parent = landingRoomOrigin;
    landingRightWallMesh.parent = landingRoomOrigin;

    floor.parent = landingRoomOrigin;
    grass.parent = landingRoomOrigin;
    ceiling.parent = landingRoomOrigin;
  }

  addAboutRoom = () => {
    const roomWidth = 50;
    const roomHeight = 20;
    const aboutRoomOrigin = new BABYLON.Mesh("aboutRoomOrigin", this.scene);
    aboutRoomOrigin.position = new BABYLON.Vector3(0, 0, 28);

    const aboutUsFrontWall = this.createWallMesh(
      [
        -18.0, +15.0,
        -18.0, +10.0,
        -12.0, +10.0,
        -12.0, +8.0,
        -12.0, +4.0,
        +12.0, +4.0,
        +12.0, +8.0,
      ]
    );

    const aboutUsBackLeftWall = this.createWallMesh(
      [
        -20.0 - wallThickness, +15.0,
        -20.0 - wallThickness, +7.0 + wallThickness,
        -15.0 + 1.5 * wallThickness, +7.0 + wallThickness,
        -15.0 + 1.5 * wallThickness, +1.0 + wallThickness,
        -7.0 - wallThickness, +1.0 + wallThickness,
        -7.0 - wallThickness, +0.0,
        -1.0, +0.0
      ]
    );

    const aboutUsBackRightWall = this.createWallMesh(
      [
        +1.0, +0.0,
        +7.0 + wallThickness, +0.0,
        +7.0 + wallThickness, +1.0 + wallThickness,
        +15.0, +1.0 + wallThickness,
        +15.0, +8.0,
      ]
    );

    const aboutRoomMaterial = this.attachTexture(require("./images/brick2.jpg"), {
      vOffset: 0.09
    });
    aboutUsFrontWall.material = aboutRoomMaterial;
    aboutUsBackLeftWall.material = aboutRoomMaterial;
    aboutUsBackRightWall.material = aboutRoomMaterial;

    const floor = this.createFloor(roomWidth, roomHeight, require("./images/marble_red2.jpg"));
    floor.position.y = -3 * gap;
    floor.position.z = roomHeight / 2 - 1 * wallThickness;;

    const floorTexture = ((floor.material as StandardMaterial).diffuseTexture as Texture);
    floorTexture.uScale = roomWidth / 2;
    floorTexture.vScale = roomHeight / 2;

    const ceiling = this.createCeiling(roomWidth, roomHeight, require("./images/laminate_wood.jpg"));
    ceiling.position.z = roomHeight / 2 - 1 * wallThickness;
    ceiling.position.y = wallHeight - gap;

    const ceilingTexture = ((ceiling.material as StandardMaterial).diffuseTexture as Texture);
    ceilingTexture.uScale = roomWidth / 4;
    ceilingTexture.vScale = roomHeight / 4;

    const ceoPainting = this.addPainting(require("./images/ceo_painting.png"), 2, 1.7);
    ceoPainting.position.y = 1.5;
    ceoPainting.position.z = 3 + wallThickness - gap;

    aboutUsFrontWall.parent = aboutRoomOrigin;
    aboutUsBackLeftWall.parent = aboutRoomOrigin;
    aboutUsBackRightWall.parent = aboutRoomOrigin;

    floor.parent = aboutRoomOrigin;
    ceiling.parent = aboutRoomOrigin;
    ceoPainting.parent = aboutRoomOrigin;
  }

  addPainting = (imageUrl: string, paintingWidth: number, paintingHeight: number): BABYLON.Mesh => {
    const materialPlane = new BABYLON.StandardMaterial("PaintingMaterial", this.scene);
    materialPlane.diffuseTexture = new BABYLON.Texture(imageUrl, this.scene);
    materialPlane.emissiveColor = new BABYLON.Color3(1, 1, 1);
    materialPlane.backFaceCulling = true;
    materialPlane.disableLighting = true;
    materialPlane.diffuseTexture.hasAlpha = true;

    const options = {
      width: paintingWidth,
      height: paintingHeight,
      sideOrientation: BABYLON.Mesh.FRONTSIDE
    };

    const plane = BABYLON.MeshBuilder.CreatePlane("Painting", options, this.scene);
    plane.material = materialPlane;

    return plane;
  }
}

const app = new Application();