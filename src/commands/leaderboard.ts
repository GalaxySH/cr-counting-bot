import xlg from '../xlogger';
//import fs from "fs";
import { sendError } from "../utils/messages";
//import checkAccess from '../utils/checkaccess';
import { CommandClient, ExtMessage } from '../typings';
import { TextChannel } from 'discord.js';

module.exports = {
    name: "leaderboard",
    aliases: ["lb"],
    description: "get the global leaderboard",
    async execute(client: CommandClient, message: ExtMessage, args: string[]) {
        try {
            if (args.length > 0 && !message.chatting && message.channel.id === message.countChannel) {
                message.delete();
                if (!(message.channel instanceof TextChannel)) return;
                sendError(message.channel, "Arguments not allowed");
                return false;
            }
            // Retrieving the leaderboard from the database
            const guildsLb = await client.database?.getGuildsLeaderboard(message.guild?.id);
            if (!guildsLb) return false;
            // Initializing the array for the leaderboard display
            const lbMap: Array<string> = [];
            // Figuring the longest guild name
            let longestNameLength = 0;
            for (let i = 0; i < guildsLb.length; i++) {
                const g = guildsLb[i];
                if (g.guildID) {
                    const gu = client.guilds.cache.get(g.guildID);
                    if (gu) {
                        if (longestNameLength < gu.name.length) longestNameLength = gu.name.length;
                    }
                }
            }
            if (longestNameLength > 20) longestNameLength = 20;
            // Getting the right spacing and length and adding the header row
            const columnOneName = "Rank.";
            const columnTwoName = "Name";
            let spaces = "";
            for (let i = 0; i < (longestNameLength - columnTwoName.length); i++) {
                spaces += " ";
            }
            lbMap.unshift(`${columnOneName} │ ${columnTwoName}${spaces} │ Count `);
            // Getting and adding the entries
            let displayIndex = 1
            for (let i = 0; i < guildsLb.length; i++) {
                const g = guildsLb[i];
                if (g.guildID) {
                    const gu = client.guilds.cache.get(g.guildID);
                    if (gu) {
                        let guildName = gu.name;
                        if (guildName.length > 20) {
                            guildName = guildName.slice(0, 17) + "...";
                        }
                        const lengToAdd = longestNameLength - guildName.length;
                        for (let b = 0; b < lengToAdd; b++) {
                            guildName += " ";
                        }
                        let rankSpaces = "";
                        for (let b = 0; b < (columnOneName.length - `${displayIndex}`.length - 2); b++) {
                            rankSpaces += " ";
                        }

                        // ⫸
                        lbMap.push(` ${(displayIndex < 10) ? (`${rankSpaces}${displayIndex}`) : (`${displayIndex}`)}. │ ${guildName} │ ${g.count}`);
                        displayIndex++;
                    } else {
                        await client.database?.deleteGuildEntry(g.guildID);
                    }
                }
            }
            // Making a divider and adding in between the header and the entries
            let divider = "";
            let longestEntryLength = 0;
            for (let i = 0; i < (lbMap.length); i++) {
                const entry = lbMap[i];
                if (entry.length > longestEntryLength) longestEntryLength = entry.length;
            }
            for (let i = 0; i < (longestEntryLength); i++) {
                divider += "=";
            }
            lbMap.splice(1, 0, divider);
            // Sending the leaderboard
            message.channel.send({
                embed: {
                    color: process.env.INFO_COLOR,
                    title: "Leaderboard of Guilds",
                    description: `\`\`\`md\n${lbMap.join("\n")}\n\`\`\``,
                    footer: {
                        iconURL: message.author.avatarURL() || "",
                        text: message.author.tag
                    }
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