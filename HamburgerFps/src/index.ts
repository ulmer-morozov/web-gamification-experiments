import * as BABYLON from 'babylonjs';

import { HomeRoom } from './homeRoom';
import { LandingRoom } from './landingRoom';
import { AboutRoom } from './aboutRoom';
import { FooterRoom } from './footerRoom';
import { NewsRoom } from './newsRoom';
import { NotFoundRoom } from './notFoundRoom';
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

  private gameOverElement: HTMLElement;
  private scoreElement: HTMLElement;

  constructor() {
    this.initEngine();
    this.initAssets();
    this.initScene();
    this.render();
    this.bindEvents();
    this.run();
  }

  time = 0;
  render = () => {


    var shaderMaterial = this.scene.getMaterialByName("glitchShaderWallMaterial") as BABYLON.ShaderMaterial;
    shaderMaterial.setFloat("time", this.time);
    this.time += 0.02;



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

    this.player.onKilled = this.onKilled;

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
    this.gameOverElement = document.getElementById("gameover");
  }

  bindEvents = (): void => {
  }

  initPlayer = (): void => {
    const spawnPoint = new BABYLON.Vector3(-19.303563518995645, -0.33835735613668816, 73.15507997238659);
    this.playerCamera = new BABYLON.FreeCamera("camera", spawnPoint, this.scene);

    this.playerCamera.attachControl(this.canvas);
    this.playerCamera.ellipsoid = new BABYLON.Vector3(1.3, 0.8, 1.3);

    this.playerCamera.checkCollisions = true;
    this.playerCamera.applyGravity = true;

    this.playerCamera.keysUp = [87, 38]; // W
    this.playerCamera.keysDown = [83, 40]; // S
    this.playerCamera.keysLeft = [65, 37]; // A
    this.playerCamera.keysRight = [68, 39]; // D

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

    const notFoundRoom = new NotFoundRoom(this.scene);
    notFoundRoom.position.set(13, 0, 60);

    this.rooms = [
      homeRoom,
      landingRoom,
      aboutRoom,
      footerRoom,
      newsRoom,
      notFoundRoom
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

  onKilled = (reason: string): void => {
    console.log("killed!");

    this.playerCamera.speed = 0;

    const rotationFrom = this.playerCamera.rotation;
    const rotationTo = this.playerCamera.rotation.add(new BABYLON.Vector3(0, 0, Math.PI / 2));


    const animationBox = new BABYLON.Animation("killAnimation", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

    const keys = [
      {
        frame: 0,
        value: rotationFrom,
      },
      {
        frame: 100,
        // inTangent: new BABYLON.Vector3(-1, 0, 0),
        value: rotationTo
      }
    ];

    animationBox.setKeys(keys);

    this.playerCamera.animations = [];
    this.playerCamera.animations.push(animationBox);

    document.getElementById("gameover-text").innerText = reason;
    this.gameOverElement.style.opacity = "1";

    this.scene.beginAnimation(this.playerCamera, 0, 100, false, 5);
  }
}

const app = new Application();