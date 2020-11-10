import { CommandClient, ExtMessage } from "../typings";
import xlg from "../xlogger";

export async function handleFoul(client: CommandClient, message: ExtMessage, reason: string): Promise<boolean> {
    if (!client || !message) return false;
    if (!reason) reason = "Foul";

    message.react("❌");
    await client.database?.setLastUpdater(message.guild?.id || "", "");// reset lastUpdater for a new count (anyone can send)
    await client.database?.updateCount(message.guild?.id || "", 0);// reset the count

    const increment = await client.database?.getIncrement(message.guild?.id);
    if (!increment) return false;
    const incre = increment.increment || 1;
    message.channel.send({
        embed: {
            color: process.env.INFO_COLOR,
            title: `❌ ${reason}`,
            description: `***reset to 0***\nincrement is ${incre}`,
            footer: {
                text: "idiot"
            }
        }
    }).catch(xlg.error);
    return true;
}