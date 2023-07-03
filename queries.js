const Pool = require('pg').Pool;
const dotenv = require('dotenv').config();
const bcrypt = require("bcrypt");
const pool = new Pool({
    user: `${process.env.PGUSER}`,
    host: `${process.env.PGHOST}`,
    database: `${process.env.PGDATABASE}`,
    password: `${process.env.PGPASSWORD}`,
    port: `${process.env.PGPORT}`,
    ssl: true,
    query_timeout: 10000,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
}); 
const saltRounds = 10;


const test = (req, res) => {
    res.status(200).send("TEST SUCCESS");
}

const updateTicket = (req, res) => {
    //expected json: {"value": "Open"/"Closed", if open, "User": {"userName": "name", "contact": "###", "age": 123}}
    //update ticket status 
    if(String(req.body.value).toLocaleLowerCase().localeCompare("opened") === 0) {
        pool.query("UPDATE ticket SET userId=NULL where seat=$1", [req.params.ticketno], (error, response) => {
            if(error) {
                throw error;
            }
            res.status(200).send(`Closed ticket #${req.params.ticketno}`);
        });
    } else if (String(req.body.value).toLocaleLowerCase().localeCompare("closed") === 0) {
        pool.connect((err, client2, done)  => {
            if(err) {
                throw err;
            } else {
                try{
                    client2.query('BEGIN', (err,results) => {
                        if(err) throw err;
                        client2.query("select nextval('seq_user_index') as userid", (err, results) => {
                            if(err) throw err;
                            insertUserText = 'INSERT INTO users(userid, username, contact, age) VALUES($1, $2, $3, $4) RETURNING userid';
                            client2.query(insertUserText, 
                                [results.rows[0].userid, req.body.user.userName, req.body.user.contact, req.body.user.age], (err, results) => {
                                    if(err) throw err;
                                    const insertTicketText = "UPDATE ticket SET userid=$1 where seat=$2";
                                    const insertTicketValues = [results.rows[0].userid, req.params.ticketno];
                                    client2.query(insertTicketText, insertTicketValues, (err, results) => {
                                        if(err) throw err;
                                        client2.query('COMMIT', (err, results) => {
                                            if(err) throw err;
                                            res.status(200).send("Updated")
                                        });
                                    });
                            });
                        });
                    });
                } catch (ex) {
                    client2.query('ROLLBACK');
                    res.status(500).send("Failed to update ticket details.")
                } finally {
                    client2.release();
                }
            }

        });
    } else {
        res.status(400).send("Invalid value (Use opened/closed)")
    }
}

const getTicketStatus = (req, res) => {
    pool.query("select userid from ticket where seat = $1", [req.params.ticketno], (error, results) => {
        if(error) {
            throw error;
        }
        res.status(200).send(results.rows[0].userid == null ? "Open": "Closed");
    })
    //return status of ticket number req.params.ticketno
}

const getClosedTickets = (req, res) => {
    pool.query("select seat from ticket where userid IS NOT NULL", (error, results) => {
        if(error) {
            throw error;
        }
        res.status(200).send(results.rows.flatMap(t => t.seat));
    })
    //return list of numbers which correspond to closed tickets
}

const getOpenTickets = (req, res) => {
    pool.query("select seat from ticket where userid IS NULL", (error, results) => {
        if(error) {
            throw error;
        }
        res.status(200).send(results.rows.flatMap(t => t.seat));
    })

    //return list of numbers which correspond to open tickets
}

const getDetails = (req, res) =>{
    pool.query("select b.userid as userid, b.username as username, b.contact as contact, b.age as age " + 
    "from ticket a inner join users b on b.userid = a.userid where a.seat = $1", [req.params.ticketno], (error, results) => {
        if(error) {
            throw error;
        }
        if(results.rows.length != 0) {
            res.status(200).send({"userId": results.rows[0].userid, "userName": results.rows[0].username, "contact": results.rows[0].contact, "age": results.rows[0].age});
        } else {
            res.status(404).send("Ticket is open");
        }
    });
    //get user details of a user
}

const reset = (req, res) => {
    //first check isadmin
    pool.query("select passhash from apiusers where apiuser=$1 and admin=$2", [req.headers.user,"y"], (error, results) => {
        if(error) {
            throw error;
        }
        if(results.rows.length !=0 && results.rows[0] != null) {
            //check pass
            bcrypt.compare(req.headers.authorization, results.rows[0].passhash, (err, result) => {
                if(err) {
                    throw error;
                }
                if(result == true) {
                    pool.query("update ticket set userid=NULL", (error, results) => {
                        if(error) {
                            throw error;
                        }
                        res.status(200).send("All tickets opened");
                    });
                } else {
                    res.status(403).send("Invalid Authorization");
                }
            })
        } else {
            res.status(401).send("Admin user does not exist.");
        }
    });
    //use req.header    //expect username(user) and password(authorization) in headers, admin is admin user with password morpheus, any other user is non admin user. (user1 => password)
    
}

const addUser = (req, res) => {
    //{"username": "name", "password": "password", "isAdmin": "Y/N"}
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        if(err) {
            throw err;
        }
        pool.query("insert into apiusers(apiuser,passhash, admin) values ($1::text, $2::text, $3::text)", 
                    [req.body.username, hash, String(req.body.isAdmin).toLocaleLowerCase()], (error, response) => {
                        if(error) {
                            if(String(error.code).localeCompare('23505') === 0) {
                                res.status(400).send("User already exists");
                            } else {
                                throw error;
                            }
                        } else {
                            res.status(201).send("User created");
                        }
                    })
    })
}



module.exports = {
    test, updateTicket, getTicketStatus, getClosedTickets, getOpenTickets, getDetails, reset, addUser
}