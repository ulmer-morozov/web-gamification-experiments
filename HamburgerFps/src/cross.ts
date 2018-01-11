import * as BABYLON from 'babylonjs';
import { Howl } from "howler";

import { Collectable } from "./collectable";
import { Player } from "./player";

//decalrations
declare function require(name: string);
const _BABYLON = require('babylonjs/dist/preview release/proceduralTexturesLibrary/babylonjs.proceduralTextures')

export class Cross extends Collectable {
    private initialParent: BABYLON.Node;
    private initialPosition: BABYLON.Vector3;

    collectSound = new Howl({
        src: [require('./sounds/pickup.mp3')]
    });

    constructor(private readonly scene: BABYLON.Scene) {
        super();
        this.init();
    }

    private static _material: BABYLON.StandardMaterial;

    private static getMaterial = (scene: BABYLON.Scene): BABYLON.StandardMaterial => {
        if (Cross._material != undefined)
            return Cross._material;

        const darkWoodTexture = new _BABYLON.WoodProceduralTexture("texture", 128, scene);
        darkWoodTexture.woodColor = new BABYLON.Color3(50 / 255, 0 / 255, 0 / 255);
        darkWoodTexture.uScale = 4;
        // darkWoodTexture.vScale = 1/5;
        darkWoodTexture.ampScale = 100.0;

        const material = new BABYLON.StandardMaterial("crossMaterial", scene);

        material.diffuseTexture = darkWoodTexture
        material.diffuseTexture.hasAlpha = false;
        material.backFaceCulling = true;
        material.disableLighting = true;
        material.emissiveColor = new BABYLON.Color3(1, 1, 1);


        Cross._material = material;
        return Cross._material;
    }

    createCollider = (): BABYLON.Mesh => {
        const crossHeight = 2;
        const sideSize = crossHeight / 10;

        const crossVParams = {
            width: sideSize,
            height: crossHeight,
            depth: sideSize
        };

        const crossVMesh = BABYLON.MeshBuilder.CreateBox("crossV", crossVParams, this.scene);
        crossVMesh.rotation.y = Math.PI / 2;
        crossVMesh.parent = this;
        crossVMesh.material = Cross.getMaterial(this.scene);
        // crossVMesh.showBoundingBox = true;

        const crossHParams = {
            width: crossHeight * 3 / 5,
            height: sideSize - 0.01,
            depth: sideSize - 0.01
        };

        const crossHMesh = BABYLON.MeshBuilder.CreateBox("crossH", crossHParams, this.scene);
        crossHMesh.position.y = crossHeight / 4;
        crossHMesh.parent = this;
        crossHMesh.material = Cross.getMaterial(this.scene);
        // crossHMesh.showBoundingBox = true;

        return crossVMesh;
    }

    protected CanCollect = (player: Player): boolean => {
        const canCollect = player.inventory.cross == undefined;
        return canCollect;
    }

    onCollect = (player: Player): void => {
        this.initialParent = this.parent;
        this.initialPosition = this.position;

        player.addScore(250);
        player.inventory.cross = this;

        this.scaling.scaleInPlace(0.5);

        this.position.y = player.collider.position.y - 0.2;
        this.position.x = 0.5;
        this.position.z = 1.5;
        this.rotation.x = Math.PI / 6;
        this.rotation.y = -Math.PI / 6;

        this.parent = player.collider;
        player.pullMessage("Blessed!");

       this.collectSound.play();
    }

    updateAnimation = () => {
        if (this.animationFinished)
            return;

        if (!this.isCollected) {
            this.rotation.y += 0.04;
            return;
        }
    }

    onAnimationFinished = (): void => {
        // this.dispose();
        this.setEnabled(false);
        this.isVisible = false;
    }

    resetInternal = () => {
        if (this.positionBeforeCollected != undefined) {
            this.position.copyFrom(this.positionBeforeCollected);
        }

        if (this.initialParent)
            this.parent = this.initialParent;

        if (this.initialPosition)
            this.position.copyFrom(this.initialPosition);

        this.rotation.set(0, 0, 0);
        this.scaling.set(1, 1, 1);
        this.isVisible = true;

        this.setEnabled(true);
    }
}