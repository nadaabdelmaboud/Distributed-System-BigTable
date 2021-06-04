const MetaData={
    
    async insertNewMetaData(connection){
    const metaDataCollection =(await connection).collection("metadata");
    const metaData = await metaDataCollection.insertOne({
        tablet1Documents:0,
        tablet2Documents:0,
        tablet3Documents:0,
/*         tabletServer1Status:true,
        tabletServer2Status:true,
        server1:{
            tablet1:true;
            tablet2:true;
            tablet3:false;
        },
        server2:{
            tablet1:false;
            tablet2:false;
            tablet3:true;
        }, */
        tablet1KeyRange:{
            start:0,
            end:0
        },
        tablet2KeyRange:{
            start:0,
            end:0
        },
        tablet3KeyRange:{
            start:0,
            end:0
        },
    });
},
async getMetaData(connection){
    const metaDataCollection =(await connection).collection("metadata");
    return await metaDataCollection.find({}).toArray().then(data=>{
        return data[0];
    });

},
async checkMetaDataEmpty(connection){
    const metaDataCollection =(await connection).collection("metadata");
    const metadata =  await metaDataCollection.find({}).toArray().then(data=>{
        return data[0];
    });
    if(!metadata){
        return true;
    }
    return false;
},
async checkDataEmpty(connection){
    const metaDataCollection =(await connection).collection("metadata");
    const metadata =  await metaDataCollection.find({}).toArray().then(data=>{
        return data[0];
    });
    if(metadata.tablet1Documents==0&&metadata.tablet2Documents==0&&metadata.tablet3Documents==0){
        return true;
    }
    return false;
},
async updateMetaData(connection,tablet1KeyRange,tablet2KeyRange,tablet3KeyRange,tablet1Documents,tablet2Documents,tablet3Documents){
    const metaDataCollection =(await connection).collection("metadata");
    const metadata =  await metaDataCollection.updateOne({},{$set:{
        tablet1Documents:tablet1Documents,
        tablet2Documents:tablet2Documents,
        tablet3Documents:tablet3Documents,
        tablet1KeyRange,
        tablet2KeyRange,
        tablet3KeyRange
    }
    });
  
}
}

module.exports=MetaData;

