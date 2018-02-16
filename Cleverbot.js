"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var http = require("https");
var Cleverbot = /** @class */ (function () {
    function Cleverbot(apiKey) {
        this.config = {
            apiKey: ""
        };
        if (apiKey.length !== 27)
            //
            throw new SyntaxError(apiKey + " is not a valid Cleverbot API key");
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
        return __awaiter(this, void 0, void 0, function () {
            var _this, response;
            return __generator(this, function (_a) {
                _this = this;
                console.log(this.endpoint);
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        http.get(_this.endpoint, function (res) {
                            var final;
                            res.on('data', function (d) {
                                final += d;
                                console.log(final);
                            });
                            res.on('end', function () {
                                response = JSON.parse(final);
                                console.log('cs=' + final);
                                resolve(response.cs);
                            });
                            res.on('error', function (error) {
                                reject(error);
                            });
                        });
                    })];
            });
        });
    };
    Cleverbot.prototype.setCleverbotState = function () {
        var that = this;
        return new Promise(function (resolve, reject) {
            var _this = this;
            that.retrieveCleverbotState().then(function (cs) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    that.CleverbotState = cs;
                    resolve(cs);
                    return [2 /*return*/];
                });
            }); });
        });
    };
    Cleverbot.prototype.say = function (message, verbose) {
        var that = this;
        var endpoint = this.endpoint;
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
                var final = "";
                res.on('data', function (d) {
                    final += d;
                });
                res.on('end', function () {
                    response = JSON.parse(final);
                    if (!verbose)
                        resolve(response.output);
                    else
                        resolve(response);
                    if (that.CleverbotState === null) {
                        that.CleverbotState = response.cs;
                    }
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
