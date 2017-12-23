import { Inventory } from "./inventory";

export class Player {
    public score: number;
    public collider: BABYLON.Mesh;
    public isKilled: boolean;

    public inventory: Inventory;

    static SCORE_CHANGE = "SCORE_CHANGE";
    static ON_KILL = "ON_KILL";
    static ON_MESSAGE = "ON_MESSAGE";

    constructor(private canvas: HTMLCanvasElement) {
        this.reset();
    }

    addScore = (someScore: number): void => {
        this.setScore(this.score + someScore);
    }

    setScore = (newScore: number): void => {
        this.score = newScore;

        const eventData = {
            score: this.score
        }

        const newScoreEvent = new CustomEvent(Player.SCORE_CHANGE, { detail: eventData });
        this.canvas.dispatchEvent(newScoreEvent);

        if (this.score === 9999) {
            setInterval(() => this.pullMessage("You win!"), 1000)
        }
    }

    kill = (reason: string): void => {
        if (this.isKilled)
            return;

        this.isKilled = true;

        const eventData = {
            reason: reason
        }
        const newKillEvent = new CustomEvent(Player.ON_KILL, { detail: eventData });
        this.canvas.dispatchEvent(newKillEvent);
    }

    reset = (): void => {
        this.setScore(0);
        this.isKilled = false;
        this.inventory = new Inventory();
    }

    pullMessage = (text: string): void => {
        const eventData = {
            text: text
        }
        const newScoreEvent = new CustomEvent(Player.ON_MESSAGE, { detail: eventData });
        this.canvas.dispatchEvent(newScoreEvent);
    }
}