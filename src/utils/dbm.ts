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
        const GuildData = this.db.collection("GuildData");
        const result = await GuildData.findOne({ "guildID": guildID }) || { count: 0 };
        return result;
    }

    async getIncrement(guildID: string | undefined): Promise<guildObject | false> {
        if (!guildID || !this.db) return false;
        const GuildData = this.db.collection("GuildData");
        const result = await GuildData.findOne({ "guildID": guildID }) || { increment: 1 };
        return result;
    }
    
    async getChannel(guildID: string | undefined): Promise<guildObject | false> {
        if (!guildID || !this.db) return false;
        const GuildData = this.db.collection("GuildData");
        const result = await GuildData.findOne({ "guildID": guildID }) || { countChannel: "" };
        return result;
    }
    
    async getLastUpdater(guildID: string | undefined): Promise<guildObject | false> {
        if (!guildID || !this.db) return false;
        const GuildData = this.db.collection("GuildData");
        const result = await GuildData.findOne({ "guildID": guildID }) || { lastUpdatedID: "" };
        return result;
    }
    
    async getChatAllowed(guildID: string | undefined): Promise<guildObject | false> {
        if (!guildID || !this.db) return false;
        const GuildData = this.db.collection("GuildData");
        const result = await GuildData.findOne({ "guildID": guildID }) || { chatAllowed: false };
        return result;
    }
    
    async updateCount(guildID: string, value: number): Promise<void> {
        if (!this.db) return;
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
        if (!guildID || !this.db) return;
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
        if (!this.db) return;
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
        const GuildData = this.db.collection("GuildData");
        await GuildData.updateOne({
            "guildID": guildID,
        }, {
            $set: { "chatAllowed": state }
        }, {
            upsert: true
        });
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