const mongoose = require('mongoose');
const conf = require('./config.js');
module.exports = function(tabletServerNum){
    var connectionString = (tabletServerNum == 1)? conf.tablet1 : conf.tablet2;
    mongoose.connect(connectionString,{
        useNewUrlParser: true,
        useUnifiedTopology:true,
        useFindAndModify:false
    }).then(()=>{
        console.log(`connected to serverNo: ${tabletServerNum} successfully`);
    }).catch((err)=>{
        console.log(`error connecting to serverNo: ${tabletServerNum} db ${err}`);
    })
};
