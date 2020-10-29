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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
;
//const { Db } = require('mongodb');
const xlogger_1 = __importDefault(require("../xlogger"));
module.exports = {
    createDatabase: (UID = null, PASS = null, DB_NAME = null) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const username = UID || process.env.MONGO_INITDB_ROOT_USERNAME;
            const password = PASS || process.env.MONGO_INITDB_ROOT_PASSWORD;
            const database_name = DB_NAME || process.env.MONGO_INITDB_DATABASE;
            const URL = `mongodb://${username}:${password}@mongo:27017/?authSource=admin`;
            const db = yield mongodb_1.MongoClient.connect(URL);
            xlogger_1.default.log('Connected to database!');
            return db.db(database_name);
        }
        catch (err) {
            xlogger_1.default.error(err);
        }
    })
};
