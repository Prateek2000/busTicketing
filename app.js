//export NODE_TLS_REJECT_UNAUTHORIZED='0'
const initDB = require("init");
const express = require("express");
const { Client, Pool } = require("pg");
const env = require("dotenv").config();
const bcrypt = require("bcrypt");

const saltRounds = 10;

const app = express();
const port = 3000;

const client = new Client({
    user: `${process.env.PGUSER}`,
    host: `${process.env.PGHOST}`,
    database: `${process.env.PGDATABASE}`,
    password: `${process.env.PGPASSWORD}`,
    port: `${process.env.PGPORT}`,
    ssl: true,
    query_timeout: 5000
});
client.connect(function(err) {
    if (err) throw err;
    console.log("Connected");
});
const pool = new Pool();


app.use(express.json);
app.use(express.urlencoded({ extended: true }));

app.post("/ticketing/updateTicket", (req, res) => {
    //expected json: {"ticketNo": 1-40, "value": "Open"/"Closed", if open, "User": {"userName": "name", "contact": "###", "age": 123}}
    //update ticket status 
    if(String(req.body.value).toLocaleLowerCase.localeCompare("closed")) {
        client.query("UPDATE ticket SET userId=NULL where seat=?", [req.body.ticketNo]);
    } else if (String(req.body.value).toLocaleLowerCase.localeCompare("open")) {
        const client2 = pool.connect();

        try {
            client.query('BEGIN');
            userid = client.query("select nextval('seq_user_index')");
            insertUserText = 'INSERT INTO users(userid, username, contact, age) VALUES($1, $2, $3, $4) RETURNING userid';
            const res = client.query(insertUserText, [req.body.userid]);
            const insertTicketText = "INSERT into ticket(seat, userid) values ($1, $2)";
           
            const insertTicketValues = [req.body.ticketNo, res.row[0].userid];
            client.query(insertTicketText, insertTicketValues);
            client.query('COMMIT');
            res.statusCode = 200;
            res.body = {message: "Updated"};
            return res;
          } catch (e) {
            client.query('ROLLBACK');
            res.statusCode = 500;
            res.body = {message: "Update ticket details failed"};
            return res;
          } finally {
            client.release();
          }
    }    
});

app.get("/ticketing/:ticketno/getTicketStatus", (req, res) => {
    //return status of ticket number req.params.ticketno
    return client.query("select userid from ticket where seat = $1", [req.params.ticketno]).row[0].userid == NULL ? "Closed": "Open"; 
});

app.get("/ticketing/getClosedTickets", (req, res) => {
    return client.query("select seat from ticket where userid != NULL");
    //return list of numbers which correspond to closed tickets
});

app.get("/ticketing/getOpenTickets", (req, res) => {
    return client.query("select seat from ticket where userid = NULL");
    //return list of numbers which correspond to open tickets
});

app.get("/ticketing/:ticketno/getDetails", (req, res) =>{
    //get user details of a user
});

app.get("/ticketing/reset" , (req, res) => {
    //use req.header    //expect username and password in headers, admin is admin user with password morpheus, any other user is non admin user. (user1 => password)

});
app.put("/ticketing/addUser", (req, res) => {
    //{"username": "name", "password": "password", "isadmin": "Y/N"}
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        client.query("insert into apiusers values ($1::text, $2, $3)", [req.body.username, hash, req.body.isadmin]);
    })
});

//req.query.id
