// ignition/modules/Voting.ts

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// Default candidates and vote limit as in your script
const DEFAULT_CANDIDATES = ["Mark", "Mike", "Henry", "Rock"];
const DEFAULT_VOTE_LIMIT = 10;

const VotingModule = buildModule("VotingModule", (m) => {
  // You can make these parameters configurable if you want
  const candidates = m.getParameter("candidates", DEFAULT_CANDIDATES);
  const voteLimit = m.getParameter("voteLimit", DEFAULT_VOTE_LIMIT);

  const voting = m.contract("Voting", [candidates, voteLimit]);

  return { voting };
});

export default VotingModule;
