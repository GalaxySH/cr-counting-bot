import { Db, MongoClient } from 'mongodb';
import { guildObject } from '../typings';
import xlg from '../xlogger';

/**
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

let database: Db;
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
handleDb();

export class Database {
    db: Db;
    constructor() {
        this.db = database;
    }
    
    async getCount(guildID: string | undefined): Promise<guildObject | false> {
        if (!guildID) return false;
        const GuildData = this.db.collection("GuildData");
        const result = await GuildData.findOne({ "guildID": guildID }) || { count: 0 };
        return result;
    }

    async getIncrement(guildID: string | undefined): Promise<guildObject | false> {
        if (!guildID) return false;
        const GuildData = this.db.collection("GuildData");
        const result = await GuildData.findOne({ "guildID": guildID }) || { increment: 1 };
        return result;
    }
    
    async getChannel(guildID: string | undefined): Promise<guildObject | false> {
        if (!guildID) return false;
        const GuildData = this.db.collection("GuildData");
        const result = await GuildData.findOne({ "guildID": guildID }) || { countChannel: "" };
        return result;
    }
    
    async getLastUpdater(guildID: string | undefined): Promise<guildObject | false> {
        if (!guildID) return false;
        const GuildData = this.db.collection("GuildData");
        const result = await GuildData.findOne({ "guildID": guildID }) || { lastUpdatedID: "" };
        return result;
    }
    
    async updateCount(guildID: string, value: number): Promise<void> {
        const GuildData = this.db.collection("GuildData");
        await GuildData.updateOne({
            "guildID": guildID,
        }, {
            $set: { "count": value }
        }, {
            upsert: true
        });
    }
    
    async setIncrement(guildID: string | undefined, value: number): Promise<void> {
        if (!guildID) return;
        const GuildData = this.db.collection("GuildData");
        await GuildData.updateOne({
            "guildID": guildID,
        }, {
            $set: { "increment": value }
        }, {
            upsert: true
        });
    }

    async setChannel(guildID: string, channel: string): Promise<void> {
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
        const GuildData = this.db.collection("GuildData");
        await GuildData.updateOne({
            "guildID": guildID,
        }, {
            $set: { "lastUpdatedID": id }
        }, {
            upsert: true
        });
    }
}