let WALLET_CONNECTED = "";
const contractAddress = "0x091994Dc3585dC4c8d388a10A22EfD2243F11Fe0";

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

        // Check if we're connected to the right network
        const network = await provider.getNetwork();
        if (network.chainId !== 11155111) { // Sepolia testnet chainId
            document.getElementById("status").innerText = "Please connect to Sepolia testnet";
            return;
        }

        // Try to get voting status with a timeout
        const statusPromise = contract.getVotingStatus();
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 10000)
        );

        const isOpen = await Promise.race([statusPromise, timeoutPromise]);
        
        // Get remaining time
        const remainingTime = await contract.getRemainingTime();
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;

        document.getElementById("status").innerText = 
            isOpen ? "Voting is currently open" : "Voting is finished";
        document.getElementById("time").innerText = 
            `Remaining time: ${minutes} minutes and ${seconds} seconds`;
    } catch (err) {
        console.error("Error fetching status:", err);
        let errorMessage = "Error checking voting status. ";
        
        if (err.code === 'CALL_EXCEPTION') {
            errorMessage += "The contract call failed. Please make sure you're connected to the correct network and the contract is deployed.";
        } else if (err.code === 'NETWORK_ERROR') {
            errorMessage += "Network error. Please check your internet connection.";
        } else if (err.message === 'Request timeout') {
            errorMessage += "Request timed out. Please try again.";
        } else {
            errorMessage += err.message || "Unknown error occurred.";
        }
        
        document.getElementById("status").innerText = errorMessage;
        document.getElementById("time").innerText = "";
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

        // Check if we're connected to the right network
        const network = await provider.getNetwork();
        if (network.chainId !== 11155111) { // Sepolia testnet chainId
            document.getElementById("p3").innerText = "Please connect to Sepolia testnet";
            return;
        }

        // Get the candidates array first
        const candidates = await contract.getAllVotesOfCandiates();
        
        if (!candidates || candidates.length === 0) {
            document.getElementById("p3").innerText = "No candidates found";
            return;
        }

        // Get voting status for information only
        let votingStatus = "Voting in progress";
        try {
            const isVotingActive = await contract.getVotingStatus();
            votingStatus = isVotingActive ? "Voting in progress" : "Voting period has ended";
        } catch (statusErr) {
            console.warn("Could not fetch voting status:", statusErr);
            votingStatus = "Voting status unknown";
        }

        const table = document.getElementById("myTable");
        const tbody = table.querySelector("tbody");
        tbody.innerHTML = ""; // Clear previous rows

        // Create header if it doesn't exist
        if (!table.querySelector("thead")) {
            const thead = document.createElement("thead");
            const headerRow = document.createElement("tr");
            ["Index", "Candidate name", "Candidate votes"].forEach(text => {
                const th = document.createElement("th");
                th.textContent = text;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.insertBefore(thead, tbody);
        }

        // Add candidates to table
        candidates.forEach((candidate, index) => {
            const row = document.createElement("tr");
            
            const indexCell = document.createElement("td");
            indexCell.textContent = index;
            row.appendChild(indexCell);

            const nameCell = document.createElement("td");
            nameCell.textContent = candidate.name;
            row.appendChild(nameCell);

            const votesCell = document.createElement("td");
            votesCell.textContent = candidate.voteCount.toString();
            row.appendChild(votesCell);

            tbody.appendChild(row);
        });

        // Update status message with voting status
        document.getElementById("p3").innerText = `${votingStatus} - Showing current results`;
    } catch (err) {
        console.error("Error fetching candidates:", err);
        let errorMessage = "Error loading candidates. ";
        
        if (err.code === 'CALL_EXCEPTION') {
            errorMessage += "The contract call failed. Please make sure you're connected to the correct network and the contract is deployed.";
        } else if (err.code === 'NETWORK_ERROR') {
            errorMessage += "Network error. Please check your internet connection.";
        } else {
            errorMessage += err.message || "Unknown error occurred.";
        }
        
        document.getElementById("p3").innerText = errorMessage;
    }
};
