"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http = require("https");
var Cleverbot = /** @class */ (function () {
    function Cleverbot(apiKey) {
        this.config = {
            apiKey: ""
        };
        this.config.apiKey = apiKey;
        this.endpoint = 'https://www.cleverbot.com/getreply?key=' + this.config.apiKey;
        // the first cs request actually does return us a reply
    }
    Object.defineProperty(Cleverbot.prototype, "encodedEmotion", {
        get: function () {
            if (!this.config.emotion) {
                return "";
            }
            return '&cb_settings_tweak1=' + this.config.emotion;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cleverbot.prototype, "encodedEngagement", {
        get: function () {
            if (!this.config.engagement) {
                return "";
            }
            return '&cb_settings_tweak2=' + this.config.engagement;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cleverbot.prototype, "encodedRegard", {
        get: function () {
            if (!this.config.regard) {
                return "";
            }
            return '&cb_settings_tweak3=' + this.config.regard;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cleverbot.prototype, "encodedCleverbotState", {
        get: function () {
            return '&cs=' + this.CleverbotState;
        },
        enumerable: true,
        configurable: true
    });
    Cleverbot.encodeInput = function (input) {
        return '&input=' + input;
    };
    Cleverbot.prototype.retrieveCleverbotState = function () {
        var _this = this;
        var response;
        return new Promise(function (resolve, reject) {
            http.get(_this.endpoint, function (res) {
                var final;
                res.on('data', function (d) {
                    final += d;
                });
                res.on('end', function () {
                    response = JSON.parse(final);
                    console.log('cs=' + response.cs);
                    resolve(response.cs);
                });
                res.on('error', function (error) {
                    reject(error);
                });
            });
        });
    };
    Cleverbot.prototype.setCleverbotState = function () {
        var _this = this;
        this.retrieveCleverbotState().then(function (cs) {
            _this.CleverbotState = cs;
        });
    };
    Cleverbot.prototype.say = function (message, verbose) {
        if (verbose === void 0) { verbose = false; }
        var endpoint = this.endpoint;
        endpoint += Cleverbot.encodeInput(message);
        if (this.CleverbotState == null)
            this.setCleverbotState();
        endpoint += this.encodedCleverbotState;
        if (this.config.emotion)
            endpoint += '&' + this.config.emotion;
        if (this.config.engagement)
            endpoint += '&' + this.config.engagement;
        if (this.config.regard)
            endpoint += '&' + this.config.regard;
        var response;
        console.log(endpoint);
        return new Promise(function (resolve, reject) {
            http.get(endpoint, function (res) {
                var final;
                res.on('data', function (d) {
                    final += d;
                });
                res.on('end', function () {
                    response = JSON.parse(final);
                    if (!verbose)
                        resolve(response.output);
                    else
                        resolve(response);
                });
                res.on('error', function (error) {
                    reject(error);
                });
            });
        });
    };
    Cleverbot.prototype.setEmotion = function (amount) {
        this.config.emotion = amount;
    };
    Cleverbot.prototype.setEngagement = function (amount) {
        if (amount < 0 || amount > 100)
            throw new RangeError("Engagement must be a value between 0 and 100.");
        this.config.emotion = amount;
    };
    Cleverbot.prototype.setRegard = function (amount) {
        this.config.emotion = amount;
    };
    return Cleverbot;
}());
exports.default = Cleverbot;
