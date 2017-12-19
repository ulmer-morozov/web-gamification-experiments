import * as BABYLON from 'babylonjs';

import { Room } from "./room";
import { Orientation } from "./wallOrientation";
import { Texture, Color3 } from 'babylonjs';

//decalrations
declare function require(name: string);

export class NewsRoom extends Room {
    constructor(scene: BABYLON.Scene) {
        super(scene, "news-room", NewsRoom.createTrigerVolume());

        // aliases
        const gap = this.gap;

        //ROOM START
        const newsRoomWallParams = {
            wallHeight: 4 * this.defaultWallParams.wallHeight,
            wallThickness: this.defaultWallParams.wallThickness
        }
        const size = 24.0;
        const newsRoomWallMesh = this.createWallMesh(
            [
                +0.0, +2.0,
                +0.0, +0.0,
                size, +0.0,
                size, size,
                +0.0, size,
                +0.0, +5.0,
            ],
            Orientation.Right,
            newsRoomWallParams
        );

        const wallMaterial = new BABYLON.StandardMaterial("myMaterial", scene);

        wallMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
        wallMaterial.specularPower = 0.01;

        // wallMaterial.cameraExposure = 0.1;
        // wallMaterial.disableLighting = true;
        // wallMaterial.emissiveColor = new BABYLON.Color3(44 / 255, 34 / 255, 139 / 255);
        newsRoomWallMesh.material = wallMaterial;

        const floor = this.createFloor(size + 2 * this.wallThickness, size + 2 * this.wallThickness);
        floor.material = wallMaterial;
        floor.position.x = size / 2;
        floor.position.z = size / 2;
        floor.checkCollisions = true;

        const ceiling = this.createCeiling(size + 2 * this.wallThickness, size + 2 * this.wallThickness);
        ceiling.material = wallMaterial;
        ceiling.position.x = size / 2;
        ceiling.position.y = newsRoomWallParams.wallHeight;
        ceiling.position.z = size / 2;

        const wallFixerParams = {
            height: newsRoomWallParams.wallHeight - this.defaultWallParams.wallHeight,
            width: newsRoomWallParams.wallThickness,
            depth: 3
        };


        const wallFixerMaterial = new BABYLON.StandardMaterial("cubeMat", scene);
        wallFixerMaterial.emissiveColor = new Color3(0.1, 0.1, 0.1);
        wallFixerMaterial.specularPower = 0.3;
        wallFixerMaterial.disableLighting = true;

        const wallFixer = BABYLON.MeshBuilder.CreateBox("cube", wallFixerParams, scene);
        wallFixer.position.x = -wallFixerParams.width / 2;
        wallFixer.position.y = newsRoomWallParams.wallHeight / 2 + this.defaultWallParams.wallHeight / 2;
        wallFixer.position.z = 3.5;
        wallFixer.material = wallFixerMaterial;
        wallFixer.parent = this;

        // const floorTexture = ((floor.material as BABYLON.StandardMaterial).diffuseTexture as Texture);
        // floorTexture.uScale = size;
        // floorTexture.vScale = size;

        const addLedBar = (x: number, z: number, uOffset: number) => {
            const barHeight = newsRoomWallParams.wallHeight;
            const barWidth = barHeight * 45 / 512 / 4;
            const cubeSide = 1.2 * barWidth;

            const cubeParams = {
                height: barHeight,
                width: cubeSide,
                depth: cubeSide
            };

            const cubeMaterial = new BABYLON.StandardMaterial("cubeMat", scene);
            cubeMaterial.emissiveColor = new Color3(0.1, 0.1, 0.1);
            cubeMaterial.specularPower = 0.3;
            cubeMaterial.disableLighting = true;

            const cube = BABYLON.MeshBuilder.CreateBox("cube", cubeParams, scene);
            cube.position.x = x;
            cube.position.y = cubeParams.height / 2;
            cube.position.z = z;
            cube.material = cubeMaterial;
            cube.checkCollisions = true;
            cube.parent = this;

            const redSide = this.addPainting(require("./images/red_led.jpg"), barHeight, barWidth);
            redSide.rotation.y = Math.PI / 2;
            redSide.rotation.z = Math.PI / 2;
            redSide.position.x = x - cubeSide / 2 - gap;
            redSide.position.y = barHeight / 2;
            redSide.position.z = z;

            const redSideMaterial = ((redSide.material as BABYLON.StandardMaterial).diffuseTexture as Texture);
            redSideMaterial.uScale = 5;
            redSideMaterial.vScale = 1;
            redSideMaterial.uOffset = uOffset;
            redSideMaterial.vOffset = 0.01;

            const blueSide = this.addPainting(require("./images/blue_led.jpg"), barHeight, barWidth);
            blueSide.rotation.y = -Math.PI / 2;
            blueSide.rotation.z = Math.PI / 2;
            blueSide.position.x = x + cubeSide / 2 + gap;
            blueSide.position.y = barHeight / 2;
            blueSide.position.z = z;

            const blueSideMaterial = ((blueSide.material as BABYLON.StandardMaterial).diffuseTexture as Texture);
            blueSideMaterial.uScale = 5;
            blueSideMaterial.vScale = 1;
            blueSideMaterial.uOffset = uOffset;
            blueSideMaterial.vOffset = 0.01;
        }

        const ledCount = 7;
        for (let i = 1; i < ledCount; i++) {
            const x = size / 2;
            const z = i * size / ledCount;
            const textureOffset = i * 0.3;

            addLedBar(x, z, textureOffset);


            if (i === 4) {
                const blueLightColor = new BABYLON.Color3(0, 0, 1);
                const blueLightPosition = new BABYLON.Vector3(x - 0.5, newsRoomWallParams.wallHeight / 2, z);

                const blueLight = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(1, -0.2, 0), scene);
                blueLight.position = blueLightPosition;
                blueLight.diffuse = blueLightColor;
                blueLight.specular = blueLightColor;
                blueLight.intensity = 0.5;
                blueLight.parent = this;

                const redLightColor = new BABYLON.Color3(1, 0, 0);
                const redLightPosition = new BABYLON.Vector3(x + 0.5, newsRoomWallParams.wallHeight / 2, z);

                const redLight = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(-1, -0.2, 0), scene);
                redLight.position = redLightPosition;
                redLight.diffuse = redLightColor;
                redLight.specular = redLightColor;
                redLight.intensity = 0.5;
                redLight.parent = this;


            }
        }

        const coinY = 0.5;
        this.addCoin(18, coinY, 4);
        this.addCoin(18, coinY, 8);
        this.addCoin(18, coinY, 12);
        this.addCoin(18, coinY, 16);
        this.addCoin(18, coinY, 20);

    }

    static createTrigerVolume = (): BABYLON.Mesh => {
        const roofParams = {
            height: 5,
            width: 24,
            depth: 24
        };

        const mesh = BABYLON.MeshBuilder.CreateBox("roof", roofParams);
        mesh.position.set(roofParams.width / 2, roofParams.height / 2, roofParams.depth / 2);
        return mesh;
    }


}