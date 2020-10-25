const MongoClient = require('mongodb').MongoClient
//const { Db } = require('mongodb')
const xlg = require('../xlogger')

module.exports = {
    createDatabase: async (UID = null, PASS = null, DB_NAME = null) => {
        try {
            const username = UID || process.env.MONGO_INITDB_ROOT_USERNAME
            const password = PASS || process.env.MONGO_INITDB_ROOT_PASSWORD
            const database_name = DB_NAME || process.env.MONGO_INITDB_DATABASE

            const URL = `mongodb://${username}:${password}@mongo:27017/?authSource=admin`
            const db = await MongoClient.connect(URL, {
                useUnifiedTopology: true,
                useNewUrlParser: true
            })

            xlg.log('Connected to database!')

            return db.db(database_name)
        } catch (err) {
            xlg.error(err)
        }
    }
}