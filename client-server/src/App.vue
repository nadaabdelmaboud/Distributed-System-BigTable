<template>
  <div id="app">
    <!--Get anime-->
    <h2>Get Anime</h2>
    <div class="container clientForm">
      <form v-on:submit.prevent="ReadRowsSubmit">
        <div>
          <label for="getAnimeNumber">Anime Number</label>
          <input
            type="text"
            name="getAnimeNumber"
            v-model="getAnimeNumber"
            placeholder="Enter Anime Numbers you want to get separated by spaces"
            required
          />
        </div>
        <div v-for="anime in animes" :key="anime.anime_id">
          <div class="arrayItems">
            <div v-if="anime.anime_id">
              <h4>Anime Number</h4>
              <p>{{ anime.anime_id }}</p>
            </div>
            <div v-if="anime.name">
              <h4>Anime Name</h4>
              <p>{{ anime.name }}</p>
            </div>
            <div v-if="anime.genre">
              <h4>Anime Genre</h4>
              <p>{{ anime.genre }}</p>
            </div>
            <div v-if="anime.type">
              <h4>Anime Type</h4>
              <p>{{ anime.type }}</p>
            </div>
            <div v-if="anime.episodes">
              <h4>Anime Episodes</h4>
              <p>{{ anime.episodes }}</p>
            </div>
            <div v-if="anime.rating">
              <h4>Anime Rating</h4>
              <p>{{ anime.rating }}</p>
            </div>
            <div v-if="anime.members">
              <h4>Anime Members</h4>
              <p>{{ anime.members }}</p>
            </div>
          </div>
        </div>
        <div v-if="errors1.length != 0 || errors2.length != 0">
          <p>Error detected in row keys:</p>
          <div v-if="errors1.length != 0">
            <p>Tablet1 RowKey Errors:</p>
            <div v-for="error in errors1" :key="error" class="errorList">
              <div class="errorItems">
                <div>
                  {{ error }}
                </div>
              </div>
            </div>
          </div>
          <div v-if="errors2.length != 0">
            <p>Tablet2 RowKey Errors:</p>
            <div
              v-for="errorData in errors2"
              :key="errorData"
              class="errorList"
            >
              <div class="errorItems">
                <div>
                  {{ errorData }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <button type="submit">Get Animes</button>
        </div>
      </form>
    </div>
    <!--Set anime-->
    <h2>Update Anime</h2>
    <div class="container clientForm">
      <form id="SetForm" v-on:submit.prevent="SetSubmit">
        <div>
          <label for="updatedAnimeNumber">Anime Number</label>
          <input
            type="number"
            min="1"
            name="updatedAnimeNumber"
            v-model="updatedAnimeNumber"
            id="updateInput"
            placeholder="Enter Anime Number"
            required
          />
        </div>
        <div>
          <label for="updatedAnimeName">Anime Name</label>
          <input
            type="text"
            name="updatedAnimeName"
            v-model="updatedAnimeName"
            placeholder="Enter Anime Name"
            id="updateInput"
          />
        </div>
        <div>
          <label for="updatedAnimeGenre">Anime Genre</label>
          <input
            type="text"
            name="updatedAnimeGenre"
            v-model="updatedAnimeGenre"
            placeholder="Enter Anime Genre"
            id="updateInput"
          />
        </div>
        <div>
          <label for="updatedAnimeType">Anime Type</label>
          <input
            type="text"
            name="updatedAnimeType"
            v-model="updatedAnimeType"
            placeholder="Enter Anime Type"
            id="updateInput"
          />
        </div>
        <div>
          <label for="updatedAnimeEpisodes">Anime Episodes</label>
          <input
            type="text"
            name="updatedAnimeEpisodes"
            v-model="updatedAnimeEpisodes"
            placeholder="Enter Anime Episodes"
            id="updateInput"
          />
        </div>
        <div>
          <label for="updatedAnimeRating">Anime Rating</label>
          <input
            type="text"
            name="updatedAnimeRating"
            v-model="updatedAnimeRating"
            placeholder="Enter Anime Rating"
            id="updateInput"
          />
        </div>
        <div>
          <label for="updatedAnimeMembers">Anime Members</label>
          <input
            type="text"
            name="updatedAnimeMembers"
            v-model="updatedAnimeMembers"
            placeholder="Enter Anime Members"
            id="updateInput"
          />
        </div>
        <div>
          <button type="submit">Update Anime</button>
        </div>
      </form>
    </div>
    <!--Add new anime-->
    <h2>Add new Anime</h2>
    <div class="container clientForm">
      <form id="AddForm" v-on:submit.prevent="addMultipleAnimes">
        <div>
          <label for="addAnimeName">Anime Name</label>
          <input
            type="text"
            name="addAnimeName"
            v-model="addAnimeName"
            placeholder="Enter Anime Name"
            id="addInput"
            required
          />
        </div>
        <div>
          <label for="addAnimeGenre">Anime Genre</label>
          <input
            type="text"
            name="addAnimeGenre"
            v-model="addAnimeGenre"
            placeholder="Enter Anime Genre"
            id="addInput"
            required
          />
        </div>
        <div>
          <label for="addAnimeType">Anime Type</label>
          <input
            type="text"
            name="addAnimeType"
            v-model="addAnimeType"
            placeholder="Enter Anime Type"
            id="addInput"
            required
          />
        </div>
        <div>
          <label for="addAnimeEpisodes">Anime Episodes</label>
          <input
            type="text"
            name="addAnimeEpisodes"
            v-model="addAnimeEpisodes"
            placeholder="Enter Anime Episodes"
            id="addInput"
            required
          />
        </div>
        <div>
          <label for="addAnimeRating">Anime Rating</label>
          <input
            type="text"
            name="addAnimeRating"
            v-model="addAnimeRating"
            placeholder="Enter Anime Rating"
            id="addInput"
            required
          />
        </div>
        <div>
          <label for="addAnimeMembers">Anime Members</label>
          <input
            type="text"
            name="addAnimeMembers"
            v-model="addAnimeMembers"
            placeholder="Enter Anime Members"
            id="addInput"
            required
          />
        </div>
        <div>
          <button @click="AddRowSubmit()">Submit</button>
           <button type="submit">Add Animes</button>
        </div>
      </form>
      
    </div>
    <!--Delete anime-->
    <h2>Delete Anime</h2>
    <div class="container clientForm">
      <form action="" id="DeleteRowForm" v-on:submit.prevent="DeleteRowSubmit">
        <div>
          <label for="deletedAnimeNumber">Anime Number</label>
          <input
            type="text"
            name="deletedAnimeNumber"
            v-model="deletedAnimeNumber"
            placeholder="Enter Anime Number"
            required
          />
        </div>

       <div v-if="errorsInDelete1.length != 0 || errorsInDelete2.length != 0">
          <p>Error detected while deleting rows of id:</p>
          <div v-if="errorsInDelete1.length != 0">
            <p>Tablet1 RowKey Errors:</p>
            <div v-for="error in errorsInDelete1" :key="error" class="errorList">
              <div class="errorItems">
                <div>
                  {{ error }}
                </div>
              </div>
            </div>
          </div>
          <div v-if="errorsInDelete2.length != 0">
            <p>Tablet2 RowKey Errors:</p>
            <div
              v-for="errorID in errorsInDelete2"
              :key="errorID"
              class="errorList"
            >
              <div class="errorItems">
                <div>
                  {{ errorID }}
                </div>
              </div>
            </div>
          </div>
        </div>


        <div>
          <button type="submit">Delete Anime</button>
        </div>
      </form>
    </div>
    <br />

    <!--Delete column family of certain anime-->
    <h2>Delete column family of certain Anime</h2>
    <div class="container clientForm">
      <form
        action=""
        id="DeleteColumnFAmilyForm"
        v-on:submit.prevent="DeleteCellsSubmit"
      >
        <div>
          <label for="deletedFamilyAnimeNumber">Anime Number</label>
          <input
            type="text"
            name="deletedFamilyAnimeNumber"
            v-model="deletedFamilyAnimeNumber"
            placeholder="Enter Anime Number"
            required
          />
        </div>
        <div>
          <h3>Choose Column Families:</h3>
          <br />
          <div>
            <input
              type="checkbox"
              name="animeName"
              v-model="animeName"
              value="Anime Name"
              id="check"
            />
            <label for="Anime Name">Anime Name</label>
          </div>
          <div>
            <input
              type="checkbox"
              name="animeGenre"
              v-model="animeGenre"
              value="Anime Genre"
              id="check"
            />
            <label for="Anime Genre">Anime Genre</label>
          </div>
          <div>
            <input
              type="checkbox"
              name="animeType"
              v-model="animeType"
              value="Anime Type"
              id="check"
            />
            <label for="Anime Type">Anime Type</label>
          </div>
          <div>
            <input
              type="checkbox"
              name="animeEpisodes"
              v-model="animeEpisodes"
              value="Anime Episodes"
              id="check"
            />
            <label for="Anime Episodes">Anime Episodes</label>
          </div>
          <div>
            <input
              type="checkbox"
              name="animeRating"
              v-model="animeRating"
              value="Anime Rating"
              id="check"
            />
            <label for="Anime Rating">Anime Rating</label>
          </div>
          <div>
            <input
              type="checkbox"
              name="animeMembers"
              v-model="animeMembers"
              value="Anime Members"
              id="check"
            />
            <label for="Anime Members">Anime Members</label>
          </div>
        </div>
        <div>
          <button type="submit">Delete Anime Columns</button>
        </div>
      </form>
    </div>
    <div class="toast" id="toastId">
      <div class="requestFinished">{{ messageToast }}</div>
    </div>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
h2 {
  color: #2c3e50;
}
h3 {
  margin-bottom: 0;
}
#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

.container {
  border: 2px solid #2c3e50;
}

label {
  width: 150px;
  padding: 20px;
  font-weight: 700;
  display: inline-block;
}
div {
  margin: 20px;
}
button {
  width: 15%;
  height: 37px;
  background-color: #2c3e50;
  color: white;
  border: none;
  cursor: pointer;
  transition: 0.5s ease-in-out;
  margin: 20px;
}
button:active {
  transform: scale(0.89);
}
input {
  width: 40%;
  height: 30px;
}
.arrayItems {
  border: 2px solid #2c3e50;
  margin: 0;
}
.errorList {
  display: inline-block;
  margin:0;
}
#check {
  margin: 0;
  width: 20px;
}
#errorMessage {
  color: red;
}
.toast {
  display: flex;
  align-content: center;
  text-align: center;
  visibility: hidden;
  color: white;
  text-align: center;
  justify-content: center;
  font-size: 20px;
  opacity: 0;
  position: fixed;
  bottom: 2%;
  left: 30%;
  margin-right: auto;
  width: 40%;
  background-color: #2c3e50;
  padding: 5px;
  z-index: 1500;
  box-shadow: 0 0 10 #2c3e50;
  transition: 0.5s ease-in-out;
}
.toast--visible {
  visibility: visible;
  opacity: 1;
}
</style>

<script>
import io from "socket.io-client";
export default {
  data: function () {
    return {
      socketMaster: "",
      metaData: "",
      socketTablet1: "",
      socketTablet2: "",
      updatedAnimeNumber: "",
      updatedAnimeName: "",
      updatedAnimeGenre: "",
      updatedAnimeType: "",
      updatedAnimeEpisodes: "",
      updatedAnimeRating: "",
      updatedAnimeMembers: "",
      addAnimeName: "",
      addAnimeGenre: "",
      addAnimeType: "",
      addAnimeEpisodes: "",
      addAnimeRating: "",
      addAnimeMembers: "",
      deletedAnimeNumber: "",
      deletedFamilyAnimeNumber: "",
      selected: "",
      getAnimeNumber: "",
      animes: [],
      animeName: "",
      animeGenre: "",
      animeType: "",
      animeEpisodes: "",
      animeRating: "",
      animeMembers: "",
      clientLogs: [],
      messageToast: "",
      addAnimes: [],
      port: "",
      errors1: [],
      errors2: [],
      errorsInDelete1:[],
      errorsInDelete2:[]
    };
  },
  beforeDestroy() {
    this.clientLogs.push({
      message: `Client (${this.port}) is disconnecting `,
      timeStamp: Date.now(),
    });
    this.socketMaster.emit("clientLogs", this.clientLogs);
  },
  created() {
    //starting tablet socket connection
    var p = window.location.href;
    this.port = p.substring(p.length - 5, p.length - 1);
    this.socketTablet1 = io.connect("https://tabletserver1-os.herokuapp.com/", {
      transports: ["websocket"],
    });
    this.clientLogs.push({
      message: `Client (${this.port}) is Connecting to tablet`,
      timeStamp: Date.now(),
    });
    this.socketTablet2 = io.connect("https://tabletserver2-os.herokuapp.com/", {
      transports: ["websocket"],
    });
    //starting master socket connection
    this.socketMaster = io.connect("https://master-os.herokuapp.com/", {
      transports: ["websocket"],
    });
    this.clientLogs.push({
      message: `Client (${this.port}) Connected to master`,
      timeStamp: Date.now(),
    });
    //Add listeners here
    //get Meta Data
    this.socketMaster.emit("source", "client");
    this.socketMaster.on("GetMetaData", (data) => {
      this.metaData = data;
      this.clientLogs.push({
        message: `Client (${this.port}) Got metadata successfully`,
        metaData: data,
        timeStamp: Date.now(),
      });
    });
    //Tablet 2 listeners
    //Set
    this.socketTablet2.on("SetResponse", (UpdateData) => {
      if (UpdateData.data == false) {
        this.showToast();
        this.messageToast = UpdateData.err;
      } else {
        this.showToast();
        this.messageToast =
          "Updating row of id: " +
          UpdateData.data.anime_id +
          " is done successfully";
          this.clientLogs.push({
          message: `Client (${this.port}) :  Updated data successfully`,
          UpdateData: UpdateData,
          timeStamp: Date.now(),
        });
      }

      this.updatedAnimeNumber = "";
      this.updatedAnimeName = "";
      this.updatedAnimeGenre = "";
      this.updatedAnimeType = "";
      this.updatedAnimeEpisodes = "";
      this.updatedAnimeRating = "";
      this.updatedAnimeMembers = "";

      
    });
    // //Delete cells
    this.socketTablet2.on("DeleteCellsResponse", (DeleteCells) => {
      if (DeleteCells.data == false) {
        this.showToast();
        this.messageToast = DeleteCells.err;
      } else {
        this.showToast();
        this.messageToast = "Selected cells are deleted successfully";
        this.clientLogs.push({
          message: `Client (${this.port}) : Delete cells finished successfully`,
          DeleteCells: DeleteCells,
          timeStamp: Date.now(),
        });
      }

      this.deletedFamilyAnimeNumber = "";
      this.animeName = "";
      this.animeGenre = "";
      this.animeType = "";
      this.animeEpisodes = "";
      this.animeRating = "";
      this.animeMembers = "";
    });
    // //Delete Row
    this.socketTablet2.on("DeleteRowResponse", (DeleteRow) => {
      if (DeleteRow.err.length != 0) {
        this.errorsInDelete2 = DeleteRow.err;
      } else {
        this.showToast();
        this.messageToast = "Rows are deleted successfully";
        this.clientLogs.push({
          message: `Client (${this.port}) : Delete row finished successfully`,
          DeleteRow: DeleteRow,
          timeStamp: Date.now(),
        });
      }
      this.deletedAnimeNumber = "";
    });
    // //Add Row
    this.socketTablet2.on("AddRowResponse", (CreateRow) => {
      if (CreateRow.data == false) {
        this.showToast();
        this.messageToast = CreateRow.err;
      } else {
        let outOfRange = [];
        for (let i = 0; i < CreateRow.data.length; i++) {
          outOfRange.push(CreateRow.data[i]);
        }

        if (outOfRange.length != 0) {
          this.showToast();
          this.messageToast = "Rows of id: ";
          let len = outOfRange.length;
          for (let i = 0; i < len - 1; i++) {
            this.messageToast = this.messageToast + outOfRange[i] + ", ";
          }
          this.messageToast =
            this.messageToast + outOfRange[len - 1] + " are added successfully";
        }
        outOfRange = [];
        this.clientLogs.push({
          message: `Client (${this.port}) : Row is added successfully`,
          CreateRow: CreateRow,
          timeStamp: Date.now(),
        });
      }

      this.addAnimeName = "";
      this.addAnimeGenre = "";
      this.addAnimeType = "";
      this.addAnimeEpisodes = "";
      this.addAnimeRating = "";
      this.addAnimeMembers = "";

    });
    // //Read Row
    this.socketTablet2.on("ReadRowsResponse", (data) => {
      var dataBack = data.data;
      if (data.err.length != 0) {
        this.errors2 = data.err;
      }
      if (dataBack.length != 0) {
        for (var a in dataBack) {
          this.animes.push(dataBack[a]);
        }
      }
      this.clientLogs.push({
        message: `Client (${this.port}) : Data retrieved successfully`,
        RowRead: data,
        timeStamp: Date.now(),
      });
    });

    //Tablet 1 listeners
    //Set
    this.socketTablet1.on("SetResponse", (UpdateData) => {
      if (UpdateData.data == false) {
        this.showToast();
        this.messageToast = UpdateData.err;
      } else {
        this.showToast();
        this.messageToast =
          "Updating row of id: " +
          UpdateData.data.anime_id +
          " is done successfully";
          this.clientLogs.push({
        message: `Client (${this.port}) :  Updated data successfully`,
        UpdateData: UpdateData,
        timeStamp: Date.now(),
      });
      }

      this.updatedAnimeNumber = "";
      this.updatedAnimeName = "";
      this.updatedAnimeGenre = "";
      this.updatedAnimeType = "";
      this.updatedAnimeEpisodes = "";
      this.updatedAnimeRating = "";
      this.updatedAnimeMembers = "";

    });
    //Delete cells
    this.socketTablet1.on("DeleteCellsResponse", (DeleteCells) => {
      if (DeleteCells.data == false) {
        this.showToast();
        this.messageToast = DeleteCells.err;
      } else {
        this.showToast();
        this.messageToast = "Selected cells are deleted successfully";
        this.clientLogs.push({
          message: `Client (${this.port}) : Delete cells finished successfully`,
          DeleteCells: DeleteCells,
          timeStamp: Date.now(),
        });
      }

      
      this.deletedFamilyAnimeNumber = "";
      this.animeName = "";
      this.animeGenre = "";
      this.animeType = "";
      this.animeEpisodes = "";
      this.animeRating = "";
      this.animeMembers = "";
    });
    //Delete Row
    this.socketTablet1.on("DeleteRowResponse", (DeleteRow) => {
      if (DeleteRow.err.length != 0) {
        this.errorsInDelete1 = DeleteRow.err;
      } else {
        this.showToast();
        this.messageToast = "Rows are deleted successfully";
        this.clientLogs.push({
        message: `Client (${this.port}) : Delete row finished successfully`,
        DeleteRow: DeleteRow,
        timeStamp: Date.now(),
      });
      }

      
      this.deletedAnimeNumber = "";
    });
    
    //Read Row
    this.socketTablet1.on("ReadRowsResponse", (data) => {
      var dataBack = data.data;
      if (data.err.length != 0) {
        this.errors1 = data.err;
      }
      if (dataBack.length != 0) {
        for (var a in dataBack) {
          this.animes.push(dataBack[a]);
        }
      }
      this.clientLogs.push({
        message: `Client (${this.port}) : Data retrieved successfully`,
        RowRead: data,
        timeStamp: Date.now(),
      });
    });

    //Sending Client Logs to Master and Flushing this Logs
    //each five minutes
    setInterval(() => {
      if (this.clientLogs.length) {
        this.socketMaster.emit("clientLogs", this.clientLogs);
        this.clientLogs = [];
      }
    }, 3000);
  },
  methods: {
    showToast() {
      var mytoast = document.getElementById("toastId");
      clearTimeout(mytoast.hideTimeout);
      mytoast.className = "toast toast--visible";
      mytoast.hideTimeout = setTimeout(() => {
        mytoast.classList.remove("toast--visible");
      }, 10000);
    },
    addMultipleAnimes() {
      var CreateRow = {
        name: this.addAnimeName,
        genre: this.addAnimeGenre,
        type: this.addAnimeType,
        episodes: this.addAnimeEpisodes,
        rating: this.addAnimeRating,
        members: this.addAnimeMembers,
      };

      this.addAnimes.push(CreateRow);

      this.addAnimeName = "";
      this.addAnimeGenre = "";
      this.addAnimeType = "";
      this.addAnimeEpisodes = "";
      this.addAnimeRating = "";
      this.addAnimeMembers = "";
    },
    ///////
    validateRowKey(rowKey) {
      var anime_id = parseInt(rowKey);
      var start1 = this.metaData.tablet1KeyRange.start;
      var end1 = this.metaData.tablet1KeyRange.end;
      var start2 = this.metaData.tablet2KeyRange.start;
      var end2 = this.metaData.tablet2KeyRange.end;
      var start3 = this.metaData.tablet3KeyRange.start;
      var end3 = this.metaData.tablet3KeyRange.end;
      if (anime_id >= start1 && anime_id <= end1) return 1;
      else if (anime_id >= start2 && anime_id <= end2) return 2;
      else if (anime_id >= start3 && anime_id <= end3) return 3;
      else return -1;
    },
    SetSubmit() {
      var UpdateData = {
        Anime: {
          name: this.updatedAnimeName,
          genre: this.updatedAnimeGenre,
          type: this.updatedAnimeType,
          episodes: this.updatedAnimeEpisodes,
          rating: this.updatedAnimeRating,
          members: this.updatedAnimeMembers,
        },
        rowKey: this.updatedAnimeNumber,
      };
      for (var propName in UpdateData.Anime) {
        if (UpdateData.Anime[propName] == "") {
          delete UpdateData.Anime[propName];
        }
      }
      const tNum = this.validateRowKey(UpdateData.rowKey);
      if (tNum == 1 || tNum == 2) this.socketTablet1.emit("Set", UpdateData);
      if (tNum == 3) this.socketTablet2.emit("Set", UpdateData);
      let t;
      if (tNum == 1 || tNum == 2) t = 1;
      else t = 2;
      if (tNum == -1) {
        this.showToast();
        this.messageToast =
          "Row of id: " + UpdateData.rowKey + " is not in range";
      }

      this.clientLogs.push({
        message: `Client (${this.port}) : Sending request to update data`,
        TabletRequesed: t,
        timeStamp: Date.now(),
      });
    },
    ReadRowsSubmit() {
      this.errors1 = [];
      this.errors2 = [];
      var rowKeys = this.getAnimeNumber.split(" ");
      let tablet1Rows = [],
        tablet2Rows = [];
      let outOfRange = [];


      for (let i = 0; i < rowKeys.length; i++) {
        let t = this.validateRowKey(rowKeys[i]);
        if (t == 1 || t == 2) tablet1Rows.push(rowKeys[i]);
        else if (t == 3) tablet2Rows.push(rowKeys[i]);
        if (t == -1) {
          if(rowKeys[i] != "")
            outOfRange.push(rowKeys[i]);
        }
      }
      if (outOfRange.length != 0) {
        this.showToast();
        this.messageToast = "Rows of id: ";
        let len = outOfRange.length;
        for (let i = 0; i < len - 1; i++) {
          this.messageToast = this.messageToast + outOfRange[i] + ", ";
        }
        this.messageToast =
          this.messageToast + outOfRange[len - 1] + " not in range";
        outOfRange = [];
      }

      let data1 = {
        rowKeys: tablet1Rows,
      };
      ///add TNum

      let data2 = {
        rowKeys: tablet2Rows,
      };
      if (data1.rowKeys.length) {
        this.socketTablet1.emit("ReadRows", data1);
        this.clientLogs.push({
          message:
            "Sending request to Tablet Server 1 retrieve rows with ids: " +
            data1.rowKeys,
          timeStamp: Date.now(),
        });
      }

      if (data2.rowKeys.length) {
        this.socketTablet2.emit("ReadRows", data2);
        this.clientLogs.push({
          message:
            "Sending request to Tablet Server 2 retrieve rows with ids: " +
            data2.rowKeys,
          timeStamp: Date.now(),
        });
      }

      this.animes = [];
    },
    AddRowSubmit() {
      if(this.addAnimes.length != 0){
        this.socketTablet2.emit("AddRow", this.addAnimes);
        this.addAnimes = [];
        this.clientLogs.push({
          message: `Client (${this.port}) : Sending request to add new row to Tablet Server 2`,
          timeStamp: Date.now(),
        });
      }
      else{
        this.showToast();
        this.messageToast = "please add at least one object by pressing on Add Animes button";
      }
    },
    DeleteCellsSubmit() {
      var DeleteCells = {
        columnFamilies: [],
        rowKey: this.deletedFamilyAnimeNumber,
      };
      if (this.animeName) DeleteCells.columnFamilies.push("name");
      if (this.animeGenre) DeleteCells.columnFamilies.push("genre");
      if (this.animeType) DeleteCells.columnFamilies.push("type");
      if (this.animeEpisodes) DeleteCells.columnFamilies.push("episodes");
      if (this.animeRating) DeleteCells.columnFamilies.push("rating");
      if (this.animeMembers) DeleteCells.columnFamilies.push("members");
      const tNum = this.validateRowKey(DeleteCells.rowKey);
      if (tNum == 1 || tNum == 2)
        this.socketTablet1.emit("DeleteCells", DeleteCells);
      if (tNum == 3) this.socketTablet2.emit("DeleteCells", DeleteCells);
      let t;
      if (tNum == 1 || tNum == 2) t = 1;
      else t = 2;
      if (tNum == -1) {
        this.showToast();
        this.messageToast =
          "Row of id: " + DeleteCells.rowKey + " is not in range";
      }

      this.clientLogs.push({
        message: `Client (${this.port}) : Sending request to delete cells from rows Tablet Server ${t}`,
        timeStamp: Date.now(),
      });
    },
    DeleteRowSubmit() {
      this.errorsInDelete1 = [];
      this.errorsInDelete2 = [];
      var rowKeys = this.deletedAnimeNumber.split(" ");
      let tablet1Rows = [],
        tablet2Rows = [];
      let outOfRange = [];

      for (let i = 0; i < rowKeys.length; i++) {
        let t = this.validateRowKey(rowKeys[i]);
        if (t == 1 || t == 2) tablet1Rows.push(rowKeys[i]);
        else if (t == 3) tablet2Rows.push(rowKeys[i]);
        if (t == -1) {
          if(rowKeys[i] != "")
            outOfRange.push(rowKeys[i]);
        }
      }

      if (outOfRange.length != 0) {
        this.showToast();
        this.messageToast = "Rows of id: ";
        let len = outOfRange.length;
        for (let i = 0; i < len - 1; i++) {
          this.messageToast = this.messageToast + outOfRange[i] + ", ";
        }
        this.messageToast =
          this.messageToast + outOfRange[len - 1] + " not in range";
        outOfRange = [];
      }
      //this.errorDetected = false;

      let data1 = {
        rowKeys: tablet1Rows,
      };
      ///add TNum

      let data2 = {
        rowKeys: tablet2Rows,
      };
      if (data1.rowKeys.length) {
        this.socketTablet1.emit("DeleteRow", data1);
        this.clientLogs.push({
          message:
            `Client (${this.port}) : Sending request to delete row from data ` +
            data1.rowKeys,
          timeStamp: Date.now(),
        });
      }

      if (data2.rowKeys.length) {
        this.socketTablet2.emit("DeleteRow", data2);
        this.clientLogs.push({
          message:
            `Client (${this.port}) : Sending request to delete row from data ` +
            data2.rowKeys,
          timeStamp: Date.now(),
        });
      }
    },
  },
};
</script>
