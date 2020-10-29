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
const { sendError } = require("../utils/messages");
module.exports = {
    name: "help",
    description: "stop, get help",
    execute(client, message, args) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!client.commands)
                    return;
                var cmdMap = [];
                client.commands.forEach(c => {
                    cmdMap.push(`🔹 \`${process.env.PREFIX}${c.name}\`\n${c.description}`);
                });
                message.channel.send({
                    embed: {
                        color: process.env.NAVY_COLOR,
                        title: "Server Commands",
                        description: cmdMap.join("\n")
                    }
                }).catch(xlogger_1.default.error);
            }
            catch (error) {
                xlogger_1.default.error(error);
                sendError(message.channel);
            }
        });
    }
};
