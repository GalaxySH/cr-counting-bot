// This line MUST be first, for discord.js to read the process envs!
//require('dotenv').config()
//console.log('Start-dir: ' + process.cwd());

try {
    process.chdir('dist');
    console.log('Working-dir: ' + process.cwd());
} catch (err) {
    console.log('chdir: ' + err);
}

import xlg from './xlogger';
import { TextChannel } from 'discord.js';
import counthandler from "./utils/counthandler";
import { CommandClient, ExtMessage } from './typings';
import { sendError } from './utils/messages';
import { MutePoller } from './utils/mutepoller';
import Client from './struct/Client';
import { PaginationExecutor } from './utils/pagination';
//import config from "./config.json";

process.on('uncaughtException', function (e) {
    xlg.log(e);
    process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
    const error = new Error('Unhandled Rejection. Reason: ' + reason);
    console.error(error, "Promise:", promise);
});

export class Bot {
    static client: CommandClient;
    static mutePoller: MutePoller;
    static config: Record<string, unknown>;
    static init(client: CommandClient, mutePoller: MutePoller, config?: Record<string, unknown>): void {
        this.client = client;
        this.mutePoller = mutePoller;
        if (config) {
            this.config = config;
        }
    }
}

// const client: CommandClient = new Discord.Client();
const client = new Client();

client.on("ready", async () => {
    // set db
    await client.database.handleDb();
    await client.loadCommands();
    //client.database = await require("./utils/dbm").createDatabase();
    //client.database?.collection("counts").insertOne({});

    xlg.log(`Bot ${client.user?.tag}(${client.user?.id}) has started, with ~${client.users.cache.size}~ users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`);
    // set the visible bot status
    setInterval(async () => {
        client.user?.setPresence({
            activity: {
                name: `for ✔ nums | ${process.env.PREFIX}help`,
                type: 'WATCHING'
            },
            status: 'online'
        }).catch(xlg.error)
    }, 20000);

    const mutePoller = new MutePoller(client.database);
    Bot.init(client, mutePoller);
});

client.on("rateLimit", rateLimitInfo => {
    xlg.log('Ratelimited: ' + JSON.stringify(rateLimitInfo));
});

client.on("messageReactionAdd", async (reaction, user) => {
    if (user.partial) {
        user = await user.fetch();
    }
    PaginationExecutor.paginate(reaction, user);
});

client.on("guildMemberAdd", async (member) => {
    try {
        const mute = await client.database?.getMute(member.guild.id, member.id);
        if (mute) {
            const channelId = await client.database.getChannel(member.guild.id);
            if (channelId) {
                const channel = member.guild.channels.cache.get(channelId);
                if (channel) {
                    // if (channel.permissionsFor(member.client.user || "")?.has("MANAGE_CHANNELS")) {
                    // }
                    await channel.updateOverwrite(member, { "SEND_MESSAGES": false }, `resetting mute for ${member.user.tag} (mute evasion recovery)`);
                }
            }
        }
    } catch (error) {
        //
    }
});

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
        message.chatting = chatting;

        const countChannel = await client.database?.getChannel(message.guild?.id);
        if (countChannel) {
            message.countChannel = countChannel;
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
            client.commands?.find(cmd => !!(cmd.aliases && cmd.aliases.includes(commandName)));
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

client.login(process.env.TOKEN);
