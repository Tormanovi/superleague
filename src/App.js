import React, { useState, useEffect } from "react";
import TeamSelection from "./components/TeamSelection";
import DraftScreen from "./components/DraftScreen";

function App() {
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);

  useEffect(() => {
    // Fetch teams data from public/assets/data/teams.json
    fetch(`${process.env.PUBLIC_URL}/assets/data/teams.json`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch teams data");
        }
        return response.json();
      })
      .then((data) => setTeams(data.teams))
      .catch((error) => console.error("Error fetching teams:", error));

    // Fetch players data from public/assets/data/players.json
    fetch(`${process.env.PUBLIC_URL}/assets/data/players.json`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch players data");
        }
        return response.json();
      })
      .then((data) => setPlayers(data))
      .catch((error) => console.error("Error fetching players:", error));
  }, []);

  const handleTeamSelect = (teamName) => {
    setSelectedTeam(teamName);
  };

  return (
    <div className="App">
      {!selectedTeam ? (
        <TeamSelection teams={teams} onTeamSelect={handleTeamSelect} />
      ) : (
        <DraftScreen teams={teams} selectedTeam={selectedTeam} players={players} />
      )}
    </div>
  );
}

export default App;
