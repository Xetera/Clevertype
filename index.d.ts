declare module "clevertype" {
    export type CleverbotState = string;

    export interface Mood {
        emotion ?: number;
        engagement ?: number;
        regard ?: number;
    }

    export interface Config {
        apiKey : string;
        cs ?: CleverbotState;
        mood : Mood;
    }

    export type UserInput = string;
    export type CleverbotResponse = string;

    export type Interaction  = [UserInput, CleverbotResponse];
    export interface ChatHistory {
        input: UserInput;
        response: CleverbotResponse;
        number : number;
        mood: Mood;
        requestDate: Date;
        responseDate: Date;
        delay: number;
        getConversation(): Interaction
    }



    export interface APIResponse {
        cs : CleverbotState;
        interaction_count: string;
        output: string;
        input: string;
        input_other: string;
        predicted_input: string;
        filtered_input: string;
        filtered_input_other: string;
        input_label: string;
        emotion: string;
        emotion_tone: string;
        emotion_values: string;
        accuracy: string;
        conversation_id: string;
        database_version: string;
        errorline: string;
        reaction: string;
        reaction_tone: string;
        reaction_values: string;
        CSRES30: string;
        clever_accuracy: string;
        clever_output: string;
        clever_match: string;
        callback: string;
        time_elapsed: string;
        time_taken: string;
        random_number: string;
        time_second: string;
        time_minute: string;
        time_hour: string;
        time_day_of_week: string;
        time_day: string;
        time_month: string;
        time_year: string;
    }

}
