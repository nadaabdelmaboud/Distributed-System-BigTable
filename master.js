const express = require('express');
const mongoose = require('mongoose');
const dbs = require('./config');
const masterConnection  = mongoose.createConnection(dbs.master,{ useUnifiedTopology: true ,useNewUrlParser: true});
const MetaData = require('./metaData');
const tablet = require('./tablet-instance')
const { Server } = require("socket.io");
const Mutex = require('async-mutex').Mutex;
const mutex = new Mutex();
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
         await tablet.connect(dbs.tablet2);
         await tablet.loadData(documentsTablet2);
         await tablet.disconnect();
         await tablet.connect(dbs.tablet3);
         await tablet.loadData(documentsTablet3);
         await tablet.disconnect();
         await MetaData.updateMetaData(masterConnection,tablet1KeyRange,tablet2KeyRange,tablet3KeyRange,documentsTablet,documentsTablet,documentsTablet);
        }
  
    
})

const MasterData={
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
         if(tabletId==1){
             metadata.tablet1Documents -= ids.length;
         }
         if(tabletId==2){
            metadata.tablet2Documents -= ids.length;
         }
        if(tabletId==3){
            metadata.tablet3Documents -= ids.length;
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
            await tablet.connect(dbs[payload.tabletId]);
            let documents;
            if(payload.updateType!='delete'){
            documents = await tablet.getUpdatedDocuments(payload.ids);
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

