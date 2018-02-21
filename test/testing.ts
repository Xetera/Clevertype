import { expect } from 'chai';
import 'mocha'
import {Cleverbot} from '../Cleverbot'
const testingKey = require('../config.json').key;

let cleverbot : Cleverbot = new Cleverbot(testingKey);

let testResponse2: string;


describe('Sending successful requests', () => {
    it('Should return a string', () => {
        cleverbot.say('❤').then(response => {
            testResponse2 = response;
            console.log(testResponse2);
            expect(response).to.be.a('string');
        })
    });
});