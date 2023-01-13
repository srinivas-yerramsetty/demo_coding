const express = require("express");
const app = express();
app.use(express.json());
let path = require("path");
let dbPath = path.join(__dirname, "cricketTeam.db");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
let db = null;
let initializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};
initializeDBandServer();

app.get("/players/", async (request, response) => {
  const selectQuery = `select
    * from 
    cricket_team`;
  const result = await db.all(selectQuery);
  response.send(result);
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const selectQuery = `select 
    * 
    from 
    cricket_team 
    where 
    player_id = ${playerId};`;
  const result = await db.get(selectQuery);
  response.send(result);
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  let addQuery = `insert 
  into 
  cricket_team 
  (player_name, jersey_number, role) 
  values 
  ("${playerName}", 
  ${jerseyNumber}, 
  "${role}");`;
  const dbResponse = await db.run(addQuery);
  const playerId = dbResponse.lastID;
  //   response.send("Player Added to Team");
  //   response.send({ playerId: playerId });
  response.send("Player Added to Team");
});

//Update a player in the Database
app.put("/players/:playerId/", async (request, response) => {
  const playerId = request.params;
  const newData = request.body;
  const { playerName, jerseyNumber, role } = newData;
  const updateQuery = `update 
    cricket_team 
    set 
    player_name = "${playerName}",
    jersey_number = ${jerseyNumber},
    role = "${role}";`;
  await db.run(updateQuery);
  response.send("Player Details Updated");
});

//Delete a player from the Database
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `delete
  from 
  cricket_team
  where 
  player_id = ${playerId};`;
  await db.run(deleteQuery);
  response.send("player Removed");
});
module.exports = app;
