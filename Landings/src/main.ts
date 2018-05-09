import * as THREE from 'three';
import * as anime from 'animejs';

const _THREE: any = (window as any).THREE = THREE;

require('three/examples/js/controls/OrbitControls');
require('three/examples/js/loaders/OBJLoader.js');

import './style.scss';
import { Baloon } from './baloon';
import { IBaloonParameters } from './contracts/iBaloonParameters';
const fontData = require('three/examples/fonts/droid/droid_sans_bold.typeface.json');
// './Khula ExtraBold_Regular.json'
// './Bevan_Regular.json'

class Main {
    private camera: THREE.PerspectiveCamera;
    private scene: THREE.Scene;
    private renderer: THREE.WebGLRenderer;

    private envMap: THREE.Texture;
    private textMesh: THREE.Mesh;

    private baloons: Baloon[];

    private canvasElement: HTMLCanvasElement;

    private settings = {
        textColor: 0x42F2F7,
        bgColor: 0xFFE74C
    };

    constructor() {
        this.init();
        this.addTextMesh();
        this.addBaloons();
        this.render();
    }

    private init = (): void => {

        this.canvasElement = document.getElementById('hero') as HTMLCanvasElement;

        this.camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.01, 1000);

        const controls = new THREE.OrbitControls(this.camera, this.canvasElement);

        this.camera.position.set(0, 0, 80);
        controls.update();

        this.scene = new THREE.Scene();

        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);

        this.renderer = new THREE.WebGLRenderer(
            {
                antialias: true,
                canvas: this.canvasElement,
                alpha: true
            }
        );

        const devicePixelRatio = window.devicePixelRatio ? window.devicePixelRatio : 1;

        this.renderer.setPixelRatio(devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight, true);

        this.envMap = this.getEnvMap();
    }

    private addTextMesh = (): void => {
        const font = new THREE.Font(fontData);

        const textGeom = new THREE.TextGeometry('SALE', {
            font: font,
            size: 10,
            height: 1,
            curveSegments: 10,
            bevelEnabled: true,
            bevelThickness: 2,
            bevelSize: 0.5,
            bevelSegments: 10
        });

        const textMaterial = new THREE.MeshStandardMaterial(
            {
                envMap: this.envMap,
                // combine: THREE.MixOperation,
                // reflectivity: 0.25,
                // specular: 0x0000ff,
                color: this.settings.textColor,
                envMapIntensity: 1.2,
                // metalnessMap: metalllMap,
                metalness: 1,
                roughness: 0.32
            }
        );

        this.textMesh = new THREE.Mesh(textGeom, textMaterial);
        const box = new THREE.Box3().setFromObject(this.textMesh);

        const cx = -box.max.x / 2;
        const cy = -box.max.y / 4;

        this.textMesh.geometry
            .translate(cx, cy, 0);

        this.scene.add(this.textMesh);
    }

    private addBaloons = (): void => {
        this.baloons = [];

        const add = (params: IBaloonParameters): void => {
            if (params.color === undefined)
                params.color = 0xff0000;

            params.envMap = this.envMap;

            const baloon = new Baloon(params);

            this.baloons.push(baloon);
            this.scene.add(baloon.mesh);
        };

        add({
            posX: -30,
            posY: -70,
            posZ: 20,
            speedY: 1.3
        });

        add({
            posX: -20,
            posY: -90,
            posZ: -50,
            speedY: 1.2
        });

        add({
            posX: 10,
            posY: -110,
            posZ: -20,
            speedY: 0.9
        });

        add({
            posX: 50,
            posY: -150,
            posZ: -100,
            speedY: 0.9
        });

        this.resetBaloons();
    }

    public btnOnClick = (): void => {
        this.resetBaloons();


        // this.textMesh.rotation.y = 0;

        this.textMesh.scale.set(1, 1, 1);

        const animation = anime({
            targets: this.textMesh.scale,
            x: this.textMesh.scale.x * 2,
            y: this.textMesh.scale.y * 2,
            z: this.textMesh.scale.z * 2,
            // duration: 400,
            easing: 'easeInOutElastic'
        });
    }

    private resetBaloons = (): void => {
        for (let i = 0; i < this.baloons.length; i++)
            this.baloons[i].reset();
    }

    private getEnvMap = (): THREE.Texture => {
        const pad = (num: number, places: number): string => {
            const zero = places - num.toString().length + 1;
            return Array(+(zero > 0 && zero)).join('0') + num;
        };

        const getMapUrl = (fileName: string, resolution: number, side: number, extension: string): string => {
            const url = `${fileName}_${resolution}_000${side}${extension}`;
            return url;
        };

        const getMapUrls = (fileName: string, resolution: number, extension: string): string[] => {
            const urls = [
                getMapUrl(fileName, resolution, 1, extension),
                getMapUrl(fileName, resolution, 2, extension),
                getMapUrl(fileName, resolution, 3, extension),
                getMapUrl(fileName, resolution, 4, extension),
                getMapUrl(fileName, resolution, 5, extension),
                getMapUrl(fileName, resolution, 6, extension)
            ];
            return urls;
        };

        const mapIndex = 10;

        const mapNum = pad(mapIndex, 2);
        const pngMapUrls = getMapUrls(`GSG_PRO_STUDIOS_METAL_0${mapNum}`, 1024, '.png');

        const envMaptexture = new THREE.CubeTextureLoader()
            .setPath('./images/maps/')
            .load(pngMapUrls);

        // const metalllMap = THREE.ImageUtils.loadTexture('./images/maps/bump.jpg');
        // metalllMap.mapping = THREE.CubeUVReflectionMapping;

        return envMaptexture;
    }

    private render = (): void => {
        for (let i = 0; i < this.baloons.length; i++)
            this.baloons[i].step();

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render);
    }
}

(window as any).app = new Main();