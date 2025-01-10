import React, { useState, useEffect } from "react";
import "../styles/DraftScreen.scss";

const DraftScreen = ({ teams, selectedTeam, players }) => {
  const [draftOrder, setDraftOrder] = useState([]);
  const [draftedPlayers, setDraftedPlayers] = useState({});
  const [currentPick, setCurrentPick] = useState(0);
  const [filter, setFilter] = useState("Draft Order");

  useEffect(() => {
    // Shuffle teams for random draft order
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);

    // Generate draft order (serpentine logic)
    const generateDraftOrder = () => {
      const order = [];
      for (let round = 0; round < 23; round++) {
        const roundOrder = round % 2 === 0 ? shuffledTeams : [...shuffledTeams].reverse();
        order.push(...roundOrder);
      }
      setDraftOrder(order);
    };

    generateDraftOrder();

    // Initialize draftedPlayers structure
    const initialDrafted = {};
    shuffledTeams.forEach((team) => {
      initialDrafted[team.name] = {
        players: [],
        positions: {
          GK: 0,
          DEF: 0,
          MID: 0,
          ATT: 0,
        },
      };
    });
    setDraftedPlayers(initialDrafted);
  }, [teams, players]);

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const getPlayerPositionGroup = (position) => {
    if (position === "GK") return "GK";
    if (["LB", "CB", "RB"].includes(position)) return "DEF";
    if (["CDM", "CM", "CAM"].includes(position)) return "MID";
    if (["ST", "LW", "RW"].includes(position)) return "ATT";
    return null;
  };

  const canDraftPlayer = (team, positionGroup) => {
    const positionCaps = {
      GK: 3,
      DEF: 10,
      MID: 7,
      ATT: 8,
    };

    return team.positions[positionGroup] < positionCaps[positionGroup];
  };

  const needsPosition = (team) => {
    const positionMinimums = {
      GK: 3,
      DEF: 6,
      MID: 4,
      ATT: 5,
    };

    return Object.keys(positionMinimums).find(
      (position) => team.positions[position] < positionMinimums[position]
    );
  };

const handleNextPick = () => {
  if (currentPick >= 460 || players.length === 0) return;

  const teamPicking = draftOrder[currentPick];
  const draftedTeam = draftedPlayers[teamPicking.name];

  // Determine if this pick is part of the last 7 picks for this team
  const teamPicks = draftedTeam.players.length + 1; // Current pick number for the team
  const isLastSevenPicks = teamPicks > 16; // Picks 17 to 23 are the last 7 picks

  let eligiblePlayers;

  if (isLastSevenPicks) {
    // Prioritize unmet minimum positional requirements
    const neededPosition = needsPosition(draftedTeam);
    if (neededPosition) {
      eligiblePlayers = players.filter(
        (player) => getPlayerPositionGroup(player.position) === neededPosition
      );
    }
  }

  if (!eligiblePlayers || eligiblePlayers.length === 0) {
    // Normal logic if all minimum requirements are met
    const highestRating = players[0].rating;

    // Filter players within 2 ratings of the highest-rated player and below position caps
    eligiblePlayers = players.filter((player) => {
      const positionGroup = getPlayerPositionGroup(player.position);
      return (
        player.rating >= highestRating - 2 &&
        canDraftPlayer(draftedTeam, positionGroup)
      );
    });
  }

  if (eligiblePlayers.length === 0) return; // Skip if no eligible players are available

  // Shuffle eligible players and select one
  const shuffledPlayers = shuffleArray([...eligiblePlayers]);
  const playerPicked = shuffledPlayers[0];

  const positionGroup = getPlayerPositionGroup(playerPicked.position);

  // Assign player to the team
  setDraftedPlayers((prev) => ({
    ...prev,
    [teamPicking.name]: {
      players: [
        ...prev[teamPicking.name].players,
        {
          ...playerPicked,
          draftNumber: currentPick + 1,
          round: Math.floor(currentPick / 20) + 1,
          pick: (currentPick % 20) + 1,
        },
      ],
      positions: {
        ...prev[teamPicking.name].positions,
        [positionGroup]: (prev[teamPicking.name].positions[positionGroup] || 0) + 1,
      },
    },
  }));

  // Remove the player from the pool
  const playerPoolIndex = players.findIndex((p) => p.name === playerPicked.name);
  players.splice(playerPoolIndex, 1);

  // Increment pick only if it's not the last pick
  if (currentPick < 459) {
    setCurrentPick((prev) => prev + 1);
  }
};

const handleCompleteDraft = () => {
  let pick = currentPick;

  while (pick < 460 && players.length > 0) {
    const teamPicking = draftOrder[pick];
    const draftedTeam = draftedPlayers[teamPicking.name];

    // Determine if this pick is part of the last 7 picks for this team
    const teamPicks = draftedTeam.players.length + 1; // Current pick number for the team
    const isLastSevenPicks = teamPicks > 16; // Picks 17 to 23 are the last 7 picks

    let eligiblePlayers;

    if (isLastSevenPicks) {
      // Prioritize unmet minimum positional requirements
      const neededPosition = needsPosition(draftedTeam);
      if (neededPosition) {
        eligiblePlayers = players.filter(
          (player) => getPlayerPositionGroup(player.position) === neededPosition
        );
      }
    }

    if (!eligiblePlayers || eligiblePlayers.length === 0) {
      // Normal logic if all minimum requirements are met
      const highestRating = players[0].rating;

      // Filter players within 2 ratings of the highest-rated player and below position caps
      eligiblePlayers = players.filter((player) => {
        const positionGroup = getPlayerPositionGroup(player.position);
        return (
          player.rating >= highestRating - 2 &&
          canDraftPlayer(draftedTeam, positionGroup)
        );
      });
    }

    if (eligiblePlayers.length === 0) break; // Stop drafting if no eligible players are available

    // Shuffle eligible players and select one
    const shuffledPlayers = shuffleArray([...eligiblePlayers]);
    const playerPicked = shuffledPlayers[0];

    const positionGroup = getPlayerPositionGroup(playerPicked.position);

    draftedPlayers[teamPicking.name].players.push({
      ...playerPicked,
      draftNumber: pick + 1,
      round: Math.floor(pick / 20) + 1,
      pick: (pick % 20) + 1,
    });

    draftedPlayers[teamPicking.name].positions[positionGroup] =
      (draftedPlayers[teamPicking.name].positions[positionGroup] || 0) + 1;

    const playerPoolIndex = players.findIndex((p) => p.name === playerPicked.name);
    players.splice(playerPoolIndex, 1);

    pick++;
  }

  setDraftedPlayers({ ...draftedPlayers });
  setCurrentPick(460);
};


  const draftSummary = () => {
    return Object.entries(draftedPlayers).map(([teamName, teamData]) => {
      const totalPlayers = teamData.players.length;
      const { GK = 0, DEF = 0, MID = 0, ATT = 0 } = teamData.positions;

      const warnings = [];
      if (GK < 3) warnings.push("Less than 3 Goalkeepers");
      if (GK > 3) warnings.push("More than 3 Goalkeepers");
      if (DEF < 6) warnings.push("Less than 6 Defenders");
      if (DEF > 10) warnings.push("More than 10 Defenders");
      if (MID < 4) warnings.push("Less than 4 Midfielders");
      if (MID > 7) warnings.push("More than 7 Midfielders");
      if (ATT < 5) warnings.push("Less than 5 Attackers");
      if (ATT > 8) warnings.push("More than 8 Attackers");
      if (totalPlayers !== 23) warnings.push(`Total players drafted: ${totalPlayers} (should be 23)`);

      return (
        <div key={teamName}>
          <h4>{teamName}</h4>
          <p>Warnings: {warnings.length > 0 ? warnings.join(", ") : "None"}</p>
        </div>
      );
    });
  };

  return (
    <div className="draft-screen">
      <h1>Draft in Progress</h1>
      <h2>
        Pick {currentPick + 1 <= 460 ? currentPick + 1 : 460} / 460 (Round{" "}
        {Math.floor(currentPick / 20) + 1}, Pick {(currentPick % 20) + 1})
      </h2>
      <h3>Team Picking: {draftOrder[currentPick]?.name || "Completed"}</h3>
      <div className="actions">
        <button onClick={handleNextPick} disabled={currentPick >= 460}>
          Next Pick
        </button>
        <button onClick={handleCompleteDraft}>
          Go to End of Draft
        </button>
      </div>
      <div className="filter-container">
  <label htmlFor="filter">Filter By:</label>
  <select id="filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
    <option value="Draft Order">Draft Order</option>
    <option value="Position">Position</option>
    <option value="Highest to Lowest (Rating)">Highest to Lowest (Rating)</option>
  </select>
</div>

      <div className="drafted-teams">
  {Object.entries(draftedPlayers).map(([teamName, teamData]) => {
    // Apply filtering logic to players
    let filteredPlayers = [...teamData.players];

    if (filter === "Position") {
      const positionOrder = ["GK", "RB", "CB", "LB", "CDM", "CM", "CAM", "RW", "LW", "ST"];
      filteredPlayers.sort((a, b) => {
        const posA = positionOrder.indexOf(a.position);
        const posB = positionOrder.indexOf(b.position);
        return posA - posB;
      });
    } else if (filter === "Highest to Lowest (Rating)") {
      filteredPlayers.sort((a, b) => b.rating - a.rating);
    } // Default is "Draft Order", no sorting needed

    return (
      <div key={teamName} className="team-draft">
        <h4>
          <img src={teams.find((team) => team.name === teamName)?.badge_url} alt={`${teamName} Badge`} className="team-badge" />
          {teamName}
        </h4>
        <div>
          {filteredPlayers.map((player, index) => (
            <div key={index} className="player-box">
              <div className="player-info">
                {player.name} ({player.position}) - {player.rating}
              </div>
              <div className="pick-info">
                Pick {player.draftNumber} (Round {player.round}, Pick{" "}
                {player.pick})
              </div>
            </div>
          ))}
        </div>
        <div className="position-summary">
          Total Players: {teamData.players.length} | GK: {teamData.positions.GK || 0}, DEF:{" "}
          {teamData.positions.DEF || 0}, MID: {teamData.positions.MID || 0}, ATT:{" "}
          {teamData.positions.ATT || 0}
        </div>
      </div>
    );
  })}
</div>

      {currentPick >= 460 && (
        <div className="draft-summary">
          <h2>Draft Summary</h2>
          {draftSummary()}
        </div>
      )}
    </div>
  );
};

export default DraftScreen;
