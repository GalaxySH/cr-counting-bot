"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const xlogger_1 = __importDefault(require("../xlogger"));
const fs_1 = __importDefault(require("fs"));
const messages_1 = require("../utils/messages");
const checkaccess_1 = __importDefault(require("../utils/checkaccess"));
const discord_js_1 = require("discord.js");
module.exports = {
    name: "count",
    aliases: ["increment"],
    description: "set the count difference",
    execute(client, message, args) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const config = require("../config.json");
                // check for perms
                if (!(yield checkaccess_1.default(message)))
                    return;
                if (args.length > 0 && args.length < 2) {
                    if (/[^0-9]+/.test(args[0])) {
                        message.channel.send({
                            embed: {
                                color: process.env.FAIL_COLOR,
                                description: "that is not a valid number"
                            }
                        });
                        return false;
                    }
                    if (parseInt(args[0], 10) === config.increment) {
                        message.channel.send({
                            embed: {
                                color: process.env.WARN_COLOR,
                                description: "that increment is already set"
                            }
                        });
                        return false;
                    }
                    let ninc = parseInt(args[0], 10);
                    config.increment = ninc;
                    fs_1.default.writeFile("./config.json", JSON.stringify(config, null, 2), function (err) {
                        if (err)
                            return console.log(err);
                    });
                    message.channel.send({
                        embed: {
                            color: process.env.NAVY_COLOR,
                            description: `increment set to \`${ninc}\``
                        }
                    });
                    return;
                }
                let ninc = Math.floor(Math.random() * 10);
                config.increment = ninc;
                fs_1.default.writeFile("./config.json", JSON.stringify(config, null, 2), function (err) {
                    if (err)
                        return console.log(err);
                });
                message.channel.send({
                    embed: {
                        color: process.env.NAVY_COLOR,
                        description: `increment set to \`${ninc}\``
                    }
                });
                return;
            }
            catch (error) {
                xlogger_1.default.error(error);
                if (!(message.channel instanceof discord_js_1.TextChannel))
                    return;
                messages_1.sendError(message.channel);
            }
        });
    }
};
