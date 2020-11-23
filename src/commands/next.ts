import xlg from '../xlogger';
//import fs from "fs";
import { sendError } from "../utils/messages";
//import checkAccess from '../utils/checkaccess';
import { CommandClient, ExtMessage } from '../typings';
import { TextChannel } from 'discord.js';

const actions = [
    "get yoinked",
    "get smushed",
    "feel bad",
    "get yelled at",
    "get banned",
    "get fired",
    "get kicked",
    "become depressed",
    "regret not listening",
    "face my wrath",
    "pay your taxes",
    "get anxiety",
    "your computer will crash",
    "you don't know how to count",
    "never fit in",
    "be that one kid",
    "get the Fail Role",
    "nothing much will happen"
]

module.exports = {
    name: "next",
    aliases: ["hint"],
    description: "find the next number",
    async execute(client: CommandClient, message: ExtMessage, args: string[]) {
        try {
            if (args.length > 0 && !message.chatting && message.channel.id === message.countChannel) {
                message.delete();
                if (!(message.channel instanceof TextChannel)) return;
                sendError(message.channel, "Arguments not allowed");
                return false;
            }
            let count = await client.database?.getCount(message.guild?.id);
            if (!count || !count.count) count = { count: 0 };
            const cc = count.count || 0;
            const increment = await client.database?.getIncrement(message.guild?.id);
            if (!increment) return;
            const incre = increment.increment || 1;
            // check for perms
            //if (!(await checkAccess(message))) return;

            // CHECK TO MAKE SURE THAT A CHANNEL IS SET, ABORT AND SEND EMBED IF THERE ISN"T ONE

            // CHECK IF THE SENDER WAS THE LAST PERSON TO COUNT, THEN SAY DON"T COUNT
            const lastUpdater = await client.database?.getLastUpdater(message.guild?.id);
            
            let embed = {};
            if (lastUpdater) {
                const last = lastUpdater?.lastUpdatedID || false;

                if (last === message.author.id) {
                    embed = {
                        color: process.env.INFO_COLOR,
                        title: "Next",
                        description: `Don't send anything! You were the last to count.`,
                        footer: {
                            text: `or ${actions[Math.floor(Math.random() * actions.length)]}`
                        }
                    };
                } else {
                    embed = {
                        color: process.env.INFO_COLOR,
                        author: {
                            name: "〉〉〉〉〉〉〉〉〉〉〉〉〉〉"
                        },
                        title: "Next",
                        description: `send \`${cc + incre}\``,
                        footer: {
                            text: `or ${actions[Math.floor(Math.random() * actions.length)]}`
                        }
                    };
                }
                
            } else {
                embed = {
                    title: "No Data"
                };
            }
            message.channel.send({ embed: embed });
            return;
        } catch (error) {
            xlg.error(error);
            if (!(message.channel instanceof TextChannel)) return;
            sendError(message.channel);
        }
    }
}