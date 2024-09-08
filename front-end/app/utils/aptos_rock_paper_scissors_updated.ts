
import { AptosClient, HexString, TxnBuilderTypes } from "aptos";

const contractAddress =
  "0x5f806c3af07a30c6c58a98d0c12058dedc95c337c8c4f06790b63f3f07fa104f";

// Utility functions for blockchain interactions
export const blockchainUtils = {
  async fetchScore(aptosClient: AptosClient, walletAddress: string) {
    try {
      const resource = await aptosClient.getAccountResource(
        walletAddress,
        `${contractAddress}::RockPaperScissors::Game`
      );
      const score = resource.data.score;
      return parseInt(score, 10);
    } catch (error) {
      console.error("Error fetching score:", error);
      return null;
    }
  },

  async createNewGame(aptosClient: AptosClient, walletAddress: string) {
    try {
      const payload = {
        function: `${contractAddress}::RockPaperScissors::start_game`,
        type_arguments: [],
        arguments: [],
      };

      const transaction = await aptosClient.generateTransaction(walletAddress, payload);
      const signedTxn = await aptosClient.signTransaction(transaction);
      const res = await aptosClient.submitTransaction(signedTxn);

      console.log("Transaction submitted:", res);
      return res;
    } catch (error) {
      console.error("Error starting game:", error);
    }
  },

  async setPlayerMove(aptosClient: AptosClient, walletAddress: string, move: string) {
    try {
      const payload = {
        function: `${contractAddress}::RockPaperScissors::set_player_move`,
        type_arguments: [],
        arguments: [moveToU8(move)],
      };

      const transaction = await aptosClient.generateTransaction(walletAddress, payload);
      const signedTxn = await aptosClient.signTransaction(transaction);
      const res = await aptosClient.submitTransaction(signedTxn);

      console.log("Transaction submitted:", res);
      return res;
    } catch (error) {
      console.error("Error submitting move:", error);
    }
  },

  async getComputerMove(aptosClient: AptosClient, walletAddress: string) {
    try {
      const resource = await aptosClient.getAccountResource(
        walletAddress,
        `${contractAddress}::RockPaperScissors::Game`
      );
      const computerMove = resource.data.computer_move;
      return u8ToMove(parseInt(computerMove, 10));
    } catch (error) {
      console.error("Error fetching computer move:", error);
      return null;
    }
  },

  async finalizeGameResults(aptosClient: AptosClient, walletAddress: string) {
    try {
      const payload = {
        function: `${contractAddress}::RockPaperScissors::finalize_game_results`,
        type_arguments: [],
        arguments: [],
      };

      const transaction = await aptosClient.generateTransaction(walletAddress, payload);
      const signedTxn = await aptosClient.signTransaction(transaction);
      const res = await aptosClient.submitTransaction(signedTxn);

      console.log("Transaction submitted:", res);
      return res;
    } catch (error) {
      console.error("Error finalizing game results:", error);
    }
  },

  async getGameResults(aptosClient: AptosClient, walletAddress: string) {
    try {
      const resource = await aptosClient.getAccountResource(
        walletAddress,
        `${contractAddress}::RockPaperScissors::Game`
      );
      const result = resource.data.result;
      return u8ToMove(parseInt(result, 10));
    } catch (error) {
      console.error("Error fetching game results:", error);
      return null;
    }
  },

  async getGameHistory(aptosClient: AptosClient, walletAddress: string) {
    try {
      const resource = await aptosClient.getAccountResource(
        walletAddress,
        `${contractAddress}::RockPaperScissors::GameHistory`
      );
      return resource.data;
    } catch (error) {
      console.error("Error fetching game history:", error);
      return null;
    }
  },

  async createNewGameSession(aptosClient: AptosClient, walletAddress: string) {
    try {
      const payload = {
        function: `${contractAddress}::RockPaperScissors::start_game`,
        type_arguments: [],
        arguments: [],
      };

      const transaction = await aptosClient.generateTransaction(walletAddress, payload);
      const signedTxn = await aptosClient.signTransaction(transaction);
      const res = await aptosClient.submitTransaction(signedTxn);

      console.log("Transaction submitted:", res);
      const latestSession = await this.getGameHistory(aptosClient, walletAddress);
      return latestSession;
    } catch (error) {
      console.error("Error creating new game session:", error);
    }
  },
};

function moveToU8(move: string): number {
  switch (move) {
    case "rock":
      return 1;
    case "paper":
      return 2;
    case "scissors":
      return 3;
    default:
      throw new Error("Invalid move");
  }
}

function u8ToMove(move: number): string {
  switch (move) {
    case 1:
      return "rock";
    case 2:
      return "paper";
    case 3:
      return "scissors";
    default:
      throw new Error("Invalid move");
  }
}
