import * as http from 'https'
import * as cb from "Cleverbot";

const Exceptions : { [index:string] : string } = {
    "401": "Invalid API Key",
    "404": "API Was not found",
    "413": "The request was too large (over 64kb)",
    "414": "The request was too large (over 64kb)",
    "502": "Could not get a reply from Cleverbot API Servers",
    "503": "Too many requests",
    "504": "Could not get a reply from Cleverbot API Servers",
};

class Cleverbot{
    private endpoint : string;
    private config : cb.Config = {
        apiKey:  ""
    };
    private CleverbotState : cb.CleverbotState;
    private numberOfAPICalls : number;
    private wrapperName : string;

    private history : string[]; // implementing this later

    constructor(apiKey : string | cb.Config){
        if (apiKey instanceof String){
            if (apiKey.length !== 27)
                throw new SyntaxError(`${apiKey} is not a valid Cleverbot API key`);

            this.config.apiKey = apiKey;
        }
        else if (typeof apiKey ){

        }

        this.endpoint= 'https://www.cleverbot.com/getreply?key=' + this.config.apiKey;
        this.wrapperName = 'Clevertype';
        this.numberOfAPICalls = 0;
        // the first cs request actually does return us a reply
    }

    private get encodedWrapper() : string {
        return '&wrapper=' + this.wrapperName;
    }
    private get encodedEmotion() : string {
        if (this.config.emotion === undefined){
            return "";
        }
        return '&cb_settings_tweak1=' + this.config.emotion;
    }
    private get encodedEngagement() : string {
        if (this.config.engagement === undefined){
            return "";
        }
        return '&cb_settings_tweak2=' + this.config.engagement;
    }
    private get encodedRegard() : string {
        if (this.config.regard === undefined){
            return "";
        }
        return '&cb_settings_tweak3=' + this.config.regard;
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

    public say(message : string, verbose ?: boolean) : Promise<string> {
        let that = this;
        let endpoint : string = this.endpoint;

        endpoint += this.encodedWrapper;
        endpoint += Cleverbot.encodeInput(message);
        endpoint += this.encodedCleverbotState;
        endpoint += this.encodedEmotion;
        endpoint += this.encodedEngagement;
        endpoint += this.encodedRegard;

        let response : cb.APIResponse;
        console.log(endpoint);

        return new Promise<string>(function (resolve, reject) {
            http.get(endpoint, (res : any ) => {
                const statusCodes : Array<string> = Object.keys(Exceptions);

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

    public setEmotion(amount : number){
        if (amount < 0 || amount > 100) throw new RangeError(`Emotion must be a value between 0 and 100.`);
        this.config.emotion = amount;
        console.log(this.config.emotion);
    }

    public setEngagement(amount : number) : void {
        if (amount < 0 || amount > 100) throw new RangeError(`Engagement must be a value between 0 and 100.`);
        this.config.engagement = amount;
    }

    public setRegard(amount : number){
        if (amount < 0 || amount > 100) throw new RangeError(`Regard must be a value between 0 and 100.`);
        this.config.regard = amount;
    }

    public get callAmount(){
        return this.numberOfAPICalls;
    }
}

export default Cleverbot