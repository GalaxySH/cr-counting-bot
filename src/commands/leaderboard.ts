import xlg from '../xlogger';
import { sendError } from "../utils/messages";
import { Command, CommandClient, ExtMessage } from '../typings';
import { TextChannel } from 'discord.js';

export const command: Command = {
    name: "leaderboard",
    aliases: ["lb"],
    description: "Get the global leaderboard",
    specialArgs: 0,
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
            const columnOneName = "Rank.";
            const columnTwoName = "Name";
            let spaces = "";
            for (let i = 0; i < (longestNameLength - columnTwoName.length); i++) {
                spaces += " ";
            }
            lbMap.unshift(`${columnOneName} │ ${columnTwoName}${spaces} │ Count `);
            // Getting and adding the entries
            const garray = [];
            for (let i = 0; i < guildsLb.length; i++) {
                const g = guildsLb[i];
                if (g.guildID) {
                    try {
                        const gu = await client.guilds.fetch(g.guildID);
                        if (gu) {
                            garray.push(gu);
                        } else {
                            await client.database?.deleteGuildEntry(g.guildID);
                        }
                    } catch (err) {
                        //garray.push(new Guild(client, {id: g.guildID}))
                        xlg.log(`Leaderboard: Missing access for guild: ${g.guildID}`);
                    }
                }
            }
            let displayIndex = 1
            for (let i = 0; i < garray.length; i++) {
                const g = garray[i];
                        let guildName = g.name;
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
                        lbMap.push(`${rankSpaces}${displayIndex}. │ ${guildName} │ ${guildsLb[i].count}`);
                        displayIndex++;
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
            while (`\`\`\`md\n${lbMap.join("\n")}\n\`\`\``.length > 2048) {
                lbMap.pop();
            }
            message.channel.send({
                embed: {
                    color: process.env.INFO_COLOR,
                    title: "Leaderboard of Guilds",
                    description: `\`\`\`md\n${lbMap.join("\n")}\n\`\`\``,
                    footer: {
                        iconURL: message.author.avatarURL() || "",
                        text: `${message.author.tag} | Top Ten`
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
