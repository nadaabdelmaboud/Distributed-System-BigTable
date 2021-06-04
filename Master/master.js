const express = require('express');
const mongoose = require('mongoose');
const dbs = require('./config');
const masterConnection  = mongoose.createConnection(dbs.master,{ useUnifiedTopology: true ,useNewUrlParser: true});
const MetaData = require('./metaData');
const tablet = require('./tablet-instance')
const Mutex = require('async-mutex').Mutex;
const mutex = new Mutex();

const fs = require('fs')
let masterLog = []
const io = require("socket.io")(3000);

masterLog.push({
    message: "Master started...",
    timeStamp: Date.now(),
  });
setInterval(()=>{
    if(masterLog.length == 0) return;
    let logFileString;
    let logArray = [];
    try {
        logFileString = fs.readFileSync('./systemLogs.log', 'utf8');
        logArray = JSON.parse(logFileString);
    } catch (err) {
        console.log("output file not created yet",err)
    }
    logArray = logArray.concat(masterLog);
    masterLog=[]
    fs.writeFile('systemLogs.log', JSON.stringify(logArray), err => {
        if (err) {
        console.error(err)
        return
        }
    })
},3000)
masterConnection.once('open',async function(){

    if(await MetaData.checkMetaDataEmpty(masterConnection)){
        await MetaData.insertNewMetaData(masterConnection);
    }
    if(await MetaData.checkDataEmpty(masterConnection)){
            await MasterData.balanceData();
            await io.sockets.emit('GetMetaData',await MetaData.getMetaData(masterConnection));
        }
  
    
})



const MasterData={
   
    async checkBalance(){
        const metadata = await MetaData.getMetaData(masterConnection);
        const docs1 = metadata.tablet1Documents;
        const docs2 = metadata.tablet2Documents;
        const docs3 = metadata.tablet3Documents;
        const threshold = 1;
        if(
            (
                (docs1-docs2>=threshold)
                ||
                (docs2-docs1>=threshold)
            )
            ||
            (
                (docs1-docs3>=threshold)
                ||
                (docs3-docs1>=threshold)
            )
            ||
            (
                (docs3-docs2>=threshold)
                ||
                (docs2-docs3>=threshold)
            )
        )
        return true;

        return false;

    },
    async balanceData(){
        //drop 3 databases
        const checkedBalance = await MasterData.checkBalance();
        if(!checkedBalance){
            return;
        }
        else{
            await io.sockets.emit("Balance");
        }
        //await new Promise((resolve) => setTimeout(resolve, 10000));
        const release = await mutex.acquire();
        try {
        const BigTableCollection = (await masterConnection).collection("BigTable");
        let totalMasterDocuments = await BigTableCollection.countDocuments({});
        let documentsTablet=parseInt(totalMasterDocuments/3);
        documentsTablet1 = await BigTableCollection.find({}).skip(0).limit(documentsTablet).toArray().then(data=>{
             return data;
         });
        await tablet.connect(dbs.tablet1,1);
        await tablet.drop(1);

        await tablet.loadData(documentsTablet1,1);
        documentsTablet2 =  await BigTableCollection.find({}).skip(documentsTablet).limit(documentsTablet).toArray().then(data=>{
            return data;
        });
        documentsTablet3 = await BigTableCollection.find({}).skip(2*documentsTablet).limit(documentsTablet).toArray().then(data=>{
            return data;
        });
        const tablet1KeyRange={
            start:parseInt(documentsTablet1[0].anime_id),
            end:parseInt(documentsTablet1[documentsTablet1.length-1].anime_id)
        };
        const tablet2KeyRange={
            start:parseInt(documentsTablet2[0].anime_id),
            end:parseInt(documentsTablet2[documentsTablet2.length-1].anime_id)
        };
        const tablet3KeyRange={
            start:parseInt(documentsTablet3[0].anime_id),
            end:parseInt(documentsTablet3[documentsTablet3.length-1].anime_id)
        };
         await tablet.connect(dbs.tablet2,2);
         await tablet.drop(2);
         await tablet.loadData(documentsTablet2,2);
         await tablet.connect(dbs.tablet3,3);
         await tablet.drop(3);
         await tablet.loadData(documentsTablet3,3);
         await MetaData.updateMetaData(masterConnection,tablet1KeyRange,tablet2KeyRange,tablet3KeyRange,documentsTablet,documentsTablet,documentsTablet);
         await io.sockets.emit("End-Balance");
            masterLog.push({
                message: "master rebalanced the data",
                timeStamp: Date.now(),
              });

    } finally {
        release();
    }
        },
    //lock
    async insert(animeDocuments){
        const release = await mutex.acquire();
        try {

            const BigTableCollection = (await masterConnection).collection("BigTable");
            const metadata = await MetaData.getMetaData(masterConnection);
            let id = metadata.tablet3KeyRange.end+1;
            animeDocuments.forEach(anime => {
                anime.anime_id=id;
                id+=1;
            });
            console.log(animeDocuments);
            await BigTableCollection.insertMany(animeDocuments);
            id=id-1;
            metadata.tablet3KeyRange.end=id;
            metadata.tablet3Documents += animeDocuments.length;
            await MetaData.updateMetaData(masterConnection,metadata.tablet1KeyRange,metadata.tablet2KeyRange,metadata.tablet3KeyRange,metadata.tablet1Documents,metadata.tablet2Documents,metadata.tablet3Documents)
        } 
        finally {
            release();
        }
       
    },
    //unlock

    async delete(ids,tabletId){
        const BigTableCollection = (await masterConnection).collection("BigTable");
        await BigTableCollection.deleteMany({
            'anime_id': { $in: ids}
         });
         let metadata = await MetaData.getMetaData(masterConnection);
         if(tabletId==1){
             metadata.tablet1Documents -= ids.length;
         }
         if(tabletId==2){
            metadata.tablet2Documents -= ids.length;
         }
        if(tabletId==3){
            metadata.tablet3Documents -= ids.length;
        }
        const release = await mutex.acquire();
        try {
        //lock
        await MetaData.updateMetaData(masterConnection,metadata.tablet1KeyRange,metadata.tablet2KeyRange,metadata.tablet3KeyRange,metadata.tablet1Documents,metadata.tablet2Documents,metadata.tablet3Documents)
        //unlock
        }
        finally {
            release();
        }
    },

    
    async update(animeDocuments){
        const BigTableCollection = (await masterConnection).collection("BigTable");
        await BigTableCollection.bulkWrite(
            animeDocuments.map((data) => 
              ({
                updateOne: {
                  filter: { anime_id: data.anime_id },
                  update: { $set: data }
                }
              })
            )
          )
    },

}

const BROWSER_CLIENTS = [];
const SERVER_CLIENTS = [];
//Stay alive signal with tablet
io.on("connection", socket => {
        socket.on("source", async (payload) => {
            if (payload == "client")
            {
                BROWSER_CLIENTS[socket.id] = socket;
                masterLog.push({
                    message: "client => id: " + socket.id + " connected to master",
                    timeStamp: Date.now(),
                  });
            }
            else if (payload == "tablet")
            {
                SERVER_CLIENTS[socket.id] = socket;
                masterLog.push({
                    message: "Tablet => id: " + socket.id + " connected to master",
                    timeStamp: Date.now(),
                  });
            }
            console.log("Tablet Connected");
            await socket.emit('GetMetaData',await MetaData.getMetaData(masterConnection));
        });

        socket.on("disconnect", () => {
            //if socket is not found in server array then it is a client
            //-1 => client
            //else => server
            let serverType = -1;
            // SERVER_CLIENTS.indexOf(socket.id);
            if(serverType==-1)
            {
            delete BROWSER_CLIENTS[socket.id];
            masterLog.push({
                message: "client => id: " + socket.id + " disconnected from master",
                timeStamp: Date.now(),
                });
                return;
            }  

            delete SERVER_CLIENTS[socket.id];
            masterLog.push({
                message: "server => id: " + socket.id + " disconnected from master",
                timeStamp: Date.now(),
              });

        });
      
        socket.on("tablet-update",async (payload)=>{
            console.log(payload);
            await tablet.connect(dbs["tablet"+payload.tabletId],payload.tabletId);
            let documents;
            if(payload.updateType!='delete'){
            documents = await tablet.getUpdatedDocuments(payload.ids,payload.tabletId);
            }
            if(payload.updateType=='insert'){
                await MasterData.insert(documents);
            }
            if(payload.updateType=='update'){
                await MasterData.update(documents);                
            }
            if(payload.updateType=='delete'){
                await MasterData.delete(payload.ids,payload.tabletId);                
            }
            if(payload.updateType!='update'){
            await MasterData.balanceData();
         
            const metadata =  await MetaData.getMetaData(masterConnection);
            await io.sockets.emit("GetMetaData", metadata);
            masterLog.push({
                message: "master updated and re-emitted the metadata",
                timeStamp: Date.now(),
              });
            }
        
        })

        //Getting logs from clients and tablets 
        socket.on("clientLogs", payload => {
           //payload -> array of objects

            let logFileString;
            let logArray = [];
            try {
                logFileString = fs.readFileSync('./systemLogs.log', 'utf8');
                logArray = JSON.parse(logFileString);
            } catch (err) {
                console.log("output file not created yet client",err)
            }
            logArray = logArray.concat(payload);
            logArray.sort(function(a, b) {
                return a.timeStamp - b.timeStamp;
            });
            fs.writeFile('systemLogs.log', JSON.stringify(logArray), err => {
                if (err) {
                console.error(err)
                return
                }
            })           //each object consists of message and global time stamp
        });
    
        socket.on("tabletLogs", payload => {
           
        });
});

