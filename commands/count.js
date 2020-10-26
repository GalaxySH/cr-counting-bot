const xlg = require("../xlogger");
const fs = require("fs");
const { sendError } = require("../utils/messages");
const checkAccess = require('../utils/checkaccess');

module.exports = {
    name: "count",
    aliases: ["increment"],
    description: "set the count difference",
    async execute({ message, args }) {
        try {
            const config = require("../config.json");
            // check for perms
            if (!(await checkAccess(message, true))) return;

            if (args.length > 0 && args.length < 2) {
                if (/[^0-9]+/.test(args[0])) {
                    message.channel.send({
                        embed: {
                            color: config.fail_color,
                            description: "that is not a valid number"
                        }
                    });
                    return false;
                }
                if (parseInt(args[0], 10) === config.increment) {
                    message.channel.send({
                        embed: {
                            color: config.warn_color,
                            description: "that increment is already set"
                        }
                    });
                    return false;
                }
                let ninc = parseInt(args[0], 10);
                config.increment = ninc;
                fs.writeFile("./config.json", JSON.stringify(config, null, 2), function (err) {
                    if (err) return console.log(err);
                });
                message.channel.send({
                    embed: {
                        color: config.navy_color,
                        description: `increment set to \`${ninc}\``
                    }
                });
                return;
            }
            let ninc = Math.floor(Math.random() * 10);
            config.increment = ninc;
            fs.writeFile("./config.json", JSON.stringify(config, null, 2), function (err) {
                if (err) return console.log(err);
            });
            message.channel.send({
                embed: {
                    color: config.navy_color,
                    description: `increment set to \`${ninc}\``
                }
            });
            return;
        } catch (error) {
            xlg.error(error);
            sendError(message.channel);
        }
    }
}