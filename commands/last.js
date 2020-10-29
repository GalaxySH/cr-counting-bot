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
//import fs from "fs";
const messages_1 = require("../utils/messages");
const discord_js_1 = require("discord.js");
module.exports = {
    name: "last",
    description: "get the last person who counted",
    execute(client, message) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const config = require("../config.json");
                // check for perms
                //if (!(await checkAccess(message))) return;
                message.channel.send({
                    embed: {
                        color: process.env.INFO_COLOR,
                        title: "Last Sender",
                        description: `${(_a = message.guild) === null || _a === void 0 ? void 0 : _a.members.cache.get(config.lastUpdatedId)}`,
                        footer: {
                            text: `${config.currentNumber}`
                        }
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
