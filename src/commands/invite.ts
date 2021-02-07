import xlg from '../xlogger';
import { Command, CommandClient, ExtMessage } from '../typings';
import { sendError } from "../utils/messages";
import { TextChannel } from 'discord.js';

export const command: Command = {
    name: "invite",
    description: "Invite the bot to your server!",
    specialArgs: 0,
    async execute(client, message) {
        try {
            message.channel.send({
                embed: {
                    color: process.env.INFO_COLOR,
                    title: "Invite Me",
                    description: `[click here (shortlink)](https://digmsl.link/counting2)`
                }
            }).catch(xlg.error);
        } catch (error) {
            xlg.error(error);
            if (!(message.channel instanceof TextChannel)) return;
            sendError(message.channel);
        }
    }
}