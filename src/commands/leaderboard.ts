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
    async execute(client: CommandClient, message: ExtMessage) {
        try {
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
            let spaces = "";
            for (let i = 0; i < (longestNameLength - "Name".length); i++) {
                spaces += " ";
            }
            lbMap.unshift(`R  | Name${spaces} | Count`);
            // Getting and adding the entries
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
                        for (let i = 0; i < lengToAdd; i++) {
                            guildName += " ";
                        }

                        // ⫸
                        lbMap.push(`${(i + 1 < 10) ? (i + 1 + " ") : (i + 1)} | ${guildName} | ${g.count}`)
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
                    description: `\`\`\`\n${lbMap.join("\n")}\n\`\`\``,
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