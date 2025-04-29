let WALLET_CONNECTED = "";
const contractAddress = "0x44ac68EAD47BDC4706A01481009234e89fD680eD";

// The ABI remains unchanged (paste it fully as you had it)
const contractAbi = [
    {
      "inputs": [
        {
          "internalType": "string[]",
          "name": "_candidateNames",
          "type": "string[]"
        },
        {
          "internalType": "uint256",
          "name": "_durationInMinutes",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_name",
          "type": "string"
        }
      ],
      "name": "addCandidate",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "candidates",
      "outputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "voteCount",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAllVotesOfCandiates",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "voteCount",
              "type": "uint256"
            }
          ],
          "internalType": "struct Voting.Candidate[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getRemainingTime",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getVotingStatus",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_candidateIndex",
          "type": "uint256"
        }
      ],
      "name": "vote",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "voters",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "votingEnd",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "votingStart",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

const connectMetamask = async () => {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        WALLET_CONNECTED = await signer.getAddress();
        document.getElementById("metamasknotification").innerText = 
            "Metamask is connected: " + WALLET_CONNECTED;
    } catch (err) {
        console.error("Metamask connection failed:", err);
        document.getElementById("metamasknotification").innerText = 
            "Metamask connection failed. Make sure it's installed and unlocked.";
    }
};

const addVote = async () => {
    if (!WALLET_CONNECTED) {
        document.getElementById("cand").innerText = "Please connect Metamask first";
        return;
    }

    const indexInput = document.getElementById("vote").value;
    const voteStatusElement = document.getElementById("cand");

    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractAbi, signer);

        voteStatusElement.innerText = "Please wait, casting vote on the smart contract...";
        const tx = await contract.vote(Number(indexInput)); // Assumes index input
        await tx.wait();

        voteStatusElement.innerText = "Vote successfully added!";
    } catch (err) {
        console.error("Error voting:", err);
        voteStatusElement.innerText = "Error occurred while voting.";
    }
};

const voteStatus = async () => {
    if (!WALLET_CONNECTED) {
        document.getElementById("status").innerText = "Please connect Metamask first";
        return;
    }

    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractAbi, signer);

        const isOpen = await contract.getVotingStatus();
        const remainingTime = await contract.getRemainingTime();

        document.getElementById("status").innerText = 
            isOpen ? "Voting is currently open" : "Voting is finished";
        document.getElementById("time").innerText = 
            `Remaining time: ${remainingTime.toString()} seconds`;
    } catch (err) {
        console.error("Error fetching status:", err);
        document.getElementById("status").innerText = "Error checking voting status.";
    }
};

const getAllCandidates = async () => {
    if (!WALLET_CONNECTED) {
        document.getElementById("p3").innerText = "Please connect Metamask first";
        return;
    }

    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractAbi, signer);

        document.getElementById("p3").innerText = "Fetching candidates...";

        const candidates = await contract.getAllVotesOfCandiates();

        const table = document.getElementById("myTable");
        table.innerHTML = ""; // Clear previous rows

        candidates.forEach((candidate, index) => {
            const row = table.insertRow();
            row.insertCell().innerText = index;
            row.insertCell().innerText = candidate.name;
            row.insertCell().innerText = candidate.voteCount.toString();
        });

        document.getElementById("p3").innerText = "Candidates updated.";
    } catch (err) {
        console.error("Error fetching candidates:", err);
        document.getElementById("p3").innerText = "Error loading candidates.";
    }
};
