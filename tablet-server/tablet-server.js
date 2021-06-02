const tabletQueries = require("./anime.queries.js");
require("./db.connection.js")(1);

//Master socket setup(connecting tablet with master)
var ioMaster = require('socket.io-client');
var socketMaster = ioMaster.connect("http://localhost:3000/", {
    reconnection: true
});

var metaData;

//Tablet socket setup(connecting tablet with client)
var ioTablet = require('socket.io')(8000);

socketMaster.on('connect', function () {
    console.log('connected to Master');
    socketMaster.emit('tabletStarting',  {
        tabletNumber: 1
    });
    socketMaster.on('GetMetaData', (data)=>
    {
        metaData = data.metaData;
    });
})


ioTablet.on('connection', function (socket) {
    console.log('client connected to Tablet :', socket.client.id);

    //Tablet queries from client

    //check on each id and send to the appropriate tablet
    socket.on('ReadRows', async function (data) {
        console.log("read request is send");
        const result = await tabletQueries.findRows(data.rowKeys,0);
        if(!result||result.length == 0){
             console.log("Invalid Ids");
             return;
        }
        socket.emit('ReadRowsResponse',result);
    });

    socket.on('Set', async function (data) {
        console.log("Set the row with the updated data");
        const result = await tabletQueries.updateAnime(data.Anime,data.rowKey,0);
        if(!result){
             console.log("Invalid data");
             return;
        }
        socket.emit('SetResponse',result);
    });

    socket.on('AddRow', async function (data) {
        console.log("Add new Row");
        const result = await tabletQueries.createAnime(data.Anime,0);
        if(!result){
             console.log("Error adding new row");
             return;
        }
        socket.emit('AddRowResponse',result);
    });

    socket.on('DeleteCells', async function (data) {
        console.log("Delete Cells");
        const result = await tabletQueries.deleteCells(data.columnFamilies,data.rowKey,0);
        if(!result){
             console.log("Error in deleting cells");
             return;
        }
        socket.emit('DeleteCellsResponse',result);
    });

    socket.on('DeleteRow', async function (data) {
        console.log("Delete Row");
        const result = await tabletQueries.deleteRow(data.rowKey,0);
        if(!result){
             console.log("Error in deleting row");
             return;
        }
        socket.emit('DeleteRowResponse',result);
    });

 });



 