import 'dotenv/config';
import express from 'express';
import fileUpload from 'express-fileupload';
import path from 'path';
import { fileURLToPath } from 'url';
import { ethers } from 'ethers';
import { readFile } from 'fs/promises';

// Setup __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Middleware
app.use(fileUpload());
app.use(express.static( 'static'));
app.use(express.json());

// Environment variables
const API_URL = `https://sepolia.infura.io/v3/${process.env.INFURA_API}`;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

if (!API_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
    console.error("Missing environment variables. Please check your .env file.");
    process.exit(1);
}

// Load contract ABI
const artifactPath = path.join(__dirname, 'artifacts', 'contracts', 'Voting.sol', 'Voting.json');
const artifact = JSON.parse(await readFile(artifactPath, 'utf8'));
const abi = artifact.abi;

// Blockchain setup
const provider = new ethers.JsonRpcProvider(API_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);
const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

// Routes
app.get(['/', '/index.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
});


app.post('/vote', async (req, res) => {
    const vote = req.body.vote;
    console.log("Received vote:", vote);

    if (!vote || typeof vote !== 'string') {
        return res.status(400).send("Invalid vote input.");
    }

    try {
        const isVotingActive = await contractInstance.getVotingStatus();
        if (!isVotingActive) {
            return res.status(400).send("Voting is finished");
        }

        console.log("Adding the candidate to the voting contract...");
        const tx = await contractInstance.addCandidate(vote);
        await tx.wait();

        res.send("The candidate has been registered in the smart contract");
    } catch (error) {
        console.error("Error while adding candidate:", error);
        res.status(500).send("An error occurred while processing the vote.");
    }
});

// Start server
app.listen(port, () => {
    console.log(`App is listening on http://localhost:${port}`);
});
