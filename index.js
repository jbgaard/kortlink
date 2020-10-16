
// Inkluder FS (Fil system)
const fs = require("fs");

// Inkluder Mysql
const mysql = require("mysql");

// Inkluder express
const express = require("express");
const app = express();

// EJS viewengine
const ejs = require('ejs');

// Sæt viewengine til Pug
// app.set('views', __dirname + '/views');
app.set("view engine", "ejs");


// Mysql Connection info
/*var connection = mysql.createConnection({
  host     : '188.114.165.148',
  user     : 'jonas',
  password : 'mBuaj28181',
  database : 'kortlinkdb'
});*/

var dbConfig = {
	host     : '188.114.165.148',
	user     : 'jonas',
	password : 'mBuaj28181',
	database : 'kortlinkdb'
}

var connection;

function handleDisconnect() {
  connection = mysql.createConnection(dbConfig); // Recreate the connection, since
                                                  // the old one cannot be reused.

  connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

handleDisconnect();

// Tilføj http/https til link
function checkLink(link) {
	if (link.substring(0, 7) !== 'http://' && link.substring(0, 8) !== 'https://' && link.substring(0, 4) !== 'www.') {

		// Tilføj HTTP hvis ingen af disse er til stede.
		redirectURL = 'http://' + link;
		return redirectURL;

	}else{

		// Hvis denne allerede indeholder en af disse.
		redirectURL = link;
		return redirectURL;
	}
}


// Make connection to Mysql DB
// connection.connect();

app.get("/disconnect", (req, res) => {

	// Tjek om mysql er forbundet
	if (connection.state === "disconnected") {

		// Forbindelsen er allerede blevet terminated.
		res.send("Connection already terminated");

	}else {

		// Disconeect
		connection.end();
		res.send("Mysql, disconnected");
	}

});

// Bootstrap css
app.get("/bootstrap.css", (req, res) => {

	console.log("Downloader bootstrap.css");
	res.download(`${__dirname}/node_modules/bootstrap/dist/css/bootstrap.css`);

})

// Test express
app.get("/", function (req, res){


	// Tjek om filen historik.json er oprettet, ellers opret den
	if (!(fs.existsSync("./historik.json"))) {
		fs.writeFileSync("./historik.json", "{}");
	}

	// Indlæs histok.json som raw data
	var historikJSONRAW = fs.readFileSync("./historik.json");

	// Omdan til JSON objekt
	var historikJSON = JSON.parse(historikJSONRAW);

	// Tjek om counter & historik er oprettet, ellers opret dem.
	if (!("counter" in historikJSON)) {
		historikJSON["counter"] = 0;
	}
	if (!("historik" in historikJSON)) {
		historikJSON["historik"] = [];
	}

	// Omdan til string igen og skriv til filen igen.
	var historikJSON_STRHistorik = JSON.stringify(historikJSON["historik"], null, 4);

	console.log("Get modtaget!");

	// Opret data varieble
	let data = {};
	data["counter"] = historikJSON["counter"];
	data["historik"] = historikJSON["historik"];
	data["historikString"] = historikJSON_STRHistorik;

	// Brug index fra viewengine mappen
	res.render('pages/index', { data: data });

});

// Test express
app.get("/:kortlink", function (req, res){

	// Make connection to DB
	// connection.connect();

	// Var til kortlink som er efterspurgt
	var kortlinkGet = req.params.kortlink;

	// Mysql
	connection.query(`SELECT * FROM kortlink WHERE kortlink="${kortlinkGet}"`, function (error, results, fields) {
	  if (error) throw error;

	  //  Tjek om der er resultater
	  if (results != "") {
	  	console.log(results[0]);

	  	// Opret variabler til modtaget data.
		var sqlResultID = results[0]["id"];
		var sqlResultLink = results[0]["link"];
		var sqlResultKortlink = results[0]["kortlink"];

		// Tjek om string indeholder HTTP eller HTTPS ved hjælp af denne funktion
		redirectURL = checkLink(sqlResultLink);

		// Indsæt i results så de bliver gemt korrekt i historik.json
		results[0]["link"] = redirectURL;

		// Tjek om filen historik.json er oprettet, ellers opret den
		if (!(fs.existsSync("./historik.json"))) {
			fs.writeFileSync("./historik.json", "{}");
		}

		// Indlæs histok.json som raw data
		var historikJSONRAW = fs.readFileSync("./historik.json");

		// Omdan til JSON objekt
		var historikJSON = JSON.parse(historikJSONRAW);

		// Tjek om counter & historik er oprettet, ellers opret dem.
		if (!("counter" in historikJSON)) {
			historikJSON["counter"] = 0;
		}
		if (!("historik" in historikJSON)) {
			historikJSON["historik"] = [];
		}

		// Tilføj 1 til counteren.
		historikJSON["counter"] += 1;

		// Tilføj resultat fra mysql søgning til historik.json
		historikJSON["historik"].push(results);

		// Omdan til string igen og skriv til filen igen.
		var historikJSON_STR = JSON.stringify(historikJSON, null, 4);

		// Skriv til filen igen
		fs.writeFileSync("./historik.json", historikJSON_STR);

		// Console log
		console.log(`Redirect til denne: ${redirectURL}`)

		// Redirect brugeren til dette site.
		res.redirect(redirectURL);

		// Afslut mysql forbindelse
		// connection.end();

		// res.end();

	  }else {

	  	console.log("Kunne ikke finde noget");
	  	res.send("Kunne ikke finde noget");

		// Afslut mysql forbindelse
		// connection.end();

		// res.end();

	  }

	});

	console.log(`Get modtaget! - Andet - ${kortlinkGet}`);

	// Afslut mysql forbindelse
	// connection.end();

});

app.get("*", (req, res) => {

	res.send("404 Fejl, kunne ikke finde den ønskede side");

});

console.log("App started on port 3001");

app.listen(3001);
