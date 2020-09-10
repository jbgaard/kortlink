
// Inkluder FS
const fs = require("fs");

// Inkluder Mysql
const mysql = require("mysql");

// Inkluder express
const express = require("express");
const app = express();


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

	res.send("KortlinkNode");
	console.log("Get modtaget!");

});

// Test express
app.get("/:kortlink", function (req, res){

	// Var til kortlink som er efterspurgt
	var kortlinkGet = req.params.kortlink;

	// Test MYSQL
	connection.query(`SELECT * FROM kortlink WHERE id="${{kortlinkGet}}"`, function (error, results, fields) {
	  if (error) throw error;
	  console.log(results[0]);

	  var sqlResult = results[0];

	});

	connection.end();

	res.send(`KortlinkNode - Andet - ${sqlResult}`);
	console.log(`Get modtaget! - Andet - ${kortlinkGet}`);

});

app.listen(3001);