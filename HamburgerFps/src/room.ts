import { Wall } from "./wall";
import { Orientation } from "./wallOrientation";

export class Room extends BABYLON.Mesh {

    wallHeight = 3.5;
    wallThickness = this.wallHeight / 5;
    gap = 0.001;

    defaultWallParams = {
        wallHeight: this.wallHeight,
        wallThickness: this.wallThickness
    };

    constructor(private scene: BABYLON.Scene) {
        super("roomBase", scene);
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

    createWallMesh = (cornerData: number[], orientation: Orientation = Orientation.Left, wallParams): BABYLON.Mesh => {
        const wall = new Wall(cornerData, orientation);

        const wallMesh = wall.createMesh(wallParams);

        wallMesh.physicsImpostor = new BABYLON.PhysicsImpostor(wallMesh, BABYLON.PhysicsImpostor.MeshImpostor, { mass: 0, friction: 0, restitution: 0.3 });
        wallMesh.checkCollisions = true;
        wallMesh.parent = this;

        return wallMesh;
    }

    createFloor = (floorWidth: number, floorHeight, textureUrl: string): BABYLON.Mesh => {
        const sourcePlane = new BABYLON.Plane(0, -1, 0, 0);
        sourcePlane.normalize();

        const options = {
            width: floorWidth,
            height: floorHeight,
            sourcePlane: sourcePlane
        };

        const floor = BABYLON.MeshBuilder.CreatePlane("floor", options, this.scene);

        floor.position.y = 0.01;
        floor.material = this.createMaterial(textureUrl);
        floor.checkCollisions = true;
        floor.parent = this;

        return floor;
    }

    createCeiling = (ceilingWidth: number, ceilingHeight, textureUrl: string): BABYLON.Mesh => {
        const sourcePlane = new BABYLON.Plane(0, 1, 0, 0);
        sourcePlane.normalize();

        const options = {
            width: ceilingWidth,
            height: ceilingHeight,
            sourcePlane: sourcePlane
        };

        const ceiling = BABYLON.MeshBuilder.CreatePlane("floor", options, this.scene);

        ceiling.position.y = 0.01;
        ceiling.material = this.createMaterial(textureUrl);
        ceiling.parent = this;

        return ceiling;
    }

    addPainting = (imageUrl: string, paintingWidth: number, paintingHeight: number): BABYLON.Mesh => {
        const materialPlane = new BABYLON.StandardMaterial("PaintingMaterial", this.scene);

        materialPlane.diffuseTexture = new BABYLON.Texture(imageUrl, this.scene);
        materialPlane.emissiveColor = new BABYLON.Color3(1, 1, 1);
        materialPlane.backFaceCulling = true;
        materialPlane.disableLighting = true;
        materialPlane.diffuseTexture.hasAlpha = true;

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
}