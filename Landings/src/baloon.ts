import * as THREE from 'three';
const _THREE: any = (window as any).THREE = THREE;

require('three/examples/js/loaders/OBJLoader.js');

import { IBaloonParameters } from './contracts/iBaloonParameters';
import { Vector3 } from 'three';

const baloonObj = require('./baloon.obj');
const objLoader = new THREE.OBJLoader();

const baloonEtalonGroup = objLoader.parse(baloonObj);
const baloonEtalonMesh = baloonEtalonGroup.children[0] as THREE.Mesh;
baloonEtalonMesh.rotateX(Math.PI / 2);


export class Baloon {
    public readonly mesh: THREE.Mesh;

    private readonly initialPos: THREE.Vector3;
    private readonly speed: THREE.Vector3;

    constructor(params: IBaloonParameters) {

        this.initialPos = new Vector3(params.posX, params.posY, params.posZ);
        this.speed = new Vector3(params.speedX, params.speedY, params.speedZ);

        this.mesh = baloonEtalonMesh.clone();
        this.mesh.position.copy(this.initialPos);

        const material = new THREE.MeshStandardMaterial(
            {
                envMap: params.envMap,
                // combine: THREE.MixOperation,
                // reflectivity: 0.25,
                // specular: 0x0000ff,
                color: params.color,
                envMapIntensity: 1.2,
                // metalnessMap: metalllMap,
                metalness: 1,
                roughness: 0.32
            }
        );

        this.mesh.material = material;
    }

    step = (): void => {
        this.mesh.position.add(this.speed);
    }

    reset = (): void => {
        this.mesh.position.copy(this.initialPos);
    }
}