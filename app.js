//export NODE_TLS_REJECT_UNAUTHORIZED='0'
const express = require("express");
const db = require('./queries');



const app = express();
const port = 3000;




app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/test", db.test);


app.post("/ticketing/:ticketno/updateTicket", db.updateTicket);

app.get("/ticketing/:ticketno/getTicketStatus", db.getTicketStatus);

app.get("/ticketing/getClosedTickets", db.getClosedTickets);

app.get("/ticketing/getOpenTickets", db.getOpenTickets);

app.get("/ticketing/:ticketno/getDetails", db.getDetails);

app.get("/ticketing/reset" , db.reset);

app.put("/ticketing/addUser", db.addUser);

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
});