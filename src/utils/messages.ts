import { Channel, DMChannel, TextChannel } from "discord.js"

export function sendError(channel: Channel, message?: string, errorTitle = false): undefined {
    if (!(channel instanceof TextChannel) && !(channel instanceof DMChannel)) return;
    channel.send({
        embed: {
            color: parseInt(process.env.FAIL_COLOR || "16711680"),
            title: (errorTitle) ? "Error" : undefined,
            description: (message && message.length) ? message : "Something went wrong. ¯\\_(ツ)_/¯"
        }
    }).catch(console.error)
    return;
}

export function sendWarn(channel: Channel, message?: string, warnTitle = false): undefined {
    if (!(channel instanceof TextChannel) && !(channel instanceof DMChannel)) return;
    channel.send({
        embed: {
            color: parseInt(process.env.WARN_COLOR || "0xFF9933"),
            title: (warnTitle) ? "Warn" : undefined,
            description: (message && message.length) ? message : "Warning!"
        }
    }).catch(console.error)
    return;
}

export function sendInfo(channel: Channel, message?: string, infoTitle = false): undefined {
    if (!(channel instanceof TextChannel) && !(channel instanceof DMChannel)) return;
    channel.send({
        embed: {
            color: parseInt(process.env.INFO_COLOR || "0x8C134C"),
            title: (infoTitle) ? "Warn" : undefined,
            description: (message && message.length) ? message : "Info"
        }
    }).catch(console.error)
    return;
}
