const xlg = require('../xlogger');

module.exports = async (message) => {
    var config = require("../config.json");
    if (message.author.id !== config.ownerID && !message.member.permissions.has("ADMINISTRATOR")) {
        message.channel.send({
            embed: {
                color: config.fail_color,
                description: `${message.member}, you do not have permission to use this command.`
            }
        }).catch(xlg.error);
        return false;
    }
    return true;
}