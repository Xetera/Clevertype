import { expect } from 'chai';
import 'mocha'
import {Cleverbot} from '../Cleverbot'
import {User} from "../User";


let testingKey : string | undefined;
if (process.env.KEY)
    testingKey = process.env.KEY;
else
    testingKey = require('../../config.json').key;



let cleverbot : Cleverbot;
let multibot : Cleverbot;

describe('Invoking constructors', () => {
    it('Correct API key should work as intended', () => {
        expect(() => cleverbot = new Cleverbot(testingKey? testingKey : '')).to.not.throw(Error);
    });
    it('Correct API key should work as intended on multiUser', () => {
        expect(() => multibot  = new Cleverbot(testingKey? testingKey: '', true)).to.not.throw(Error);
    });
});

describe('Sending requests normally without multiUser', function () {
    it('Querying without multiUser.', done  => {
        cleverbot.say('test').then(response => {
            expect(response).to.be.a('string');
        }).then(() => {
            done();
        });
    }).timeout(15000);
    it('Message counts should be incrementing without multiUser', ()=> {
        expect(cleverbot.callAmount).to.equal(1);
    });
    it('Fetching single user history', () => {
        expect(cleverbot.getHistory()).to.have.lengthOf(1);
    });
    it('Getting api key', () => {
        expect(cleverbot.apiKey).to.be.a('string');
    });
});

describe('User Errors without multiUser' , () => {
    it('Throwing error on fetching user without multiUser', ( )=> {
        expect(() => cleverbot.getUser('1')).to.throw(Error);
    });
    it('Throwing error on setting user emotion without multiUser', () => {
        expect(() => cleverbot.setEmotion(0, 1)).to.throw(Error);
    });
    it('Throwing error on setting user engagement without multiUser', () => {
        expect(() => cleverbot.setEngagement(0, 1)).to.throw(Error);
    });
    it('Throwing error on setting user regard without multiUser', () => {
        expect(() => cleverbot.setRegard(0, 1)).to.throw(Error);
    });
    it('Throwing error on fetching user mood without multiUser', () => {
        expect(() => cleverbot.mood(1)).to.throw(Error);
    });
    it('Throwing error on getting user data without multiUser', () => {
        expect(() => cleverbot.getUser(1)).to.throw(Error);
    });
});

describe('Cleverbot moods without multiUser', () => {
    it('Setting regard out of bounds should throw errors', () => {
        expect(() => cleverbot.setRegard(101)).to.throw(RangeError, "Regard must be a value between 0 and 100.");
    });
    it('Setting emotion out of bounds should throw errors', () => {
        expect(() => cleverbot.setEmotion(101)).to.throw(RangeError, "Emotion must be a value between 0 and 100.");
    });
    it('Setting engagement out of bounds should throw errors', () => {
        expect(() => cleverbot.setEngagement(101)).to.throw(RangeError, "Engagement must be a value between 0 and 100.");
    });
    it('setEngagement should be calling without errors', () => {
        expect(() => cleverbot.setEngagement(20)).to.not.throw(RangeError);
    });
    it('setRegard should be calling without errors', () => {
        expect(() => cleverbot.setRegard(20)).to.not.throw(RangeError);
    });
    it('setEmotion should be calling without errors', () => {
        expect(() => cleverbot.setEmotion(20)).to.not.throw(RangeError);
    });
    it('Cleverbot moods should be setting properly', () => {
        expect(cleverbot.mood()).to.deep.equal({
            emotion:20,
            engagement:20,
            regard:20
        });
    });
});


describe('Sending requests in multiUser', () => {
    let input: string = 'test';
    let reply: string;
    it('Querying with multiUser.', done  => {
        multibot.say('test', '1').then(response => {
            expect(response).to.be.a('string');
            reply = response;
        }).then(() => {
            done();
        });
    }).timeout(15000);
    it('Message counts should be incrementing in multiUser', ()=> {
        expect(multibot.callAmount).to.equal(1);
    });
    it('Fetching users ', ()=> {
        expect(multibot.users).to.be.an.instanceof(Array).and.to.have.lengthOf(1);
    });
    it('Fetching user string inputted information properly with a number', () => {
        expect(multibot.getUser(1)).to.be.instanceof(User);
    });
    it('getLast for user history', () => {
        expect(multibot.getUser(1).getFirst()).to.eql([input, reply]);
    });
    it('getFirst for user history', () => { // since there's only one query
        expect(multibot.getUser(1).getLast()).to.eql([input, reply]);
    });
    it('Getting api key', () => {
        expect(cleverbot.apiKey).to.be.a('string');
    });
});

describe('Cleverbot moods with multiUser', () => {
    it('Setting regard out of bounds should throw errors', () => {
        expect(() => multibot.setRegard(101)).to.throw(RangeError, "Regard must be a value between 0 and 100.");
    });
    it('Setting emotion out of bounds should throw errors', () => {
        expect(() => multibot.setEmotion(101)).to.throw(RangeError, "Emotion must be a value between 0 and 100.");
    });
    it('Setting engagement out of bounds should throw errors', () => {
        expect(() => multibot.setEngagement(101)).to.throw(RangeError, "Engagement must be a value between 0 and 100.");
    });

    it('setEngagement should be calling without errors', () => {
        expect(() => multibot.setEngagement(20, 1)).to.not.throw(Error);
    });
    it('setEmotion should be calling without errors', () => {
        expect(() => multibot.setEmotion(20, 1)).to.not.throw(Error);
    });
    it('setRegard should be calling without errors', () => {
        expect(() => multibot.setRegard(20, 1)).to.not.throw(Error);
    });
    it('Cleverbot moods should be setting properly', () => {
        expect(multibot.mood(1)).to.deep.equal({
            emotion:20,
            engagement:20,
            regard:20
        });
    });
});
describe('User Errors with multiUser' , () => {
    it('Throwing error on fetching user without multiUser', ( )=> {
        expect(() => multibot.getUser('1')).to.not.throw(Error);
    });
    it('Throwing error on setting user emotion without multiUser', () => {
        expect(() => multibot.setEmotion(0)).to.throw(Error);
    });
    it('Throwing error on setting user engagement without multiUser', () => {
        expect(() => multibot.setEngagement(0)).to.throw(Error);
    });
    it('Throwing error on setting user regard without multiUser', () => {
        expect(() => multibot.setRegard(0)).to.throw(Error);
    });
    it('Throwing error on getting user data without multiUser', () => {
        expect(() => multibot.getUser(1)).to.not.throw(Error);
    });
});