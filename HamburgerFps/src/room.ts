import { Wall } from "./wall";
import { Orientation } from "./wallOrientation";
import { Collectable } from "./collectable";
import { Coin } from "./coin";
import { IWallParams } from "./iWallParams";
import { Ghost } from "./ghost";
import { Cross } from "./cross";

//decalrations
declare function require(name: string);
const _BABYLON = require('babylonjs/dist/preview release/proceduralTexturesLibrary/babylonjs.proceduralTextures')

export class Room extends BABYLON.Mesh {
    wallHeight = 3.5;
    wallThickness = this.wallHeight / 5;
    gap = 0.001;

    defaultWallParams: IWallParams = {
        wallHeight: this.wallHeight,
        wallThickness: this.wallThickness,
        closed: false
    };

    public priority: number = 0;
    public collectables: Collectable[];

    constructor(protected scene: BABYLON.Scene, public roomName: string, public trigerVolume: BABYLON.Mesh = undefined) {
        super("roomBase", scene);

        this.collectables = [];

        if (this.trigerVolume) {
            this.trigerVolume.parent = this;
            this.trigerVolume.isVisible = false;
        }
    }

    createMaterial = (url: string, params: { uOffset?: number, vOffset?: number } = undefined): BABYLON.StandardMaterial => {
        if (params == undefined)
            params = { uOffset: 0, vOffset: 0 };

        const texture = new BABYLON.Texture(url, this.scene);
        texture.uOffset = params.uOffset | 0;
        texture.vOffset = params.vOffset | 0;

        const material = new BABYLON.StandardMaterial("material", this.scene);

        material.diffuseTexture = texture
        material.diffuseTexture.hasAlpha = false;
        material.backFaceCulling = true;
        material.emissiveColor = new BABYLON.Color3(1, 1, 1);
        material.disableLighting = true;

        return material;
    }

    createWallMesh = (cornerData: number[], orientation: Orientation = Orientation.Left, wallParams: IWallParams, physicsEnabled = true): BABYLON.Mesh => {
        const wall = new Wall(cornerData, orientation);

        const wallMesh = wall.createMesh(wallParams);

        if (physicsEnabled) {
            wallMesh.physicsImpostor = new BABYLON.PhysicsImpostor(wallMesh, BABYLON.PhysicsImpostor.MeshImpostor, { mass: 0, friction: 0, restitution: 0.3 });
            wallMesh.checkCollisions = true;
        }

        wallMesh.parent = this;

        return wallMesh;
    }

    createFloor = (floorWidth: number, floorHeight, textureUrl: string = undefined): BABYLON.Mesh => {
        const sourcePlane = new BABYLON.Plane(0, -1, 0, 0);
        sourcePlane.normalize();

        const options = {
            width: floorWidth,
            height: floorHeight,
            sourcePlane: sourcePlane
        };

        const floor = BABYLON.MeshBuilder.CreatePlane("floor", options, this.scene);

        floor.position.y = 0.01;
        floor.checkCollisions = true;
        floor.parent = this;

        if (textureUrl !== undefined)
            floor.material = this.createMaterial(textureUrl);

        return floor;
    }

    createCeiling = (ceilingWidth: number, ceilingHeight, textureUrl: string = undefined): BABYLON.Mesh => {
        const sourcePlane = new BABYLON.Plane(0, 1, 0, 0);
        sourcePlane.normalize();

        const options = {
            width: ceilingWidth,
            height: ceilingHeight,
            sourcePlane: sourcePlane
        };

        const ceiling = BABYLON.MeshBuilder.CreatePlane("floor", options, this.scene);

        ceiling.position.y = 0.01;
        ceiling.parent = this;

        if (textureUrl !== undefined)
            ceiling.material = this.createMaterial(textureUrl);

        return ceiling;
    }

    createDefaultMaterial = (texture: BABYLON.Texture): BABYLON.StandardMaterial => {
        const material = new BABYLON.StandardMaterial("texturedMaterial", this.scene);

        material.diffuseTexture = texture
        material.diffuseTexture.hasAlpha = false;
        material.backFaceCulling = true;
        material.disableLighting = true;
        material.emissiveColor = new BABYLON.Color3(1, 1, 1);

        return material;
    }

    createDefaultMaterialWithColor = (color: BABYLON.Color3): BABYLON.StandardMaterial => {
        const material = new BABYLON.StandardMaterial("ceilingMaterial", this.scene);

        material.backFaceCulling = true;
        material.disableLighting = true;
        material.emissiveColor = color;

        return material;
    }

    addPainting = (imageUrl: string, paintingWidth: number, paintingHeight: number): BABYLON.Mesh => {
        const materialPlane = new BABYLON.StandardMaterial("PaintingMaterial2", this.scene);

        materialPlane.diffuseTexture = new BABYLON.Texture(imageUrl, this.scene);
        materialPlane.emissiveColor = new BABYLON.Color3(1, 1, 1);
        materialPlane.backFaceCulling = true;
        materialPlane.disableLighting = true;
        materialPlane.diffuseTexture.hasAlpha = false;

        const options = {
            width: paintingWidth,
            height: paintingHeight,
            sideOrientation: BABYLON.Mesh.FRONTSIDE
        };

        const plane = BABYLON.MeshBuilder.CreatePlane("Painting", options, this.scene);
        plane.material = materialPlane;
        plane.parent = this;

        return plane;
    }

    addPointLight = (color: BABYLON.Color3, position: BABYLON.Vector3, helper: boolean = false): BABYLON.Light => {
        const light = new BABYLON.PointLight("Light", position, this.scene);
        light.diffuse = color;
        light.parent = this;

        if (!helper)
            return light;

        const cubeMaterial = new BABYLON.StandardMaterial("cubeMat", this.scene);
        cubeMaterial.emissiveColor = color;
        cubeMaterial.disableLighting = true;

        const cubeParams: any = {
            width: 0.2,
            height: 0.2,
            depth: 0.2
        };

        const cube = BABYLON.MeshBuilder.CreateBox("cube", cubeParams, this.scene);
        cube.position.copyFrom(position);
        cube.material = cubeMaterial;
        cube.parent = this;

        return light;
    }

    registerCollectable = (collectable: Collectable) => {
        collectable.parent = this;
        this.collectables.push(collectable);
    }

    addCoin = (x: number, y: number, z: number): void => {
        const coin = new Coin();
        coin.position.set(x, y, z);
        this.registerCollectable(coin);
    }

    addGhost = (track: BABYLON.Vector3[], speed: number, initialRotation: BABYLON.Vector3 = BABYLON.Vector3.Zero()): Ghost => {
        const ghost = new Ghost(2, this.scene, track, speed, initialRotation);

        this.registerCollectable(ghost);
        return ghost;
    }

    addCross = (x: number, y: number, z: number): Cross => {
        const cross = new Cross(this.scene);
        cross.position.set(x, y, z);

        this.registerCollectable(cross);
        return cross;
    }

    addTorch = (x: number, y: number, z: number): void => {
        const fireTexture: BABYLON.Texture = new _BABYLON.FireProceduralTexture("texture", 32, this.scene);
        // fireTexture.ampScale = 500.0;

        const cubeSideSize = 0.25;
        const torchHeight = 0.75;

        const woodTexture: BABYLON.Texture = new _BABYLON.WoodProceduralTexture("texture", 64, this.scene);
        // (woodTexture as any).ampScale = 200.0;
        // woodTexture.uScale = 1/10;
        woodTexture.vScale = 3;

        const stickParams = {
            height: torchHeight,
            width: cubeSideSize * 1 / 2,
            depth: cubeSideSize * 1 / 2
        };

        const stickMesh = BABYLON.MeshBuilder.CreateBox("stickMesh", stickParams, this.scene);
        stickMesh.parent = this;
        stickMesh.position.set(x, y + torchHeight / 2, z);
        stickMesh.rotation.x = -Math.PI / 12;
        stickMesh.material = this.createDefaultMaterial(woodTexture);

        const fireParams = {
            height: 2 * cubeSideSize,
            width: cubeSideSize,
            depth: cubeSideSize
        };

        const fireMesh = BABYLON.MeshBuilder.CreateBox("fireMesh", fireParams, this.scene);
        fireMesh.parent = stickMesh;
        fireMesh.position.set(0, torchHeight / 2 + cubeSideSize / 2 + this.gap, 0);
        fireMesh.material = this.createDefaultMaterial(fireTexture);
        // fireMesh.material.alpha = 0.7;
    }
}