import { Bot } from "../bot";
import { Database } from "./dbm";
import { MuteData } from "../typings";
import xlg from "../xlogger";

export class MutePoller {
    private database: Database;
    constructor(database: Database) {
        this.database = database;
        setInterval(() => {
            Bot.mutePoller.execMuteCheck();
        }, 1000)
    }
    /**
     * A function that automatically polls the database once per second and deletes all permission overwrites for expired mutes.
     * A mute is considered expired when it's specifiec time to unmute has passed.
     */
    async execMuteCheck(): Promise<void> {
        try {
            if (!Bot.client || !Bot.client.readyAt) return;
            const mc = await this.database.getExpiredMutes();
            if (!mc) return;
            mc.forEach(async (a: MuteData) => {
                const g = Bot.client.guilds.cache.get(a.guildID);
                const cc = await this.database.getChannel(a.guildID);// counting channel
                if (g && cc) {
                    const m = g.members.cache.get(a.memberID);
                    const c = g.channels.cache.get(cc);
                    if (m && c) {
                        const o = c.permissionOverwrites.find(x => x.type === "member" && x.id === m.id);
                        if (o && !o.allow.has("SEND_MESSAGES")) {
                            await o.delete(`unmuting ${m.user.tag} automatically`);
                        }
                    }
                }
                this.database.unsetMemberMute(a.guildID, a.memberID);
            });
        } catch (error) {
            xlg.error(error);
        }
    }
}
