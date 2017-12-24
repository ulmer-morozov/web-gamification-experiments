import * as BABYLON from 'babylonjs';

import { Player } from './player';
import { Game } from './game';
import { JawQuery } from './jawQuery';
import { IRoomChangeEvent } from './iRoomChangeEvent';

//decalrations
declare function require(name: string);

class Application {
  private canvas: HTMLCanvasElement;
  private engine: BABYLON.Engine;
  private scene: BABYLON.Scene;
  private game: Game;

  private gameOverElement: HTMLElement;
  private scoreElement: HTMLElement;
  private messageElement: HTMLElement;
  private helpElement: HTMLElement;
  private needRestartGame: boolean;

  constructor() {
    this.initEngine();
    this.initUI();
    this.initGame();
    this.bindEvents();
    this.run();
  }

  time = 0;
  render = () => {
    if (this.needRestartGame) {
      this.game.restart();
      this.needRestartGame = false;
    }
    const shaderMaterial = this.scene.getMaterialByName("glitchShaderWallMaterial") as BABYLON.ShaderMaterial;
    shaderMaterial.setFloat("time", this.time);
    this.time += 0.02;

    this.game.calcIntersectionsWithCollectables();
    this.scene.render();
  }

  run = (): void => {
    this.needRestartGame = true;
    this.engine.runRenderLoop(this.render);

    //for test purpuse
    (document as any).getPlayerPosition = () => {
      const playerPosition = this.game.playerCamera.position;
      console.log(`position: {${playerPosition.x}, ${playerPosition.y}, ${playerPosition.z}}`);
    }



    // var i = 1;
    // setInterval(() => {
    //   this.showMessage("ghost " + i);
    //   i++;
    // }, 1500);
  }

  animationendHandler = () => {
    JawQuery.removeClass(this.messageElement.id, "active");
  }

  showMessage = (text: string): void => {
    const options: AddEventListenerOptions = {
      once: true
    };
    this.messageElement.innerText = text;
    this.messageElement.removeEventListener("animationend", this.animationendHandler, options);
    JawQuery.removeClass(this.messageElement.id, "active");

    setTimeout(() => {
      this.messageElement.addEventListener("animationend", this.animationendHandler, options);
      JawQuery.addClass(this.messageElement.id, "active");
    });
  }

  initEngine = (): void => {
    this.canvas = document.getElementById('glCanvas') as HTMLCanvasElement;
    this.engine = new BABYLON.Engine(this.canvas, true);

    this.scene = new BABYLON.Scene(this.engine);
    this.scene.gravity.y = -0.2;
    this.scene.enablePhysics();
    // this.canvas.focus();
  }

  initUI = (): void => {
    this.scoreElement = document.getElementById("score");
    this.gameOverElement = document.getElementById("gameover");
    this.messageElement = document.getElementById("message");
    this.helpElement = document.getElementById("help");

    const fpsLabel = document.getElementById("fpsLabel");
    fpsLabel.innerHTML = this.engine.getFps().toFixed() + " fps";
  }

  initGame = (): void => {
    this.game = new Game(this.canvas, this.scene);
  }

  bindEvents = (): void => {
    this.canvas.addEventListener(Player.ON_KILL, this.onKilled);
    this.canvas.addEventListener(Player.ON_MESSAGE, this.onMessageRecieved);
    this.canvas.addEventListener(Player.SCORE_CHANGE, this.onScoreChange);
    this.canvas.addEventListener(Game.ROOM_CHANGE, this.onRoomChange);

    this.initPointerLock();
    setInterval(this.game.updatePositionInRoom, 50);

    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }

  onRoomChange = (event: IRoomChangeEvent): void => {
    this.hideRoom(event.detail.oldRoomName);
    this.showRoom(event.detail.roomName);
  }

  onMessageRecieved = (event: CustomEvent): void => {
    this.showMessage(event.detail.text);
  }

  onKilled = (event: CustomEvent): void => {
    this.showGameover(event.detail.reason);

    const somekeyDown = (): void => {
      document.removeEventListener("keydown", somekeyDown, false);
      this.hideGameover();
      this.needRestartGame = true;
    }

    const keyListenerDelay = 1000;

    const registerSomeKeyDownRestart = () => {
      document.addEventListener("keydown", somekeyDown, false);
    };

    setTimeout(registerSomeKeyDownRestart, keyListenerDelay);
  }

  onScoreChange = (event: CustomEvent): void => {
    this.setScore(event.detail.score);
  }

  /* HELPERS */
  showRoom = (roomName: string): void => {
    JawQuery.removeClass(roomName, "hidden");
  }

  hideRoom = (roomName: string): void => {
    JawQuery.addClass(roomName, "hidden");
  }

  showGameover = (reason: string): void => {
    this.gameOverElement.style.opacity = "1";
    document.getElementById("gameover-text").innerText = reason;
  }

  hideGameover = (): void => {
    this.gameOverElement.style.opacity = "0";
  }


  setScore = (newScore: number): void => {
    this.scoreElement.innerText = `${newScore}`;
  }

  initPointerLock = (): void => {
    const canvas = this.canvas;

    const requestPointerLockHandler = (event: Event): void => {
      canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
      if (canvas.requestPointerLock) {
        canvas.requestPointerLock();
      }
      this.canvas.focus();
    }
    canvas.addEventListener("click", requestPointerLockHandler, false);

    this.helpElement.addEventListener("click", (event: Event) => {
      requestPointerLockHandler(event);
      JawQuery.addClassHideAfterAnim(this.helpElement, "hidden");
    }, false);

    const pointerlockchange = (event): void => {
      const controlEnabled = (
        document.mozPointerLockElement === canvas
        || document.webkitPointerLockElement === canvas
        || document.msPointerLockElement === canvas
        || document.pointerLockElement === canvas);

      if (!controlEnabled) {
        this.game.playerCamera.detachControl(canvas);
        this.helpElement.style.display = "inherit";
        setTimeout(() => this.helpElement.classList.remove("hidden"));
      } else {
        this.game.playerCamera.attachControl(canvas);
      }
    };

    document.addEventListener("pointerlockchange", pointerlockchange, false);
    document.addEventListener("mspointerlockchange", pointerlockchange, false);
    document.addEventListener("mozpointerlockchange", pointerlockchange, false);
    document.addEventListener("webkitpointerlockchange", pointerlockchange, false);
  }
}

const app = new Application();