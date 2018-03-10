import * as http from 'https'
import * as cb from "clevertype";
import {APIResponse, User} from "clevertype";

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

    private multiUser : boolean;
    private users : Map<string, User>;
    private CleverbotState : cb.CleverbotState;
    private numberOfAPICalls : number;
    private wrapperName : string;

    private history : string[]; // implementing this later
    private statusCodes : string[];
    constructor(input : string | cb.Config){
        if (typeof input !== 'string' && typeof input !== 'object') {
            throw new SyntaxError(`Cleverbot constructor expects either a string or an Config object.`);
        }
        else if (typeof input === 'string')
            this.config.apiKey = input;

        else if (typeof input === 'object'){
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
        this.statusCodes = Object.keys(Exceptions);
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

    private setCleverbotState(state : string, id?: string | number) : void {
        if (this.multiUser && id){
            const user : User = this.resolveUser(id);
            user.cs = state
        }
        else{
            this.CleverbotState = state;
        }
    }

    private static createUser(id : string, eng?: number, emo ?: number, reg ?: number) : User {
        return {
            id :id,
            mood: {
                engagement: eng || 50,
                emotion: emo|| 50,
                regard: reg || 50
            },
            cs: undefined,
            history : undefined
        }
    }

    private resolveUser(user : string | number) : User {
        let id : string;
        let resolvedUser : User | undefined ;
        if (!this.multiUser)
            throw new Error(`Tried resolving user in non-multi user mode.`);

        if (typeof user === 'number'){
            id = user.toString();
        }
        else if (typeof user === 'string') {
            id = user;
        }
        else {
            throw new TypeError(`Use must be a string or a number.`);
        }
        resolvedUser = this.users.get(id);
        if (resolvedUser === undefined){
            resolvedUser = Cleverbot.createUser(id);
            this.users.set(id, resolvedUser);
        }
        return resolvedUser;
    }

    public say(message : string, user?: string | number) : Promise<string> {
        let that = this;
        let endpoint : string = this.endpoint;

        endpoint += this.encodedWrapperName;
        endpoint += Cleverbot.encodeInput(message);
        endpoint += this.encodedCleverbotState;
        endpoint += this.encodedEmotion;
        endpoint += this.encodedEngagement;
        endpoint += this.encodedRegard;

        let options = {
            hostname:endpoint,
            json:true
        };
        return new Promise<string>(function (resolve, reject) {
            http.get(endpoint, (res : any ) => {
                let response : APIResponse;

                if (that.statusCodes.includes(res.statusCode.toString())){
                    const errorMessage : string = Exceptions[res.statusCode];
                    return Promise.reject(errorMessage);
                }
                let final : any = "";

                res.on('data', (data:string) => {
                    final += data;
                });

                res.on('end', () => {
                    // get history here later
                    try {
                        response = JSON.parse(final);
                    }
                    catch (err) {
                        if (err instanceof SyntaxError){
                            // sometimes cleverbot sends us a weirdly formatted responses, this should
                            // be fixed by JSON.stringify but I can't be sure
                            that.numberOfAPICalls++;
                            console.log(`Debug:\n\tRequested endpoint:\n`);
                            console.log(endpoint);
                            console.log(`\tResponse:\n`);
                            console.log(final);
                            return Promise.reject(
                                'Cleverbot sent a malformed response, try again.\nErr: ' + err.message
                            );
                        }
                        else if (err.code === "ECONNRESET") {
                            return Promise.reject(`Cleverbot took too long to respond.`);
                        }
                        else {

                            return Promise.reject(err);
                        }
                    }
                    that.numberOfAPICalls++;
                    that.setCleverbotState(response.cs, user);

                    resolve(response.output);
                });

                res.on('error', (error : Error) => {
                    console.log(`Error while receiving response from cleverbot.`);
                    return Promise.reject(error);
                });
            });

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

    public get apiKey() : string {
        return this.config.apiKey;
    }

}