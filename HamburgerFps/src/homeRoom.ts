import * as BABYLON from 'babylonjs';

import { Room } from "./room";
import { Orientation } from "./wallOrientation";

//decalrations
declare function require(name: string);
const _BABYLON = require('babylonjs/dist/preview release/proceduralTexturesLibrary/babylonjs.proceduralTextures')

export class HomeRoom extends Room {
    constructor(scene: BABYLON.Scene) {
        super(scene, "home-room", HomeRoom.createTrigerVolume());

        // aliases
        const defaultWallParams = this.defaultWallParams;
        const wallThickness = this.wallThickness;
        const wallHeight = this.wallHeight;
        const gap = this.gap;

        //ROOM START
        const floorWidth = 9;
        const floorHeight = 6 + 6 * this.wallThickness;

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
            this.defaultWallParams
        );
        homepageRoomMesh.material = this.createMaterial(require("./images/papers3.jpg"));

        const woodTexture = new _BABYLON.WoodProceduralTexture("texture", 256, scene);
        woodTexture.uScale = floorWidth;
        woodTexture.vScale = floorHeight / 4;
        woodTexture.ampScale = 200.0;

        const floor = this.createFloor(floorWidth, floorHeight);
        floor.position.z = -wallThickness;
        floor.checkCollisions = false;
        floor.material = this.createDefaultMaterial(woodTexture);

        const darkWoodTexture = new _BABYLON.WoodProceduralTexture("texture", 256, scene);
        darkWoodTexture.woodColor = new BABYLON.Color3(17 / 255, 11 / 255, 5 / 255);
        darkWoodTexture.uScale = floorWidth;
        darkWoodTexture.vScale = floorHeight / 4;
        darkWoodTexture.ampScale = 200.0;

        const ceiling = this.createCeiling(floorWidth, floorHeight);
        ceiling.position.z = -wallThickness;
        ceiling.position.y = wallHeight - 2 * gap;
        ceiling.material = this.createDefaultMaterial(darkWoodTexture);


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
            height: 2 * wallThickness,
            width: 11 + 2 * wallThickness,
            depth: 9 + 2 * wallThickness
        };

        const roof = BABYLON.MeshBuilder.CreateBox("roof", roofParams, scene);
        roof.position.y = defaultWallParams.wallHeight + roofParams.height / 2;
        roof.material = ceiling.material;
    }

    static createTrigerVolume = (): BABYLON.Mesh => {
        const roofParams = {
            height: 5,
            width: 10,
            depth: 8
        };

        const mesh = BABYLON.MeshBuilder.CreateBox("roof", roofParams);
        mesh.position.set(0, roofParams.height / 2, 0);

        return mesh;
    }
}