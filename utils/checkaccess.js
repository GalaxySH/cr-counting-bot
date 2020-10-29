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
const xlg = require('../xlogger');
module.exports = (message) => __awaiter(void 0, void 0, void 0, function* () {
    if (!message.member)
        return;
    var config = require("../config.json");
    if (message.author.id !== config.ownerID && !message.member.permissions.has("ADMINISTRATOR")) {
        message.channel.send({
            embed: {
                color: process.env.FAIL_COLOR,
                description: `${message.member}, you do not have permission to use this command.`
            }
        }).catch(xlg.error);
        return false;
    }
    return true;
});
