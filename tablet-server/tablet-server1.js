const AnimeService = require("./anime.service.js");
const AnimeValidation = require("./anime.validation");
let metaData = require("./tabletMetaData.js");
var Mutex = require("async-mutex").Mutex;
let set = metaData.set;
let MasterUpdateD = [];

let MUtexTablet1, MUtexTablet2;
let MasterLock;
let MasterRelease;
fs = require("fs");
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
  if (tabletLogs.length) {
    socketMaster.emit("tabletLogs", tabletLogs);
    tabletLogs = [];
  }
}, 3000);
  tabletLogs.push({
  message: "Tablet Server 1 Connected to master",
  timeStamp: Date.now(),
});

//Tablet Server socket setup(connecting tablet with client)
var ioTablet = require("socket.io")(8000);
tabletLogs.push({
  message: "Tablet Server 1 Listening to client...",
  timeStamp: Date.now(),
});

socketMaster.on("connect", function () {
  MUtexTablet1 = new Mutex();
  MUtexTablet2 = new Mutex();
  MasterLock = new Mutex();
  console.log("connected to Master");
  socketMaster.emit("source", "tablet");
  socketMaster.on("GetMetaData", (data) => {
    set(data);
    tabletLogs.push({
      message: "Tablet Server 1 got metadata",
      metaData:data,
      timeStamp: Date.now(),
    });
  });

    //Balance
    socketMaster.on('Balance',async ()=>{
      tabletLogs.push({
        message: "Tablet Server 1 blocked Requests as master is balancing",
        timeStamp: Date.now(),
      });
        MasterRelease = await MasterLock.acquire();
    });

    socketMaster.on('End-Balance', ()=>{
      tabletLogs.push({
        message: "master finished balancing, Tablet Server 1 removed block",
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
        ids: ids1,
      };
      socketMaster.emit("tablet-update", MasterUpdateData);
    }
    if (ids2.length != 0) {
      MasterUpdateData = {
        updateType: "update",
        tabletId: 2,
        ids: ids2,
      };
      socketMaster.emit("tablet-update", MasterUpdateData);
    }
    MasterUpdateD = [];
  }
}, 30000);

ioTablet.on("connection", function (socket) {
  console.log("client connected to Tablet Server 1:", socket.client.id);
  tabletLogs.push({
    message: "Tablet Server 1 connected to client => id: " + socket.client.id,
    timeStamp: Date.now(),
  });
  //Tablet Server queries from client

  //the client must send the tablet number that contains the data
  let tabletNumber; //tablet not tablet server

  //check on each id and send to the appropriate tablet
  socket.on("ReadRows", async function (ClientData) {
    ///client
    console.log("acuiring master lock  ", MasterLock.isLocked());
    var before = new Date().getTime() / 1000;
    if (MasterLock.isLocked()) {
      MasterRelease = await MasterLock.acquire();
      MasterRelease();
    }
    console.log(
      "time taken to acquire : ",
      new Date().getTime() / 1000 - before
    );
    console.log("read request is send");
    tabletLogs.push({
    message: "client => id: " + socket.client.id + " requested data reterival from Tablet Server 1",
    timeStamp: Date.now(),
    });
    const ids = await AnimeValidation.seperateId(ClientData.rowKeys);
    const data1 = await AnimeService.findRows(ids.ids1, 1);
    const data2 = await AnimeService.findRows(ids.ids2, 2);
    console.log("after",ids);

    if (data1.data.length==0) {
      console.log(data1.myerr);
      tabletLogs.push({
        message:
          "client => id: " +
          socket.client.id +
          " requested data reterival => Error: " +
          data1.myerr,
        timeStamp: Date.now(),
      });
    }
    if (data2.data.length==0) {
      console.log(data2.myerr);
      tabletLogs.push({
        message:
          "client => id: " +
          socket.client.id +
          " requested data reterival => Error: " +
          data2.myerr,
        timeStamp: Date.now(),
      });
    }
    var data = {};
    data.data =
      data1.data.length != 0 && data2.data.length !=0
        ? data1.data.concat(data2.data)
        : data1.data.length != 0
        ? data1.data
        : data2.data;
    data.err =
      data1.err.length != 0 && data2.err.length !=0
        ? data1.err.concat(data2.err)
        : data1.err.length != 0
        ? data1.err
        : data2.err;
    console.log("////////////////////");
    console.log("data send to client from read:",data);
    socket.emit("ReadRowsResponse", data); ///tablet
    tabletLogs.push({
    message: "client => id: " + socket.client.id + " requested data reterival from Tablet Server 1 => Succeeded",
    timeStamp: Date.now(),
    });
  });

  socket.on("Set", async function (ClientData) {
    console.log("acuiring master lock  ", MasterLock.isLocked());
    var before = new Date().getTime() / 1000;
    if (MasterLock.isLocked()) {
      MasterRelease = await MasterLock.acquire();
      MasterRelease();
    }
    console.log(
      "time taken to acquire : ",
      new Date().getTime() / 1000 - before
    );

    console.log("Set the row with the updated data");
    tabletNumber = await AnimeValidation.validateRowKey(ClientData.rowKey);
    console.log("///////////////tablet number: ",tabletNumber);

    tabletLogs.push({
      message: "client => id: " + socket.client.id + " requested data update from Tablet Server "+tabletNumber,
      timeStamp: Date.now(),
    });

    let release ;
    if(tabletNumber == 1){
      release = await MUtexTablet1.acquire();
    }else{
      release = await MUtexTablet2.acquire();
    }

    console.log("tablet ",tabletNumber , "aquired lock");
    tabletLogs.push({
      message: "client => id: " + socket.client.id + " acquired the lock from Tablet Server "+tabletNumber,
      timeStamp: Date.now(),
    });
    try {
      //await new Promise((resolve) => setTimeout(resolve, 10000));
      const data = await AnimeService.updateAnime(
        ClientData.Anime,
        ClientData.rowKey,
        tabletNumber
      );
      console.log("////////////////////data: ", data);
      if (!data.data) {
        console.log(data.err);
        tabletLogs.push({
          message: "client => id: " + socket.client.id + "requested data update from Tablet Server 1 => Error: " + data.err,
          timeStamp: Date.now(),
        });
      } else {
        MasterUpdateD.push({ tabletId: tabletNumber, ids: ClientData.rowKey });
      }
      socket.emit("SetResponse", data);
      tabletLogs.push({
        message: "client => id: " + socket.client.id + "requested data update from Tablet Server 1 => Succeeded",
        timeStamp: Date.now(),
      });
    } finally {
      release();
      console.log("After release true");
      tabletLogs.push({
        message: "client => id: " + socket.client.id + " released the lock from Tablet Server "+tabletNumber,
        timeStamp: Date.now(),
      });
    }
  });

  socket.on("AddRow", async function (ClientData) {
    console.log("acuiring master lock  ", MasterLock.isLocked());
    var before = new Date().getTime() / 1000;
    if (MasterLock.isLocked()) {
      MasterRelease = await MasterLock.acquire();
      MasterRelease();
    }
    console.log(
      "time taken to acquire : ",
      new Date().getTime() / 1000 - before
    );

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
      console.log(ClientData);
      const data = await AnimeService.createAnime(ClientData, 1);
      console.log(data);
      if (!data.data) {
        console.log(data.err);
        tabletLogs.push({
          message: "client => id: " + socket.client.id + " requested add new row from Tablet Server 1 => Error: " + data.err,
          timeStamp: Date.now(),
        });
      } else {
        console.log(data);
        const masterUpdateData = {
          tabletId: 1,
          updateType: "insert",
          ids: data.data,
        };
        console.log(masterUpdateData);
        socketMaster.emit("tablet-update", masterUpdateData);
        tabletLogs.push({
          message: "client => id: " + socket.client.id + " requested add new row to master from Tablet Server 1 => Succeeded ",
          timeStamp: Date.now(),
        });
      }
      socket.emit("AddRowResponse", data);
      tabletLogs.push({
        message: "client => id: " + socket.client.id + " requested add new row to client from Tablet Server 1  => Succeeded ",
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
    console.log("acuiring master lock  ", MasterLock.isLocked());
    var before = new Date().getTime() / 1000;
    if (MasterLock.isLocked()) {
      MasterRelease = await MasterLock.acquire();
      MasterRelease();
    }
    console.log(
      "time taken to acquire : ",
      new Date().getTime() / 1000 - before
    );

    tabletLogs.push({
      message: "client => id: " + socket.client.id + " requested Delete Cells ",
      timeStamp: Date.now(),
    });

    tabletNumber = await AnimeValidation.validateRowKey(ClientData.rowKey);
    let release; 
    if(tabletNumber == 1)
      release = await MUtexTablet1.acquire();
    else 
      release = await MUtexTablet2.acquire();
    console.log("tablet ",tabletNumber , "aquired lock");
    tabletLogs.push({
      message: "client => id: " + socket.client.id + " acquired the lock ",
      timeStamp: Date.now(),
    });

    try {
      console.log("Delete Cells");
      const data = await AnimeService.deleteCells(
        ClientData.columnFamilies,
        ClientData.rowKey,
        tabletNumber
      );
      if (!data.data) {
        console.log(data.err);
        tabletLogs.push({
          message: "client => id: " + socket.client.id + " requested Delete Cells from Tablet Server "+tabletNumber+"  => Error: " + data.err,
          timeStamp: Date.now(),
        });
      } else {
        MasterUpdateD.push({ tabletId: tabletNumber, ids: ClientData.rowKey });
      }
      socket.emit("DeleteCellsResponse", data);
      tabletLogs.push({
        message: "client => id: " + socket.client.id + " requested Delete Cells from Tablet Server "+tabletNumber+" => Succeeded",
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
    console.log("acuiring master lock  ", MasterLock.isLocked());
    var before = new Date().getTime() / 1000;
    if (MasterLock.isLocked()) {
      MasterRelease = await MasterLock.acquire();
      MasterRelease();
    }
    console.log(
      "time taken to acquire : ",
      new Date().getTime() / 1000 - before
    );

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
      const ids = await AnimeValidation.seperateId(ClientData.rowKeys);
      const data1 = await AnimeService.deleteRow(ids.ids1, 1);
      const data2 = await AnimeService.deleteRow(ids.ids2, 2);
      console.log("data1",data1);
      console.log("/////////////////////");
      console.log("data2",data2);
      if (data1.ids.length == 0) {
        console.log("No Anime Was Deleted");
        tabletLogs.push({
          message: "client => id: " + socket.client.id + " requested Delete Row from Tablet Server 1  => Error: No Anime Was Deleted",
          timeStamp: Date.now(),
        });
      }
      else{
        const masterUpdateData = {
          tabletId: 1,
          updateType: "delete",
          ids: data1.ids,
        };
        console.log("deleting from tablet1 :", masterUpdateData);
        socketMaster.emit("tablet-update", masterUpdateData);
        tabletLogs.push({
          message:
            "client => id: " +
            socket.client.id +
            " requested Delete Row to master from Tablet Server 1 => Succeeded",
          timeStamp: Date.now(),
        });
      }
      if (data2.ids.length == 0) {
        console.log("No Anime Was Deleted");
        tabletLogs.push({
          message:"client => id: " +socket.client.id +" requested Delete Row from Tablet Server 1  => Error: No Anime Was Deleted" ,timeStamp: Date.now(),
        });
      } else {
        const masterUpdateData = {
          tabletId: 2,
          updateType: "delete",
          ids: data2.ids,
        };
        console.log("deleting from tablet2 :", masterUpdateData);
        socketMaster.emit("tablet-update", masterUpdateData);
        tabletLogs.push({
          message:
            "client => id: " +
            socket.client.id +
            " requested Delete Row to master from Tablet Server 1 => Succeeded",
          timeStamp: Date.now(),
        });
      }
      var data ={};
      data.err =
        data1.err.length != 0 && data2.err.length != 0
          ? data1.err.concat(data2.err)
          : data1.err.length != 0
          ? data1.err
          : data2.err;
      console.log("send to client:",data);
      socket.emit("DeleteRowResponse", data);
      tabletLogs.push({
        message: "client => id: " + socket.client.id + " requested Delete Row to client from Tablet Server 1  => Succeeded",
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
