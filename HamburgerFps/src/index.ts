import * as BABYLON from 'babylonjs';

import { HomeRoom } from './homeRoom';
import { LandingRoom } from './landingRoom';
import { AboutRoom } from './aboutRoom';
import { FooterRoom } from './footerRoom';
import { NewsRoom } from './newsRoom';
import { Room } from './room';
import { Player } from './player';

//decalrations
declare function require(name: string);

class Application {
  private canvas: HTMLCanvasElement;
  private engine: BABYLON.Engine;
  private scene: BABYLON.Scene;
  private camera: BABYLON.ArcRotateCamera;

  private playerCamera: BABYLON.FreeCamera;
  private rooms: Room[];
  private currentRoom: Room;
  private player: Player;

  private scoreElement: HTMLElement;

  constructor() {
    this.initEngine();
    this.initAssets();
    this.initScene();
    this.render();
    this.bindEvents();
    this.run();
  }

  render = () => {
    this.calcIntersectionsWithCollectables();
    this.scene.render();
    const fpsLabel = document.getElementById("fpsLabel");
    fpsLabel.innerHTML = this.engine.getFps().toFixed() + " fps";
  }

  run = (): void => {
    this.player = new Player();

    this.player.collider = BABYLON.MeshBuilder.CreateSphere("playerCollider", {
      diameter: 3
    }, null);

    this.player.collider.isVisible = false;
    // this.player.collider.position.z = 2;
    this.player.collider.parent = this.playerCamera;

    this.player.onScoreChanged = (newScore: number) => {
      this.setScore(newScore);
    }

    this.setScore(0);



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

  calcIntersectionsWithCollectables = () => {
    if (this.currentRoom == undefined)
      return;

    for (let i = 0; i < this.currentRoom.collectables.length; i++) {
      const collectable = this.currentRoom.collectables[i];

      collectable.tryCollect(this.player);
      collectable.updateAnimation();
    }
  }

  initAssets = (): void => {
    this.scoreElement = document.getElementById("score");
  }

  bindEvents = (): void => {
  }

  initPlayer = (): void => {
    const spawnPoint = new BABYLON.Vector3(25.476913280864128, 1.6179999994039513, 52.31300114440918);
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

    this.rooms = [
      homeRoom,
      landingRoom,
      aboutRoom,
      footerRoom,
      newsRoom
    ];

    this.initPlayer();

    setInterval(() => {
      for (let i = 0; i < this.rooms.length; i++) {
        const room = this.rooms[i];

        if (room.trigerVolume && this.currentRoom !== room && room.trigerVolume.intersectsPoint(this.playerCamera.position)) {
          const oldRoomName = this.currentRoom == undefined ? '' : this.currentRoom.roomName;
          this.currentRoom = room;
          this.roomChangeHandler(room.roomName, oldRoomName);
          break;
        }
      }
    }, 50);
  }

  roomChangeHandler = (roomName: string, prevRoomName: string): void => {
    console.log("intersection: " + roomName);
    this.hideRoom(prevRoomName);
    this.showRoom(roomName);
  }

  showRoom = (roomName: string): void => {
    const roomElement = document.getElementById(roomName);

    if (roomElement == undefined || !roomElement.classList.contains("hidden"))
      return;

    roomElement.classList.remove("hidden");
  }

  hideRoom = (roomName: string): void => {
    const roomElement = document.getElementById(roomName);

    if (roomElement == undefined || roomElement.classList.contains("hidden"))
      return;

    roomElement.classList.add("hidden");
  }

  setScore = (newScore: number): void => {
    this.scoreElement.innerText = `${newScore}`;
  }
}

const app = new Application();