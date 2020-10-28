import { Channel, TextChannel } from "discord.js"

export function sendError(channel: TextChannel): any {
    return channel.send({
        embed: {
            color: 16711680,
            description: "Something went wrong. ¯\\_(ツ)_/¯"
        }
    }).catch(console.error)
}