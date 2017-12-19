import { Player } from "./player";
import { Vector3 } from "babylonjs";

export abstract class Collectable extends BABYLON.Mesh {
    abstract createCollider: () => BABYLON.Mesh;
    abstract updateAnimation: () => void;

    abstract onCollect: (player: Player) => void;
    abstract onAnimationFinished: () => void;

    private colliderMesh: BABYLON.Mesh;
    public isCollected = false;
    public animationFinished = false;

    protected collisionVector: BABYLON.Vector3;

    constructor() {
        super("collectable");
    }

    init() {
        this.colliderMesh = this.createCollider();
    }

    tryCollect = (player: Player): boolean => {
        if (this.isCollected)
            return false;

        const intersects = this.colliderMesh.intersectsMesh(player.collider);
        if (!intersects)
            return false;

        this.isCollected = true;

        // debugger;
        this.collisionVector = this.colliderMesh.getAbsolutePosition().subtract(player.collider.getAbsolutePosition());
        this.collisionVector.normalize();

        console.log("colelcted");

        if (this.onCollect != undefined)
            this.onCollect(player);

        return intersects;
    }
}