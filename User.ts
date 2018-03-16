///<reference path="index.d.ts"/>
import {ChatHistory, CleverbotState, Interaction, Mood} from "clevertype";
import {isString} from "util";

export class User {
    id: string;
    mood: Mood ;
    messages: number;
    history :ChatHistory[];
    cs?: CleverbotState;
    constructor(id: string| number, cs: string|undefined, mood : Mood){
        this.mood = mood;
        this.id = isString(id) ? id : id.toString();
        this.history = [];
        this.cs = cs;
    }

    public getFirst(): Interaction {
        return this.history[0].getConversation();
    }

    public getLast(): Interaction {
        return this.history[this.history.length-1].getConversation();
    }
}
