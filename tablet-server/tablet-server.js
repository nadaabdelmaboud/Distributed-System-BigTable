const AnimeService = require("./anime.service.js");
const AnimeValidation = require("./anime.validation");
let metaData = require("./tabletMetaData.js");
var Mutex = require("async-mutex").Mutex;
let set = metaData.set;
let MasterUpdateD = [];

let MUtexTablet1, MUtexTablet2;
let MasterLock;
let MasterRelease;
fs = require('fs')
let tabletLogs = []; 


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
setInterval(() => {
  if(tabletLogs.length)
   {
    socketMaster.emit("tabletLogs", tabletLogs);
    tabletLogs = [];
   } 
}, 3000);
  tabletLogs.push({
  message: "Tablet 1 Connected to master",
  timeStamp: Date.now(),
});

//Tablet socket setup(connecting tablet with client)
var ioTablet = require("socket.io")(8000);
tabletLogs.push({
  message: "Tablet 1 Listening to client...",
  timeStamp: Date.now(),
});

socketMaster.on("connect", function () {
  MUtexTablet1 = new Mutex();
  MasterLock = new Mutex();
  console.log("connected to Master");
  socketMaster.emit("source", "tablet");
  socketMaster.on("GetMetaData", (data) => {
    set(data);
    tabletLogs.push({
      message: "Tablet 1 got metadata",
      metaData:data,
      timeStamp: Date.now(),
    });
  });

    //Balance
    socketMaster.on('Balance',async ()=>{
      tabletLogs.push({
        message: "Tablet 1 blocked Requests as master is rebalancing",
        timeStamp: Date.now(),
      });
        MasterRelease = await MasterLock.acquire();
    });

    socketMaster.on('End-Balance', ()=>{
      tabletLogs.push({
        message: "master finished balancing, Tablet 1 removed block",
        timeStamp: Date.now(),
      });
        MasterRelease();
    });
});

//send updates to master
setInterval(function () {
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
    if(ids2.length != 0){
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
  tabletLogs.push({
    message: "Tablet 1 connected to client => id: " + socket.client.id,
    timeStamp: Date.now(),
  });
  //Tablet queries from client

  //the client must send the tablet number that contains the data
  let tabletNumber; //tablet not tablet server

  //check on each id and send to the appropriate tablet
  socket.on("ReadRows", async function (ClientData) { ///client
    console.log("acuiring master lock  ",MasterLock.isLocked());
    var before = new Date().getTime() / 1000;
    if(MasterLock.isLocked())
     {
      MasterRelease = await MasterLock.acquire();
      MasterRelease();
     } 
    console.log("time taken to acquire : ",(new Date().getTime() / 1000)- before);
    console.log("read request is send");
    tabletLogs.push({
    message: "client => id: " + socket.client.id + " requested data reterival from Tablet 1 ",
    timeStamp: Date.now(),
    });

    tabletNumber = await AnimeValidation.validateRowKey(ClientData.rowKeys[0]);
    console.log(tabletNumber);
        //const tabletNumber = AnimeValidation.validateRowKey(ClientData.rowKeys);
        if (tabletNumber == -1) {
        console.log("row key doesn't exist");
        tabletLogs.push({
            message: "client => id: " + socket.client.id + " requested data reterival => Error: row key doesn't exist Tablet 1 ",
            timeStamp: Date.now(),
        });
        }
    const data = await AnimeService.findRows(ClientData.rowKeys, tabletNumber);
    if (!data.data) {
    console.log(data.err);
    tabletLogs.push({
    message: "client => id: " + socket.client.id + " requested data reterival from Tablet 1  => Error: " + data.err,
    timeStamp: Date.now(),
    });
    }
    socket.emit("ReadRowsResponse", data);///tablet
    tabletLogs.push({
    message: "client => id: " + socket.client.id + " requested data reterival from Tablet 1 => Succeeded",
    timeStamp: Date.now(),
    });
  });

  socket.on("Set", async function (ClientData) {
    console.log("acuiring master lock  ",MasterLock.isLocked());
    var before = new Date().getTime() / 1000;
    if(MasterLock.isLocked())
     {
      MasterRelease = await MasterLock.acquire();
      MasterRelease();
     } 
    console.log("time taken to acquire : ",(new Date().getTime() / 1000)- before);
    
    console.log("Before aquire", MUtexTablet1.isLocked());
    tabletLogs.push({
      message: "client => id: " + socket.client.id + " requested data update from Tablet 1 ",
      timeStamp: Date.now(),
    });

    const release = await MUtexTablet1.acquire();
    tabletLogs.push({
      message: "client => id: " + socket.client.id + " acquired the lock from Tablet 1 ",
      timeStamp: Date.now(),
    });
    try {
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
        tabletLogs.push({
          message: "client => id: " + socket.client.id + "requested data update from Tablet 1 => Error: " + data.err,
          timeStamp: Date.now(),
        });
      } else {
        MasterUpdateD.push({ tabletId: tabletNumber, ids: ClientData.rowKey });
      }
      socket.emit("SetResponse", data);
      tabletLogs.push({
        message: "client => id: " + socket.client.id + "requested data update from Tablet 1 => Succeeded",
        timeStamp: Date.now(),
      });
    } finally {
      release();
      console.log("After release", MUtexTablet1.isLocked());
      tabletLogs.push({
        message: "client => id: " + socket.client.id + " released the lock from Tablet 1",
        timeStamp: Date.now(),
      });
    }
  });

  socket.on("AddRow", async function (ClientData) {
    console.log("acuiring master lock  ",MasterLock.isLocked());
    var before = new Date().getTime() / 1000;
    if(MasterLock.isLocked())
     {
      MasterRelease = await MasterLock.acquire();
      MasterRelease();
     } 
    console.log("time taken to acquire : ",(new Date().getTime() / 1000)- before);

    tabletLogs.push({
      message: "client => id: " + socket.client.id + " requested to add new row ",
      timeStamp: Date.now(),
    });
    const release = await MUtexTablet1.acquire();
    tabletLogs.push({
      message: "client => id: " + socket.client.id + " acquired the lock ",
      timeStamp: Date.now(),
    });
    try {
      console.log("Add new Row");
      const data = await AnimeService.createAnime(
        ClientData.Anime,
        1
      );
      if (!data.data) {
        console.log(data.err);
        tabletLogs.push({
          message: "client => id: " + socket.client.id + " requested add new row from Tablet 1 => Error: " + data.err,
          timeStamp: Date.now(),
        });
      } else {
        console.log(data);
        const masterUpdateData = {
          tabletId: 1,
          updateType: "insert",
          ids: [data.data.anime_id],
        };
        console.log(masterUpdateData);
        socketMaster.emit("tablet-update", masterUpdateData);
        tabletLogs.push({
          message: "client => id: " + socket.client.id + " requested add new row to master from Tablet 1 => Succeeded ",
          timeStamp: Date.now(),
        });
      }
      socket.emit("AddRowResponse", data);
      tabletLogs.push({
        message: "client => id: " + socket.client.id + " requested add new row to client from Tablet 1  => Succeeded ",
        timeStamp: Date.now(),
      });
    } finally {
      release();
      tabletLogs.push({
        message: "client => id: " + socket.client.id + " released the lock ",
        timeStamp: Date.now(),
      });
    }
  });

  socket.on("DeleteCells", async function (ClientData) {
    console.log("acuiring master lock  ",MasterLock.isLocked());
    var before = new Date().getTime() / 1000;
    if(MasterLock.isLocked())
     {
      MasterRelease = await MasterLock.acquire();
      MasterRelease();
     } 
    console.log("time taken to acquire : ",(new Date().getTime() / 1000)- before);

    tabletLogs.push({
      message: "client => id: " + socket.client.id + " requested Delete Cells ",
      timeStamp: Date.now(),
    });
    const release = await MUtexTablet1.acquire();
      tabletLogs.push({
      message: "client => id: " + socket.client.id + " acquired the lock ",
      timeStamp: Date.now(),
    });
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
        tabletLogs.push({
          message: "client => id: " + socket.client.id + " requested Delete Cells from Tablet 1  => Error: " + data.err,
          timeStamp: Date.now(),
        });
      } else {
        MasterUpdateD.push({ tabletId: tabletNumber, ids: ClientData.rowKey });
      }
      socket.emit("DeleteCellsResponse", data);
      tabletLogs.push({
        message: "client => id: " + socket.client.id + " requested Delete Cells from Tablet 1 => Succeeded",
        timeStamp: Date.now(),
      });
    } finally {
      release();
      tabletLogs.push({
        message: "client => id: " + socket.client.id + "released the lock",
        timeStamp: Date.now(),
      });
    }
  });

  socket.on("DeleteRow", async function (ClientData) {
    console.log("acuiring master lock  ",MasterLock.isLocked());
    var before = new Date().getTime() / 1000;
    if(MasterLock.isLocked())
     {
      MasterRelease = await MasterLock.acquire();
      MasterRelease();
     } 
    console.log("time taken to acquire : ",(new Date().getTime() / 1000)- before);

    tabletLogs.push({
      message: "client => id: " + socket.client.id + " requested Delete Row " ,
      timeStamp: Date.now(),
    });
    const release = await MUtexTablet1.acquire();
    tabletLogs.push({
      message: "client => id: " + socket.client.id + " acquired the lock ",
      timeStamp: Date.now(),
    });
    try {
      console.log("Delete Row");
      tabletNumber = await AnimeValidation.validateRowKey(ClientData.rowKey);
      const data = await AnimeService.deleteRow(
        ClientData.rowKey,
        tabletNumber
      );
      if (!data.data) {
        console.log(data.err);
        tabletLogs.push({
          message: "client => id: " + socket.client.id + " requested Delete Row from Tablet 1  => Error: " + data.err,
          timeStamp: Date.now(),
        });
      } else {
        const masterUpdateData = {
          tabletId: tabletNumber,
          updateType: "delete",
          ids: [ClientData.rowKey],
        };
        socketMaster.emit("tablet-update", masterUpdateData);
        tabletLogs.push({
          message: "client => id: " + socket.client.id + " requested Delete Row to master from Tablet 1 => Succeeded",
          timeStamp: Date.now(),
        });
      }
      socket.emit("DeleteRowResponse", data);
      tabletLogs.push({
        message: "client => id: " + socket.client.id + " requested Delete Row to client from Tablet 1  => Succeeded",
        timeStamp: Date.now(),
      });
    } finally {
      release();
      tabletLogs.push({
        message: "client => id: " + socket.client.id + " released the lock ",
        timeStamp: Date.now(),
      });
    }
  });
});
