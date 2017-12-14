import * as BABYLON from 'babylonjs';
import { Orientation } from './wallOrientation';

const elementsForOnePosition = 3;// (x, y, z)

export class Wall2 {
    public corners: BABYLON.Vector2[];

    constructor(cornerData: number[], orientation: Orientation) {
        if (cornerData == undefined)
            throw new Error("для создания стены необходимы данные");

        if (!(cornerData instanceof Array))
            throw new Error("для создания стены необходим массив данных");

        if (cornerData.length % 2 !== 0)
            throw new Error("для создания стены необходим четный массив данных [x1, y1, x2, y2, ...]");

        this.corners = new Array<BABYLON.Vector2>();

        for (let i = 0; i < cornerData.length - 1; i += 2) {
            const x = cornerData[i];
            const y = cornerData[i + 1];

            const newCorner = new BABYLON.Vector2(x, y);
            this.corners.push(newCorner);
        }

        if (orientation === Orientation.Right)
            this.corners = this.corners.reverse();
    }

    createMesh = (params: { wallHeight: number, wallThickness: number }): BABYLON.Mesh => {

        this.corners = this.corners.reverse();
        const wallHeight = params.wallHeight;
        const wallThickness = params.wallThickness;

        const trianglesInOneWallPlate = 2;
        let closed = false;

        const wallPlateCount = closed ? this.corners.length : this.corners.length - 1;

        const bottomInnerPositions: number[] = [];
        const topInnerPositions: number[] = [];

        for (let i = 0; i < this.corners.length; i++) {
            const corner = this.corners[i];

            // основание
            bottomInnerPositions.push(corner.x, 0, corner.y);
            // верх
            topInnerPositions.push(corner.x, wallHeight, corner.y);
        }

        let v1 = new BABYLON.Vector2(2, 0);
        let v2 = new BABYLON.Vector2(-2, 1);

        let angle = Math.acos(BABYLON.Vector2.Dot(v1.normalize(), v2.normalize())) * 180 / Math.PI;

        // debugger;


        const bottomOuterPositions: number[] = [];
        const topOuterPositions: number[] = [];

        let angleBetween = 0;
        let prevDirection = BABYLON.Vector2.Zero();
        let currDirection = BABYLON.Vector2.Zero();

        let prevDirection3 = BABYLON.Vector3.Zero();
        let currDirection3 = BABYLON.Vector3.Zero();

        let outerCorners = new Array<BABYLON.Vector2>();


        for (let i = 0; i < this.corners.length; i++) {
            const currentCorner = this.corners[i];

            const nextCorner = this.corners[(i + 1) % this.corners.length];
            nextCorner.subtractToRef(currentCorner, currDirection);

            //небольшая хитрость чтобы избежать отрицательных значений
            //для точки до нулевой
            const prevCorner = this.corners[(this.corners.length + i - 1) % this.corners.length];
            currentCorner.subtractToRef(prevCorner, prevDirection);

            if (!closed && i == 0) {
                //считаем, что направление не менялось,
                //чтобы нормаль была перпендикулярна первому сегменту
                prevDirection = currDirection.clone();
            }

            if (!closed && i == this.corners.length - 1) {
                //считаем, что направление не менялось,
                //чтобы нормаль была перпендикулярна последнему сегменту
                currDirection = prevDirection.clone();
            }

            prevDirection.normalize();
            currDirection.normalize();

            angleBetween = Math.acos(BABYLON.Vector2.Dot(prevDirection, currDirection));

            let prevDirectionNormal = new BABYLON.Vector2(prevDirection.y, -1 * prevDirection.x);
            prevDirectionNormal.normalize();

            prevDirection3.x = prevDirection.x;
            prevDirection3.z = prevDirection.y;

            currDirection3.x = currDirection.x;
            currDirection3.z = currDirection.y;

            let res = BABYLON.Vector3.Cross(prevDirection3, currDirection3);
            let wallVector = prevDirectionNormal.scale(wallThickness);
            let angleX = (Math.PI - angleBetween) / 2;

            let tangleX = Math.tan(angleX);
            let cSideLength = tangleX === 0 ? 0 : wallThickness / tangleX;
            let cSideVector = prevDirection.scale(- Math.sign(res.y) * cSideLength);

            let relativeOuterCornerVector = wallVector.add(cSideVector);
            let outerCornerVector = currentCorner.add(relativeOuterCornerVector);

            outerCorners.push(outerCornerVector);

            // основание
            bottomOuterPositions.push(outerCornerVector.x, 0, outerCornerVector.y);
            // верх
            topOuterPositions.push(outerCornerVector.x, wallHeight, outerCornerVector.y);
        }

        const positions: number[] = []
            .concat(bottomInnerPositions)
            .concat(topInnerPositions)
            .concat(bottomOuterPositions)
            .concat(topOuterPositions);

        const innerWallIndices = Wall2.createIndices({
            closed: closed,
            clockwise: true,
            positionsOne: bottomInnerPositions,
            positionsTwo: topInnerPositions,
            sideOneOffset: 0,
            sideTwoOffset: bottomInnerPositions.length / elementsForOnePosition
        });

        const outerWallIndices = Wall2.createIndices({
            closed: closed,
            clockwise: false,
            positionsOne: bottomOuterPositions,
            positionsTwo: topOuterPositions,
            sideOneOffset: (bottomInnerPositions.length + topInnerPositions.length) / elementsForOnePosition,
            sideTwoOffset: (bottomInnerPositions.length + topInnerPositions.length + bottomOuterPositions.length) / elementsForOnePosition
        });

        const topIndices = Wall2.createIndices({
            closed: closed,
            clockwise: true,
            positionsOne: topInnerPositions,
            positionsTwo: topOuterPositions,
            sideOneOffset: (bottomInnerPositions.length) / elementsForOnePosition,
            sideTwoOffset: (bottomInnerPositions.length + topInnerPositions.length + bottomOuterPositions.length) / elementsForOnePosition
        });

        const bottomIndices = Wall2.createIndices({
            closed: closed,
            clockwise: false,
            positionsOne: bottomInnerPositions,
            positionsTwo: bottomOuterPositions,
            sideOneOffset: 0,
            sideTwoOffset: (bottomInnerPositions.length + topInnerPositions.length) / elementsForOnePosition
        });

        let indices = innerWallIndices
            .concat(outerWallIndices)
            .concat(topIndices)
            .concat(bottomIndices);

        let uvs: number[] = [];

        const innerWallUVs = Wall2.createWallUVs({
            closed: closed,
            wallHeight: wallHeight,
            corners: this.corners
        });

        const outerWallUVs = Wall2.createWallUVs({
            closed: closed,
            wallHeight: wallHeight,
            corners: outerCorners
        });

        uvs = uvs
            .concat(innerWallUVs)
            .concat(outerWallUVs);

        // зальем концы разомкнутой стены
        if (!closed) {

            const addCornerPositionsAndReturnIndiceIndex = (newCorner: BABYLON.Vector2, verticalPosition: number) => {
                const position = positions.length / elementsForOnePosition;
                positions.push(newCorner.x, verticalPosition, newCorner.y);
                return position;
            }

            //используем новые вертексы, чтобы избавиться от искажений текстур на краях
            const outerStartCornerDup = outerCorners[0];
            const relativeWallThickness = wallThickness / wallHeight;
            const lastUForStartOfInnerWall = 0;

            const outerTopStartCornerDupIndex = addCornerPositionsAndReturnIndiceIndex(outerStartCornerDup, wallHeight);
            uvs.push(lastUForStartOfInnerWall - relativeWallThickness, 1); //для  новых точек надо добавить координаты текстуры

            const outerBottomStartCornerDupIndex = addCornerPositionsAndReturnIndiceIndex(outerStartCornerDup, 0);
            uvs.push(lastUForStartOfInnerWall - relativeWallThickness, 0);

            const innerTopStartCornerIndex = bottomInnerPositions.length / elementsForOnePosition;
            const innerBottomStartCornerIndex = 0;

            const trianleStart1 = [
                innerBottomStartCornerIndex,
                outerBottomStartCornerDupIndex,
                outerTopStartCornerDupIndex
            ];

            const trianleStart2 = [
                innerBottomStartCornerIndex,
                outerTopStartCornerDupIndex,
                innerTopStartCornerIndex
            ];

            const outerEndCornerDup = outerCorners[outerCorners.length - 1];
            const lastUForEndOfInnerWall = innerWallUVs[innerWallUVs.length - 1 - 1];

            const outerTopEndCornerDupIndex = addCornerPositionsAndReturnIndiceIndex(outerEndCornerDup, wallHeight);
            uvs.push(lastUForEndOfInnerWall + relativeWallThickness, 1);

            const outerBottomEndCornerDupIndex = addCornerPositionsAndReturnIndiceIndex(outerEndCornerDup, 0);
            uvs.push(lastUForEndOfInnerWall + relativeWallThickness, 0);

            const innerTopEndCornerIndex = (bottomInnerPositions.length + topInnerPositions.length) / elementsForOnePosition - 1;
            const innerBottomEndCornerIndex = bottomInnerPositions.length / elementsForOnePosition - 1;;

            const triangleEnd1 = [
                innerBottomEndCornerIndex,
                innerTopEndCornerIndex,
                outerBottomEndCornerDupIndex
            ];

            const triangleEnd2 = [
                outerBottomEndCornerDupIndex,
                innerTopEndCornerIndex,
                outerTopEndCornerDupIndex
            ];

            const edgeIndices = []
                .concat(trianleStart1)
                .concat(trianleStart2)
                .concat(triangleEnd1)
                .concat(triangleEnd2);

            indices = indices.concat(edgeIndices);
        }

        let normals = [];

        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        (BABYLON.VertexData as any)._ComputeSides(BABYLON.Mesh.FRONTSIDE, positions, indices, normals, uvs);
        // debugger;

        //Create a custom mesh  
        var customMesh = new BABYLON.Mesh("custom");

        //Create a vertexData object
        var vertexData = new BABYLON.VertexData();

        //Assign positions and indices to vertexData
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.normals = normals;
        vertexData.uvs = uvs;

        //Apply vertexData to custom mesh
        vertexData.applyToMesh(customMesh);

        return customMesh;
    }

    static createIndices = (params: { clockwise: boolean, closed: boolean, positionsOne: number[], positionsTwo: number[], sideOneOffset: number, sideTwoOffset: number }): number[] => {
        const indices: number[] = [];

        const sideOneMaxCount = params.sideOneOffset + params.positionsOne.length / elementsForOnePosition;
        const sideTwoMaxCount = params.sideTwoOffset + params.positionsTwo.length / elementsForOnePosition;

        const absOne = (relativePosition: number): number => {
            return relToAbs(relativePosition, params.sideOneOffset, sideOneMaxCount);
        }

        const absTwo = (relativePosition: number): number => {
            return relToAbs(relativePosition, params.sideTwoOffset, sideTwoMaxCount);
        }

        const pushTriangle = (data: number[]) => {
            indices.push(data[0], data[1], data[2]);
        }

        const relToAbs = (relativePosition: number, offset: number, maximum: number): number => {
            let absolutePosition = offset + relativePosition;

            if (absolutePosition >= maximum) {
                absolutePosition = absolutePosition % maximum + offset;
            }
            return absolutePosition;
        }

        const wallPlateCount = params.closed ? params.positionsOne.length / elementsForOnePosition : params.positionsOne.length / elementsForOnePosition - 1;

        for (let i = 0; i < wallPlateCount; i++) {
            let triangleOne: number[];
            let triangleTwo: number[];

            //относительная позиция слева направо начиная с 0
            if (params.clockwise) {
                //CW по часовой
                triangleOne = [
                    absOne(0 + i),
                    absTwo(0 + i),
                    absOne(1 + i)
                ];

                triangleTwo = [
                    absTwo(0 + i),
                    absTwo(1 + i),
                    absOne(1 + i)
                ];
            } else {
                //CCW против часовой
                triangleOne = [
                    absOne(0 + i),
                    absOne(1 + i),
                    absTwo(0 + i)
                ];

                triangleTwo = [
                    absTwo(0 + i),
                    absOne(1 + i),
                    absTwo(1 + i)
                ];
            }

            pushTriangle(triangleOne);
            pushTriangle(triangleTwo);
        }

        return indices;
    }

    static createWallUVs = (params: { corners: BABYLON.Vector2[], closed: boolean, wallHeight: number }): number[] => {
        const uvs: number[] = [];

        const addPoints = (v: number) => {
            let curLen = 0;
            uvs.push(0, v);

            for (let i = 1; i < params.corners.length; i++) {
                const prevCorner = params.corners[i - 1];
                const currentCorner = params.corners[i];

                const wallLength = currentCorner.subtract(prevCorner).length();
                const relativeLength = wallLength / params.wallHeight;

                curLen += relativeLength;
                uvs.push(curLen, v);
            }
        }
        //низ
        addPoints(0);
        //верх    
        addPoints(1);
        return uvs;
    }
}