import * as BABYLON from 'babylonjs';

import { Room } from "./room";
import { Orientation } from "./wallOrientation";
import { Texture } from 'babylonjs';

//decalrations
declare function require(name: string);

export class LandingRoom extends Room {
    constructor(scene: BABYLON.Scene) {
        super(scene);

        // aliases
        const defaultWallParams = this.defaultWallParams;
        const wallThickness = this.wallThickness;
        const wallHeight = this.wallHeight;
        const gap = this.gap;

        //ROOM START
        const landingLength = 50;
        const landingWidth = 20;
        
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
        const floorTexture = ((floor.material as BABYLON.StandardMaterial).diffuseTexture as Texture);
        floorTexture.vScale = 10;
    
        const grass = this.createFloor(landingWidth, landingLength, require("./images/ground.jpg"));
        const grassTexture = ((grass.material as BABYLON.StandardMaterial).diffuseTexture as Texture);
        grassTexture.uScale = landingWidth / 2 / 2;
        grassTexture.vScale = landingLength / 2;
        grass.position.z = landingLength / 2;
        grass.position.y = -2 * gap;
    
        const ceiling = this.createCeiling(landingWidth, landingLength + highFloorGap, require("./images/night_sky.jpg"));
        const ceilingMaterial = ((ceiling.material as BABYLON.StandardMaterial).diffuseTexture as Texture);
        ceilingMaterial.uScale = landingWidth / 2 / 2;
        ceilingMaterial.vScale = landingLength / 6;
        ceiling.position.z = (landingLength + highFloorGap) / 2;
        ceiling.position.y = 3 * landingWallParams.wallHeight;
    }
}