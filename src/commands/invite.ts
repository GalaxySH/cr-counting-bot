import xlg from '../xlogger';
import { CommandClient, ExtMessage } from '../typings';
import { sendError } from "../utils/messages";
import { TextChannel } from 'discord.js';

module.exports = {
    name: "invite",
    description: "invite the bot to your server!",
    async execute(client: CommandClient, message: ExtMessage, args: string[]) {
        try {
            if (args.length > 0 && !message.chatting && message.channel.id === message.countChannel) {
                message.delete();
                if (!(message.channel instanceof TextChannel)) return;
                sendError(message.channel, "Arguments not allowed");
                return false;
            }
            message.channel.send({
                embed: {
                    color: process.env.INFO_COLOR,
                    title: "Invite Me",
                    description: `[click here](https://digmsl.link/counting2)`
                }
            }).catch(xlg.error);
        } catch (error) {
            xlg.error(error);
            if (!(message.channel instanceof TextChannel)) return;
            sendError(message.channel);
        }
    }
}