import { Cursor, Db, MongoClient } from 'mongodb';
import { guildObject, GuildPlayer, MuteData, PlayerData } from '../typings';
import xlg from '../xlogger';

/*/**
 *
 * @param {string} UID Database login Username
 * @param {string} PASS Database login Password
 * @param {string} DB_NAME Database Name
 * @returns {Promise<Db>} A mongoDB database if login worked
 */
/*export async function createDatabase(UID = null, PASS = null, DB_NAME = null): Promise<Db> {
    const username = UID || process.env.MONGO_INITDB_ROOT_USERNAME;
    const password = PASS || process.env.MONGO_INITDB_ROOT_PASSWORD;
    const database_name = DB_NAME || process.env.MONGO_INITDB_DATABASE;

    const URL = `mongodb://${username}:${password}@mongo:27017/?authSource=admin`;
    const db = await MongoClient.connect(URL, {
        useNewUrlParser: true
    });

    xlg.log('Connected to database!');

    return db.db(database_name);
}*/

/*let database: Db;
async function handleDb() {
    try {
        const username = process.env.MONGO_INITDB_ROOT_USERNAME;
        const password = process.env.MONGO_INITDB_ROOT_PASSWORD;
        const database_name = process.env.MONGO_INITDB_DATABASE;
    
        const URL = `mongodb://${username}:${password}@mongo:27017/?authSource=admin`;
        const db = await MongoClient.connect(URL, {
            useNewUrlParser: true
        });
    
        xlg.log('Connected to database!');
    
        database = db.db(database_name);
    } catch (error) {
        xlg.error(`DB Error: ${error.message}\nError: ${error.stack}`);
    }
}
handleDb();*/

export class Database {
    private db?: Db;
    constructor() {
        this.db;
    }

    /**
     * Initialize the database
     * @returns The database handler
     */
    async handleDb(): Promise<this> {
        try {
            const username = process.env.MONGO_INITDB_ROOT_USERNAME;
            const password = process.env.MONGO_INITDB_ROOT_PASSWORD;
            const database_name = process.env.MONGO_INITDB_DATABASE;

            const URL = `mongodb://${username}:${password}@crmongo:27024/?authSource=admin`;
            const db = await MongoClient.connect(URL, {
                useNewUrlParser: true
            });

            xlg.log('Connected to database!');

            this.db = db.db(database_name);
            return this;
        } catch (error) {
            xlg.error(`DB Error: ${error.message}\nError: ${error.stack}`);
            return this;
        }
    }

    /*┏━━━━━━━━━┓
      ┃ GETTERS ┃
      ┗━━━━━━━━━┛*/

    private guildDefaults: guildObject = {
        guildID: "",
        count: 0,
        increment: 1,
        chatAllowed: true,
        leaderboardEligible: 1,
        numberOfCounts: 0,
        recordNumber: 0,
        countChannel: "",
        numberOfErrors: 0,
        saves: 1,
        //lastSaved: new Date()
        lastUpdatedID: "",
        lastMessageID: "",
        totalCount: 0,
        failRole: "",
        pogNumStat: 0,
        players: [],
        courtesyChances: 2,
        autoMute: false,
        recordRole: "",
        recordHolder: "",
        foulPlayPrevention: false
    }
    private userDefaults: PlayerData = {
        userID: "",
        saves: 1,
        counts: 0,
        errors: 0,
        highestNumber: 0,
        banned: false,
        correctAccumulation: 0
    }
    
    async getCount(guildID: string | undefined): Promise<guildObject | false> {
        if (!guildID || !this.db) return false;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        const result = await GuildData.findOne({ "guildID": guildID }) || this.guildDefaults;
        return result;
    }

    async getIncrement(guildID: string | undefined): Promise<guildObject | false> {
        if (!guildID || !this.db) return false;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        const result = await GuildData.findOne({ "guildID": guildID }) || this.guildDefaults;
        if (!result) return false;
        if (!result.increment) {
            await this.setIncrement(guildID, 1);
        }
        return result;
    }
    
    async getChannel(guildID: string | undefined): Promise<guildObject | false> {
        if (!guildID || !this.db) return false;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        const result = await GuildData.findOne({ "guildID": guildID }) || this.guildDefaults;
        if (!result) return false;
        return result;
    }
    
    async getLastUpdater(guildID: string | undefined): Promise<guildObject | false> {
        if (!guildID || !this.db) return false;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        const result = await GuildData.findOne({ "guildID": guildID }) || this.guildDefaults;
        if (!result) return false;
        return result;
    }
    
    async getChatAllowed(guildID: string | undefined): Promise<guildObject | false> {
        if (!guildID || !this.db) return false;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        const result = await GuildData.findOne({ "guildID": guildID }) || this.guildDefaults;
        if (!result) return false;
        return result;
    }
    
    async getStats(guildID: string | undefined): Promise<guildObject | false> {
        if (!guildID || !this.db) return false;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        const result = await GuildData.findOne({ "guildID": guildID }) || this.guildDefaults;
        if (!result) return false;
        if (!result.recordNumber && result.recordNumber !== 0) result.recordNumber = 0;
        if (!result.numberOfCounts && result.numberOfCounts !== 0) result.numberOfCounts = 0;
        if (!result.leaderboardEligible && result.leaderboardEligible !== 0) result.leaderboardEligible = 1;
        if (!result.totalCount && result.totalCount !== 0) result.totalCount = 0;
        if (!result.numberOfErrors) result.numberOfErrors = 0;
        if (!result.count) result.count = 0;
        if (!result.pogNumStat) result.pogNumStat = 0;
        if (!result.players) result.players = [];
        return result;
    }
    
    async getGuildsLeaderboard(guildID: string | undefined): Promise<Array<guildObject> | false> {
        if (!guildID || !this.db) return false;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        const result = GuildData.find({ "leaderboardEligible": 1, "guildID": { $nin: [""] }, "count": { $gt: 0 } }).sort({ "count": -1 }).limit(10);
        if (!result) return false;
        return result.toArray();
    }

    async getGuildSaves(guildID: string | undefined): Promise<number | false> {
        if (!guildID || !this.db) return false;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        const result = await GuildData.findOne({ "guildID": guildID });
        if (!result) return false;
        let saves;
        if (isNaN(result.saves) || result.saves < 0) {
            saves = 0;
        } else {
            saves = result.saves;
        }
        if (!result.lastSaved) return saves;
        const yesterday = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));
        const yesteryesterday = new Date(new Date().getTime() - (48 * 60 * 60 * 1000));
        const yesteryesteryesterday = new Date(new Date().getTime() - (72 * 60 * 60 * 1000));
        //const yesterday = new Date(new Date().getTime() - (10000));
        if (yesteryesteryesterday >= result.lastSaved.getTime() && saves < 3) {
            await this.updateSaves(guildID, saves + 3)
            return await this.getGuildSaves(guildID);
        } else if (yesteryesterday >= result.lastSaved.getTime() && saves < 3) {
            await this.updateSaves(guildID, saves + 2)
            return await this.getGuildSaves(guildID);
        } else if (yesterday >= result.lastSaved.getTime() && saves < 3) {
            await this.updateSaves(guildID, saves + 1)
            return await this.getGuildSaves(guildID);
        } else {
            return saves;
        }
    }

    async getFailRole(guildID: string | undefined): Promise<string | false> {
        if (!guildID || !this.db) return false;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        const result = await GuildData.findOne({ "guildID": guildID }) || this.guildDefaults;
        if (!result) return false;
        if (!result.failRole) return "";
        return result.failRole;
    }
    
    async getCommandChannel(guildID: string | undefined): Promise<string | false> {
        if (!guildID || !this.db) return false;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        const result = await GuildData.findOne({ "guildID": guildID });
        if (!result || !result.commandChannel || result.commandChannel.length !== 18) return "";
        return result.commandChannel;
    }
    
    async getPlayerData(userID: string | undefined): Promise<PlayerData | false> {
        if (!userID || !this.db) return false;
        await this.createUser(userID);
        const UserData = this.db.collection("UserData");
        const result = await UserData.findOne({ "userID": userID }) || this.userDefaults;
        if (!result) return false;
        return result;
    }

    async getLastMessageID(guildID: string | undefined): Promise<string | false> {
        if (!guildID || !this.db) return false;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        const result = await GuildData.findOne({ "guildID": guildID });
        if (!result) return false;
        if (!result.lastMessageID || result.lastMessageID.length !== 18) return "";
        return result.lastMessageID;
    }

    async getDelReminderSent(guildID: string | undefined): Promise<string | false> {
        if (!guildID || !this.db) return false;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        const result = await GuildData.findOne({ "guildID": guildID });
        if (!result || !result.deletedMessageReminder) return false;
        return result.deletedMessageReminder;
    }

    async getCourtesyChances(guildID: string | undefined): Promise<number | false> {
        if (!guildID || !this.db) return false;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        const result = await GuildData.findOne({ "guildID": guildID });
        if (!result || !result.courtesyChances) return 0;
        return result.courtesyChances;
    }

    async getGuildPlayers(guildID: string | undefined): Promise<Array<GuildPlayer> | false> {
        if (!guildID || !this.db) return false;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        const result = await GuildData.findOne({ "guildID": guildID }) || this.guildDefaults;
        if (!result || !result.players) result.players = [];
        return result;
    }

    async getMute(guildID: string | undefined, memberID: string | undefined): Promise<MuteData | false> {
        if (!guildID || !memberID || !this.db) return false;
        await this.maybeSetDefaults(guildID);
        const MuteData = this.db.collection("MuteSchedule");
        let mute = await MuteData.findOne({ "guildID": guildID, "memberID": memberID });
        if (!mute) mute = false;
        return mute;
    }

    async getExpiredMutes(): Promise<Cursor | false> {
        if (!this.db) return false;
        const MuteData = this.db.collection("MuteSchedule");
        const mutes = MuteData.find({ "muteTime": { $lte: new Date() } });
        if (!mutes || !mutes.count()) return false;
        return mutes;
    }

    async getAutoMuteSetting(guildID: string | undefined): Promise<boolean> {
        if (!guildID || !this.db) return false;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        const result = await GuildData.findOne({ "guildID": guildID });
        if (!result || !result || !result.autoMute) return false;
        return true;
    }

    async getRecordRole(guildID: string | undefined): Promise<string | false> {
        if (!guildID || !this.db) return false;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        const result = await GuildData.findOne({ "guildID": guildID }) || this.guildDefaults;
        if (result && result.recordRole) {
            return result.recordRole;
        }
        return "";
    }

    async getRecordHolder(guildID: string | undefined): Promise<string | false> {
        if (!guildID || !this.db) return false;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        const result = await GuildData.findOne({ "guildID": guildID }) || this.guildDefaults;
        if (result && result.recordHolder) {
            return result.recordHolder;
        }
        return "";
    }

    async getFoulPrevention(guildID: string | undefined): Promise<boolean> {
        if (!guildID || !this.db) return false;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        const result = await GuildData.findOne({ "guildID": guildID });
        if (!result || !result.foulPlayPrevention) return false;
        return result.foulPlayPrevention;
    }

    async getGuildPlayer(guildID: string, userID: string): Promise<GuildPlayer | false> {
        if (!this.db) return false;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");

        const nstatsdef: GuildPlayer = {
            id: userID,
            errors: 0,
            totalCounts: 0,
            highestNumber: 0
        }
        const guild = await GuildData.findOne({ "guildID": guildID });
        const playerIndex = guild.players.findIndex((x: GuildPlayer) => x.id && x.id === userID)
        const player: GuildPlayer = guild.players[playerIndex] || nstatsdef;
        return player;
    }

    /*┏━━━━━━━━━┓
      ┃ SETTERS ┃
      ┗━━━━━━━━━┛*/

    async updateCount(guildID: string, value: number, messageid = ""): Promise<void> {
        if (!this.db) return;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        /*const guild = await GuildData.findOne({ "guildID": guildID });
        let record = guild.recordNumber;
        if (guild.recordNumber < value) {
            record = value;
        }*/
        const inc = await this.getIncrement(guildID) || { increment: 1 };
        await GuildData.updateOne({
            "guildID": guildID,
        }, {
            $set: { "count": value, "lastMessageID": messageid },
            $inc: { "numberOfCounts": 1, "totalCount": inc.increment },
            $max: { "recordNumber": value }
        }, {
            upsert: true
        });
    }

    async setIncrement(guildID: string | undefined, value: number): Promise<void> {
        if (!guildID || !this.db) return;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        await GuildData.updateOne({
            "guildID": guildID,
        }, {
            $set: { "increment": value },
            $min: { "leaderboardEligible": (value !== 1) ? 0 : 1 }
        }, {
            upsert: true
        });
    }

    async setChannel(guildID: string, channel: string): Promise<void> {
        if (!this.db) return;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        await GuildData.updateOne({
            "guildID": guildID,
        }, {
            $set: { "countChannel": channel }
        }, {
            upsert: true
        });
    }

    async setLastUpdater(guildID: string, id: string): Promise<void> {
        if (!this.db) return;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        await GuildData.updateOne({
            "guildID": guildID,
        }, {
            $set: { "lastUpdatedID": id }
        }, {
            upsert: true
        });
    }

    async setChatAllowed(guildID: string, state: boolean): Promise<void> {
        if (!this.db) return;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        await GuildData.updateOne({
            "guildID": guildID,
        }, {
            $set: { "chatAllowed": state }
        }, {
            upsert: true
        });
    }

    async incrementErrorCount(guildID: string): Promise<void> {
        if (!this.db) return;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        await GuildData.updateOne({
            "guildID": guildID,
        }, {
            $inc: { "numberOfErrors": 1 }
        }, {
            upsert: true
        });
    }

    async updateSaves(guildID: string, saves: number): Promise<void> {
        if (!this.db) return;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        await GuildData.updateOne({
            "guildID": guildID,
        }, {
            $set: { "saves": saves, "lastSaved": new Date() }
        });
    }

    async setFailRole(guildID: string, role: string): Promise<void> {
        if (!this.db) return;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        await GuildData.updateOne({
            "guildID": guildID,
        }, {
            $set: { "failRole": role }
        }, {
            upsert: true
        });
    }

    async deleteGuildEntry(guildID: string): Promise<void> {
        if (!this.db) return;
        await this.maybeSetDefaults(guildID);
        this.db.collection("GuildData").deleteOne({ "guildID": guildID });
    }

    async setCommandChannel(guildID: string, channel: string): Promise<void> {
        if (!this.db) return;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        await GuildData.updateOne({
            "guildID": guildID,
        }, {
            $set: { "commandChannel": channel }
        }, {
            upsert: true
        });
    }

    async updatePlayerSaves(userID: string, saves: number): Promise<void> {
        if (!this.db) return;
        await this.createUser(userID);
        const UserData = this.db.collection("UserData");
        await UserData.updateOne({
            "userID": userID,
        }, {
            $set: { "saves": saves, "lastSaved": new Date() }
        });
    }

    async setDelReminderShown(guildID: string, status: boolean): Promise<void> {
        if (!this.db) return;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        await GuildData.updateOne({
            "guildID": guildID,
        }, {
            $set: { "deletedMessageReminder": status }
        }, {
            upsert: true
        });
    }

    async setCourtesyChances(guildID: string, left: number): Promise<void> {
        if (!this.db) return;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        await GuildData.updateOne({
            "guildID": guildID,
        }, {
                $set: { "courtesyChances": left }
        }, {
            upsert: true
        });
    }

    async incrementPogStat(guildID: string): Promise<void> {
        if (!this.db) return;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        await GuildData.updateOne({
            "guildID": guildID,
        }, {
            $inc: { "pogNumStat": 1 }
        }, {
            upsert: true
        });
    }

    async incrementGuildPlayerStats(guildID: string, memberID: string, inerror = false, cnum = 0): Promise<void> {
        if (!this.db) return;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        
        const nstatsdef: GuildPlayer = {
            id: memberID,
            errors: 0,
            totalCounts: 0,
            highestNumber: 0
        }
        const guild = await GuildData.findOne({ "guildID": guildID });
        const playerIndex = guild.players.findIndex((x: GuildPlayer) => x.id && x.id === memberID)
        const player: GuildPlayer = guild.players[playerIndex] || nstatsdef;

        if (!inerror) player.totalCounts += 1;
        if (!inerror && cnum > player.highestNumber) player.highestNumber = cnum;
        if (inerror) player.errors += 1;

        if (!guild.players[playerIndex]) {
            guild.players.push(player);
        } else {
            guild.players[playerIndex] = player;
        }
        await GuildData.updateOne({
            "guildID": guildID,
        }, {
            $set: { "players": guild.players }
        }, {
            upsert: true
        });
    }

    async setAutoMuting(guildID: string, state: boolean): Promise<void> {
        if (!this.db) return;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        await GuildData.updateOne({
            "guildID": guildID,
        }, {
            $set: { "autoMute": state }
        }, {
            upsert: true
        });
    }

    async setMemberMute(guildID: string, memberID: string, until: Date): Promise<void> {
        if (!this.db) return;
        await this.maybeSetDefaults(guildID);
        const MuteData = this.db.collection("MuteSchedule");
        let mute = await MuteData.findOne({ "guildID": guildID, "memberID": memberID });

        if (!mute) {
            mute = {
                guildID,
                memberID,
                muteTime: until
            };
        } else {
            mute.muteTime = until;
        }

        await MuteData.updateOne({
            "guildID": guildID,
            "memberID": memberID
        }, {
            $set: mute
        }, {
            upsert: true
        });
    }

    async clearMemberMutes(guildID: string): Promise<void> {
        if (!this.db) return;
        await this.maybeSetDefaults(guildID);
        const MuteData = this.db.collection("MuteSchedule");
        await MuteData.deleteMany({ "guildID": guildID });
    }
    
    async unsetMemberMute(guildID: string, memberID: string): Promise<void> {
        if (!this.db) return;
        await this.maybeSetDefaults(guildID);
        const MuteData = this.db.collection("MuteSchedule");
        //const mute = await MuteData.findOne({ "guildID": guildID, "memberID": memberID });

        await MuteData.deleteOne({
            "guildID": guildID,
            "memberID": memberID
        });
    }

    async setRecordRole(guildID: string, role: string): Promise<void> {
        if (!this.db) return;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        await GuildData.updateOne({
            "guildID": guildID,
        }, {
            $set: { "recordRole": role }
        }, {
            upsert: true
        });
    }

    async setRecordHolder(guildID: string, id: string): Promise<void> {
        if (!this.db) return;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        await GuildData.updateOne({
            "guildID": guildID,
        }, {
            $set: { "recordHolder": id }
        }, {
            upsert: true
        });
    }

    async setFoulPrevention(guildID: string, state: boolean): Promise<void> {
        if (!this.db) return;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        await GuildData.updateOne({
            "guildID": guildID,
        }, {
            $set: { "foulPlayPrevention": state }
        }, {
            upsert: true
        });
    }

    async setPlayerCorrect(userID: string, num?: number, incrementing = false): Promise<void> {
        if (!this.db) return;
        await this.createUser(userID);
        const UserData = this.db.collection("UserData");
        if ((num || num === 0) && !incrementing) {
            await UserData.updateOne({
                "userID": userID,
            }, {
                $set: { "correctAccumulation": num }
            });
        } else {
            await UserData.updateOne({
                "userID": userID,
            }, {
                $inc: { "correctAccumulation": 1 }
            });
        }
    }

    /*┏━━━━━━━━━━┓
      ┃ DEFAULTS ┃
      ┗━━━━━━━━━━┛*/

    private async maybeSetDefaults(guildID: string): Promise<void> {
        if (!this.db || !guildID) return;
        const GuildData = this.db.collection("GuildData");
        /*const guildDefaults: guildObject = {// i'm not sure why i haven't done this yet, but at some point i should probably get rid of this and use the other guildDefaults var
            guildID: guildID,
            count: 0,
            increment: 1,
            chatAllowed: true,
            leaderboardEligible: 1,
            numberOfCounts: 0,
            recordNumber: 0,
            countChannel: "",
            numberOfErrors: 0,
            saves: 1,
            courtesyChances: 2,
            pogNumStat: 0,
            players: [],
            //lastSaved: new Date()
            //lastSaved: new Date()
            lastUpdatedID: "",
            lastMessageID: "",
            totalCount: 0,
            failRole: "",
            autoMute: false,
            recordRole: "",
            recordHolder: "",
            foulPlayPrevention: false
        }*/
        const guildDefaults: guildObject = Object.create(this.guildDefaults);
        const guild: guildObject = await GuildData.findOne({ "guildID": guildID }) || guildDefaults;
        if (!guild.guildID) guild.guildID = guildID;
        if (typeof guild.count !== "number") guild.count = 0;
        if (typeof guild.increment !== "number") guild.increment = 1;
        if (typeof guild.leaderboardEligible !== "number") guild.leaderboardEligible = 1;
        if (!guild.chatAllowed && guild.chatAllowed !== false) guild.chatAllowed = true;
        if (typeof guild.numberOfCounts !== "number") guild.numberOfCounts = 0;
        if (typeof guild.recordNumber !== "number") guild.recordNumber = 0;
        if (!guild.countChannel) guild.countChannel = "";
        if (typeof guild.numberOfErrors !== "number") guild.numberOfErrors = 0;
        if (typeof guild.saves !== "number") guild.saves = 1;
        if (typeof guild.courtesyChances !== "number") guild.courtesyChances = 2;
        if (typeof guild.pogNumStat !== "number") guild.pogNumStat = 0;
        if (!guild.players) guild.players = [];
        if (!guild.autoMute && guild.autoMute !== false) guild.autoMute = false;
        //if (!guild.lastSaved) guild.lastSaved = new Date();
        await GuildData.updateOne(
            { guildID },
            { $set: guild },
            { upsert: true }
        );
        return;
    }

    private async createUser(userID: string): Promise<void> {
        if (!this.db) return;
        const UserData = this.db.collection("UserData");
        const userDefaults: PlayerData = {
            userID: userID,
            saves: 1,
            counts: 0,
            errors: 0,
            highestNumber: 0,
            banned: false,
            correctAccumulation: 0
        }
        const user = await UserData.findOne({ "userID": userID }) || userDefaults;
        if (isNaN(user.saves)) user.saves = 1;
        if (isNaN(user.counts)) user.counts = 0;
        if (isNaN(user.errors)) user.errors = 0;
        if (isNaN(user.highestNumber)) user.highestNumber = 0;
        if (user.banned !== true && user.banned !== false) user.banned = false;
        if (isNaN(user.correctAccumulation)) user.correctAccumulation = 0;
        //if (!guild.lastSaved) guild.lastSaved = new Date();
        await UserData.updateOne(
            { "userID": userID },
            { $set: user },
            { upsert: true }
        );
        return;
    }
}

/*export class DatabaseBuilder {
    private readonly _username: string;
    private readonly _password: string;
    private readonly _database_name: string;
    private _db?: Db;

    constructor(un: string | undefined, pw: string | undefined, dn: string | undefined) {
        this._username = un || process.env.MONGO_INITDB_ROOT_USERNAME || "";
        this._password = pw || process.env.MONGO_INITDB_ROOT_PASSWORD || "";
        this._database_name = dn || process.env.MONGO_INITDB_DATABASE || "";
    }

    async handleDb(): Promise<this> {
        const username = this._username;
        const password = this._password;
        const database_name = this._database_name;

        const URL = `mongodb://${username}:${password}@mongo:27017/?authSource=admin`;
        const db = await MongoClient.connect(URL, {
            useNewUrlParser: true
        });

        xlg.log('Connected to database!');

        this._db = db.db(database_name);
        return this;
    }

    build(): Database {
        return new Database(this);
    }

    get db(): Db | undefined {
        return this._db;
    }
}*/