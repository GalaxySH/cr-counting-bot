import xlg from '../xlogger';
import { CommandClient, ExtMessage } from '../typings';
import { sendError } from "../utils/messages";
import { TextChannel } from 'discord.js';

module.exports = {
    name: "howto",
    aliases: ["instructions"],
    description: "in case you haven't already figured it out",
    specialArgs: 0,
    async execute(client: CommandClient, message: ExtMessage) {
        try {
            message.channel.send({
                embed: {
                    color: process.env.INFO_COLOR,
                    title: "How To Count",
                    description: `__**The Basics**__\n\n1, 2, 3, ...10000, 10001, ...\n\n__**The Count**__\n\nThe purpose of this bot is to run a **counting** channel in any discord server.\n\nTo start counting, set the counting **channel** with \`${message.gprefix}channel\`. The bot will begin watching that channel for a count. Send \`${message.gprefix}help\` to get a list of other cool commands.\n\nMembers of the server can start counting at any time, and configure this bot with multiple settings.\n\nSend \`1\` in the counting channel to begin. Keep counting upwards. Note that at least **two members** are needed!\n\nMembers can only send one number per turn. After a member increments the count once, they have completed their turn.\n\nSending another number from the same account will count as a **foul** and **reset the count**. Sending a number out of sequence will count as a foul and **reset the count**.`,
                    footer: {
                        text: `Send ${message.gprefix}help for a list of commands`
                    }
                }
            }).catch(xlg.error);
        } catch (error) {
            xlg.error(error);
            if (!(message.channel instanceof TextChannel)) return;
            sendError(message.channel);
        }
    }
}