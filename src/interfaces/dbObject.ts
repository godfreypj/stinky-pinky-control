import { Round } from "./round";

export interface DbObject {
    round: Round,
    active: boolean,
    threadsApiResponseId: string
}