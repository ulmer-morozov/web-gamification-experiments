import * as BABYLON from 'babylonjs';

import { Room } from "./room";
import { Orientation } from "./wallOrientation";
import { Texture } from 'babylonjs';

//decalrations
declare function require(name: string);

export class NotFoundRoom extends Room {
    constructor(scene: BABYLON.Scene) {
        super(scene, "404-room", NotFoundRoom.createTrigerVolume());

        // aliases
        const notFoundRoomParams = {
            wallHeight: this.wallHeight,
            wallThickness: this.wallThickness,
            closed: true
        };

        const wallThickness = notFoundRoomParams.wallThickness;
        const wallHeight = notFoundRoomParams.wallHeight;
        const gap = this.gap;

        const notFoundRoom = this.createWallMesh(
            [
                -3.0, +0.0,
                -3.0, +2.0,
                -9.0, +2.0,
                -9.0, +9.0,
                +0.0, +9.0,
                +0.0, +0.0,
                -3.0, +0.0,
            ],
            Orientation.Right,
            notFoundRoomParams,
            false
        );

        const notFoundRoomOuterWall = this.createWallMesh(
            [
                -4.00, 1 * wallThickness,
                -4.00, +2.0,
                -10.0, +2.0,
                -10.0, +9.5,
                +1.00, +9.5,
                +1.00, 1 * wallThickness,
            ],
            Orientation.Left,
            {
                wallHeight: this.wallHeight,
                wallThickness: this.wallThickness,
                closed: false
            }
        );

        const wallTexture = new BABYLON.Texture(require("./images/brick2.jpg"), this.scene);
        wallTexture.vOffset = 0.09;

        const floorWidth = 12;
        const floorHeight = 10;

        const floor = this.createFloor(floorWidth, floorHeight, require("./images/marble_red2.jpg"));
        floor.position.y = 2 * gap;
        floor.position.x = -floorWidth / 2 + 2;
        floor.position.z = floorHeight / 2;
        // floor.rotation.x = Math.PI / 20;

        const floorTexture = ((floor.material as BABYLON.StandardMaterial).diffuseTexture as Texture);
        floorTexture.uScale = floorWidth / 2;
        floorTexture.vScale = floorHeight / 2;


        notFoundRoomOuterWall.material = this.createDefaultMaterialWithColor(new BABYLON.Color3(0, 0, 0));

        BABYLON.Effect.ShadersStore["customVertexShader"] = `
        precision highp float;
  
        // Attributes
        attribute vec3 position;
        attribute vec3 normal;
        attribute vec2 uv;
        
        // Uniforms
        uniform mat4 worldViewProjection;
        uniform float time;
        
        // Varying
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUV;
        
        void main(void) {
            vec3 v = position;
            if(v.x < v.z && v.y > 1.0)
                v.z += sin(1.0 * position.y + 5.0*(time)) * 0.9;
            if(v.z > 1.0 && v.y > 1.0)
                v.x += sin(1.0 * position.z + 5.0*(time)) * 0.5;
            
            gl_Position = worldViewProjection * vec4(v, 1.0);
            
            vPosition = position;
            vNormal = normal;
            vUV = uv;
        }
        `;

        BABYLON.Effect.ShadersStore["customFragmentShader"] = `
        precision highp float;
  
        varying vec2 vUV;
  
        uniform sampler2D textureSampler;
  
        void main(void) {
          gl_FragColor = texture2D(textureSampler, vUV);
        }
        `

        const shaderMaterial = new BABYLON.ShaderMaterial("glitchShaderWallMaterial", scene,
            {
                vertex: "custom",
                fragment: "custom",
            },
            {
                attributes: ["position", "normal", "uv"],
                uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
            }
        );

        shaderMaterial.setTexture("textureSampler", wallTexture);

        notFoundRoom.material = shaderMaterial;

        const ceiling = this.createCeiling(floorWidth, floorHeight, require("./images/laminate_wood.jpg"));
        ceiling.position.copyFrom(floor.position);
        ceiling.position.y = wallHeight - gap;

        const ceilingTexture = ((ceiling.material as BABYLON.StandardMaterial).diffuseTexture as Texture);
        ceilingTexture.uScale = floorWidth / 4;
        ceilingTexture.vScale = floorHeight / 4;

        const coinY = 0.5;
        this.addCoin(-2, coinY, 7);
        this.addCoin(-2, coinY, 4);

        this.addCoin(-4, coinY, 7);
        this.addCoin(-4, coinY, 4);

        this.addCoin(-6, coinY, 7);
        this.addCoin(-6, coinY, 4);

        this.addCross(-5, 1.5, 5.5);
    }

    static createTrigerVolume = (): BABYLON.Mesh => {
        const roofParams = {
            height: 5,
            width: 12,
            depth: 10
        };

        const mesh = BABYLON.MeshBuilder.CreateBox("boundBox", roofParams);
        mesh.position.set(-roofParams.height / 2 - 2, 0, roofParams.depth / 2 + 0.001);
        return mesh;
    }
}