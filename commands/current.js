const xlg = require("../xlogger");
const fs = require("fs");
const { sendError } = require("../utils/messages");
const checkAccess = require('../utils/checkaccess');

module.exports = {
    name: "current",
    aliases: ["count"],
    description: "get the current count",
    async execute({ message, args }) {
        try {
            const config = require("../config.json");
            
            if (args.length === 1) {
                // check for perms
                if (!(await checkAccess(message, true))) return;
                if (/[^0-9]+/.test(args[0])) {
                    message.channel.send({
                        embed: {
                            color: config.fail_color,
                            description: "that is not a valid number"
                        }
                    });
                    return false;
                }
                let ncount = parseInt(args[0], 10);
                config.currentNumber = ncount;
                fs.writeFile("./config.json", JSON.stringify(config, null, 2), function (err) {
                    if (err) return console.log(err);
                });
                message.channel.send({
                    embed: {
                        color: config.navy_color,
                        description: `count set to \`${ncount}\``
                    }
                });
                return;
            }
            message.channel.send({
                embed: {
                    color: config.info_color,
                    title: "Current",
                    description: `the count is \`${config.currentNumber}\`\nthe increment is \`${config.increment}\``
                }
            });
            return;
        } catch (error) {
            xlg.error(error);
            sendError(message.channel);
        }
    }
}