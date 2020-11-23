import xlg from '../xlogger';
import { sendError } from "../utils/messages";
import { CommandClient, ExtMessage } from '../typings';
import { TextChannel } from 'discord.js';

module.exports = {
    name: "saves",
    aliases: ["s"],
    description: "get the saves for the guild",
    async execute(client: CommandClient, message: ExtMessage, args: string[]) {
        try {
            if (args.length > 0 && !message.chatting && message.channel.id === message.countChannel) {
                message.delete();
                if (!(message.channel instanceof TextChannel)) return;
                sendError(message.channel, "Arguments not allowed");
                return false;
            }

            let saves = await client.database?.getGuildSaves(message.guild?.id);
            if (!saves && saves !== 0) saves = 0;

            // CHECK TO MAKE SURE THAT A CHANNEL IS SET, ABORT AND SET EMBED IF THERE ISN"T ONE

            message.channel.send({
                embed: {
                    color: process.env.INFO_COLOR,
                    title: "Saves",
                    description: `Saves Left: **${saves}**\nMax Saves: **3**`
                }
            });
            return;
        } catch (error) {
            xlg.error(error);
            if (!(message.channel instanceof TextChannel)) return;
            sendError(message.channel);
        }
    }
}