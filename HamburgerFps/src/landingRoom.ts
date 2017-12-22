import * as BABYLON from 'babylonjs';

import { Room } from "./room";
import { Orientation } from "./wallOrientation";
import { Texture } from 'babylonjs';
import { Coin } from './coin';
import { IWallParams } from './iWallParams';

//decalrations
declare function require(name: string);
const _BABYLON = require('babylonjs/dist/preview release/proceduralTexturesLibrary/babylonjs.proceduralTextures')

export class LandingRoom extends Room {
  constructor(scene: BABYLON.Scene) {
    super(scene, "landing-room", LandingRoom.createTrigerVolume());

    // aliases
    const defaultWallParams = this.defaultWallParams;
    const wallThickness = this.wallThickness;
    const wallHeight = this.wallHeight;
    const gap = this.gap;

    //ROOM START
    const landingLength = 50;
    const landingWidth = 20;

    const landingWallParams: IWallParams = {
      wallHeight: wallHeight,
      wallThickness: wallThickness,
      closed: false
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

    const starfieldWallMaterial = new _BABYLON.StarfieldProceduralTexture("texture", 256, scene);
    starfieldWallMaterial.zoom = 5;
    starfieldWallMaterial.uScale = 1 / 10;
    starfieldWallMaterial.vScale = 1 / 10;
    starfieldWallMaterial.distfading = 0.5;
    starfieldWallMaterial.beta = 1;
    starfieldWallMaterial.saturation = 0.3;

    const landingWallMaterial = this.createDefaultMaterial(starfieldWallMaterial);

    landingFirstWallMesh.material = landingWallMaterial;
    landingSecondWallMesh.material = landingWallMaterial;
    landingThirdWallMesh.material = landingWallMaterial;

    const floor = this.createFloor(3, landingLength, require("./images/asphalt.jpg"));
    floor.position.z = landingLength / 2;
    floor.position.y = - gap;
    floor.checkCollisions = false;
    const floorTexture = ((floor.material as BABYLON.StandardMaterial).diffuseTexture as Texture);
    floorTexture.vScale = 10;

    const grassTexture = new _BABYLON.GrassProceduralTexture("texture", 256, scene);;
    grassTexture.uScale = landingWidth / 8;
    grassTexture.vScale = landingLength / 8;
    (grassTexture.grassColors as BABYLON.Color3[]) = [
      new BABYLON.Color3(60 / 255, 36 / 255, 0 / 255),
      new BABYLON.Color3(80 / 255, 22 / 255, 0 / 255),
      new BABYLON.Color3(64 / 255, 93 / 255, 52 / 255),
    ];

    const grass = this.createFloor(landingWidth, landingLength);//, require("./images/ground.jpg")
    grass.position.z = landingLength / 2;
    grass.position.y = -2 * gap;
    grass.material = this.createDefaultMaterial(grassTexture);

    const ceiling = this.createCeiling(landingWidth, landingLength + highFloorGap);
    ceiling.position.z = (landingLength + highFloorGap) / 2;
    ceiling.position.y = 3 * landingWallParams.wallHeight;

    const ceilingTexture = new _BABYLON.StarfieldProceduralTexture("texture", 128, scene);
    ceilingTexture.zoom = 1;
    ceilingTexture.vScale = 3;
    ceilingTexture.distfading = 0.5;
    ceilingTexture.beta = 1;
    ceilingTexture.saturation = 0.3;

    ceiling.material = this.createDefaultMaterial(ceilingTexture);

    this.addCoin(0, 0.5, 14);
    this.addCoin(0, 0.5, 18);
    this.addCoin(0, 0.5, 22);
    this.addCoin(0, 0.5, 26);
    this.addCoin(0, 0.5, 30);
    this.addCoin(0, 0.5, 34);
    this.addCoin(0, 0.5, 38);
    this.addCoin(0, 0.5, 42);
    this.addCoin(0, 0.5, 46);

    this.addCross(7.5, 1.5, 4);
  }

  static createTrigerVolume = (): BABYLON.Mesh => {
    const roofParams = {
      height: 5,
      width: 20,
      depth: 40
    };

    const mesh = BABYLON.MeshBuilder.CreateBox("roof", roofParams);
    mesh.position.set(0, roofParams.height / 2, roofParams.depth / 2 + 10);
    // mesh.setEnabled(false);
    // mesh.isVisible = false;
    return mesh;
  }
}