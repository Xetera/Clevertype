declare module "Cleverbot" {
    export type CleverbotState = string;


    export enum ResponseTypes {
        INVALID_API_KEY = 401,
        API_NOT_FOUND = 404,
        REQUEST_TOO_LARGE = 413 | 414,
        SERVER_DOWN = 502 | 504,
        TOO_MANY_REQUESTS = 503
    }
    export interface Config {
        apiKey : string;
        cs ?: CleverbotState;
        emotion ?: number;
        engagement ?: number;
        regard ?: number;
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


    class Cleverbot {
        constructor(apiKey: string)
        retrieveCsEndpoint() : CleverbotState;

    }
    export default Cleverbot
}
