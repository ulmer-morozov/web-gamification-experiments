import * as BABYLON from "babylonjs";

import { Player } from "./player";
import { HomeRoom } from './homeRoom';
import { LandingRoom } from './landingRoom';
import { AboutRoom } from './aboutRoom';
import { FooterRoom } from './footerRoom';
import { NewsRoom } from './newsRoom';
import { NotFoundRoom } from './notFoundRoom';
import { Room } from "./room";
import { IRoomChangeEvent } from "./iRoomChangeEvent";
import { IRoomChangeEventData } from "./iRoomChangeEventData";
import { ResourceRoom } from "./resourceRoom";

export class Game {
    player: Player;
    playerCamera: BABYLON.FreeCamera;
    rooms: Room[];
    currentRoom: Room;

    defaultCameraSpeed = 1.5;

    static ROOM_CHANGE = "ROOM_CHANGE";

    constructor(private canvas: HTMLCanvasElement, private scene: BABYLON.Scene) {
        this.initPlayerCamera();
        this.initPlayer();
        this.initRooms();
        this.bindEvents();
    }

    bindEvents = (): void => {
        this.canvas.addEventListener(Player.ON_KILL, this.onKilled);
    }

    initPlayer = (): void => {
        this.player = new Player(this.canvas);

        this.player.collider = BABYLON.MeshBuilder.CreateSphere("playerCollider", {
            diameter: 3
        }, null);

        this.player.collider.isVisible = false;
        this.player.collider.parent = this.playerCamera;
    }

    initPlayerCamera = (): void => {
        this.playerCamera = new BABYLON.FreeCamera("camera", BABYLON.Vector3.Zero(), this.scene);

        this.playerCamera.attachControl(this.canvas);
        this.playerCamera.ellipsoid = new BABYLON.Vector3(1.3, 0.8, 1.3);

        this.playerCamera.checkCollisions = true;
        this.playerCamera.applyGravity = true;

        this.playerCamera.keysUp = [87, 38]; // W
        this.playerCamera.keysDown = [83, 40]; // S
        this.playerCamera.keysLeft = [65, 37]; // A
        this.playerCamera.keysRight = [68, 39]; // D

        this.playerCamera.speed = this.defaultCameraSpeed;
        this.playerCamera.inertia = 0.5;
        this.playerCamera.angularSensibility = 500;

    }

    initRooms = (): void => {
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

        const resourceRoom = new ResourceRoom(this.scene);
        resourceRoom.position.set(4.5, 0, 51.9);

        this.rooms = [
            homeRoom,
            landingRoom,
            aboutRoom,
            footerRoom,
            newsRoom,
            notFoundRoom,
            resourceRoom
        ];
    }

    restart = () => {
        const spawnPoint = new BABYLON.Vector3(-20.690283688679465, 1.6049999998807911, 54.01300318944455);
        this.playerCamera.position.copyFrom(spawnPoint);
        this.playerCamera.rotation.set(0, 0, 0);
        this.playerCamera.speed = this.defaultCameraSpeed;

        this.player.reset();
        this.player.collider.computeWorldMatrix(true);


        //reset all collectables
        for (let i = 0; i < this.rooms.length; i++) {
            const room = this.rooms[i];

            for (let j = 0; j < room.collectables.length; j++) {
                const collectable = room.collectables[j];
                collectable.reset();
            }
        }
    }

    onKilled = (event: CustomEvent): void => {
        this.playerCamera.speed = 0;
        this.playKillAnimation();
    }

    calcIntersectionsWithCollectables = (): void => {
        if (this.currentRoom == undefined)
            return;

        for (let i = 0; i < this.currentRoom.collectables.length; i++) {
            const collectable = this.currentRoom.collectables[i];

            collectable.tryCollect(this.player);
            if (this.player.isKilled)
                break;

            collectable.updateAnimation();
        }
    }

    updatePositionInRoom = (): void => {
        for (let i = 0; i < this.rooms.length; i++) {
            const room = this.rooms[i];

            if (room.trigerVolume && this.currentRoom !== room && room.trigerVolume.intersectsPoint(this.playerCamera.position)) {
                const oldRoomName = this.currentRoom == undefined ? '' : this.currentRoom.roomName;
                this.currentRoom = room;

                const eventData: IRoomChangeEventData = {
                    roomName: room.roomName,
                    oldRoomName: oldRoomName
                }
                const roomChangedEvent: IRoomChangeEvent = new CustomEvent(Game.ROOM_CHANGE, { detail: eventData });
                this.canvas.dispatchEvent(roomChangedEvent);
                break;
            }
        }
    }

    playKillAnimation = (): void => {
        const rotationFrom = this.playerCamera.rotation;
        const rotationTo = this.playerCamera.rotation.add(new BABYLON.Vector3(0, 0, Math.PI / 2));

        const keys = [
            {
                frame: 0,
                value: rotationFrom,
            },
            {
                frame: 100,
                value: rotationTo
            }
        ];

        const animationBox = new BABYLON.Animation("killAnimation", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        animationBox.setKeys(keys);

        this.playerCamera.animations = [animationBox];
        this.scene.beginAnimation(this.playerCamera, 0, 100, false, 5);
    }
}