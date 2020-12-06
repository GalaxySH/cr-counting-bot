import xlg from '../xlogger';
//import fs from "fs";
import { sendError } from "../utils/messages";
//import checkAccess from '../utils/checkaccess';
import { CommandClient, ExtMessage } from '../typings';
import { TextChannel } from 'discord.js';

module.exports = {
    name: "stats",
    description: "get stats about the current guild",
    specialArgs: 0,
    async execute(client: CommandClient, message: ExtMessage) {
        try {
            const stats = await client.database?.getStats(message.guild?.id);
            if (!stats) return false;
            //const lastUpdater = await client.database?.getLastUpdater(message.guild?.id);
            //if (!lastUpdater) return false;
            //const statArray: Array<string> = [];
            //statArray.push()

            const bestSorted = stats.players?.slice().sort((p1, p2) => (p1.totalCounts > p2.totalCounts) ? -1 : 1)
            const bestCounter = bestSorted && bestSorted[0] ? message.guild?.members.cache.get(bestSorted[0].id) : null;
            const worstSorted = stats.players?.slice().sort((p1, p2) => (p1.errors > p2.errors) ? -1 : 1)
            const worstCounter = worstSorted && worstSorted[0] ? message.guild?.members.cache.get(worstSorted[0].id) : null;

            message.channel.send({
                embed: {
                    color: process.env.INFO_COLOR,
                    author: {
                        name: `${message.guild?.name}`,
                        icon_url: message.guild?.iconURL() || ""
                    },
                    title: "Stats",
                    fields: [
                        {
                            name: "Count Now",
                            value: `\`\`\`${stats.count}\`\`\``,
                            inline: true
                        },
                        {
                            name: "Record",
                            value: `\`\`\`${stats.recordNumber}\`\`\``,
                            inline: true
                        },
                        {
                            name: "\u200b",
                            value: "\u200b",
                            inline: true
                        },
                        {
                            name: "Counts Received",
                            value: `\`\`\`${stats.numberOfCounts}\`\`\``,
                            inline: true
                        },
                        {
                            name: "Errors",
                            value: `\`\`\`${stats.numberOfErrors}\`\`\``,
                            inline: true
                        },
                        {
                            name: "69 Reached",
                            value: `\`\`\`${stats.pogNumStat} times\`\`\``,
                            inline: true
                        },
                        {
                            name: "Total With No Resets",
                            value: `\`\`\`${stats.totalCount}\`\`\``
                        },
                        {
                            name: "Best Counter | Most Counting",
                            value: `\`\`\`${bestCounter ? bestCounter.user.tag : "ND"}\`\`\``
                        },
                        {
                            name: "Worst Counter | Most Errors",
                            value: `\`\`\`${worstCounter ? worstCounter.user.tag : "ND"}\`\`\``
                        },
                        {
                            name: "Leaderboard Eligible",
                            value: `\`\`\`${stats.leaderboardEligible ? 'yes' : 'no'}\`\`\``
                        },
                    ],
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