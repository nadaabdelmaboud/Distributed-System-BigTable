const express = require('express');
var ioMaster = require("socket.io-client");
const fs = require('fs')
const util = require('util')
fs.openSync("systemLogs.log", 'w+')
const Mutex = require('async-mutex').Mutex;
const mutex = new Mutex();

var socketMaster = ioMaster.connect("http://localhost:3000/", {
  reconnection: true,
});

const readFile = util.promisify(fs.readFile);
function getFile() {
    return readFile('systemLogs.log', 'utf8');
  }

  const writeFile = util.promisify(fs.writeFile);
  function outFile(ArrFormated) {
      return writeFile('systemLogs.log', ArrFormated);
    }
    
    
socketMaster.on("out-file",async (masterLog)=>{
    const release = await mutex.acquire();
    try{
    let logFileString;
    let logArray = [];
    try {
        logFileString = await getFile();
        logArray = JSON.parse(logFileString);
    } catch (err) {
        console.log("output file not yet intialized")
    }
    logArray = logArray.concat(masterLog);

    for(let i=0;i<logArray.length;i++){
        for(let j=i+1;j<logArray.length;j++){
            if(logArray[i].timeStamp>logArray[j].timeStamp){
                let tmp = logArray[i];
                logArray[i]=logArray[j];
                logArray[j]=tmp;
            }
        }
    }
    var ArrFormated = JSON.stringify(logArray,null,2)
    await outFile(ArrFormated);

}finally{
    release();
}
})