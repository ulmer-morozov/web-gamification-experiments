import * as BABYLON from 'babylonjs';

import { Room } from "./room";
import { Orientation } from "./wallOrientation";
import { Texture } from 'babylonjs';

//decalrations
declare function require(name: string);

export class FooterRoom extends Room {
    constructor(scene: BABYLON.Scene) {
        super(scene, "footer-room", FooterRoom.createTrigerVolume());

        // aliases
        const defaultWallParams = this.defaultWallParams;
        const wallThickness = this.wallThickness;
        const wallHeight = this.wallHeight;
        const gap = this.gap;

        //ROOM START
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

        const floorTexture = ((floor.material as BABYLON.StandardMaterial).diffuseTexture as Texture);
        floorTexture.uScale = floorWidth / 2;
        floorTexture.vScale = floorHeight / 2;

        const ceilling = this.createCeiling(floorWidth, floorHeight, require("./images/stone_wall.jpg"));
        ceilling.position.y = wallHeight - 3 * gap;
        ceilling.position.x = -9;
        ceilling.position.z = floorHeight / 2;

        const ceillingTexture = ((ceilling.material as BABYLON.StandardMaterial).diffuseTexture as Texture);
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

        const stairs = BABYLON.MeshBuilder.CreateBox("stairs", stairsParams, scene);

        stairs.position.z = wallThickness + Math.sqrt(2) / 2 * cubeSideSize * Math.sin(Math.PI / 4 - stairsAngle);
        stairs.position.y = -Math.sqrt(2) / 2 * cubeSideSize * Math.cos(Math.PI / 4 - stairsAngle);
        stairs.rotation.x = stairsAngle;
        stairs.material = this.createMaterial(require("./images/stone_wall.jpg"));
        stairs.checkCollisions = true;
        stairs.parent = this;

        const stairsTexture = ((stairs.material as BABYLON.StandardMaterial).diffuseTexture as Texture);
        stairsTexture.uScale = stairsParams.height / (footerWallParams.wallHeight);
        stairsTexture.vScale = stairsParams.width / (footerWallParams.wallHeight);
        // stairs.physicsImpostor = new BABYLON.PhysicsImpostor(stairs, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 1 }, this.scene);;
        // stairs.physicsImpostor.registerOnPhysicsCollide(this.playerCamera, (main, collided) => {
        //   this.playerCamera.position.y = 0;
        // });
        // stairs.physicsImpostor.friction = 0;

        const coinY = 0.5 - 3.5;

        for (let coinX = -7; coinX < -2; coinX += 3)
            for (let coinZ = 0; coinZ < 36; coinZ += 4)
                this.addCoin(coinX, coinY, coinZ);


    }

    static createTrigerVolume = (): BABYLON.Mesh => {
        const roofParams = {
            height: 6,
            width: 23,
            depth: 40
        };

        const mesh = BABYLON.MeshBuilder.CreateBox("boundBox", roofParams);
        mesh.position.set(-8.5, roofParams.height / 2 - 3, roofParams.depth / 2 + 0.5);
        // mesh.setEnabled(false);
        // mesh.isVisible = false;
        return mesh;
    }
}