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

  constructor() {
    this.initEngine();
    this.initUI();
    this.initGame();
    this.bindEvents();
    this.run();
  }

  time = 0;
  render = () => {
    const shaderMaterial = this.scene.getMaterialByName("glitchShaderWallMaterial") as BABYLON.ShaderMaterial;
    shaderMaterial.setFloat("time", this.time);
    this.time += 0.02;

    this.game.calcIntersectionsWithCollectables();
    this.scene.render();
  }

  run = (): void => {
    //defaults
    this.setScore(0);

    this.engine.runRenderLoop(this.render);

    //for test purpuse
    (document as any).getPlayerPosition = () => {
      const playerPosition = this.game.playerCamera.position;
      console.log(`position: {${playerPosition.x}, ${playerPosition.y}, ${playerPosition.z}}`);
    }
  }

  initEngine = (): void => {
    this.canvas = document.getElementById('glCanvas') as HTMLCanvasElement;
    this.engine = new BABYLON.Engine(this.canvas, true);

    this.scene = new BABYLON.Scene(this.engine);
    this.scene.gravity.y = -0.2;
    this.scene.enablePhysics();
    this.canvas.focus();
  }

  initUI = (): void => {
    this.scoreElement = document.getElementById("score");
    this.gameOverElement = document.getElementById("gameover");

    const fpsLabel = document.getElementById("fpsLabel");
    fpsLabel.innerHTML = this.engine.getFps().toFixed() + " fps";
  }

  initGame = (): void => {
    this.game = new Game(this.canvas, this.scene);
  }

  bindEvents = (): void => {
    this.canvas.addEventListener(Player.ON_KILL, this.onKilled);
    this.canvas.addEventListener(Player.SCORE_CHANGE, this.onScoreChange);
    this.canvas.addEventListener(Game.ROOM_CHANGE, this.onRoomChange);

    setInterval(this.game.updatePositionInRoom, 50);
  }

  onRoomChange = (event: IRoomChangeEvent): void => {
    this.hideRoom(event.detail.oldRoomName);
    this.showRoom(event.detail.roomName);
  }

  onKilled = (event: CustomEvent): void => {
    document.getElementById("gameover-text").innerText = event.detail.reason;
    this.gameOverElement.style.opacity = "1";
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

  setScore = (newScore: number): void => {
    this.scoreElement.innerText = `${newScore}`;
  }
}

const app = new Application();