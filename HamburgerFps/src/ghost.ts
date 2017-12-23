import { Collectable } from "./collectable";
import { Player } from "./player";

//decalrations
declare function require(name: string);

export class Ghost extends Collectable {
    private static _material: BABYLON.MultiMaterial;

    private motionFromPoint: BABYLON.Vector3;
    private motionToPoint: BABYLON.Vector3;

    //calculated properties
    private pathIndex: number;
    private currentStep: number;
    private stepCount: number;
    private evicted: boolean;

    constructor(
        private readonly size: number = 1.5,
        private scene: BABYLON.Scene,
        private track: BABYLON.Vector3[],
        private speed: number,
        private initialRotation: BABYLON.Vector3 = BABYLON.Vector3.Zero()
    ) {
        super();
        this.init();

        this.evicted = false;
        this.pathIndex = 0;
        this.currentStep = 0;
        this.rotation.copyFrom(this.initialRotation);
        this.position.copyFrom(track[0]);

        this.updateMotionPoints();
    }

    private static getMaterial = (scene: BABYLON.Scene): BABYLON.MultiMaterial => {
        if (Ghost._material != undefined)
            return Ghost._material;

        const ghostBack = Ghost.createMaterial(new BABYLON.Color3(1.00, 1.00, 1.00), scene);
        const ghostFace = Ghost.createMaterial(new BABYLON.Color3(1.00, 1.00, 1.00), scene);

        ghostFace.diffuseTexture = new BABYLON.Texture(require('./images/ghost_face.jpg'), scene);
        const multiMaterial = new BABYLON.MultiMaterial("ghostMaterial", scene);

        multiMaterial.subMaterials.push(ghostBack);
        multiMaterial.subMaterials.push(ghostFace);
        multiMaterial.subMaterials.push(ghostBack);
        multiMaterial.subMaterials.push(ghostBack);
        multiMaterial.subMaterials.push(ghostBack);
        multiMaterial.subMaterials.push(ghostBack);

        Ghost._material = multiMaterial;
        return Ghost._material;
    }

    private static createMaterial = (color: BABYLON.Color3, scene: BABYLON.Scene): BABYLON.StandardMaterial => {
        const material = new BABYLON.StandardMaterial("material5", scene);

        material.backFaceCulling = true;
        material.disableLighting = true;
        material.emissiveColor = color;
        material.alpha = 0.5;

        return material;
    }

    createCollider = (): BABYLON.Mesh => {
        const colliderParams = {
            height: this.size,
            width: this.size,
            depth: this.size
        };

        const mesh = BABYLON.MeshBuilder.CreateBox("roof", colliderParams, null);
        // mesh.rotation.z = Math.PI / 2;
        mesh.parent = this;
        // mesh.showBoundingBox = true;

        mesh.subMeshes = [];
        const verticesCount = mesh.getTotalVertices();
        mesh.subMeshes.push(new BABYLON.SubMesh(0, 0, verticesCount, 0, 6, mesh));
        mesh.subMeshes.push(new BABYLON.SubMesh(1, 1, verticesCount, 6, 6, mesh));
        mesh.subMeshes.push(new BABYLON.SubMesh(2, 2, verticesCount, 12, 6, mesh));
        mesh.subMeshes.push(new BABYLON.SubMesh(3, 3, verticesCount, 18, 6, mesh));
        mesh.subMeshes.push(new BABYLON.SubMesh(4, 4, verticesCount, 24, 6, mesh));
        mesh.subMeshes.push(new BABYLON.SubMesh(5, 5, verticesCount, 30, 6, mesh));
        mesh.material = Ghost.getMaterial(this.scene);

        return mesh;
    }

    protected CanCollect = (player: Player): boolean => true;

    onCollect = (player: Player): void => {
        if (player.inventory.cross) {
            this.evicted = true;
            player.addScore(2500);

            const cross = player.inventory.cross;

            cross.isVisible = false;
            cross.setEnabled(false);

            player.inventory.cross = undefined;
            player.pullMessage("Ghostbuster!");
            return
        }

        console.log("killed");
        player.kill("killed by ghost");
    }

    updateAnimation = () => {
        if (this.animationFinished)
            return;

        if (!this.isCollected) {
            this.incStep();
            return;
        }

        if (!this.evicted)
            return;

        this.scaling = this.scaling.scale(0.8);

        const direction = new BABYLON.Vector3(this.collisionVector.x, 0.3, this.collisionVector.z);
        this.position.addInPlace(direction.scale(0.3));

        const minSize = 0.05;
        if (this.scaling.x < minSize) {
            this.animationFinished = true;
            this.onAnimationFinished();
        }
    }

    updateMotionPoints = (): void => {
        this.motionFromPoint = this.track[this.pathIndex];
        this.motionToPoint = this.track[(this.pathIndex + 1) % this.track.length];

        const distance = this.motionFromPoint.subtract(this.motionToPoint).length();
        this.stepCount = Math.ceil(distance / this.speed);
    }

    incStep = (): void => {
        this.currentStep = (this.currentStep + 1) % this.stepCount;

        if (this.currentStep === 0) {
            //new cicle
            this.pathIndex = (this.pathIndex + 1) % this.track.length;
            this.updateMotionPoints();

            if (this.initialRotation.length() === 0)
                this.lookAt(this.motionToPoint);
        }
        const between = this.motionToPoint.subtract(this.motionFromPoint);
        const relativePosition = between.scale(this.currentStep / this.stepCount);
        const absolutePosition = this.motionFromPoint.add(relativePosition);

        this.position.copyFrom(absolutePosition);
    }

    onAnimationFinished = (): void => {
        // this.dispose();
        this.setEnabled(false);
        this.isVisible = false;
        debugger
    }

    protected resetInternal = (): void => {
        this.isVisible = true;
        this.evicted = false;
        this.rotation.copyFrom(this.initialRotation);
        this.position.copyFrom(this.track[0]);
        this.scaling.set(1, 1, 1);
        this.pathIndex = 0;
        this.currentStep = 0;
        this.updateMotionPoints();
        this.setEnabled(true);
    }
}