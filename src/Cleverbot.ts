///<reference path="index.d.ts"/>
import {APIResponse, ChatHistory, CleverbotState, Config, Mood} from 'clevertype';
import * as iconv from  'iconv-lite'
import axios, {AxiosError, AxiosResponse} from 'axios'
import {Exceptions} from "./Exceptions";
import moment = require("moment");
import {isString} from "util";
import {User} from "./User";

export class Cleverbot {
    private endpoint : string;

    // the config file is our preset for the mood of subsequent calls
    // when multi user is off
    private config : Config = {
        apiKey:'',
        mood: {
            emotion: 50,
            engagement: 50,
            regard: 50
        }
    };

    private multiUser : boolean;
    private _users ?: Map<string, User>;
    private CleverbotState ?: CleverbotState;
    private numberOfAPICalls : number;
    private wrapperName : string;
    private history ?: ChatHistory[];
    private statusCodes : string[];

    constructor(input : string | Config, multiUser ?: boolean) {

        if (typeof input === 'string')
            this.config.apiKey = input;

        else if (typeof input === 'object') {
            this.config.apiKey = input.apiKey;
            if (input.mood) {
                input.mood.emotion != undefined ? this.setEmotion(input.mood.emotion) : '';
                input.mood.engagement != undefined ? this.setEngagement(input.mood.engagement) : '';
                input.mood.regard != undefined ? this.setRegard(input.mood.regard) : '';
            }
        }
        else {
            throw new TypeError(`Cleverbot constructor expects either a string or an Config object.`);
        }

        if (multiUser) {
            this.multiUser = true;
            this._users = new Map<string, User>();
        }
        else { // we don't want this initialized if we don't need to
            this.multiUser = false;
            this.history = [];
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
    private encodedEmotion(emotion ?: number) : string {
        if (emotion){
            return '&cb_settings_tweak1=' + emotion;
        }
        else if (!this.config.mood || this.config.mood.emotion === undefined){
            return '';
        }
        return '&cb_settings_tweak1=' + this.config.mood.emotion;
    }
    private encodedEngagement(engagement?: number) : string {
        if (engagement){
            return '&cb_settings_tweak2=' + engagement;
        }
        else if (!this.config.mood || this.config.mood.engagement === undefined){
            return '';
        }
        return '&cb_settings_tweak2=' + this.config.mood.engagement;
    }
    private encodedRegard(regard?: number) : string {
        if (regard){
            return '&cb_settings_tweak3=' + regard;
        }
        else if (!this.config.mood || this.config.mood.regard === undefined){
            return '';
        }
        return '&cb_settings_tweak3=' + this.config.mood.regard;
    }

    private encodedCleverbotState(state ?: string) : string {
        if (state){
            return '&cs=' + state;
        }
        if (this.CleverbotState === undefined ) return '';
        return '&cs=' + this.CleverbotState;
    }

    private static encodeInput(input : string) : string {
        const out = iconv.encode(input, 'utf-8');
        return '&input=' + encodeURIComponent(out.toString());
    }

    private setCleverbotState(state : string, id?: string | number) : void {
        if (this.multiUser && id){
            const user : User = this.resolveUser(id);
            user.cs = state
        }
        else {
            this.CleverbotState = state;
        }
    }
    private createSingleUserHistory(userInput: string, cleverbotResponse : string,requestDate: Date) : ChatHistory {
        if (this.multiUser || !this.history)
            throw new Error('Tried to create single user history in multiUser mode  ');
        const latestConversation = Math.max(...this.history.map((hs : ChatHistory) => hs.number));
        let history = <ChatHistory> {};

        // we don't want to just set the two moods
        // equals because that passes it by reference
        // and the mood is something that can change
        history.mood = JSON.parse(JSON.stringify(this.config.mood));

        history.number = !isFinite(latestConversation) ? 1 : latestConversation +1;
        history.input = userInput;
        history.response = cleverbotResponse;
        history.responseDate= new Date();
        history.requestDate = requestDate;
        history.delay = moment(history.responseDate).diff(history.requestDate);
        history.getConversation = () => [history.input, history.response];

        return history;
    }
    private createMultiUserHistory(userInput: string, cleverbotResponse : string, id: string | number, requestDate: Date) : ChatHistory {
        let _id;
        typeof id === 'string' ? _id = id : _id = id.toString();
        const user : User = this.resolveUser(_id, true);
        const latestConversation = Math.max(...user.history.map((hs : ChatHistory) => hs.number));
        let history = <ChatHistory> {};

        // we don't want to just set the two moods
        // equals because that passes it by reference
        // and the mood is something that can change
        history.mood = JSON.parse(JSON.stringify(user.mood));

        history.number = !isFinite(latestConversation) ? 1 : latestConversation +1;
        history.input = userInput;
        history.response = cleverbotResponse;
        history.responseDate= new Date();
        history.requestDate = requestDate;
        history.delay = moment(history.responseDate).diff(history.requestDate);
        history.getConversation = () => [history.input, history.response];

        return history;
    }

    private static createUser(id : string | number, eng?: number, emo ?: number, reg ?: number) : User {
        const _id = isString(id) ? id : id.toString();
        let mood = <Mood> {
            engagement: eng || 50,
            emotion: emo || 50,
            regard: reg || 50
        };
        return new User(_id, undefined, mood);
    }

    private resolveUser(user : string | number, safe?: boolean) : User {
        let id : string;
        let resolvedUser : User | undefined ;
        if (!this.multiUser || this._users === undefined)
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
        resolvedUser = this._users.get(id);
        if (resolvedUser === undefined) {
            if (safe) {
                throw new ReferenceError(`User ${user} was not found`);
            }
            const engagement = this.config.mood.engagement;
            const emotion = this.config.mood.emotion;
            const regard = this.config.mood.regard;
            resolvedUser = Cleverbot.createUser(id, engagement, emotion, regard);

            this._users.set(id, resolvedUser);
        }
        return resolvedUser;
    }

    public say(message : string, user?: string | number) : Promise<string>{
        const requestDate : Date = new Date();
        let _user : User | undefined;
        if (user){
            _user = this.resolveUser(user);
        }

        let endpoint : string = this.endpoint;

        endpoint += this.encodedWrapperName;
        endpoint += Cleverbot.encodeInput(message);

        if (_user){
            endpoint += this.encodedCleverbotState(_user.cs);
            endpoint += this.encodedEmotion(_user.mood.emotion);
            endpoint += this.encodedEngagement(_user.mood.engagement);
            endpoint += this.encodedRegard(_user.mood.regard);
        }
        else {
            endpoint += this.encodedCleverbotState();
            endpoint += this.encodedEmotion();
            endpoint += this.encodedEngagement();
            endpoint += this.encodedRegard();
        }

        return axios.get(endpoint).then((res:AxiosResponse<APIResponse>) => {
            if (res.statusText && this.statusCodes.includes(res.statusText.toString())){
                const errorMessage : string = Exceptions[res.statusText];
                return Promise.reject(errorMessage);
            }
            this.numberOfAPICalls++;
            const response : string = res.data.output;
            if (_user){
                this.setCleverbotState(res.data.cs, _user.id);
                _user.history.push(this.createMultiUserHistory(message, response, _user.id, requestDate));
                _user.messages++;
            }
            else if (this.history && !this.multiUser){
                this.setCleverbotState(res.data.cs);
                this.history.push(this.createSingleUserHistory(message, response, requestDate))
            }
            return Promise.resolve(response);

        }).catch((err:AxiosError)=> {

            console.log('Error getting response from cleverbot\n' +  err);
            console.log('endpoint: ' + endpoint + '\n');
            return Promise.reject(err);
        });
    }

    public setEmotion(amount : number, user?: number | string) : void {
        if (amount < 0 || amount > 100) throw new RangeError(`Emotion must be a value between 0 and 100.`);
        else if (!user && !this.multiUser)
            this.config.mood.emotion = amount;
        else if (!user && this.multiUser)
            throw new Error(`setEmotion requires a user id when it's in multi user mode`);
        else if (user && !this.multiUser)
            throw new Error(`Can not set emotion without user id when in multi user mode.`);
        else if (user){
            const resolved : User = this.resolveUser(user, true);
            resolved.mood.emotion = amount;
        }
    }

    public setEngagement(amount : number, user ?: number | string) : void {
        if (amount < 0 || amount > 100) throw new RangeError(`Engagement must be a value between 0 and 100.`);
        else if (!user && !this.multiUser)
            this.config.mood.engagement = amount;
        else if (!user && this.multiUser)
            throw new Error(`setEngagement requires a user id when it's in multi user mode`);
        else if (user && !this.multiUser)
            throw new Error(`Can not set engagement without user id when in multi user mode.`);
        else if (user){
            const resolved : User = this.resolveUser(user, true);
            resolved.mood.engagement = amount;
        }
    }

    public setRegard(amount : number, user ?: number | string) : void {
        if (amount < 0 || amount > 100) throw new RangeError(`Regard must be a value between 0 and 100.`);
        else if (!user && !this.multiUser)
            this.config.mood.regard = amount;
        else if (!user && this.multiUser)
            throw new Error(`setRegard requires a user id when it's in multi user mode`);
        else if (user && !this.multiUser)
            throw new Error(`Can not set regard without user id when in multi user mode.`);
        else if (user){
            const resolved : User = this.resolveUser(user, true);
            resolved.mood.regard = amount;
        }
    }

    public get callAmount() : number{
        return this.numberOfAPICalls;
    }

    public mood(user ?: string | number) : Mood {
        if (!user && !this.multiUser)
            return this.config.mood;
        else if (user && !this.multiUser)
            throw new Error(`Can not fetch user mood when not in multiUser mood`);
        else if (user && this.multiUser)
            return this.resolveUser(user, true).mood;
        else
            throw new Error(`A user id is required when fetching mood in multiUser mode`);
    }

    public get apiKey() : string {
        return this.config.apiKey;
    }

    public get users() : User[] {
        if (!this.multiUser || !this._users)
            throw new Error(`Tried to fetch users but clevertype is not in multi user mode.`);
        return Array.from(this._users.values());
    }

    public getUser(user: string | number){
        return this.resolveUser(user, true);
    }

    public getHistory(user?: string | number){
        if (user)
            return this.resolveUser(user, true).history;
        else
            return this.history;
    }

}