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
                            value: `\`\`\`${stats.pogNumStat} times\`\`\``
                        },
                        {
                            name: "Total With No Resets",
                            value: `\`\`\`${stats.totalCount}\`\`\``
                        },
                        {
                            name: "Best Counter",
                            value: `\`\`\`${"coming soon"}\`\`\``
                        },
                        {
                            name: "Worst Counter",
                            value: `\`\`\`${"coming soon"}\`\`\``
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