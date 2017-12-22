import * as BABYLON from 'babylonjs';

import { Room } from "./room";
import { Orientation } from "./wallOrientation";
import { Texture } from 'babylonjs';

//decalrations
declare function require(name: string);
const _BABYLON = require('babylonjs/dist/preview release/proceduralTexturesLibrary/babylonjs.proceduralTextures')

export class AboutRoom extends Room {
  constructor(scene: BABYLON.Scene) {
    super(scene, "about-room", AboutRoom.createTrigerVolume());

    // aliases
    const defaultWallParams = this.defaultWallParams;
    const wallThickness = this.wallThickness;
    const wallHeight = this.wallHeight;
    const gap = this.gap;

    //ROOM START
    const roomWidth = 40 - 2 * wallThickness;
    const roomHeight = 15 + 2 * wallThickness;

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

    const nearResourcesLeftWall = this.createWallMesh(
      [
        +10.0, +15.0,
        -17.0 - wallThickness, +15.0,
      ],
      Orientation.Right,
      defaultWallParams
    );

    const nearResourcesRightWall = this.createWallMesh(
      [
        +15.0, +11.0,
        +15.0, +15.0,
        +13.0, +15.0,
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
    nearResourcesRightWall.material = aboutRoomMaterial
    nearResourcesLeftWall.material = aboutRoomMaterial;

    secondFloorWall.material = aboutRoomMaterial;
    thirdFloorWall.material = aboutRoomMaterial;

    const floorX = -5 + 2 * wallThickness;

    const floor = this.createFloor(roomWidth, roomHeight, require("./images/marble_red2.jpg"));
    floor.position.x = floorX;
    floor.position.y = -3 * gap;
    floor.position.z = roomHeight / 2 - wallThickness;

    const floorTexture = ((floor.material as BABYLON.StandardMaterial).diffuseTexture as Texture);
    floorTexture.uScale = roomWidth / 2;
    floorTexture.vScale = roomHeight / 2;

    const ceiling = this.createCeiling(roomWidth, roomHeight, require("./images/laminate_wood.jpg"));
    ceiling.position.x = floorX;
    ceiling.position.z = roomHeight / 2 - wallThickness;
    ceiling.position.y = wallHeight - gap;

    const ceilingTexture = ((ceiling.material as BABYLON.StandardMaterial).diffuseTexture as Texture);
    ceilingTexture.uScale = roomWidth / 4;
    ceilingTexture.vScale = roomHeight / 4;

    const paintingY = 2.0;

    const ceoPainting = this.addPainting(require("./images/ceo_painting.jpg"), 2, 1.4);
    ceoPainting.position.y = paintingY;
    ceoPainting.position.z = 5 - gap;

    const dogPainting = this.addPainting(require("./images/dog.jpg"), 2, 1.4);
    dogPainting.position.x = -2.5;
    dogPainting.position.y = paintingY;
    dogPainting.position.z = 5 - gap;

    const familyPainting = this.addPainting(require("./images/family.jpg"), 2, 1.4);
    familyPainting.position.x = 2.5;
    familyPainting.position.y = paintingY;
    familyPainting.position.z = 5 - gap;

    const torchY = 2.3;
    const torchZ = 4.86;

    this.addTorch(-3.75, torchY, torchZ);
    this.addTorch(-1.25, torchY, torchZ);
    this.addTorch(+1.25, torchY, torchZ);
    this.addTorch(+3.75, torchY, torchZ);
  }

  static createTrigerVolume = (): BABYLON.Mesh => {
    const roofParams = {
      height: 5,
      width: 38,
      depth: 6.5
    };

    const mesh = BABYLON.MeshBuilder.CreateBox("roof", roofParams);
    mesh.position.set(-4, roofParams.height / 2, roofParams.depth / 2);
    // mesh.setEnabled(false);
    // mesh.isVisible = false;
    return mesh;
  }
}