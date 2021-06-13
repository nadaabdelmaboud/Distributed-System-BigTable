const AnimeService = require("./anime.service.js");
const AnimeValidation = require("./anime.validation");
let metaData = require("./tabletMetaData.js");
var Mutex = require("async-mutex").Mutex;
let set = metaData.set;
let MasterUpdateD = [];
const express = require("express");

let MUtexTablet1, MUtexTablet2;
let MasterLock;
let MasterRelease;
fs = require("fs");
let tabletLogs = [];

require("./server2.db.connection")
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
  message: "Tablet Server 2 Connected to master",
  timeStamp: Date.now(),
});

//Tablet Server socket setup(connecting tablet with client)
const Tablet2_PORT = 9000;
const PORT = process.env.PORT || Tablet2_PORT;
const server = express()
  .get("/", (req, res) => res.send("HELLO FROM Tablet-Server 2"))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
var ioTablet = require("socket.io")(server);

tabletLogs.push({
  message: "Tablet Server 2 Listening to Client...",
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
      message: "Tablet Server 2 got metadata from master",
      metaData: data,
      timeStamp: Date.now(),
    });
  });

  //Balance
  socketMaster.on("Balance", async () => {
    if(MasterLock.isLocked()){
      return ;
    }
    tabletLogs.push({
      message: "Tablet Server 2 blocked Requests as master is balancing",
      timeStamp: Date.now(),
    });
    MasterRelease = await MasterLock.acquire();
  });

  socketMaster.on("End-Balance", () => {
    if(!MasterLock.isLocked()){
      return ;
    }
    tabletLogs.push({
      message: "master finished balancing, Tablet Server 2 removed block",
      timeStamp: Date.now(),
    });
    MasterRelease();
  });
});

//send updates to master
setInterval(function () {
  if (MasterUpdateD.length != 0) {
    ids1 = [];
    for (i = 0; i < MasterUpdateD.length; i++) {
      ids1.push(MasterUpdateD[i].ids);
    }
    if (ids1.length != 0) {
      MasterUpdateData = {
        updateType: "update",
        tabletId: 3,
        ids: ids1,
      };
      socketMaster.emit("tablet-update", MasterUpdateData);
    }
    MasterUpdateD = [];
  }
}, 30000);

ioTablet.on("connection", function (socket) {
  tabletLogs.push({
    message: "Tablet Server 2 connected to Client => id: " + socket.client.id,
    timeStamp: Date.now(),
  });

  //Tablet Server queries from Client
  let tabletNumber;

  //check on each id and send to the appropriate tablet
  socket.on("ReadRows", async function (ClientData) {
    if (MasterLock.isLocked()) {
      MasterRelease = await MasterLock.acquire();
      MasterRelease();
    }
    tabletLogs.push({
      message:
        "Client => id: " +
        socket.client.id +
        " requested data reterival of ids: " +
        ClientData.rowKeys +
        " from Tablet Server 2",
      timeStamp: Date.now(),
    });
    const data = await AnimeService.findRows(ClientData.rowKeys, 3);

    if (data.data.length == 0) {
      tabletLogs.push({
        message:
          "Client => id: " +
          socket.client.id +
          "requested data reterival => Error: Problem retrieving data from Tablet Server 2 " +
          data.myerr,
        timeStamp: Date.now(),
      });
    } else {
      tabletLogs.push({
        message:
          "Client => id: " +
          socket.client.id +
          " requested data reterival from Tablet Server 2 => Succeeded",
        timeStamp: Date.now(),
      });
    }
    socket.emit("ReadRowsResponse", data); ///tablet
  });

  socket.on("Set", async function (ClientData) {
    if (MasterLock.isLocked()) {
      MasterRelease = await MasterLock.acquire();
      MasterRelease();
    }
    tabletLogs.push({
      message:
        "Client => id: " +
        socket.client.id +
        " requested data update for id: " +
        ClientData.rowKey +
        " from Tablet Server 2",
      timeStamp: Date.now(),
    });

    const release = await MUtexTablet1.acquire();
    tabletLogs.push({
      message:
        "Client => id: " +
        socket.client.id +
        " acquired the lock from Tablet Server 2 to update row with id: " +
        ClientData.rowKey,
      timeStamp: Date.now(),
    });
    try {
      tabletNumber = await AnimeValidation.validateRowKey(ClientData.rowKey);
      const data = await AnimeService.updateAnime(
        ClientData.Anime,
        ClientData.rowKey,
        tabletNumber
      );
      if (!data.data) {
        tabletLogs.push({
          message:
            "Client => id: " +
            socket.client.id +
            " requested data update from Tablet Server 2 => Error: " +
            data.err,
          timeStamp: Date.now(),
        });
      } else {
        MasterUpdateD.push({ tabletId: tabletNumber, ids: ClientData.rowKey });
        tabletLogs.push({
          message:
            "Client => id: " +
            socket.client.id +
            " requested data update from Tablet Server 2 => Succeeded",
          timeStamp: Date.now(),
        });
      }
      socket.emit("SetResponse", data);
    } finally {
      release();
      tabletLogs.push({
        message:
          "Client => id: " +
          socket.client.id +
          " released the lock from Tablet Server 2",
        timeStamp: Date.now(),
      });
    }
  });

  socket.on("AddRow", async function (ClientData) {
    if (MasterLock.isLocked()) {
      MasterRelease = await MasterLock.acquire();
      MasterRelease();
    }

    tabletLogs.push({
      message:
        "Client => id: " +
        socket.client.id +
        " requested to add new rows to Tablet Server 2",
      timeStamp: Date.now(),
    });


    const release = await MUtexTablet1.acquire();
    await new Promise((resolve)=>setTimeout(resolve,3000));
    tabletLogs.push({
      message:
        "Client => id: " +
        socket.client.id +
        " acquired the lock from Tablet Server 2 to add rows",
      timeStamp: Date.now(),
    });
    try {
      const data = await AnimeService.createAnime(ClientData, 3);
      if (!data.data || data.data.length == 0) {
        tabletLogs.push({
          message:
            "Client => id: " +
            socket.client.id +
            " requested add new row to Tablet Server 2 => Error: " +
            data.err,
          timeStamp: Date.now(),
        });
      } else {
        const masterUpdateData = {
          tabletId: 3,
          updateType: "insert",
          ids: data.data,
        };
        socketMaster.emit("tablet-update", masterUpdateData);
        tabletLogs.push({
          message:
            "Client => id: " +
            socket.client.id +
            " requested add new row to master from Tablet Server 2 => Succeeded",
          timeStamp: Date.now(),
        });
        tabletLogs.push({
          message:
            "Client => id: " +
            socket.client.id +
            " requested add new row to Client from Tablet Server 2  => Succeeded , ids: " +
            data.data +
            " are added",
          timeStamp: Date.now(),
        });
      }
      socket.emit("AddRowResponse", data);
    } finally {
      release();
      tabletLogs.push({
        message:
          "Client => id: " +
          socket.client.id +
          " released the lock from Tablet Server 2",
        timeStamp: Date.now(),
      });
    }
  });

  socket.on("DeleteCells", async function (ClientData) {
    if (MasterLock.isLocked()) {
      MasterRelease = await MasterLock.acquire();
      MasterRelease();
    }
    tabletLogs.push({
      message:
        "Client => id: " +
        socket.client.id +
        " requested Delete Cells for id: " +
        ClientData.rowKey +
        " from Tablet Server 2",
      timeStamp: Date.now(),
    });
    const release = await MUtexTablet1.acquire();
    tabletLogs.push({
      message:
        "Client => id: " +
        socket.client.id +
        " acquired the lock for Deleting Cells for id: " +
        ClientData.rowKey +
        " from Tablet Server 2",
      timeStamp: Date.now(),
    });
    try {
      tabletNumber = await AnimeValidation.validateRowKey(ClientData.rowKey);
      const data = await AnimeService.deleteCells(
        ClientData.columnFamilies,
        ClientData.rowKey,
        tabletNumber
      );
      if (!data.data) {
        tabletLogs.push({
          message:
            "Client => id: " +
            socket.client.id +
            " requested Delete Cells from Tablet Server 2  => Error: " +
            data.err,
          timeStamp: Date.now(),
        });
      } else {
        MasterUpdateD.push({ tabletId: tabletNumber, ids: ClientData.rowKey });
        tabletLogs.push({
          message:
            "Client => id: " +
            socket.client.id +
            " requested Delete Cells from Tablet Server 2 => Succeeded",
          timeStamp: Date.now(),
        });
      }
      socket.emit("DeleteCellsResponse", data);
    } finally {
      release();
      tabletLogs.push({
        message:
          "Client => id: " +
          socket.client.id +
          " released the lock from Tablet Server 2",
        timeStamp: Date.now(),
      });
    }
  });

  socket.on("DeleteRow", async function (ClientData) {
    var before = new Date().getTime() / 1000;
    if (MasterLock.isLocked()) {
      MasterRelease = await MasterLock.acquire();
      MasterRelease();
    }
    tabletLogs.push({
      message:
        "Client => id: " +
        socket.client.id +
        " requested Delete Rows of ids: " +
        ClientData.rowKeys +
        " from Tablet Server 2",
      timeStamp: Date.now(),
    });
    const release = await MUtexTablet1.acquire();
    tabletLogs.push({
      message:
        "Client => id: " +
        socket.client.id +
        " acquired the lock on Tablet server 2 for deleting rows with ids: " +
        ClientData.rowKeys,
      timeStamp: Date.now(),
    });
    try {
      const data = await AnimeService.deleteRow(ClientData.rowKeys, 3);
      if (data.ids.length == 0) {
        tabletLogs.push({
          message:
            "Client => id: " +
            socket.client.id +
            " requested Delete Rows from Tablet Server 2  => Error: No Anime Was Deleted",
          timeStamp: Date.now(),
        });
      } else {
        const masterUpdateData = {
          tabletId: 3,
          updateType: "delete",
          ids: data.ids,
        };
        socketMaster.emit("tablet-update", masterUpdateData);
        tabletLogs.push({
          message:
            "Client => id: " +
            socket.client.id +
            " requested Delete Rows to master from Tablet Server 2 => Succeeded",
          timeStamp: Date.now(),
        });
        tabletLogs.push({
          message:
            "Client => id: " +
            socket.client.id +
            " requested Delete Rows to Client from Tablet Server 2  => Succeeded , rows with ids: " +
            data.ids +
            " was deleted",
          timeStamp: Date.now(),
        });
      }
      socket.emit("DeleteRowResponse", data);
    } finally {
      release();
      tabletLogs.push({
        message:
          "Client => id: " +
          socket.client.id +
          " released the lock from Tablet Server 2",
        timeStamp: Date.now(),
      });
    }
  });
});
