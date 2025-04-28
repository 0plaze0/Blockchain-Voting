import 'dotenv/config'
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { privateDecrypt } from 'crypto';

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks:{
    sepolia:{
      url:`https://sepolia.infura.io/v3/${process.env.INFURA_API}`,
      accounts:[process.env.PRIVATE_KEY as string]
    }
  }
};

export default config;
