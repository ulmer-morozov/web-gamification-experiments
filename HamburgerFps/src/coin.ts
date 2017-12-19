import { Collectable } from "./collectable";
import { Player } from "./player";

//decalrations
declare function require(name: string);

export class Coin extends Collectable {

    constructor(private readonly size: number = 1) {
        super();
        this.init();
    }

    private static _material: BABYLON.StandardMaterial;

    private static getMaterial = (): BABYLON.StandardMaterial => {
        if (Coin._material != undefined)
            return Coin._material;

        const texture = new BABYLON.Texture(require('./images/gold.jpg'), undefined);
        texture.uScale = 1 / 4;
        texture.vScale = 1 / 4;
        // texture.uOffset = params.uOffset | 0;
        // texture.vOffset = params.vOffset | 0;

        const material = new BABYLON.StandardMaterial("material", undefined);

        material.diffuseTexture = texture
        material.diffuseTexture.hasAlpha = false;
        material.backFaceCulling = true;
        material.emissiveColor = new BABYLON.Color3(1, 1, 1);
        material.disableLighting = true;

        Coin._material = material;
        return Coin._material;
    }

    createCollider = (): BABYLON.Mesh => {
        const colliderParams = {
            diameter: this.size,
            height: this.size / 5
        };

        const colliderMesh = BABYLON.MeshBuilder.CreateCylinder("roof", colliderParams, null);
        colliderMesh.rotation.z = Math.PI / 2;
        colliderMesh.parent = this;
        colliderMesh.material = Coin.getMaterial();

        // colliderMesh.registerBeforeRender(() => {

        // });

        return colliderMesh;
    }

    onCollect = (player: Player): void => {
        player.addScore(100);
    }

    updateAnimation = () => {
        if (this.animationFinished)
            return;

        if (!this.isCollected) {
            this.rotation.y += 0.04;
            return;
        }

        this.scaling = this.scaling.scale(0.8);

        const direction = new BABYLON.Vector3(this.collisionVector.x, 0.3, this.collisionVector.z);
        this.position.addInPlace(direction.scale(0.3));

        const minSize = 0.05;
        if (this.scaling.x < minSize) {
            this.animationFinished = true;
            this.onAnimationFinished();
        }
    }

    onAnimationFinished = (): void => {
        this.dispose();
    }
}