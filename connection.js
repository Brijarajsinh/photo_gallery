//requiring mongoose for connect with db
const mongoose = require("mongoose");

//requiring env variable to get connection string stored in env variable
require('custom-env').env();

module.exports = (async () => {
    try {
        //Use environment variable of databaseConnection which stores string for db connection
        await mongoose.connect(process.env.databaseConnection);
        //Simply prints connection successful message in console
        console.log("Connected Successfully with database...");
    }
    catch (error) {
        //If error generate while connecting to database than error will throw and catch block will be executes
        console.log("Connection Failed", error);
    }
});