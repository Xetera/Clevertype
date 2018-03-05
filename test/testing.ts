import { expect } from 'chai';
import 'mocha'
import {Cleverbot} from '../Cleverbot'
const testingKey = require('../config.json').key;

let cleverbot : Cleverbot;

describe('Invoking constructor', () => {
    it('Correct API key should work as intended', done => {
        expect(function(){
            cleverbot = new Cleverbot(testingKey);
            done();
        }).to.not.throw(Error);
    })
});

describe('Sending requests', function () {
    this.timeout(3000);
    it('Returning a string and incrementing message count.', function(done) {
        this.timeout(3000);
        cleverbot.say('send me an emoji please').then(response => {
            expect(response).to.be.a('string');
        }).then(() => {
            expect(cleverbot.callAmount).to.equal(1);
            done();
        });
    });
});

describe('Cleverbot Moods', () => {
    it('Setting Moods out of bounds should throw errors', () => {
        expect(function() {
            cleverbot.setRegard(101)
        }).to.throw(RangeError, "Regard must be a value between 0 and 100.");
        expect(function() {
            cleverbot.setEmotion(101)
        }).to.throw(RangeError, "Emotion must be a value between 0 and 100.");
        expect(function(){
            cleverbot.setEngagement(101)
        }).to.throw(RangeError, "Engagement must be a value between 0 and 100.");
    });

    it('Engagement should be calling without errors', () => {
        expect(function(){
            cleverbot.setEmotion(20)
        }).to.not.throw(RangeError);
        expect(function(){
            cleverbot.setRegard(20)
        }).to.not.throw(RangeError);
        expect(function(){
            cleverbot.setEngagement(20)
        }).to.not.throw(RangeError);
    });

    it('Cleverbot moods should be setting properly', () => {
        expect(cleverbot.mood).to.deep.equal({
            emotion:20,
            engagement:20,
            regard:20
        });
    })
});