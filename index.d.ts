declare module "clevertype" {

    export type CleverbotState = string;
    export type Response = string;

    export interface Mood {
        emotion : number;
        engagement : number;
        regard : number;
    }

    export interface Config {
        apiKey : string;
        cs ?: CleverbotState;
        mood : Mood;
    }

    export interface ChatHistory {
        conversation ?: {
            self: string;
            cleverbot: string;
        }
    }

    export interface APIResponse {
        cs : CleverbotState;
        interaction_count: number;
        input: string;
        output: string;
        time_taken: number;
        random_number: number;
        time_second: number;
        time_minute: number;
        time_hour: number;
        time_day_of_week: number;
        time_day: number;
        time_month: number;
        time_year: number;
    }


    export class Cleverbot {
        private endpoint : string;
        private config : Config;
        private CleverbotState : CleverbotState;
        private numberOfAPICalls : number;
        private wrapperName : string;

        private readonly encodedWrapperName: string;
        private readonly encodedEmotion : string;
        private readonly encodedEngagement : string;
        private readonly encodedRegard : string;
        private readonly encodedCleverbotState : string;

        public readonly callAmount : number;
        public readonly mood : Mood;

        public constructor(apiKey: string | Config);
        private static encodeInput(input : string ) : string;
        private retrieveCsEndpoint() : CleverbotState;
        private setCleverbotState(input : string) : void;

        public setEmotion(amount : number) : void;
        public setEngagement(amount : number) : void;
        public setRegard(amount : number) : void;
        public say(message : string): Promise<Response>;

    }
    export default Cleverbot
}
