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

client.on("ready", async () => {
    xlg.log(`Bot ${client.user.tag}(${client.user.id}) has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`);
})

client.on("message", async message => {
    try {
        if (message.author.bot) return;
        if (message.system) return;
        if (message.channel.id !== "769849916582789140") return;
    
        if (!parseInt(message.content, 10) || /[^0-9]+/.test(message.content)) {
            message.delete();
            return;
        }
        //const rmsgs = await message.channel.messages.fetch({ limit: 2 });
        //if (parseInt(message.content, 10) !== parseInt((rmsgs.array())[1].content, 10) + 1) {
        if (parseInt(message.content, 10) !== config.currentNumber + 1) {
            message.react("❌");
            config.currentNumber = 0;
            fs.writeFile("./config.json", JSON.stringify(config, null, 2), function (err) {
                if (err) return console.log(err);
            });
            message.channel.send({
                embed: {
                    color: 6969,
                    description: "Count **Reset**"
                }
            })
            return;
        }
        config.currentNumber++;
        message.react("✔");
    } catch (error) {
        xlg.error(error);
    }
})

client.login(process.env.TOKEN)