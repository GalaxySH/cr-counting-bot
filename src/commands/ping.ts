import xlg from "../xlogger";
import { Command } from "../typings";
import { TextChannel } from "discord.js";
import { sendError } from "../utils/messages";

export const command: Command = {
    name: 'ping',
    description: 'Ping the bot',
    hideInHelp: true,
    specialArgs: 0,
    async execute(client, message) {
        try {
            // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
            // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
            const m = await message.channel.send("Ping?");
            m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms.`);
        } catch (error) {
            xlg.error(error);
            if (!(message.channel instanceof TextChannel)) return;
            sendError(message.channel);
        }
    }
}
