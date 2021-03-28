import xlg from '../xlogger';
//import fs from "fs";
import { sendError } from "../utils/messages";
//import checkAccess from '../utils/checkaccess';
import { Command, CommandClient, ExtMessage } from '../typings';
import { MessageEmbedOptions, TextChannel } from 'discord.js';

const actions = [
    "feel bad",
    "get yelled at",
    "get banned",
    "get kicked",
    "disappoint your family",
    "regret it",
    "face my wrath",
    "I will destroy you",
    "get anxiety",
    "Discord will crash",
    "leave this server",
    "be that one kid",
    "I will give you the fail role",
    "I will mute you",
    "I can't do anything to stop you",
    "lose your pension",
    "lose your prospects",
    "I will henceforth refer to you as a pleb",
    "I will break your keyboard",
    "you will never see the light",
    "I will give you an F",
    "your punishment in hell will be playing golf",
    "hell will exist,\nonly for you,\nand you will go to hell\n...for an eternity"
]

export const command: Command = {
    name: "next",
    aliases: ["hint", "n"],
    description: "Find the next number",
    specialArgs: 0,
    async execute(client: CommandClient, message: ExtMessage) {
        try {
            const count = await client.database.getCount(message.guild?.id) || 0;
            const increment = await client.database.getIncrement(message.guild?.id);
            if (!increment) return;
            const incre = increment || 1;
            // check for perms
            //if (!(await checkAccess(message))) return;

            // CHECK TO MAKE SURE THAT A CHANNEL IS SET, ABORT AND SEND EMBED IF THERE ISN"T ONE

            // CHECK IF THE SENDER WAS THE LAST PERSON TO COUNT, THEN SAY DON"T COUNT
            const lastUpdater = await client.database.getLastUpdater(message.guild?.id);
            
            let embed: MessageEmbedOptions = {};
            if (typeof lastUpdater === "string") {
                const last = lastUpdater || false;

                embed = {
                    color: process.env.INFO_COLOR,
                    title: "Next",
                    description: last === message.author.id ? `Don't send anything! You were the last to count.` : `send \`${count + incre}\``,
                    footer: {
                        text: `else ${actions[Math.floor(Math.random() * actions.length)]}`
                    }
                };
                
            } else {
                embed = {
                    color: process.env.WARN_COLOR,
                    description: "No Data"
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