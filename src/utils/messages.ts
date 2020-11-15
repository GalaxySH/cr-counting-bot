import { TextChannel } from "discord.js"

export function sendError(channel: TextChannel, message?: string, errorTitle = false): undefined {
    channel.send({
        embed: {
            color: parseInt(process.env.FAIL_COLOR || "16711680"),
            title: (errorTitle) ? "Error" : undefined,
            description: (message && message.length) ? message : "Something went wrong. ¯\\_(ツ)_/¯"
        }
    }).catch(console.error)
    return;
}