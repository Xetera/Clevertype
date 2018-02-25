import { expect } from 'chai';
import 'mocha'
import {Cleverbot} from '../Cleverbot'
const testingKey = require('../config.json').key;

let cleverbot : Cleverbot = new Cleverbot("2323");

let testResponse2: string;

describe('Inputting wrong api key', () => {
    it('Should throw an error', () => {
        let test : Cleverbot = new Cleverbot("2323");
        return expect(Promise.resolve(test.say('test'))).throw('Error');
    })
});

describe('Sending successful requests', () => {
    it('Should return a string', () => {
        cleverbot.say('❤').then(response => {
            console.log(response);
            expect(response).to.be.a('string').and.not.equal('');
        });
    });
});