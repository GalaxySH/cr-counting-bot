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
const fs_1 = __importDefault(require("fs"));
module.exports = (client, message) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const config = require("../config.json");
    if (message.channel.id !== "769849916582789140")
        return false;
    if (!parseInt(message.content, 10) || /[^0-9]+/.test(message.content)) {
        if (!message.gprefix || !client.commands)
            return;
        const args = message.content.slice(message.gprefix.length).trim().split(/ +/g);
        const commandName = (_a = args.shift()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
        if (!commandName)
            return;
        const command = client.commands.get(commandName) ||
            client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
        if (command)
            return false;
        message.delete();
        return true;
    }
    //const rmsgs = await message.channel.messages.fetch({ limit: 2 });
    //if (parseInt(message.content, 10) !== parseInt((rmsgs.array())[1].content, 10) + 1) {
    if (!config.currentNumber && config.currentNumber !== 0)
        config.currentNumber = 0;
    if (parseInt(message.content, 10) !== config.currentNumber + config.increment) {
        message.react("❌");
        config.lastUpdatedId = message.author.id;
        config.currentNumber = 0;
        fs_1.default.writeFile("./config.json", JSON.stringify(config, null, 2), function (err) {
            if (err)
                return console.log(err);
        });
        message.channel.send({
            embed: {
                color: process.env.INFO_COLOR,
                title: "❌ wrong number",
                description: `the count has reset to 0\nthe increment is ${config.increment}`,
                footer: {
                    text: "idiot"
                }
            }
        });
        return true;
    }
    if (config.lastUpdatedId === message.author.id) {
        message.react("❌");
        config.lastUpdatedId = message.author.id;
        config.currentNumber = 0;
        fs_1.default.writeFile("./config.json", JSON.stringify(config, null, 2), function (err) {
            if (err)
                return console.log(err);
        });
        message.channel.send({
            embed: {
                color: process.env.INFO_COLOR,
                title: "❌ talking out of turn",
                description: `the count has reset to 0\nthe increment is ${config.increment}`,
                footer: {
                    text: "idiot"
                }
            }
        });
        return true;
    }
    config.lastUpdatedId = message.author.id;
    config.currentNumber += config.increment;
    fs_1.default.writeFile("./config.json", JSON.stringify(config, null, 2), function (err) {
        if (err)
            return console.log(err);
    });
    //message.react("✔");
    message.react("☑️");
    return true;
});
