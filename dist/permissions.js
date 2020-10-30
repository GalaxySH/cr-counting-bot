"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPermLevel = void 0;
//import { getGlobalSetting, getXP } from "./dbmanager";
const permLevels = {
    member: 0,
    trustedMember: 1,
    immune: 2,
    mod: 3,
    admin: 4,
    botMaster: 5,
};
function getPermLevel(member) {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
}
exports.getPermLevel = getPermLevel;
