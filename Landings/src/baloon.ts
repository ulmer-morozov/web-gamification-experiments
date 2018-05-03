import * as THREE from 'three';
const _THREE: any = (window as any).THREE = THREE;

require('three/examples/js/loaders/OBJLoader.js');

const baloonObj = require('./baloon.obj');
const objLoader = new THREE.OBJLoader();

const baloonEtalonGroup = objLoader.parse(baloonObj);
const baloonEtalonMesh = baloonEtalonGroup.children[0] as THREE.Mesh;
baloonEtalonMesh.rotateX(Math.PI / 2);


export class Baloon {
    public mesh: THREE.Mesh;

    constructor(parameters: { color: number, envMap?: THREE.Texture }) {
        this.mesh = baloonEtalonMesh.clone();

        const material = new THREE.MeshStandardMaterial(
            {
                envMap: parameters.envMap,
                // combine: THREE.MixOperation,
                // reflectivity: 0.25,
                // specular: 0x0000ff,
                color: parameters.color,
                envMapIntensity: 1.2,
                // metalnessMap: metalllMap,
                metalness: 1,
                roughness: 0.32
            }
        );

        this.mesh.material = material;
    }
}