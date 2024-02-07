const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

const app = express();

app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log(`Server is running at http://localhost:3000/`);
    });
  } catch (e) {
    console.log(`DB Error: ${e}`);
    process.exit(1);
  }
};
initializeDBAndServer();

convertPlayerDetailTableToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  };
};

convertMatchDetailTableToResponseObject = (dbObject) => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  };
};

convertPlayerMatchScoreDetailTableToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    score: dbObject.score,
    fours: dbObject.fours,
    sixes: dbObject.sixes,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `SELECT * FROM player_details;`;
  const playersList = await db.all(getPlayersQuery);
  response.send(
    playersList.map((eachPlayer) =>
      convertPlayerDetailTableToResponseObject(eachPlayer)
    )
  );
});

app.get("/matches/", async (request, response) => {
  const getMatchesQuery = `SELECT * FROM match_details;`;
  const matchesList = await db.all(getMatchesQuery);
  response.send(
    matchesList.map((eachPlayer) =>
      convertMatchDetailTableToResponseObject(eachPlayer)
    )
  );
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `SELECT * FROM player_details WHERE player_id=${playerId};`;
  const player = await db.get(getPlayerQuery);
  response.send(convertPlayerDetailTableToResponseObject(player));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updateQuery = `UPDATE player_details SET
    player_name='${playerName}' 
    WHERE player_id=${playerId};`;
  await db.run(updateQuery);
  response.send("Player Details Updated");
});

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchQuery = `SELECT * FROM match_details WHERE match_id=${matchId};`;
  const match = await db.get(getMatchQuery);
  response.send(convertMatchDetailTableToResponseObject(match));
});

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getMatchesQuery = `SELECT match_id,match,year FROM match_details NATURAL JOIN player_match_score WHERE player_match_score.player_id=${playerId};`;
  const playerMatches = await db.all(getMatchesQuery);
  response.send(
    playerMatches.map((eachMatch) =>
      convertMatchDetailTableToResponseObject(eachMatch)
    )
  );
});

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getPlayersQuery = `SELECT player_id,player_name FROM player_details NATURAL JOIN player_match_score  WHERE player_match_score.match_id=${matchId};`;
  const playerMatches = await db.all(getPlayersQuery);
  response.send(
    playerMatches.map((eachMatch) =>
      convertPlayerDetailTableToResponseObject(eachMatch)
    )
  );
});

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getMatchesQuery = `SELECT player_id AS playerId,player_name AS playerName,SUM(score) AS totalScore,SUM(fours) AS totalFours, SUM(sixes) AS totalSixes FROM player_details NATURAL JOIN player_match_score WHERE player_match_score.player_id=${playerId} GROUP BY player_id;`;
  const playerMatches = await db.get(getMatchesQuery);
  response.send(playerMatches);
});

module.exports = app;
