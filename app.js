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
//convert dbresult from snakecase to camelCase
const getdbresultAndConvertToCamelCase = (player) => {
  return {
    playerId: player.player_id,
    playerName: player.player_name,
    jerseyNumber: player.jersey_number,
    role: player.role,
  };
};
//get all players details from database
app.get("/players/", async (request, response) => {
  const selectQuery = `select
    * from 
    cricket_team`;
  const result = await db.all(selectQuery);
  response.send(
    result.map((eachPlayer) => getdbresultAndConvertToCamelCase(eachPlayer))
  );
});

//convert_snake_case to camelCase
const snake_case_to_camelCase = (result) => {
  return {
    playerId: result.player_id,
    playerName: result.player_name,
    jerseyNumber: result.jersey_number,
    role: result.role,
  };
};
//get required player details from database
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const selectQuery = `
    select * 
    from cricket_team 
    where player_id = ${playerId}`;
  const result = await db.get(selectQuery);
  response.send(snake_case_to_camelCase(result));
});

//create a new player details in the database
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

//Update a player details in the Database
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const newData = request.body;
  const { playerName, jerseyNumber, role } = newData;
  const updateQuery = `update 
    cricket_team 
    set 
    player_name = "${playerName}",
    jersey_number = ${jerseyNumber},
    role = "${role}" where player_id = ${playerId};`;
  await db.run(updateQuery);
  response.send("Player Details Updated");
});

//Delete a player details from the Database
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `delete
  from 
  cricket_team
  where 
  player_id = ${playerId};`;
  await db.run(deleteQuery);
  response.send("Player Removed");
});
module.exports = app;
