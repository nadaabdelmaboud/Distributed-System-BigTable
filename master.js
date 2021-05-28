const express = require('express');
const mongoose = require('mongoose');
const dbs = require('./config');
const masterConnection  = mongoose.createConnection(dbs.master,{ useUnifiedTopology: true ,useNewUrlParser: true});
//const metaDataModel = require('./metaData')();
const tablet = require('./tablet-instance')
masterConnection.once('open',async function(){
    //check 
    
    const metaDataCollection =(await masterConnection).collection("metadata");
    const metaData = await metaDataCollection.find({}).toArray().then(data=>{
        return data[0];
    });

    let documentsTablet1,documentsTablet2;
    const BigTableCollection = (await masterConnection).collection("BigTable");
    documentsTablet1 = await BigTableCollection.find({genre:"Action"}).toArray().then(data=>{
        return data;
    });
         console.log(documentsTablet1[0]);
    await tablet.connect(dbs.tablet1);
    await tablet.loadData(documentsTablet1);
    documentsTablet2 = await BigTableCollection.find({genre:"Comedy"}).toArray().then(data=>{
        return data;
    });
    console.log(documentsTablet2[0]);
    await tablet.connect(dbs.tablet2);
    await tablet.loadData(documentsTablet2);
})

//connect master database
//connect tablet db
 