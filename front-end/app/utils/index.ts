import { AptosClient } from "aptos";

const NODE_URL = process.env.NEXT_PUBLIC_APTOS_NODE_URL;
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

const client = new AptosClient(NODE_URL);

// Fetch player score
export const fetchScore = async (accountAddress) => {
  try {
    const response = await client.getAccountResource(
      accountAddress,
      `${CONTRACT_ADDRESS}::MoveMaster::Game`
    );
    return response.data.score;
  } catch (error) {
    console.error("Error fetching score:", error);
    return 0;
  }
};

// Fetch the computer's move
export const fetchComputerMove = async (accountAddress) => {
  try {
    const response = await client.getAccountResource(
      accountAddress,
      `${CONTRACT_ADDRESS}::MoveMaster::Game`
    );
    return response.data.computer_move;
  } catch (error) {
    console.error("Error fetching computer move:", error);
    return null;
  }
};

// Fetch the game result
export const fetchGameResult = async (accountAddress) => {
  try {
    const response = await client.getAccountResource(
      accountAddress,
      `${CONTRACT_ADDRESS}::MoveMaster::Game`
    );
    return response.data.result;
  } catch (error) {
    console.error("Error fetching game result:", error);
    return null;
  }
};
