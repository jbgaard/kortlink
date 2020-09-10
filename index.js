
// Inkluder FS
const fs = require("fs");

// Inkluder Mysql
const mysql = require("mysql");

// Inkluder express
const express = require("express");
const app = express();

// Test express
app.get("/", function (req, res){

	res.send("KortlinkNode");
	console.log("Get modtaget!");

});

// Test express
app.get("/:kortlink", function (req, res){

	// Var til kortlink som er efterspurgt
	var kortlinkGet = req.params.kortlink;

	res.send(`KortlinkNode - Andet - ${kortlinkGet}`);
	console.log(`Get modtaget! - Andet - ${kortlinkGet}`);

});

app.listen(3001);