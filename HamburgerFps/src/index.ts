import * as BABYLON from 'babylonjs';
import { WallCorner } from './wallCorner';
import { Wall } from './wall';
import { Wall2 } from './wall2';
import { StandardMaterial, Texture } from 'babylonjs';
import { Orientation } from './wallOrientation';

//decalrations
declare function require(name: string);

const wallHeight = 3.5;
const wallThickness = wallHeight / 5;
const gap = 0.001;

const defaultWallParams = {
  wallHeight: wallHeight,
  wallThickness: wallThickness
};

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
    this.scene.gravity.y = -0.2;
    // debugger;;
    this.scene.enablePhysics();
    this.canvas.focus();
    // this.camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 10, new BABYLON.Vector3(0, 0, 0), this.scene);
    // this.camera.attachControl(this.canvas, true);
  }

  initAssets = (): void => {

  }

  bindEvents = (): void => {
  }

  initPlayer = (): void => {
    // const spawnPoint = new BABYLON.Vector3(-19.9, 1.6, 55.5);
    const spawnPoint = new BABYLON.Vector3(0, 1.6, 32);
    // const spawnPoint = new BABYLON.Vector3(0, 1.6, -2);
    this.playerCamera = new BABYLON.FreeCamera("camera", spawnPoint, this.scene);

    this.playerCamera.attachControl(this.canvas);
    this.playerCamera.ellipsoid = new BABYLON.Vector3(1.3, 0.8, 1.3);

    this.playerCamera.checkCollisions = true;
    this.playerCamera.applyGravity = true;

    this.playerCamera.keysUp = [87]; // W
    this.playerCamera.keysDown = [83]; // S
    this.playerCamera.keysLeft = [65]; // A
    this.playerCamera.keysRight = [68]; // D

    this.playerCamera.speed = 1.5;
    this.playerCamera.inertia = 0.5;
    this.playerCamera.angularSensibility = 500;

    //for test purpuse
    (document as any).getPlayerPosition = () => {
      console.log("position: " + this.playerCamera.position);
    }
  }


  initScene = (): void => {
    // const ground = BABYLON.Mesh.CreateGround("ground", 500, 500, 2, this.scene);
    // ground.checkCollisions = true;
    // ground.position.y = -0.01;

    this.addHomeRoom();
    this.addLandingRoom();
    this.addAboutRoom();
    this.addFooterRoom();



    this.initPlayer();
  }

  createMaterial = (url: string, params: { uOffset?: number, vOffset?: number } = undefined): BABYLON.StandardMaterial => {
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

  createWallMesh = (cornerData: number[], orientation: Orientation = Orientation.Left, wallParams): BABYLON.Mesh => {
    const wall = new Wall2(cornerData, orientation);

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
    floor.material = this.createMaterial(textureUrl);
    floor.checkCollisions = true;
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
    ceiling.material = this.createMaterial(textureUrl);
    return ceiling;
  }

  addHomeRoom = (): void => {
    const floorWidth = 9;
    const floorHeight = 6 + 6 * wallThickness;

    const homepageRoomMesh = this.createWallMesh(
      [
        -1.5, +3.0,
        -3.0, +3.0,
        -4.0, +2.0,
        -4.0, -4.0,
        //
        +4.0, -4.0,
        +4.0, +2.0,
        +3.0, +3.0,
        +1.5, +3.0,
      ],
      Orientation.Right,
      defaultWallParams
    );
    homepageRoomMesh.material = this.createMaterial(require("./images/papers3.jpg"));

    const position = new BABYLON.Vector3(0, 0, -wallThickness);

    const floor = this.createFloor(floorWidth, floorHeight, require("./images/red_wood_floor.jpg"));
    floor.position.copyFrom(position);
    floor.checkCollisions = false;

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
        -1.5, +4.0 + wallThickness + gap,
        -1.5, +3.0 + wallThickness + gap,
        -5.0, +3.0 + wallThickness + gap,
        -5.0, -5.0 + wallThickness - gap,
        //
        +5.0, -5.0 + wallThickness - gap,
        +5.0, +3.0 + wallThickness + gap,
        +1.5, +3.0 + wallThickness + gap,
        +1.5, +4.0 + wallThickness + gap,
      ],
      Orientation.Right,
      defaultWallParams
    );

    const homeWallMaterial = this.createMaterial(require("./images/brick3.jpg"));
    homepageOuterRoomMesh.material = homeWallMaterial;

    const roofParams = {
      height: 1 * wallThickness,
      width: 11 + 2 * wallThickness,
      depth: 9 + 2 * wallThickness
    };
    const roof = BABYLON.MeshBuilder.CreateBox("roof", roofParams, this.scene);
    roof.position.y = defaultWallParams.wallHeight + roofParams.height / 2;
    roof.material = ceiling.material;
  }

  addLandingRoom = (): void => {
    const landingLength = 50;
    const landingWidth = 20;

    const landingRoomOrigin = new BABYLON.Mesh("landingRoomOrigin", this.scene);
    landingRoomOrigin.position = new BABYLON.Vector3(0, 0, -6 + wallThickness);

    const landingWallParams = {
      wallHeight: wallHeight,
      wallThickness: wallThickness
    }

    const highFloorGap = 10;

    let landingFirstWallMesh = this.createWallMesh(
      [
        -landingWidth / 2, landingLength,
        -landingWidth / 2, + 0.0,
        landingWidth / 2, +0.0,
        landingWidth / 2, landingLength
      ],
      Orientation.Left,
      landingWallParams
    );

    let landingSecondWallMesh = this.createWallMesh(
      [
        -landingWidth / 2 + 3, landingLength + highFloorGap,
        -landingWidth / 2, landingLength + highFloorGap,
        -landingWidth / 2, + 0.0,
        landingWidth / 2, +0.0,
        landingWidth / 2, landingLength + highFloorGap,
        landingWidth / 2 - 3, landingLength + highFloorGap,
      ],
      Orientation.Left,
      landingWallParams
    );
    landingSecondWallMesh.position.y = landingWallParams.wallHeight;
    landingSecondWallMesh.checkCollisions = false;

    let landingThirdWallMesh = this.createWallMesh(
      [
        0, landingLength + highFloorGap,
        -landingWidth / 2, landingLength + highFloorGap,
        -landingWidth / 2, + 0.0,
        landingWidth / 2, +0.0,
        landingWidth / 2, landingLength + highFloorGap,
        0, landingLength + highFloorGap,
      ],
      Orientation.Left,
      landingWallParams
    );
    landingThirdWallMesh.position.y = 2 * landingWallParams.wallHeight;
    landingThirdWallMesh.checkCollisions = false;

    const landingWallMaterial = this.createMaterial(require("./images/night_sky.jpg"));
    landingFirstWallMesh.material = landingWallMaterial;
    landingSecondWallMesh.material = landingWallMaterial;
    landingThirdWallMesh.material = landingWallMaterial;

    const floor = this.createFloor(3, landingLength, require("./images/asphalt.jpg"));
    floor.position.z = landingLength / 2;
    floor.position.y = - gap;
    floor.checkCollisions = false;
    const floorTexture = ((floor.material as StandardMaterial).diffuseTexture as Texture);
    floorTexture.vScale = 10;

    const grass = this.createFloor(landingWidth, landingLength, require("./images/ground.jpg"));
    const grassTexture = ((grass.material as StandardMaterial).diffuseTexture as Texture);
    grassTexture.uScale = landingWidth / 2 / 2;
    grassTexture.vScale = landingLength / 2;
    grass.position.z = landingLength / 2;
    grass.position.y = -2 * gap;

    const ceiling = this.createCeiling(landingWidth, landingLength + highFloorGap, require("./images/night_sky.jpg"));
    const ceilingMaterial = ((ceiling.material as StandardMaterial).diffuseTexture as Texture);
    ceilingMaterial.uScale = landingWidth / 2 / 2;
    ceilingMaterial.vScale = landingLength / 6;
    ceiling.position.z = (landingLength + highFloorGap) / 2;
    ceiling.position.y = 3 * landingWallParams.wallHeight;

    landingFirstWallMesh.parent = landingRoomOrigin;
    landingSecondWallMesh.parent = landingRoomOrigin;
    landingThirdWallMesh.parent = landingRoomOrigin;

    floor.parent = landingRoomOrigin;
    grass.parent = landingRoomOrigin;
    ceiling.parent = landingRoomOrigin;
  }

  addAboutRoom = () => {
    const roomWidth = 50;
    const roomHeight = 15 + 2 * wallThickness;
    const aboutRoomOrigin = new BABYLON.Mesh("aboutRoomOrigin", this.scene);
    aboutRoomOrigin.position = new BABYLON.Vector3(0, 0, 45);

    const aboutUsFrontWall = this.createWallMesh(
      [
        -18.0, +15.0,
        -18.0, +11.0,
        -12.0, +11.0,
        -12.0, +5.0,
        //
        +12.0, +5.0,
        +12.0, +8.0,
      ],
      Orientation.Left,
      defaultWallParams
    );

    const aboutUsBackLeftWall = this.createWallMesh(
      [
        -22.0, +15.0,
        -22.0, +7.0 + wallThickness,
        -15.0 + 0 * wallThickness, +7.0 + wallThickness,
        -15.0 + 0 * wallThickness, +1.0 + wallThickness,
        -8.0 - wallThickness, +1.0 + wallThickness,
        -8.0 - wallThickness, +0.0,
        -1.5, +0.0
      ],
      Orientation.Right,
      defaultWallParams
    );

    const aboutUsBackRightWall = this.createWallMesh(
      [
        +1.5, +0.0,
        +8.0 + wallThickness, +0.0,
        +8.0 + wallThickness, +1.0 + wallThickness,
        +15.0, +1.0 + wallThickness,
        +15.0, +8.0
      ],
      Orientation.Right,
      defaultWallParams
    );

    const nextFloorData = [
      -12.0, +0.0,
      -12.0, +0.0,
      +12.0, +0.0,
      +12.0, +0.0,
    ];

    const secondFloorWall = this.createWallMesh(
      [
        // -8.0, +4.0,
        -8.0, +4.0,
        -5.0, +0.0,
        +5.0, +0.0,
        +8.0, +4.0,
        // +12.0, +4.0,
      ],
      Orientation.Left,
      defaultWallParams
    );

    secondFloorWall.position.y = wallHeight;
    secondFloorWall.position.z = - 1 * wallThickness;

    const thirdFloorWall = this.createWallMesh(
      [
        // -8.0, +4.0,
        -6.0, +4.0,
        -3.0, +0.0,
        +3.0, +0.0,
        +6.0, +4.0,
        // +12.0, +4.0,
      ],
      Orientation.Left,
      defaultWallParams
    );
    thirdFloorWall.position.y = 2 * wallHeight;
    thirdFloorWall.position.z = - 1 * wallThickness;

    const aboutRoomMaterial = this.createMaterial(require("./images/brick2.jpg"), {
      vOffset: 0.09
    });
    aboutUsFrontWall.material = aboutRoomMaterial;
    aboutUsBackLeftWall.material = aboutRoomMaterial;
    aboutUsBackRightWall.material = aboutRoomMaterial;

    secondFloorWall.material = aboutRoomMaterial;
    thirdFloorWall.material = aboutRoomMaterial;

    const floor = this.createFloor(roomWidth, roomHeight, require("./images/marble_red2.jpg"));
    floor.position.y = -3 * gap;
    floor.position.z = roomHeight / 2 - wallThickness;

    const floorTexture = ((floor.material as StandardMaterial).diffuseTexture as Texture);
    floorTexture.uScale = roomWidth / 2;
    floorTexture.vScale = roomHeight / 2;

    const ceiling = this.createCeiling(roomWidth, roomHeight, require("./images/laminate_wood.jpg"));
    ceiling.position.z = roomHeight / 2 - wallThickness;
    ceiling.position.y = wallHeight - gap;

    const ceilingTexture = ((ceiling.material as StandardMaterial).diffuseTexture as Texture);
    ceilingTexture.uScale = roomWidth / 4;
    ceilingTexture.vScale = roomHeight / 4;

    const ceoPainting = this.addPainting(require("./images/ceo_painting.png"), 2, 1.7);
    ceoPainting.position.y = 2.0;
    ceoPainting.position.z = 5 - gap;

    aboutUsFrontWall.parent = aboutRoomOrigin;
    aboutUsBackLeftWall.parent = aboutRoomOrigin;
    aboutUsBackRightWall.parent = aboutRoomOrigin;

    floor.parent = aboutRoomOrigin;
    ceiling.parent = aboutRoomOrigin;
    ceoPainting.parent = aboutRoomOrigin;

    secondFloorWall.parent = aboutRoomOrigin;
    thirdFloorWall.parent = aboutRoomOrigin;
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

  addFooterRoom = (): void => {
    const footerRoomOrigin = new BABYLON.Mesh("landingRoomOrigin", this.scene);
    footerRoomOrigin.position = new BABYLON.Vector3(-20, 0, 60);

    const footerWallParams = {
      wallHeight: 2 * wallHeight,
      wallThickness: wallThickness
    }

    const footerRoom = this.createWallMesh(
      [
        -2.0, +0.0,
        -10.0, +0.0,
        -10.0, +30.0,
        -20.0, +30.0,
        -20.0, +40.0,
        +2.0 + wallThickness, +40.0,
        +2.0 + wallThickness, +30.0,
        // +6.0, +0.0,
        +2.0 + wallThickness, +0.0,
      ],
      Orientation.Right,
      footerWallParams
    );
    footerRoom.material = this.createMaterial(require("./images/stone_wall.jpg"));
    footerRoom.position.y = -wallHeight;

    const floorWidth = 22;
    const floorHeight = 40;

    const floor = this.createFloor(floorWidth, floorHeight, require("./images/stone_floor.jpg"));
    floor.position.y = (wallHeight - footerWallParams.wallHeight) + -2 * gap;
    floor.position.x = -9;
    floor.position.z = floorHeight / 2;
    // floor.rotation.x = Math.PI / 20;

    const floorTexture = ((floor.material as StandardMaterial).diffuseTexture as Texture);
    floorTexture.uScale = floorWidth / 2;
    floorTexture.vScale = floorHeight / 2;

    const ceilling = this.createCeiling(floorWidth, floorHeight, require("./images/stone_wall.jpg"));
    ceilling.position.y = wallHeight - 3 * gap;
    ceilling.position.x = -9;
    ceilling.position.z = floorHeight / 2;

    const ceillingTexture = ((ceilling.material as StandardMaterial).diffuseTexture as Texture);
    ceillingTexture.uScale = floorWidth / (footerWallParams.wallHeight);
    ceillingTexture.vScale = floorHeight / (footerWallParams.wallHeight);

    const stairsAngle = Math.PI / 20;
    const gapHeight = footerWallParams.wallHeight - wallHeight;
    const cubeSideSize = gapHeight / Math.sin(stairsAngle);

    const stairsParams = {
      height: cubeSideSize,
      width: 4,
      depth: cubeSideSize
    };

    const stairs = BABYLON.MeshBuilder.CreateBox("stairs", stairsParams, this.scene);
    stairs.position.z = wallThickness + Math.sqrt(2) / 2 * cubeSideSize * Math.sin(Math.PI / 4 - stairsAngle);
    stairs.position.y = -Math.sqrt(2) / 2 * cubeSideSize * Math.cos(Math.PI / 4 - stairsAngle);
    stairs.rotation.x = stairsAngle;
    stairs.material = this.createMaterial(require("./images/stone_wall.jpg"));
    stairs.checkCollisions = true;

    const stairsTexture = ((stairs.material as StandardMaterial).diffuseTexture as Texture);
    stairsTexture.uScale = stairsParams.height / (footerWallParams.wallHeight);
    stairsTexture.vScale = stairsParams.width / (footerWallParams.wallHeight);
    // stairs.physicsImpostor = new BABYLON.PhysicsImpostor(stairs, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 1 }, this.scene);;
    // stairs.physicsImpostor.registerOnPhysicsCollide(this.playerCamera, (main, collided) => {
    //   this.playerCamera.position.y = 0;
    //   debugger;
    // });
    // stairs.physicsImpostor.friction = 0;
    // debugger;

    floor.parent = footerRoomOrigin;
    stairs.parent = footerRoomOrigin;
    ceilling.parent = footerRoomOrigin;
    footerRoom.parent = footerRoomOrigin;

    // this.scene.addMesh(footerRoom)
  }
}

const app = new Application();