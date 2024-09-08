import { AptosClient } from "aptos";

const client = new AptosClient("https://fullnode.devnet.aptoslabs.com"); // Aptos devnet

export async function startNewGame(walletAddress) {
  // Call the smart contract function to start a new game
}

export async function setPlayerMove(walletAddress, move) {
  // Call the smart contract to set player's move
}

export async function fetchComputerMove(walletAddress) {
  // Fetch computer's move from the blockchain
}

export async function fetchGameResult(walletAddress) {
  // Fetch the game result from the blockchain
}

export async function getHistory(walletAddress) {
  // Fetch game history for the user from the blockchain
}
