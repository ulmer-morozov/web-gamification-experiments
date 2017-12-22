import { Player } from "./player";
import { Vector3 } from "babylonjs";

export abstract class Collectable extends BABYLON.Mesh {
    abstract createCollider: () => BABYLON.Mesh;
    abstract updateAnimation: () => void;

    protected abstract onCollect: (player: Player) => void;
    protected abstract onAnimationFinished: () => void;
    protected abstract resetInternal: () => void;

    protected abstract CanCollect: (player: Player) => boolean;

    private colliderMesh: BABYLON.Mesh;
    public isCollected: boolean;
    public animationFinished: boolean;

    protected collisionVector: BABYLON.Vector3;
    protected positionBeforeCollected: BABYLON.Vector3;


    constructor() {
        super("collectable");
        this.isCollected = false;
        this.animationFinished = false;
        this.collisionVector = undefined;
        this.positionBeforeCollected = undefined;
    }

    init() {
        this.colliderMesh = this.createCollider();
    }

    tryCollect = (player: Player): boolean => {
        if (this.isCollected)
            return false;

        if (!this.CanCollect(player))
            return;

        const intersects = this.colliderMesh.intersectsMesh(player.collider);
        if (!intersects)
            return false;

        this.isCollected = true;
        this.positionBeforeCollected = this.position.clone();

        this.collisionVector = this.colliderMesh.getAbsolutePosition().subtract(player.collider.getAbsolutePosition());
        this.collisionVector.normalize();

        if (this.onCollect != undefined)
            this.onCollect(player);

        return intersects;
    }


    reset = (): void => {
        this.isCollected = false;
        this.collisionVector = null;
        this.animationFinished = false;

        this.resetInternal();
        this.positionBeforeCollected = undefined;
    }
}