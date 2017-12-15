import * as BABYLON from 'babylonjs';

import { Room } from "./room";
import { Orientation } from "./wallOrientation";
import { Texture } from 'babylonjs';

//decalrations
declare function require(name: string);

// const BABYLON = require('babylonjs/dist/preview release/proceduralTexturesLibrary/babylonjs.proceduralTextures')

// import * as sad from 'babylonjs/dist/preview release/materialsLibrary/babylonjs-materials'

// debugger;
export class HomeRoom extends Room {
    constructor(scene: BABYLON.Scene) {
        super(scene);

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


        const floor = this.createFloor(floorWidth, floorHeight, require("./images/red_wood_floor.jpg"));
        floor.position.z = -wallThickness;
        floor.checkCollisions = false;




        const floorTexture = ((floor.material as BABYLON.StandardMaterial).diffuseTexture as Texture);
        floorTexture.uScale = floorWidth;
        floorTexture.vScale = floorHeight;

        // floor.material = new BABYLON.WoodProceduralTexture("texture", 1024, scene);
        // debugger


        const ceiling = this.createCeiling(floorWidth, floorHeight, require("./images/wood4.jpg"));
        ceiling.position.z = -wallThickness;
        ceiling.position.y = wallHeight - 2 * gap;

        const ceilingTexture = ((ceiling.material as BABYLON.StandardMaterial).diffuseTexture as Texture);
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

        const roof = BABYLON.MeshBuilder.CreateBox("roof", roofParams, scene);
        roof.position.y = defaultWallParams.wallHeight + roofParams.height / 2;
        roof.material = ceiling.material;
    }
}