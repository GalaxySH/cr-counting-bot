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
// This line MUST be first, for discord.js to read the process envs!
require('dotenv').config();
const xlogger_1 = __importDefault(require("./xlogger"));
process.on('uncaughtException', function (e) {
    xlogger_1.default.log(e);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => __awaiter(void 0, void 0, void 0, function* () {
    var error = new Error('Unhandled Rejection. Reason: ' + reason);
    console.error(error, "Promise:", promise);
}));
const fs_1 = __importDefault(require("fs"));
const discord_js_1 = __importDefault(require("discord.js"));
const client = new discord_js_1.default.Client();
//import config from "./config.json";
const counthandler_1 = __importDefault(require("./utils/counthandler"));
client.commands = new discord_js_1.default.Collection();
// ▼▲▼▲▼▲▼▲▼▲▼▲▼▲ for command handler
const commandFiles = fs_1.default.readdirSync('./commands').filter(file => file.endsWith('.js'));
var commNumber = 1;
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
    let noName = '';
    if (command.name === '' || command.name == null) {
        noName = ' \x1b[33mWARNING: \x1b[32mthis command has no name, it may not be configured properly\x1b[0m';
    }
    console.log(`${commNumber} - %s$${command.name}%s has been loaded%s`, '\x1b[35m', '\x1b[0m', noName);
    commNumber++;
}
client.on("ready", () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    // set db
    client.database = yield require("./utils/dbm").createDatabase();
    xlogger_1.default.log(`Bot ${(_a = client.user) === null || _a === void 0 ? void 0 : _a.tag}(${(_b = client.user) === null || _b === void 0 ? void 0 : _b.id}) has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`);
    // set the visible bot status
    (_c = client.user) === null || _c === void 0 ? void 0 : _c.setPresence({
        activity: {
            name: `for ✔ nums | ${process.env.PREFIX}help`,
            type: 'WATCHING'
        },
        status: 'online'
    }).catch(xlogger_1.default.error);
}));
client.on("message", (message) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e;
    try {
        if (message.author.bot)
            return; // returning if messages should not be received
        if (message.system)
            return;
        //if (!(message.channel instanceof TextChannel)) return;
        var dm = false;
        if (!message.guild)
            dm = true;
        if (dm)
            return; // aborting all dm messages for now
        //const now = Date.now();
        message.gprefix = process.env.PREFIX;
        if (yield counthandler_1.default(client, message))
            return;
        if (!client.commands || !message.gprefix)
            return;
        if (message.content.toLowerCase().indexOf(message.gprefix) !== 0)
            return; // check for absence of prefix
        const args = message.content.slice(message.gprefix.length).trim().split(/ +/g);
        if (!args || !args.length)
            return;
        const commandName = (_d = args.shift()) === null || _d === void 0 ? void 0 : _d.toLowerCase();
        if (!commandName)
            return;
        const command = client.commands.get(commandName) || ((_e = client.commands) === null || _e === void 0 ? void 0 : _e.find(cmd => cmd.aliases && cmd.aliases.includes(commandName)));
        if (!command || !command.name)
            return; // if command doesn't exist, stop
        if (command.args && !args.length) {
            let reply = `I need arguments to make that work, ${message.author}!`;
            if (command.usage) {
                reply += `\nThe proper usage would be: \`${message.gprefix}${command.name} ${command.usage}\``;
            }
            return message.channel.send({
                embed: {
                    description: reply,
                    footer: {
                        text: 'tip: separate arguments with spaces'
                    }
                }
            });
        }
        try {
            //let cdat = { client: client, message: message, args: args };
            command.execute(client, message, args); // execute command function (execute())
        }
        catch (error) {
            xlogger_1.default.error(error);
            message.reply('error while executing! please ask a mod for help.');
        }
    }
    catch (error) {
        xlogger_1.default.error(error);
    }
}));
client.login(process.env.TOKEN);
