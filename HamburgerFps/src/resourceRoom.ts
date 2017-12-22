import * as BABYLON from 'babylonjs';

import { Room } from "./room";
import { Orientation } from "./wallOrientation";
import { Texture } from 'babylonjs';

//decalrations
declare function require(name: string);
const _BABYLON = require('babylonjs/dist/preview release/proceduralTexturesLibrary/babylonjs.proceduralTextures')

export class ResourceRoom extends Room {
    constructor(scene: BABYLON.Scene) {
        super(scene, "resource-room", ResourceRoom.createTrigerVolume());

        // aliases
        const resourceRoomParams = {
            wallHeight: this.wallHeight,
            wallThickness: this.wallThickness,
            closed: true
        };

        const wallThickness = resourceRoomParams.wallThickness;
        const wallHeight = resourceRoomParams.wallHeight;
        const gap = this.gap;


        const coinY = 0.5;
        // this.addCoin(-2, coinY, 7);



        //добавим ресурсы
        const defaultSamplePositionX = -10;
        const defaultSamplePositionY = 1;
        const defaultSamplePositionZ = 0;

        const goldSample = this.createResourceSample();
        goldSample.material = this.createMaterial(require('./images/gold2.jpg'));
        goldSample.position.set(defaultSamplePositionX + 12, defaultSamplePositionY, defaultSamplePositionZ);

        const woodTexture = new _BABYLON.WoodProceduralTexture("texture", 256, scene);
        // woodTexture.woodColor = new Color3(1, 0, 1);
        woodTexture.ampScale = 200.0;

        const woodSample = this.createResourceSample();
        woodSample.position.set(defaultSamplePositionX + 8, defaultSamplePositionY, defaultSamplePositionZ);
        woodSample.material = this.createDefaultMaterial(woodTexture);

        const fireTexture = new _BABYLON.FireProceduralTexture("texture", 64, scene);
        fireTexture.ampScale = 200.0;

        const fireSample = this.createResourceSample();
        fireSample.position.set(defaultSamplePositionX + 4, defaultSamplePositionY, defaultSamplePositionZ);
        fireSample.material = this.createDefaultMaterial(fireTexture);

        const earthTexture = new _BABYLON.CloudProceduralTexture("texture", 64, scene);
        earthTexture.ampScale = 200.0;

        const earthSample = this.createResourceSample();
        earthSample.position.set(defaultSamplePositionX, defaultSamplePositionY, defaultSamplePositionZ);
        earthSample.material = this.createDefaultMaterial(earthTexture);

    }

    createResourceSample = (): BABYLON.Mesh => {
        const cubeSideSize = 1.5;
        const cubeParams = {
            height: cubeSideSize,
            width: cubeSideSize,
            depth: cubeSideSize
        };

        const resourceMesh = BABYLON.MeshBuilder.CreateBox("resource", cubeParams, this.scene);
        resourceMesh.parent = this;

        return resourceMesh;
    }

    static createTrigerVolume = (): BABYLON.Mesh => {
        const roofParams = {
            height: 5,
            width: 26,
            depth: 8
        };

        const mesh = BABYLON.MeshBuilder.CreateBox("boundBox", roofParams);
        mesh.position.set(-roofParams.height / 2, 2, roofParams.depth / 2);
        return mesh;
    }
}