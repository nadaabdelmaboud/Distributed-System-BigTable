const AnimeService = require("./anime.service.js");
const AnimeValidation = require("./anime.validation");
let metaData = require("./tabletMetaData.js");
const express = require("express");
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
const Tablet1_PORT = 8000;
const PORT = process.env.PORT || Tablet1_PORT;
const server = express()
  .get("/", (req, res) => res.send("HELLO FROM Tablet-Server 1"))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
var ioTablet = require("socket.io")(server);

tabletLogs.push({
  message: "Tablet Server 1 Listening to Client...",
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
      message: "Tablet Server 1 recieved metadata from master",
      metaData: data,
      timeStamp: Date.now(),
    });
  });

  //Balance
  socketMaster.on("Balance", async () => {
    console.log("hello");
    if(MasterLock.isLocked()){
      return ;
    }
    tabletLogs.push({
      message: "Tablet Server 1 blocked Requests as master is balancing",
      timeStamp: Date.now(),
    });
    MasterRelease = await MasterLock.acquire();
  });

  socketMaster.on("End-Balance", () => {
    if(!MasterLock.isLocked()){
      return ;
    }
    console.log("hello-end");
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
  tabletLogs.push({
    message: "Tablet Server 1 connected to Client => id: " + socket.client.id,
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
        " from Tablet Server 1",
      timeStamp: Date.now(),
    });
    const ids = await AnimeValidation.seperateId(ClientData.rowKeys);
    const data1 = await AnimeService.findRows(ids.ids1, 1);
    const data2 = await AnimeService.findRows(ids.ids2, 2);
    let ok1 = 1;
    let ok2 = 1;
    if (data1.data.length == 0 && ids.ids1!=0) {
      ok1 = 0;
      tabletLogs.push({
        message:
          "Client => id: " +
          socket.client.id +
          " requested data reterival => Error: Problem retrieving data from Tablet Server 1 Tablet 1",
        timeStamp: Date.now(),
      });
    }
    if (data2.data.length == 0 && ids.ids2!=0) {
      ok2 = 0;
      tabletLogs.push({
        message:
          "Client => id: " +
          socket.client.id +
          " requested data reterival => Error: Problem retrieving data from Tablet Server 1 Tablet 2",
        timeStamp: Date.now(),
      });
    }
    var data = {};
    data.data =
      data1.data.length != 0 && data2.data.length != 0
        ? data1.data.concat(data2.data)
        : data1.data.length != 0
        ? data1.data
        : data2.data;
    data.err =
      data1.err.length != 0 && data2.err.length != 0
        ? data1.err.concat(data2.err)
        : data1.err.length != 0
        ? data1.err
        : data2.err;
    if (ok1 && ok2) {
      tabletLogs.push({
        message:
          "Client => id: " +
          socket.client.id +
          " requested data reterival from Tablet Server 1 => Succeeded",
        timeStamp: Date.now(),
      });
    }
    socket.emit("ReadRowsResponse", data);
  });

  socket.on("Set", async function (ClientData) {
    if (MasterLock.isLocked()) {
      MasterRelease = await MasterLock.acquire();
      MasterRelease();
    }
    tabletNumber = await AnimeValidation.validateRowKey(ClientData.rowKey);
    tabletLogs.push({
      message:
        "Client => id: " +
        socket.client.id +
        " requested data update for id: " +
        ClientData.rowKey +
        " from Tablet Server 1 Tablet " +
        tabletNumber,
      timeStamp: Date.now(),
    });

    let release;
    if (tabletNumber == 1) {
      release = await MUtexTablet1.acquire();
    } else {
      release = await MUtexTablet2.acquire();
    }

    tabletLogs.push({
      message:
        "Client => id: " +
        socket.client.id +
        " acquired the lock from Tablet Server 1 Tablet " +
        tabletNumber +
        " to update row with id: " +
        ClientData.rowKey,
      timeStamp: Date.now(),
    });
    try {
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
            " requested data update from Tablet Server 1 => Error: " +
            data.err,
          timeStamp: Date.now(),
        });
      } else {
        MasterUpdateD.push({ tabletId: tabletNumber, ids: ClientData.rowKey });
        tabletLogs.push({
          message:
            "Client => id: " +
            socket.client.id +
            " requested data update from Tablet Server 1 => Succeeded",
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
          " released the lock from Tablet Server 1 Tablet " +
          tabletNumber,
        timeStamp: Date.now(),
      });
    }
  });

  socket.on("DeleteCells", async function (ClientData) {
    var before = new Date().getTime() / 1000;
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
        " from Tablet Server 1",
      timeStamp: Date.now(),
    });

    tabletNumber = await AnimeValidation.validateRowKey(ClientData.rowKey);
    let release;
    if (tabletNumber == 1) release = await MUtexTablet1.acquire();
    else release = await MUtexTablet2.acquire();
    tabletLogs.push({
      message:
        "Client => id: " +
        socket.client.id +
        " acquired the lock for Deleting Cells for id: " +
        ClientData.rowKey +
        " from Tablet Server 1 Tablet " +
        tabletNumber,
      timeStamp: Date.now(),
    });

    try {
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
            " requested Delete Cells for id: " +
            ClientData.rowKey +
            " from Tablet Server 1 Tablet " +
            tabletNumber +
            "  => Error: " +
            data.err,
          timeStamp: Date.now(),
        });
      } else {
        MasterUpdateD.push({ tabletId: tabletNumber, ids: ClientData.rowKey });
        tabletLogs.push({
          message:
            "Client => id: " +
            socket.client.id +
            " requested Delete Cells for id: " +
            ClientData.rowKey +
            " from Tablet Server 1 Tablet " +
            tabletNumber +
            " => Succeeded",
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
          " released the lock from Tablet Server 1 Tablet " +
          tabletNumber,
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
        " requested Delete Rows with ids: " +
        ClientData.rowKeys +
        " from Tablet Server 1",
      timeStamp: Date.now(),
    });

    const ids = await AnimeValidation.seperateId(ClientData.rowKeys);
    let data1 = { err: [] };
    let data2 = { err: [] };

    if (ids.ids1.length != 0) {
      const release = await MUtexTablet1.acquire();
      tabletLogs.push({
        message:
          "Client => id: " +
          socket.client.id +
          " acquired the lock on Tablet Server 1 Tablet 1 for deleting rows with ids: " +
          ids.ids1,
        timeStamp: Date.now(),
      });
      try {
        data1 = await AnimeService.deleteRow(ids.ids1, 1);
        if (data1.ids.length == 0) {
          tabletLogs.push({
            message:
              "Client => id: " +
              socket.client.id +
              " requested Delete Row from Tablet Server 1 Tablet 1 => Error: No Anime Was Deleted",
            timeStamp: Date.now(),
          });
        } else {
          const masterUpdateData = {
            tabletId: 1,
            updateType: "delete",
            ids: data1.ids,
          };
          socketMaster.emit("tablet-update", masterUpdateData);
          tabletLogs.push({
            message:
              "Client => id: " +
              socket.client.id +
              " requested Delete Row to master from Tablet Server 1 Tablet 1 => Succeeded",
            timeStamp: Date.now(),
          });
        }
      } finally {
        release();
        tabletLogs.push({
          message:
            "Client => id: " +
            socket.client.id +
            " released the lock from Tablet Server 1 Tablet 1",
          timeStamp: Date.now(),
        });
      }
    }

    if (ids.ids2.length != 0) {
      const release = await MUtexTablet2.acquire();
      tabletLogs.push({
        message:
          "Client => id: " +
          socket.client.id +
          " acquired the lock on Tablet server 1 tablet 2 for deleting rows with ids: " +
          ids.ids2,
        timeStamp: Date.now(),
      });
      try {
        data2 = await AnimeService.deleteRow(ids.ids2, 2);
        if (data2.ids.length == 0) {
          tabletLogs.push({
            message:
              "Client => id: " +
              socket.client.id +
              " requested Delete Rows from Tablet Server 1 Tablet 2 => Error: No Anime Was Deleted",
            timeStamp: Date.now(),
          });
        } else {
          const masterUpdateData = {
            tabletId: 2,
            updateType: "delete",
            ids: data2.ids,
          };
          socketMaster.emit("tablet-update", masterUpdateData);
          tabletLogs.push({
            message:
              "Client => id: " +
              socket.client.id +
              " requested Delete Rows to master from Tablet Server 1 Tablet 2 => Succeeded",
            timeStamp: Date.now(),
          });
        }
      } finally {
        release();
        tabletLogs.push({
          message:
            "Client => id: " +
            socket.client.id +
            " released the lock on Tablet Server 1 Tablet 2",
          timeStamp: Date.now(),
        });
      }
    }
    if (ids.ids1.length == 0 && ids.ids2.length == 0) {
      tabletLogs.push({
        message:
          "Client => id: " +
          socket.client.id +
          " requested Delete Rows to Client from Tablet Server 1 Tablet 2 => Error : No Key Rows Exists in Tablet Server 1",
        timeStamp: Date.now(),
      });
      socket.emit("DeleteRowResponse", { err: ClientData.rowKeys });
      return;
    }
    var data = {};
    data.err =
      data1.err.length != 0 && data2.err.length != 0
        ? data1.err.concat(data2.err)
        : data1.err.length != 0
        ? data1.err
        : data2.err;
    tabletLogs.push({
      message:
        "Client => id: " +
        socket.client.id +
        " requested Delete Rows to Client from Tablet Server 1  => Succeeded",
      timeStamp: Date.now(),
    });
    socket.emit("DeleteRowResponse", data);
  });
});
