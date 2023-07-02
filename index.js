//export NODE_TLS_REJECT_UNAUTHORIZED='0'
const express = require("express");
const { Client } = require("pg")
const env = require("dotenv").config()

const app = express();
const port = 3000;

const client = new Client({
    user: `${process.env.DB_USER}`,
    host: `${process.env.DB_HOST}`,
    database: `${process.env.DB_NAME}`,
    password: `${process.env.DB_PASSWORD}`,
    port: `${process.env.DB_PORT}`,
    ssl: true
})
client.connect(function(err) {
    if (err) throw err;
    console.log("Connected");
});