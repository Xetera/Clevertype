import * as http from 'https'
import * as cb from "Cleverbot";

class Cleverbot{
    private endpoint : string;
    private config : cb.Config = {
        apiKey:  ""
    };
    private CleverbotState : cb.CleverbotState;
    private numberOfAPICalls : number;
    constructor(apiKey : string ){
        if (apiKey.length !== 27)
            //
            throw new SyntaxError(`${apiKey} is not a valid Cleverbot API key`);
        this.config.apiKey = apiKey;
        this.endpoint= 'https://www.cleverbot.com/getreply?key=' + this.config.apiKey;
        this.numberOfAPICalls = 0;
        // the first cs request actually does return us a reply
    }

    private get encodedEmotion() : string {
        if (!this.config.emotion){
            return "";
        }
        return '&cb_settings_tweak1=' + this.config.emotion;
    }
    private get encodedEngagement() : string {
        if (!this.config.engagement){
            return "";
        }
        return '&cb_settings_tweak2=' + this.config.engagement;
    }
    private get encodedRegard() : string {
        if (!this.config.regard){
            return "";
        }
        return '&cb_settings_tweak3=' + this.config.regard;
    }

    private get encodedCleverbotState() : string {
        return '&cs=' + this.CleverbotState
    }

    private static encodeInput(input : string) : string {
        return '&input=' + encodeURI(input);
    }

    private getHTTPRequest(url : string) : Promise<Object>{
        let response : any;
        return new Promise<Object>(function (resolve, reject) {
            http.get(url, (res : any) => {
                let final : any = "";
                res.on('data', (d:string) => {
                    final += d;
                    console.log(final);
                });

                res.on('end', () => {
                    resolve(JSON.parse(final));
                });

                res.on('error', (error : Error) => {
                    reject(error);
                });
            });
        })

    }
    /*
    private async retrieveCleverbotState() : Promise<cb.CleverbotState>  {
        const _this = this;
        let response : cb.APIResponse;
        console.log(this.endpoint);
        this.getHTTPRequest(this.endpoint).then(state => {

        });
    }
    */
    private setCleverbotState(input : string) : void {
        this.CleverbotState = input;
    }

    public say(message : string, verbose ?: boolean) : Promise<cb.APIResponse|string> {
        let that = this;
        let endpoint : string = this.endpoint;
        endpoint += Cleverbot.encodeInput(message);
        /*
        if (this.CleverbotState == null) {
            console.log("cleverbot state is fked");
            this.setCleverbotState().then(state => {
                this.CleverbotState = state;
            });
        }
        */
        endpoint += this.encodedCleverbotState;
        if (this.config.emotion) endpoint += this.encodedEmotion;
        if (this.config.engagement) endpoint += this.encodedEngagement;
        if (this.config.regard) endpoint += this.encodedRegard;

        let response : cb.APIResponse;
        console.log(endpoint);

        return new Promise<cb.APIResponse|string>(function (resolve, reject) {
            http.get(endpoint, (res : any )=> {
                let final : any = "";
                res.on('data', (d:string) => {
                    final += d;
                });

                res.on('end', () => {
                    response = JSON.parse(final);
                    that.numberOfAPICalls++;

                    if (that.CleverbotState === null){
                        that.setCleverbotState(response.cs);
                    }
                    if (verbose instanceof Boolean)
                        resolve(response);

                    else
                        resolve(response.output);
    

                });

                res.on('error', (error : Error) => {
                    reject(error);
                });
            })
        });
    }

    public setEmotion(amount : number){
        if (amount < 0 || amount > 100) throw new RangeError(`Emotion must be a value between 0 and 100.`);
        this.config.emotion = amount;
    }

    public setEngagement(amount : number) : void {
        if (amount < 0 || amount > 100) throw new RangeError(`Engagement must be a value between 0 and 100.`);
        this.config.emotion = amount;
    }

    public setRegard(amount : number){
        if (amount < 0 || amount > 100) throw new RangeError(`Regard must be a value between 0 and 100.`);
        this.config.emotion = amount;
    }

    public get amountOfCalls(){
        return this.numberOfAPICalls;
    }
}

export default Cleverbot