import xlg from '../xlogger';
import { sendError } from "../utils/messages";
import { Command, CommandClient, ExtMessage, guildObject } from '../typings';
import { Guild, MessageEmbedOptions, TextChannel } from 'discord.js';
import { PaginationExecutor } from '../utils/pagination';

export const command: Command = {
    name: "leaderboard",
    aliases: ["lb"],
    description: "Get the global leaderboard",
    specialArgs: 0,
    async execute(client: CommandClient, message: ExtMessage) {
        try {
            // Retrieving the leaderboard from the database
            const guildsLb = await client.database.getGuildsLeaderboard();
            if (!guildsLb) {
                message.channel.send(`No servers to display`);
                return false;
            }
            // Getting and adding the guild entries
            const garray: Guild[] = [];
            for await (const g of guildsLb) {
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
            // split the guilds into groups to display as pages
            const groups: guildObject[][] = [];
            while (guildsLb.length) {
                groups.push(guildsLb.splice(0, 10));
            }

            if (!groups.length || !groups[0].length) {
                message.channel.send(`No servers to display`);
                return;
            }

            let pn = 0;
            let displayIndex = 1
            const pages: MessageEmbedOptions[] = [];
            for (const page of groups) {
                // Initializing the array for the leaderboard display
                const lbMap: string[] = [];
                // Figuring the longest guild name
                let longestNameLength = 0;
                for (const g of page) {
                    if (g.guildID) {
                        const gu = garray.find(x => x.id === g.guildID);
                        if (gu) {
                            if (longestNameLength < gu.name.length) longestNameLength = gu.name.length;
                        }
                    }
                }
                if (longestNameLength > 20) longestNameLength = 20;
                // Getting the right spacing and length and adding the header row
                const columnOneName = "Rank";
                const columnTwoName = "Name";
                let spaces = "";
                for (let i = 0; i < (longestNameLength - columnTwoName.length); i++) {
                    spaces += " ";
                }
                lbMap.unshift(`${columnOneName} │ ${columnTwoName}${spaces} │ Count `);

                for (const d of page) {
                    const g = garray.find(x => x.id === d.guildID);
                    if (g) {
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
                        lbMap.push(` ${rankSpaces}${displayIndex}. │ ${guildName} │ ${d.count}`);
                        displayIndex++;
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

                const e: MessageEmbedOptions = {
                    color: process.env.INFO_COLOR,
                    title: "Leaderboard of Servers",
                    description: `\`\`\`md\n${lbMap.join("\n")}\n\`\`\``,
                    footer: {
                        iconURL: message.author.avatarURL() || "",
                        text: `${message.author.tag} | Top ${garray.length}`
                    }
                };
                pages.push(e);
                pn++;
            }

            PaginationExecutor.createEmbed(message, pages);// creating pages or single lb embed
            return;
        } catch (error) {
            xlg.error(error);
            if (!(message.channel instanceof TextChannel)) return;
            sendError(message.channel);
        }
    }
}
