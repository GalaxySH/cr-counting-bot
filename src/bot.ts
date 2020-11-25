// This line MUST be first, for discord.js to read the process envs!
//require('dotenv').config()
//console.log('Start-dir: ' + process.cwd());

try {
    process.chdir('dist');
    console.log('Working-dir: ' + process.cwd());
}
catch (err) {
    console.log('chdir: ' + err);
}

import xlg from './xlogger';
import fs from "fs";
import Discord, { TextChannel } from 'discord.js';
import counthandler from "./utils/counthandler";
import { Command, CommandClient, ExtMessage } from './typings';
import { Database } from "./utils/dbm";
import { sendError } from './utils/messages';
//import config from "./config.json";

process.on('uncaughtException', function (e) {
    xlg.log(e);
    process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
    const error = new Error('Unhandled Rejection. Reason: ' + reason);
    console.error(error, "Promise:", promise);
});

const client: CommandClient = new Discord.Client();
client.commands = new Discord.Collection<string, Command>();
// ▼▲▼▲▼▲▼▲▼▲▼▲▼▲ for command handler
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
let commNumber = 1;
for (const file of commandFiles) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
    let noName = '';
    if (command.name === '' || command.name == null) {
        noName = ' \x1b[33mWARNING: \x1b[32mthis command has no name, it may not be configured properly\x1b[0m';
    }
    console.log(`${commNumber} - %s$${command.name}%s has been loaded%s`, '\x1b[35m', '\x1b[0m', noName);
    commNumber++;
}

client.on("ready", async () => {
    // set db
    //client.database = await require("./utils/dbm").createDatabase();
    //client.database?.collection("counts").insertOne({});

    xlg.log(`Bot ${client.user?.tag}(${client.user?.id}) has started, with ~${client.users.cache.size}~ users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`);
    // set the visible bot status
    client.user?.setPresence({
        activity: {
            name: `for ✔ nums | ${process.env.PREFIX}help`,
            type: 'WATCHING'
        },
        status: 'online'
    }).catch(xlg.error)

    // setting up db and attaching it to the client
    client.database = await new Database().handleDb();
})

client.on("rateLimit", rateLimitInfo => {
    xlg.log('Ratelimited: ' + JSON.stringify(rateLimitInfo));
})

function delNoChat(msg: ExtMessage) {
    if (!msg.chatting && msg.channel.id === msg.countChannel) {
        msg.delete();
    }
    return;
}

client.on("message", async (message: ExtMessage) => {
    try {
        if (message.author.bot) return; // returning if messages should not be received
        if (message.system) return;
        if (message.embeds[0]) return; // ignoring messages with embeds

        //if (!(message.channel instanceof TextChannel)) return;
        let dm = false;
        if (!message.guild)
            dm = true
        if (dm) return // aborting all dm messages for now
        
        //const now = Date.now();
        const chatting = await client.database?.getChatAllowed(message.guild?.id);
        if (!chatting || (!chatting.chatAllowed && chatting.chatAllowed !== false)) {
            message.chatting = true;
        } else {
            message.chatting = chatting.chatAllowed;
        }
        const countChannel = await client.database?.getChannel(message.guild?.id);
        if (countChannel && countChannel.countChannel) {
            message.countChannel = countChannel.countChannel;
        } else {
            message.countChannel = "";
        }

        message.gprefix = process.env.PREFIX;
        if (await counthandler(client, message)) return;
        if (!client.commands || !message.gprefix) return delNoChat(message);

        message.cmdChannel = await client.database?.getCommandChannel(message.guild?.id);
        if (message.cmdChannel && message.cmdChannel !== message.channel.id) return delNoChat(message);

        if (message.content.toLowerCase().indexOf(message.gprefix) !== 0) return delNoChat(message); // check for absence of prefix
        const args = message.content.slice(message.gprefix.length).trim().split(/ +/g);
        if (!args || !args.length) return delNoChat(message);

        const commandName = args.shift()?.toLowerCase();
        if (!commandName) return delNoChat(message);
        const command = client.commands.get(commandName) ||
            client.commands?.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
        if (!command || !command.name) return delNoChat(message); // if command doesn't exist, stop

        if (command.args) {
            if (!args.length) {
                let reply = `I need arguments to make that work, ${message.author}!`
                if (command.usage) {
                    reply += `\nThe proper usage would be: \`${message.gprefix}${command.name} ${command.usage}\``
                }
                message.channel.send({
                    embed: {
                        description: reply,
                        footer: {
                            text: 'tip: separate arguments with spaces'
                        }
                    }
                });
                return delNoChat(message);
            }
        }

        if (command.specialArgs || command.specialArgs === 0) {
            if (args.length !== command.specialArgs) {
                let reply = `${message.author}, those arguments are not allowed.`
                if (command.usage) {
                    reply += `\nCorrect Usage: \`${message.gprefix}${command.name} ${command.usage}\``
                } else {
                    reply += `\nCorrect Usage: \`${message.gprefix}${command.name}\``
                }
                message.channel.send({
                    embed: {
                        color: process.env.FAIL_COLOR,
                        title: "Illegal Arguments",
                        description: reply,
                        footer: {
                            text: 'tip: separate arguments with spaces'
                        }
                    }
                });
                return delNoChat(message);
            }
        }

        try {
            //let cdat = { client: client, message: message, args: args };
            command.execute(client, message, args); // execute command function (execute())
        } catch (error) {
            xlg.error(error);
            if (!(message.channel instanceof TextChannel)) return;
            sendError(message.channel, 'Error while executing! You may try asking server staff for help. If this occurs again, please create an issue for this bug on my [GitHub](https://github.com/galaxysh/cr-counting-bot/issues).');
        }
    } catch (error) {
        xlg.error(error);
        if (!(message.channel instanceof TextChannel)) return;
        sendError(message.channel, 'Error while processing. You may try asking server staff for help. If this occurs again, please create an issue for this bug on my [GitHub](https://github.com/galaxysh/cr-counting-bot/issues).');
    }
})

client.login(process.env.TOKEN)