// Quick DB check — what does the password field look like?
const MONGO = process.env.DATABASE_URL || process.env.MONGODB_CONNECTION_STRING;

import mongoose from "mongoose";

mongoose.connect(MONGO, { dbName: "surgeshop" }).then(async () => {
    const clients = await mongoose.connection.db.collection("clients").find({}).toArray();
    clients.forEach(c => {
        const pwd = c.password;
        const type = pwd === null ? "null" : pwd === "" ? "empty string" : pwd === undefined ? "undefined" : `hash (${pwd.substring(0, 15)}...)`;
        console.log(`${c.email} | password: ${type}`);
    });
    process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
