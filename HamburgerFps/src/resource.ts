import { Howl } from "howler";

import { Collectable } from "./collectable";
import { Player } from "./player";

//decalrations
declare function require(name: string);

export class Resource extends Collectable {
    collectSound = new Howl({
        src: [require('./sounds/pickup.mp3')]
    });

    constructor(private text: string, private resMaterial: BABYLON.StandardMaterial) {
        super();
        this.init();
    }

    createCollider = (): BABYLON.Mesh => {
        const cubeSideSize = 1.5;
        const cubeParams = {
            height: cubeSideSize,
            width: cubeSideSize,
            depth: cubeSideSize
        };

        const resourceMesh = BABYLON.MeshBuilder.CreateBox("resource", cubeParams);
        resourceMesh.material = this.resMaterial;
        resourceMesh.parent = this;

        return resourceMesh;
    }

    protected CanCollect = (player: Player): boolean => true;

    onCollect = (player: Player): void => {
        player.addScore(22);
        player.pullMessage(`${this.text}!`);

        this.collectSound.play();
    }

    updateAnimation = () => {
    }

    onAnimationFinished = (): void => {
    }

    resetInternal = () => {
        this.setEnabled(true);
    }
}