import * as BABYLON from 'babylonjs';

import { HomeRoom } from './homeRoom';
import { LandingRoom } from './landingRoom';
import { AboutRoom } from './aboutRoom';
import { FooterRoom } from './footerRoom';

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
    // const spawnPoint = new BABYLON.Vector3(-19.9, 1.6, 55.5);
    const spawnPoint = new BABYLON.Vector3(0, 1.6, 32);
    // const spawnPoint = new BABYLON.Vector3(0, 1.6, -2);
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
      console.log("position: " + this.playerCamera.position);
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
    footerRoom.position = new BABYLON.Vector3(-20, 0, 60);

    this.initPlayer();
  }
}

const app = new Application();