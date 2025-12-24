import dotenv from "dotenv";

dotenv.config({
    path : './.env',
});

let myusername = process.env.user;
console.log("user : " + myusername);

let mydatabase = process.env.database;
console.log("database : " , mydatabase);



console.log("Start of the Backend project")