import { IRoomChangeEventData } from "./iRoomChangeEventData";

export interface IRoomChangeEvent extends CustomEvent {
    detail: IRoomChangeEventData
}