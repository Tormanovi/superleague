import React, { useState, useEffect } from "react";
import "../styles/TeamSelection.scss";

const TeamSelection = ({ onTeamSelect }) => {
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch the teams from the JSON file
    fetch(`${process.env.PUBLIC_URL}/assets/data/teams.json`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch teams data");
        }
        return response.json();
      })
      .then((data) => {
        if (data.teams) {
          setTeams(data.teams); // Use the `teams` key in the JSON
        } else {
          throw new Error("Invalid JSON structure");
        }
      })
      .catch((error) => {
        console.error("Error fetching teams:", error);
        setError("Failed to load teams. Please try again later.");
      });
  }, []);

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="team-selection">
      <h1>Select Your Team</h1>
      <div className="teams-grid">
        {teams.length > 0 ? (
          teams.map((team, index) => (
            <div
              key={index}
              className="team-card"
              onClick={() => onTeamSelect(team.name)}
            >
              <img src={team.badge_url} alt={`${team.name} Badge`} />
              <p>{team.name}</p>
            </div>
          ))
        ) : (
          <p>Loading teams...</p>
        )}
      </div>
    </div>
  );
};

export default TeamSelection;
