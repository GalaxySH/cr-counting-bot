import xlg from '../xlogger';
import { CommandClient, ExtMessage } from '../typings';
import { sendError } from "../utils/messages";
import { TextChannel } from 'discord.js';

module.exports = {
    name: "invite",
    description: "invite the bot to your server!",
    async execute(client: CommandClient, message: ExtMessage) {
        try {
            message.channel.send({
                embed: {
                    color: process.env.INFO_COLOR,
                    title: "Invite Me",
                    description: `[click here](http://digmsl.link/counting1)`
                }
            }).catch(xlg.error);
        } catch (error) {
            xlg.error(error);
            if (!(message.channel instanceof TextChannel)) return;
            sendError(message.channel);
        }
    }
}