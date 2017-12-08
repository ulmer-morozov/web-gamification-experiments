import * as BABYLON from 'babylonjs';

export class WallCorner extends BABYLON.Vector3 {

    constructor(x: number, y: number) {
        super(x, 0, y);
    }
}