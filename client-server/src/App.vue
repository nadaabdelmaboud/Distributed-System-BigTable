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
            value="Enter Anime Numbers you want to get separated by spaces"
            required
          />
        </div>
        <!-- <div v-if="animes.length == 0">
          <p id="errorMessage">Not Found</p>
        </div> -->
        <div v-for="anime in animes" :key="anime.anime_id">
          <div class="arrayItems">
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
            value="Enter Anime Number"
            required
          />
        </div>
        <div>
          <label for="updatedAnimeName">Anime Name</label>
          <input
            type="text"
            name="updatedAnimeName"
            v-model="updatedAnimeName"
            value="Enter Anime Name"
          />
        </div>
        <div>
          <label for="updatedAnimeGenre">Anime Genre</label>
          <input
            type="text"
            name="updatedAnimeGenre"
            v-model="updatedAnimeGenre"
            value="Enter Anime Genre"
          />
        </div>
        <div>
          <label for="updatedAnimeType">Anime Type</label>
          <input
            type="text"
            name="updatedAnimeType"
            v-model="updatedAnimeType"
            value="Enter Anime Type"
          />
        </div>
        <div>
          <label for="updatedAnimeEpisodes">Anime Episodes</label>
          <input
            type="text"
            name="updatedAnimeEpisodes"
            v-model="updatedAnimeEpisodes"
            value="Enter Anime Episodes"
          />
        </div>
        <div>
          <label for="updatedAnimeRating">Anime Rating</label>
          <input
            type="text"
            name="updatedAnimeRating"
            v-model="updatedAnimeRating"
            value="Enter Anime Rating"
          />
        </div>
        <div>
          <label for="updatedAnimeMembers">Anime Members</label>
          <input
            type="text"
            name="updatedAnimeMembers"
            v-model="updatedAnimeMembers"
            value="Enter Anime Members"
          />
        </div>
        <div>
          <button type="submit">Updata Anime</button>
        </div>
      </form>
    </div>
    <!--Add new anime-->
    <h2>Add new Anime</h2>
    <div class="container clientForm">
      <form id="AddForm" v-on:submit.prevent="AddRowSubmit">
        <div>
          <label for="addAnimeName">Anime Name</label>
          <input
            type="text"
            name="addAnimeName"
            v-model="addAnimeName"
            value="Enter Anime Name"
            required
          />
        </div>
        <div>
          <label for="addAnimeGenre">Anime Genre</label>
          <input
            type="text"
            name="addAnimeGenre"
            v-model="addAnimeGenre"
            value="Enter Anime Genre"
            required
          />
        </div>
        <div>
          <label for="addAnimeType">Anime Type</label>
          <input
            type="text"
            name="addAnimeType"
            v-model="addAnimeType"
            value="Enter Anime Type"
            required
          />
        </div>
        <div>
          <label for="addAnimeEpisodes">Anime Episodes</label>
          <input
            type="text"
            name="addAnimeEpisodes"
            v-model="addAnimeEpisodes"
            value="Enter Anime Episodes"
            required
          />
        </div>
        <div>
          <label for="addAnimeRating">Anime Rating</label>
          <input
            type="text"
            name="addAnimeRating"
            v-model="addAnimeRating"
            value="Enter Anime Rating"
            required
          />
        </div>
        <div>
          <label for="addAnimeMembers">Anime Members</label>
          <input
            type="text"
            name="addAnimeMembers"
            v-model="addAnimeMembers"
            value="Enter Anime Members"
            required
          />
        </div>
        <div>
          <button type="submit">Add Anime</button>
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
            value="Enter Anime Number"
            required
          />
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
            value="Enter Anime Number"
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
}
input {
  width: 40%;
  height: 30px;
}
.arrayItems {
  border: 2px solid #2c3e50;
}
#check {
  margin: 0;
  width: 20px;
}
#errorMessage {
  color: red;
}
</style>

<script>
import io from "socket.io-client";
export default {
  data: function () {
    return {
      socketTablet: "",
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
    };
  },

  created() {
    //starting socket connection
    this.socketTablet = io.connect("http://localhost:8000/", {
      transports: ["websocket"],
    });
    //Add listeners here
    //Set
    this.socketTablet.on("SetResponse", function (UpdateData) {
      console.log("Data recieved in client (Update Row):", UpdateData);
    });
    //Delete cells
    this.socketTablet.on("DeleteCellsResponse", function (DeleteCells) {
      console.log(
        "Row cells deleted in client (Delete row cells):",
        DeleteCells
      );
    });
    //Delete Row
    this.socketTablet.on("DeleteRowResponse", function (DeleteRow) {
      console.log("Row deleted in client (Delete Row):", DeleteRow);
    });
    //Add Row
    this.socketTablet.on("AddRowResponse", function (CreateRow) {
      console.log("Row Added in client (Add Row):", CreateRow);
    });
    //Read Row
    this.socketTablet.on("ReadRowsResponse", (data) => {
      this.animes = [];
      for (var a in data) {
        this.animes.push(data[a]);
      }
    });
  },
  methods: {
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
      this.socketTablet.emit("Set", UpdateData);
    },
    ReadRowsSubmit() {
      var data = {
        rowKeys: this.getAnimeNumber.split(" "),
      };
      this.socketTablet.emit("ReadRows", data);
    },
    AddRowSubmit() {
      var CreateRow = {
        Anime: {
          name: this.addAnimeName,
          genre: this.addAnimeGenre,
          type: this.addAnimeType,
          episodes: this.addAnimeEpisodes,
          rating: this.addAnimeRating,
          members: this.addAnimeMembers,
        },
      };
      this.socketTablet.emit("AddRow", CreateRow);
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
      console.log("DeleteCells ", DeleteCells);
      this.socketTablet.emit("DeleteCells", DeleteCells);
    },
    DeleteRowSubmit() {
      var DeleteRow = {
        rowKey: this.deletedAnimeNumber,
      };
      this.socketTablet.emit("DeleteRow", DeleteRow);
    },
  },
};
</script>
