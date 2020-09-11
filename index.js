
// Inkluder FS (Fil system)
const fs = require("fs");

// Inkluder Mysql
const mysql = require("mysql");

// Inkluder express
const express = require("express");
const app = express();

// Sæt viewengine til Pug
app.set("view engine", "pug");


// Mysql Connection info
var connection = mysql.createConnection({
  host     : '188.114.165.148',
  user     : 'jonas',
  password : 'mBuaj28181',
  database : 'kortlinkdb'
});


// Make connection to Mysql DB
connection.connect();

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
	res.render('index', { data: data })

});

// Test express
app.get("/:kortlink", function (req, res){

	// Var til kortlink som er efterspurgt
	var kortlinkGet = req.params.kortlink;

	// Test MYSQL
	connection.query(`SELECT * FROM kortlink WHERE kortlink="${kortlinkGet}"`, function (error, results, fields) {
	  if (error) throw error;
	  
	  //  Tjek om der er resultater
	  if (results != "") {
	  	console.log(results[0]);

	  	// Opret variabler til modtaget data.
		var sqlResultID = results[0]["id"];
		var sqlResultLink = results[0]["link"];
		var sqlResultKortlink = results[0]["kortlink"];

		// res.send(`KortlinkNode - Andet - ${sqlResultLink}`);

		// Tjek om string indeholder HTTP eller HTTPS ved hjælp af denne funktion
		if (sqlResultLink.substring(0, 7) !== 'http://' && sqlResultLink.substring(0, 8) !== 'https://' && sqlResultLink.substring(0, 4) !== 'www.') {
		    
		    // Tilføj HTTP hvis ingen af disse er til stede.
		    redirectURL = 'http://' + sqlResultLink;

		}else{

			// Hvis denne allerede indeholder en af disse.
			redirectURL = sqlResultLink;
		}

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

	  }else {

	  	console.log("Kunne ikke finde noget");
	  	res.send("Kunne ikke finde noget");

	  }

	});

	console.log(`Get modtaget! - Andet - ${kortlinkGet}`);

});

app.listen(3001);