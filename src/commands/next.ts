import xlg from '../xlogger';
//import fs from "fs";
import { sendError } from "../utils/messages";
//import checkAccess from '../utils/checkaccess';
import { Command, CommandClient, ExtMessage } from '../typings';
import { TextChannel } from 'discord.js';

const actions = [
    "get yoinked",
    "get smushed",
    "feel bad",
    "get yelled at",
    "get banned",
    "get fired",
    "get kicked",
    "disappoint your family",
    "regret it",
    "face my wrath",
    "pay your taxes",
    "get anxiety",
    "your computer will crash",
    "never fit in",
    "be that one kid",
    "get the f-role",
    "I can't do anything to stop you",
    "lose your pension",
    "lose your prospects",
    "you won't get that scholarship",
    "you might die\nwith the same odds as always",
    "you're bad",
    "your phone will break",
    "your keyboard will break",
    "you will never see light again",
    "lose the ability to feel heat",
    "get an F",
    "you will become infamous",
    "you will only be able to play golf",
    "god will exist, but only for you, and you will go to hell, and you will be the only one there...for eternity"
]

export const command: Command = {
    name: "next",
    aliases: ["hint", "n"],
    description: "Find the next number",
    specialArgs: 0,
    async execute(client: CommandClient, message: ExtMessage) {
        try {
            const count = await client.database?.getCount(message.guild?.id) || 0;
            const increment = await client.database?.getIncrement(message.guild?.id);
            if (!increment) return;
            const incre = increment || 1;
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
                            text: `else ${actions[Math.floor(Math.random() * actions.length)]}`
                        }
                    };
                } else {
                    embed = {
                        color: process.env.INFO_COLOR,
                        author: {
                            name: "〉〉〉〉〉〉〉〉〉〉"
                        },
                        title: "Next",
                        description: `send \`${count + incre}\``,
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