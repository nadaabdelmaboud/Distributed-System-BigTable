const AnimeService = require("./anime.service.js");
let metaData = require("./tabletMetaData.js");
let set = metaData.set;

require("./db.connection.js")(1);

//Master socket setup(connecting tablet with master)
var ioMaster = require('socket.io-client');
var socketMaster = ioMaster.connect("http://localhost:3000/", {
    reconnection: true
});

//Tablet socket setup(connecting tablet with client)
var ioTablet = require('socket.io')(8000);

socketMaster.on('connect', function () {
    console.log('connected to Master');
    socketMaster.emit('tabletStarting',  {
        tabletNumber: 1
    });
    socketMaster.on('GetMetaData', (data)=>
    {
        set(data.metaData);
    });
})


ioTablet.on('connection', function (socket) {
  console.log("client connected to Tablet :", socket.client.id);

  //Tablet queries from client

  //the client must send the tablet number that contains the data
  let tabletNumber =1; // tablet not tablet server

  //check on each id and send to the appropriate tablet
  socket.on("ReadRows", async function (ClientData) {
    console.log("read request is send");
    const data = await AnimeService.findRows(ClientData.rowKeys, tabletNumber);
    if (!data.data) {
      console.log(data.err);
    }
    socket.emit("ReadRowsResponse", data);
  });

  socket.on("Set", async function (ClientData) {
    console.log("Set the row with the updated data");
    const data = await AnimeService.updateAnime(
      ClientData.Anime,
      ClientData.rowKey,
      tabletNumber
    );
    if (!data.data) {
      console.log(data.err);
    }
    socket.emit("SetResponse", data);
  });

  socket.on("AddRow", async function (ClientData) {
    console.log("Add new Row");
    const data = await AnimeService.createAnime(
      ClientData.Anime,
      tabletNumber
    );
    if (!data.data) {
      console.log(data.err);
    }
    socket.emit("AddRowResponse", data);
  });

  socket.on("DeleteCells", async function (ClientData) {
    console.log("Delete Cells");
    const data = await AnimeService.deleteCells(
      ClientData.columnFamilies,
      ClientData.rowKey,
      tabletNumber
    );
    if (!data.data) {
      console.log(data.err);
    }
    socket.emit("DeleteCellsResponse", data);
  });

  socket.on("DeleteRow", async function (ClientData) {
    console.log("Delete Row");
    const data = await AnimeService.deleteRow(
      ClientData.rowKey,
      tabletNumber
    );
    if (!data.data) {
      console.log(data.err);
    }
    socket.emit("DeleteRowResponse", data);
  });
});



 