import { Db, MongoClient } from 'mongodb';
import { guildObject } from '../typings';
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
    
    async getCount(guildID: string | undefined): Promise<guildObject | false> {
        if (!guildID || !this.db) return false;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        const result = await GuildData.findOne({ "guildID": guildID }) || { count: 0 };
        return result;
    }

    async getIncrement(guildID: string | undefined): Promise<guildObject | false> {
        if (!guildID || !this.db) return false;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        const result = await GuildData.findOne({ "guildID": guildID }) || { increment: 1 };
        if (!result.increment) {
            await this.setIncrement(guildID, 1);
        }
        return result;
    }
    
    async getChannel(guildID: string | undefined): Promise<guildObject | false> {
        if (!guildID || !this.db) return false;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        const result = await GuildData.findOne({ "guildID": guildID }) || { countChannel: "" };
        return result;
    }
    
    async getLastUpdater(guildID: string | undefined): Promise<guildObject | false> {
        if (!guildID || !this.db) return false;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        const result = await GuildData.findOne({ "guildID": guildID }) || { lastUpdatedID: "" };
        return result;
    }
    
    async getChatAllowed(guildID: string | undefined): Promise<guildObject | false> {
        if (!guildID || !this.db) return false;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        const result = await GuildData.findOne({ "guildID": guildID }) || { chatAllowed: false };
        return result;
    }
    
    async getStats(guildID: string | undefined): Promise<guildObject | false> {
        if (!guildID || !this.db) return false;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        const result = await GuildData.findOne({ "guildID": guildID }) || { recordNumber: 0, numberOfCounts: 0, leaderboardEligible: 1, totalCount: 0, numberOfErrors: 0, count: 0 };
        if (!result.recordNumber && result.recordNumber !== 0) result.recordNumber = 0;
        if (!result.numberOfCounts && result.numberOfCounts !== 0) result.numberOfCounts = 0;
        if (!result.leaderboardEligible && result.leaderboardEligible !== 0) result.leaderboardEligible = 1;
        if (!result.totalCount && result.totalCount !== 0) result.totalCount = 0;
        if (!result.numberOfErrors) result.numberOfErrors = 0;
        if (!result.count) result.count = 0;
        return result;
    }
    
    async getGuildsLeaderboard(guildID: string | undefined): Promise<Array<guildObject> | false> {
        if (!guildID || !this.db) return false;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        const result = await GuildData.find({ "leaderboardEligible": 1 }, { sort: { "count": -1 }, limit: 15 });
        return result.toArray();
    }

    async getSaves(guildID: string | undefined): Promise<number | false> {
        if (!guildID || !this.db) return false;
        await this.maybeSetDefaults(guildID);
        const GuildData = this.db.collection("GuildData");
        const result = await GuildData.findOne({ "guildID": guildID });
        let saves;
        if (isNaN(result.saves) || result.saves < 0) {
            saves = 0;
        } else {
            saves = result.saves;
        }
        if (!result.lastSaved) return saves;
        const yesterday = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));
        //const yesterday = new Date(new Date().getTime() - (10000));
        if (yesterday >= result.lastSaved.getTime() && saves < 3) {
            await this.updateSaves(guildID, saves + 1)
            return await this.getSaves(guildID);
        }
        return saves;
    }
    
    async updateCount(guildID: string, value: number): Promise<void> {
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
            $set: { "count": value },
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

    private async maybeSetDefaults(guildID: string): Promise<void> {
        if (!this.db) return;
        const GuildData = this.db.collection("GuildData");
        const guildDefaults: guildObject = {
            guildID: guildID,
            count: 0,
            increment: 1,
            chatAllowed: true,
            leaderboardEligible: 1,
            numberOfCounts: 0,
            recordNumber: 0,
            countChannel: "",
            numberOfErrors: 0,
            saves: 1
        }
        const guild = await GuildData.findOne({ "guildID": guildID }) || guildDefaults;
        if (isNaN(guild.count)) guild.count = 0;
        if (isNaN(guild.increment)) guild.increment = 1;
        if (!guild.chatAllowed && guild.chatAllowed !== false) guild.chatAllowed = true;
        if (isNaN(guild.numberOfCounts)) guild.numberOfCounts = 0;
        if (isNaN(guild.recordNumber)) guild.recordNumber = 0;
        if (!guild.countChannel) guild.countChannel = "";
        if (isNaN(guild.numberOfErrors)) guild.numberOfErrors = 0;
        if (isNaN(guild.saves)) guild.saves = 1;
        await GuildData.updateOne(
            { guildID: guildID },
            { $set: guild },
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