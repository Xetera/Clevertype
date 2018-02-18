import * as http from 'https'
import * as cb from "clevertype";

const Exceptions : { [index:string] : string } = {
    "401": "Invalid API Key",
    "404": "API Was not found",
    "413": "The request was too large (over 64kb)",
    "414": "The request was too large (over 64kb)",
    "502": "Could not get a reply from Cleverbot API Servers",
    "503": "Too many requests",
    "504": "Could not get a reply from Cleverbot API Servers",
};

export class Cleverbot {
    private endpoint : string;
    private config : cb.Config = {
        apiKey:"",
        mood: {
            emotion: 50,
            engagement: 50,
            regard: 50
        }
    };
    private CleverbotState : cb.CleverbotState;
    private numberOfAPICalls : number;
    private wrapperName : string;

    private history : string[]; // implementing this later

    constructor(input : string | cb.Config){
        if (typeof input === 'string'){
            if (input.length !== 27)
                throw new SyntaxError(`${input} is not a valid Cleverbot API key`);

            this.config.apiKey = input;
        }
        else if (typeof input === 'object'){
            if (input.apiKey.length !== 27)
                throw new SyntaxError(`${input} is not a valid Cleverbot API key`);
            this.config.apiKey = input.apiKey;

            if (input.mood.emotion != undefined) this.setEmotion(input.mood.emotion);
            if (input.mood.engagement != undefined)  this.setEngagement(input.mood.engagement);
            if (input.mood.regard != undefined ) this.setRegard(input.mood.regard);
        }
        else {
            throw new TypeError('Client constructor expects an object or an api key string.')
        }
        this.endpoint= 'https://www.cleverbot.com/getreply?key=' + this.config.apiKey;
        this.wrapperName = 'Clevertype';
        this.numberOfAPICalls = 0;
        // the first cs request actually does return us a reply
    }

    private get encodedWrapperName() : string {
        return '&wrapper=' + this.wrapperName;
    }
    private get encodedEmotion() : string {
        if (this.config.mood.emotion === undefined){
            return "";
        }
        return '&cb_settings_tweak1=' + this.config.mood.emotion;
    }
    private get encodedEngagement() : string {
        if (this.config.mood.engagement === undefined){
            return "";
        }
        return '&cb_settings_tweak2=' + this.config.mood.engagement;
    }
    private get encodedRegard() : string {
        if (this.config.mood.regard === undefined){
            return "";
        }
        return '&cb_settings_tweak3=' + this.config.mood.regard;
    }

    private get encodedCleverbotState() : string {
        if (this.CleverbotState === undefined ) return "";
        return '&cs=' + this.CleverbotState;
    }

    private static encodeInput(input : string) : string {
        return '&input=' + encodeURI(input);
    }

    private setCleverbotState(input : string) : void {
        this.CleverbotState = input;
    }

    public say(message : string) : Promise<string> {
        let that = this;
        let endpoint : string = this.endpoint;

        endpoint += this.encodedWrapperName;
        endpoint += Cleverbot.encodeInput(message);
        endpoint += this.encodedCleverbotState;
        endpoint += this.encodedEmotion;
        endpoint += this.encodedEngagement;
        endpoint += this.encodedRegard;

        let response : cb.APIResponse;

        return new Promise<string>(function (resolve, reject) {
            http.get(endpoint, (res : any ) => {
                const statusCodes : string[] = Object.keys(Exceptions);

                if (statusCodes.includes(res.statusCode)){
                    const errorMessage : string = Exceptions[res.statusCode];
                    throw new Error(errorMessage);
                }

                let final : any = "";

                res.on('data', (data:string) => {
                    final += data;
                });

                res.on('end', () => {
                    // get history here later
                    response = JSON.parse(final);
                    that.numberOfAPICalls++;

                    that.setCleverbotState(response.cs);

                    resolve(response.output);
                });

                res.on('error', (error : Error) => {
                    console.log(error);

                    reject(error);
                });
            })
        });
    }

    public setEmotion(amount : number) : void {
        if (amount < 0 || amount > 100) throw new RangeError(`Emotion must be a value between 0 and 100.`);
        this.config.mood.emotion = amount;
    }

    public setEngagement(amount : number) : void {
        if (amount < 0 || amount > 100) throw new RangeError(`Engagement must be a value between 0 and 100.`);
        this.config.mood.engagement = amount;
    }

    public setRegard(amount : number) : void {
        if (amount < 0 || amount > 100) throw new RangeError(`Regard must be a value between 0 and 100.`);
        this.config.mood.regard = amount;
    }

    public get callAmount() : number{
        return this.numberOfAPICalls;
    }
    public get mood() : cb.Mood {
        return this.config.mood;
    }
}