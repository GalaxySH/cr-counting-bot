const xlg = require('../xlogger');
const config = require("../config.json");
const { sendError } = require("../utils/messages");

module.exports = {
    name: "help",
    description: "stop, get help",
    async execute({ client, message }) {
        try {
            var cmdMap = [];
            client.commands.forEach(c => {
                cmdMap.push(`🔹 \`${config.prefix}${c.name}\`\n${c.description}`)
            })
            message.channel.send({
                embed: {
                    color: config.navy_color,
                    title: "Server Commands",
                    description: cmdMap.join("\n")
                }
            }).catch(xlg.error);
        } catch (error) {
            xlg.error(error);
            sendError(message.channel);
        }
    }
}