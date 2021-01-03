import xlg from '../xlogger';
import { sendError } from "../utils/messages";
import { CommandClient, ExtMessage } from '../typings';
import { TextChannel } from 'discord.js';

module.exports = {
    name: "saves",
    aliases: ["s"],
    description: "View all available saves",
    specialArgs: 0,
    async execute(client: CommandClient, message: ExtMessage) {
        try {
            let saves = await client.database?.getGuildSaves(message.guild?.id);
            if (!saves && saves !== 0) saves = 0;
            const player = await client.database?.getPlayerData(message.author.id);

            // CHECK TO MAKE SURE THAT A CHANNEL IS SET, ABORT AND SET EMBED IF THERE ISN"T ONE

            message.channel.send({
                embed: {
                    color: process.env.INFO_COLOR,
                    title: "Saves",
                    description: `Personal: **${player ? player.saves : "0"}/3**\nG-Saves: **${saves}/3**`
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