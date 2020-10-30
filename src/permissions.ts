import { GuildMember } from "discord.js";
import xlg from "./xlogger";
//import { getGlobalSetting, getXP } from "./dbmanager";

const permLevels = {
    member: 0,
    trustedMember: 1,
    immune: 2,
    mod: 3,
    admin: 4,
    botMaster: 5,
}

export async function getPermLevel(member: GuildMember) {
    if (member == null) {
        return permLevels.member;
    }
    /*let botmasters = await getGlobalSetting("botmasters").catch(xlg.error);
    botmasters = botmasters[0].value.split(',');
    if (botmasters.includes(member.user.id)) {
        return permLevels.botMaster;
    }*/
    if (member.hasPermission('ADMINISTRATOR')) { // if a user has admin rights he's automatically a admin
        return permLevels.admin;
    }
    /*if ((await getXP(member))[0].level > 0) {
        return permLevels.trustedMember;
    }*/
    return permLevels.member;
}