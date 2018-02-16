"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Cleverbot_1 = require("./Cleverbot");
var cb = new Cleverbot_1.default('CC6zaMgw6Tvbd4_vrPSgtOhCM1Q');
cb.say('Hey!').then(function (response) {
    console.log(response);
});
