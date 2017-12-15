import * as BABYLON from 'babylonjs';

import { HomeRoom } from './homeRoom';
import { LandingRoom } from './landingRoom';
import { AboutRoom } from './aboutRoom';
import { FooterRoom } from './footerRoom';
import { NewsRoom } from './newsRoom';

//decalrations
declare function require(name: string);

class Application {
  private canvas: HTMLCanvasElement;
  private engine: BABYLON.Engine;
  private scene: BABYLON.Scene;
  private camera: BABYLON.ArcRotateCamera;

  private playerCamera: BABYLON.FreeCamera;

  constructor() {
    this.initEngine();
    this.initAssets();
    this.initScene();
    this.render();
    this.bindEvents();
    this.run();
  }

  render = () => {
    this.scene.render();
    const fpsLabel = document.getElementById("fpsLabel");
    fpsLabel.innerHTML = this.engine.getFps().toFixed() + " fps";
  }

  run = (): void => {
    this.engine.runRenderLoop(this.render);
  }

  initEngine = (): void => {
    this.canvas = document.getElementById('glCanvas') as HTMLCanvasElement;
    this.engine = new BABYLON.Engine(this.canvas, true);

    this.scene = new BABYLON.Scene(this.engine);
    this.scene.gravity.y = -0.2;
    // debugger;;
    this.scene.enablePhysics();
    this.canvas.focus();
    // this.camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 10, new BABYLON.Vector3(0, 0, 0), this.scene);
    // this.camera.attachControl(this.canvas, true);
  }

  initAssets = (): void => {

  }

  bindEvents = (): void => {
  }

  initPlayer = (): void => {
    const spawnPoint = new BABYLON.Vector3(14.223273766674208, 1.6049999998807911, 54.022927347505885);
    this.playerCamera = new BABYLON.FreeCamera("camera", spawnPoint, this.scene);

    this.playerCamera.attachControl(this.canvas);
    this.playerCamera.ellipsoid = new BABYLON.Vector3(1.3, 0.8, 1.3);

    this.playerCamera.checkCollisions = true;
    this.playerCamera.applyGravity = true;

    this.playerCamera.keysUp = [87]; // W
    this.playerCamera.keysDown = [83]; // S
    this.playerCamera.keysLeft = [65]; // A
    this.playerCamera.keysRight = [68]; // D

    this.playerCamera.speed = 1.5;
    this.playerCamera.inertia = 0.5;
    this.playerCamera.angularSensibility = 500;

    //for test purpuse
    (document as any).getPlayerPosition = () => {
      console.log(`position: {${this.playerCamera.position.x}, ${this.playerCamera.position.y}, ${this.playerCamera.position.z}}`);
    }
  }


  initScene = (): void => {
    // const ground = BABYLON.Mesh.CreateGround("ground", 500, 500, 2, this.scene);
    // ground.checkCollisions = true;
    // ground.position.y = -0.01;

    const homeRoom = new HomeRoom(this.scene);
    homeRoom.position.set(0, 0, 0);

    const landingRoom = new LandingRoom(this.scene);
    landingRoom.position.set(0, 0, -6 + landingRoom.wallThickness);

    const aboutRoom = new AboutRoom(this.scene);
    aboutRoom.position.set(0, 0, 45);

    const footerRoom = new FooterRoom(this.scene);
    footerRoom.position.set(-20, 0, 60);

    const newsRoom = new NewsRoom(this.scene);
    newsRoom.position.set(15 + 2 * newsRoom.wallThickness, 0, 51);

    this.initPlayer();
  }
}

const app = new Application();