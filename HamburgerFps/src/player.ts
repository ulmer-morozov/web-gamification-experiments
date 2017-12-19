export class Player {
    public score: number;
    public collider: BABYLON.Mesh;

    constructor() {
        this.score = 0;
    }

    addScore = (someScore: number): void => {
        this.score += someScore;

        if (this.onScoreChanged != undefined)
            this.onScoreChanged(this.score);
    }

    onScoreChanged: (newScore: number) => void;
}