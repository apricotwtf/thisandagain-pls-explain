import { MongoClient } from "mongodb";

const Database = new MongoClient(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/thisandagain");
await Database.connect();

export default Database.db();