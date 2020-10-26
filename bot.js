// This line MUST be first, for discord.js to read the process envs!
require('dotenv').config()
const xlg = require('./xlogger')
process.on('uncaughtException', function (e) {
    xlg.log(e);
    process.exit(1);
});
process.on('unhandledRejection', async (reason, promise) => {
    var error = new Error('Unhandled Rejection. Reason: ' + reason);
    console.error(error, "Promise:", promise);
});

const fs = require("fs");
const Discord = require('discord.js');
const client = new Discord.Client();
const config = require("./config.json");
const ch = require("./utils/counthandler");

client.commands = new Discord.Collection();
// ▼▲▼▲▼▲▼▲▼▲▼▲▼▲ for command handler
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
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

client.on("ready", async () => {
    // set db
    client.database = await require("./utils/dbm").createDatabase();

    xlg.log(`Bot ${client.user.tag}(${client.user.id}) has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`);
    // set the visible bot status
    client.user.setPresence({
        activity: {
            name: `for ✔ nums | ${config.prefix}help`,
            type: 'WATCHING'
        },
        status: 'online'
    }).catch(xlg.error)
})

client.on("message", async message => {
    try {
        if (message.author.bot) return; // returning if messages should not be received
        if (message.system) return;

        var dm = false;
        if (!message.guild)
            dm = true
        if (dm) return // aborting all dm messages for now
        
        //const now = Date.now();

        message.gprefix = config.prefix;
        if (await ch(message)) return;

        if (message.content.toLowerCase().indexOf(message.gprefix) !== 0) return; // check for absence of prefix
        const args = message.content.slice(message.gprefix.length).trim().split(/ +/g);

        const commandName = args.shift().toLowerCase();
        const command = client.commands.get(commandName) ||
            client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

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
            let cdat = { client: client, message: message, args: args };
            command.execute(cdat); // execute command function (execute())
        } catch (error) {
            xlg.error(error);
            message.reply('error while executing! please ask a mod for help.');
        }
    } catch (error) {
        xlg.error(error);
    }
})

client.login(process.env.TOKEN)