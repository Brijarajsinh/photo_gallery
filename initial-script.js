//requiring env file to use env variables
require('custom-env').env();

//require connection file to connect with database
require('./connection')();

//require general function to convert password in hex code
const commonFunction = require('./helpers/function');


//requiring user schema for checking and entry of admin
const userModel = require('./schema/userSchema');

//requiring settings modal to set general settings
const settingModel = require('./schema/generalSettings');

//create client of mongo
const MongoClient = require('mongodb').MongoClient;

//create database connection uri for admin db
const adminDBUrl = `mongodb://${process.env.ROOT_USER}:${process.env.ROOT_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.ROOT_DB}`;
try {
    (async () => {
        //if admin database connected successfully than checks user of application's database is created or not
        const adminClient = await MongoClient.connect(adminDBUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        const centralDbConnUrl = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB}`;
        //if database's user is exists than logs message
        try {
            await MongoClient.connect(centralDbConnUrl, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log(`${process.env.DB} is Central DB and its user is already exists`);
        }
        //else creates database user and simply logs the message
        catch (err) {
            console.log(`${process.env.DB} is Central DB and its user not found, creating`);
            // Add the new user to the admin database
            const db = adminClient.db(process.env.DB);
            await db.command({
                createUser: process.env.DB_USER,
                pwd: process.env.DB_PASSWORD,
                roles: ["readWrite", "dbAdmin"],
                digestPassword: true
            });
            console.log(`${process.env.DB} is Central DB and its user created successfully`);
        }

        //checks if admin role is exists in users collection

        //if exists than simply logs success message
        const admin = await userModel.findOne({
            'role': 'admin'
        });
        if (admin) {
            console.log("Admin user is already exists");
        }
        //else create an admin for application
        else {
            console.log("Admin user is not created yet");
            //creating admin object which describes the role of admin user of application
            const admin = await new userModel({
                "role": "admin",
                "fname": "Brijarajsinh",
                "lname": "Mahida",
                "email": "mahidaroyal123@gmail.com",
                "gender": "male",
                "password": commonFunction.generatePasswordHash('Brij@123'),
                "phone": "9104881178"
            });
            //stores admin details in users collection
            await admin.save();
            console.log("Admin user created successfully");
        }
        const settings = await commonFunction.applySettings();
        await settingModel.updateOne({}, { $set: settings }, { upsert: true });
        console.log("General Settings are applied successfully");
        process.exit(0);
    })();
}
//if error generated to connect admin database than handles this catch block
catch (err) {
    //if admin database not connected than logs this
    console.log('==============>Error while connect admin db<================');
    console.log(err.toString());
}