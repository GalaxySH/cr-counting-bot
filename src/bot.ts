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
import Discord from 'discord.js';
import counthandler from "./utils/counthandler";
import { Command, CommandClient, ExtMessage } from './typings';
import { Database } from "./utils/dbm";
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

        message.gprefix = process.env.PREFIX;
        if (await counthandler(client, message)) return;
        if (!client.commands || !message.gprefix) return;

        if (message.content.toLowerCase().indexOf(message.gprefix) !== 0) return; // check for absence of prefix
        const args = message.content.slice(message.gprefix.length).trim().split(/ +/g);
        if (!args || !args.length) return;

        const commandName = args.shift()?.toLowerCase();
        if (!commandName) return;
        const command = client.commands.get(commandName) ||
            client.commands?.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command || !command.name) return // if command doesn't exist, stop
        if (command.args && !args.length) {
            let reply = `I need arguments to make that work, ${message.author}!`
            if (command.usage) {
                reply += `\nThe proper usage would be: \`${message.gprefix}${command.name} ${command.usage}\``
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
        } catch (error) {
            xlg.error(error);
            message.reply('error while executing! please ask a mod for help.');
        }
    } catch (error) {
        xlg.error(error);
    }
})

client.login(process.env.TOKEN)