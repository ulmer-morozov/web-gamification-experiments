import * as BABYLON from 'babylonjs';

import { Room } from "./room";
import { Orientation } from "./wallOrientation";
import { Resource } from './resource';

//decalrations
declare function require(name: string);
const _BABYLON = require('babylonjs/dist/preview release/proceduralTexturesLibrary/babylonjs.proceduralTextures')

export class ResourceRoom extends Room {
    constructor(scene: BABYLON.Scene) {
        super(scene, "resource-room", ResourceRoom.createTrigerVolume());

        //добавим ресурсы
        const defaultSamplePositionX = -10;
        const defaultSamplePositionY = 1;
        const defaultSamplePositionZ = 0;

        const goldTexture = new BABYLON.Texture(require('./images/gold2.jpg'), this.scene);

        const goldSample = this.addResource("Gold", goldTexture);
        goldSample.position.set(defaultSamplePositionX + 12, defaultSamplePositionY, defaultSamplePositionZ);

        const woodTexture = new _BABYLON.WoodProceduralTexture("texture", 256, scene);
        // woodTexture.woodColor = new Color3(1, 0, 1);
        woodTexture.ampScale = 200.0;

        const woodSample = this.addResource("Wood", woodTexture);
        woodSample.position.set(defaultSamplePositionX + 8, defaultSamplePositionY, defaultSamplePositionZ);

        const fireTexture = new _BABYLON.FireProceduralTexture("texture", 64, scene);
        fireTexture.ampScale = 200.0;

        const fireSample = this.addResource("Fire", fireTexture);
        fireSample.position.set(defaultSamplePositionX + 4, defaultSamplePositionY, defaultSamplePositionZ);

        const airTexture = new _BABYLON.CloudProceduralTexture("texture", 64, scene);
        airTexture.ampScale = 200.0;

        const airSample = this.addResource("Air", airTexture);
        airSample.position.set(defaultSamplePositionX, defaultSamplePositionY, defaultSamplePositionZ);

        const coinY = 0.5;
        this.addCoin(-18, coinY, 5.8);
        this.addCoin(-18, coinY, 7.2);
    }

    // createResourceSample = (): BABYLON.Mesh => {
    //     const cubeSideSize = 1.5;
    //     const cubeParams = {
    //         height: cubeSideSize,
    //         width: cubeSideSize,
    //         depth: cubeSideSize
    //     };

    //     const resourceMesh = BABYLON.MeshBuilder.CreateBox("resource", cubeParams, this.scene);
    //     resourceMesh.parent = this;

    //     return resourceMesh;
    // }

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