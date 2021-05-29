const express = require('express');
const mongoose = require('mongoose');
const dbs = require('./config');
const masterConnection  = mongoose.createConnection(dbs.master,{ useUnifiedTopology: true ,useNewUrlParser: true});
const MetaData = require('./metaData');
const tablet = require('./tablet-instance')
const { Server } = require("socket.io");
const app = express();
const server = app.listen(3000,()=>{
    console.log("Server is listening on port 3000")
})
const io = new Server(server);


masterConnection.once('open',async function(){

    if(await MetaData.checkMetaDataEmpty(masterConnection)){
        await MetaData.insertNewMetaData(masterConnection);
    }
    if(await MetaData.checkDataEmpty(masterConnection)){
        const BigTableCollection = (await masterConnection).collection("BigTable");
        let totalMasterDocuments = await BigTableCollection.countDocuments({});
        let documentsTablet=parseInt(totalMasterDocuments/3);
        documentsTablet1 = await BigTableCollection.find({}).skip(0).limit(documentsTablet).toArray().then(data=>{
             return data;
         });
        await tablet.connect(dbs.tablet1);
        await tablet.loadData(documentsTablet1);
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
        await tablet.disconnect();
         await tablet.connect(dbs.tablet2,true);
         await tablet.loadData(documentsTablet2,documentsTablet3);
         await MetaData.updateMetaDate(masterConnection,tablet1KeyRange,tablet2KeyRange,tablet3KeyRange,documentsTablet);
         await tablet.disconnect();
        }
  
    
})

const MasterData={
    async insert(animeDocuments,ids){

    },
    async delete(ids){

    },
    async update(animeDocuments,ids){

    },
    async checkBalancing(){

    }
}

const BROWSER_CLIENTS = {};
const SERVER_CLIENTS = {};
io.on("connection", socket => {
        socket.on("source", payload => {
            if (payload == "client")
                BROWSER_CLIENTS[socket.id] = socket;
            else if (payload == "tablet")
                SERVER_CLIENTS[socket.id] = socket;
        });
        socket.on("disconnect", () => {
            delete BROWSER_CLIENTS[socket.id];
            delete SERVER_CLIENTS[socket.id];
        });
        socket.on("tablet-update",async (payload)=>{
            //id of tablet
            //type of updates add-delete-update
            //ids of data
            //in case add (insert): hgeb mn 2l tablet database 2l ids 2l gdeda we 23mlha insert fel db 2l kbera
            //in case delete (delete): h43l 2l ids 2lli 2tms7t mn 2l db 2l kbera
            //in case update (put): hupdate 2l ids of 2l db 2l kbera
            //check load balancing
            //nre load 2l data fel tablets
            //then update 2l metadata
            //emit the new meta data to clients
            await tablet.connect(dbs[payload.tabletId],payload.isTablet3);
            let documents;
            if(payload.updateType!='delete'){
            documents = await tablet.getUpdatedDocuments(payload.ids,payload.isTablet3);
            }
            if(payload.updateType=='insert'){
                await MasterData.insert(documents,payload.ids);
            }
            if(payload.updateType=='update'){
                await MasterData.update(documents,payload.ids);                
            }
            if(payload.updateType=='delete'){
                await MasterData.delete(payload.ids);                
            }
            await tablet.disconnect();
            if(payload.updateType!='update'){
            metadata = await MasterData.checkBalancing();
            for (let i in BROWSER_CLIENTS)
                BROWSER_CLIENTS[i].emit("metadata",metadata)
            }
        })
});

