const express = require('express');
var ioMaster = require("socket.io-client");
const fs = require('fs')
fs.openSync("systemLogs.log", 'w+')

var socketMaster = ioMaster.connect("https://master-os.herokuapp.com/", {
  reconnection: true,
});
socketMaster.on("out-file",(masterLog)=>{
    let logFileString;
    let logArray = [];
    try {
        logFileString = fs.readFileSync('./systemLogs.log', 'utf8');
        logArray = JSON.parse(logFileString);
    } catch (err) {
        console.log("output file not yet intialized")
    }
    logArray = logArray.concat(masterLog);
    logArray.sort(function(a, b) {
        return a.timeStamp - b.timeStamp;
    });
    var ArrFormated = JSON.stringify(logArray,null,2)
    fs.writeFile('systemLogs.log', ArrFormated, err => {
        if (err) {
        console.error(err)
        return
        }
    })
})