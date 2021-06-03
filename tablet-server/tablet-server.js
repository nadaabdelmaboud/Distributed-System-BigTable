const AnimeService = require("./anime.service.js");
const AnimeValidation = require("./anime.validation");
let metaData = require("./tabletMetaData.js");
var Mutex = require("async-mutex").Mutex;
let set = metaData.set;
let MasterUpdateD = [];

let MUtexTablet1, MUtexTablet2;
require("./server1.db.connection")
  .connect()
  .then(async (data) => {
    await AnimeService.setModels();
  });
//Master socket setup(connecting tablet with master)
var ioMaster = require("socket.io-client");
var socketMaster = ioMaster.connect("http://localhost:3000/", {
  reconnection: true,
});

//Tablet socket setup(connecting tablet with client)
var ioTablet = require("socket.io")(8000);
socketMaster.on("connect", function () {
  MUtexTablet1 = new Mutex();
  console.log("connected to Master");
  socketMaster.emit("source", "tablet");
  socketMaster.on("GetMetaData", (data) => {
    console.log(data);
    set(data);
  });
});

//send updates to master
setTimeout(function () {
  if (MasterUpdateD.length != 0) {
    ids1 = [];
    ids2 = [];
    for (i = 0; i < MasterUpdateD.length; i++) {
      if (MasterUpdateD[i].tabletId == 1) ids1.push(MasterUpdateD[i].ids);
      else ids2.push(MasterUpdateD[i].ids);
    }
    if (ids1.length != 0) {
      MasterUpdateData = {
        updateType: "update",
        tabletId: 1,
        ids:ids1
      };
      socketMaster.emit("tablet-update", MasterUpdateData);
    }
    else{
      MasterUpdateData = {
        updateType: "update",
        tabletId: 2,
        ids: ids2,
      };
      socketMaster.emit("tablet-update", MasterUpdateData);
    }
    MasterUpdateD=[];
  }
}, 30000);

ioTablet.on("connection", function (socket) {
  console.log("client connected to Tablet :", socket.client.id);

  //Tablet queries from client

  //the client must send the tablet number that contains the data
  let tabletNumber = 1; //tablet not tablet server

  //check on each id and send to the appropriate tablet
  socket.on("ReadRows", async function (ClientData) {
    console.log("read request is send");
    tabletNumber = await AnimeValidation.validateRowKey(ClientData.rowKeys[0]);
    console.log(tabletNumber);
    if (tabletNumber == -1) console.log("row key doesn't exist");
    const data = await AnimeService.findRows(ClientData.rowKeys, tabletNumber);
    if (!data.data) {
      console.log(data.err);
    }
    socket.emit("ReadRowsResponse", data);
  });

  socket.on("Set", async function (ClientData) {
    console.log("Before aquire", MUtexTablet1.isLocked());

    const release = await MUtexTablet1.acquire();
    try {
      console.log("After aquire", MUtexTablet1.isLocked());
      //await new Promise((resolve) => setTimeout(resolve, 10000));
      console.log("Set the row with the updated data");
      tabletNumber = await AnimeValidation.validateRowKey(ClientData.rowKey);
      const data = await AnimeService.updateAnime(
        ClientData.Anime,
        ClientData.rowKey,
        tabletNumber
      );
      if (!data.data) {
        console.log(data.err);
      } else {
        MasterUpdateD.push({ tabletId: tabletNumber, ids: ClientData.rowKey });
      }
      socket.emit("SetResponse", data);
    } finally {
      release();
      console.log("After release", MUtexTablet1.isLocked());
    }
  });

  socket.on("AddRow", async function (ClientData) {
    const release = await MUtexTablet1.acquire();
    try {
      console.log("Add new Row");
      const data = await AnimeService.createAnime(
        ClientData.Anime,
        tabletNumber
      );
      if (!data.data) {
        console.log(data.err);
      } else {
        console.log(data);
        const masterUpdateData = {
          tabletId: 3,
          updateType: "insert",
          ids: [data.data.anime_id],
        };
        console.log(masterUpdateData);
        socketMaster.emit("tablet-update", masterUpdateData);
      }
      socket.emit("AddRowResponse", data);
    } finally {
      release();
    }
  });

  socket.on("DeleteCells", async function (ClientData) {
    const release = await MUtexTablet1.acquire();
    try {
      console.log("Delete Cells");
      tabletNumber = await AnimeValidation.validateRowKey(ClientData.rowKey);
      const data = await AnimeService.deleteCells(
        ClientData.columnFamilies,
        ClientData.rowKey,
        tabletNumber
      );
      if (!data.data) {
        console.log(data.err);
      } else {
        MasterUpdateD.push({ tabletId: tabletNumber, ids: ClientData.rowKey });
      }
      socket.emit("DeleteCellsResponse", data);
    } finally {
      release();
    }
  });

  socket.on("DeleteRow", async function (ClientData) {
    const release = await MUtexTablet1.acquire();
    try {
      console.log("Delete Row");
      tabletNumber = await AnimeValidation.validateRowKey(ClientData.rowKey);
      const data = await AnimeService.deleteRow(
        ClientData.rowKey,
        tabletNumber
      );
      if (!data.data) {
        console.log(data.err);
      } else {
        const masterUpdateData = {
          tabletId: tabletNumber,
          updateType: "delete",
          ids: [ClientData.rowKey],
        };
        socketMaster.emit("tablet-update", masterUpdateData);
      }
      socket.emit("DeleteRowResponse", data);
    } finally {
      release();
    }
  });
});
