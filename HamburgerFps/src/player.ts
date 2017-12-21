export class Player {
    public score: number;
    public collider: BABYLON.Mesh;

    static SCORE_CHANGE = "SCORE_CHANGE";
    static ON_KILL = "ON_KILL";

    constructor(private canvas: HTMLCanvasElement) {
        this.score = 0;
    }

    addScore = (someScore: number): void => {
        this.score += someScore;

        const eventData = {
            score: this.score
        }

        const newScoreEvent = new CustomEvent(Player.SCORE_CHANGE, { detail: eventData });
        this.canvas.dispatchEvent(newScoreEvent);
    }

    kill = (reason: string): void => {
        const eventData = {
            reason: reason
        }
        const newKillEvent = new CustomEvent(Player.ON_KILL, { detail: eventData });
        this.canvas.dispatchEvent(newKillEvent);
    }
}