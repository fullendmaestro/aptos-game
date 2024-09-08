import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

// Constants
const contractAddress =
  "0xbba33b0f1b7cbe42bac68eab636ffa3b349debbad7650a3e39cce13d2c749bdf";

// Configure the Aptos client
const config = new AptosConfig({
  network: Network.TESTNET, // Use TESTNET for Devnet or Mainnet for the main network
});

const aptos = new Aptos(config);

// Utility functions for blockchain interactions
export const blockchainUtils = {
  /**
   * fetch score for an account
   * @param {string} address
   * @returns {number} score
   */
  async fetchScore(address: string) {
    let score = 0;
    try {
      if (address) {
        [score] = await aptos.view({
          payload: {
            function: `${contractAddress}::RockPaperScissors::get_score`,
            type_arguments: [],
            functionArguments: [address],
          },
        });
      }
    } catch (err) {
      console.error(err);
    }
    return score;
  },

  /**
   * fetch computer move for the last game
   * @param {string} address
   * @returns {number} computer move
   */
  async fetchComputerMove(address: string) {
    try {
      const [computerMove] = await aptos.view({
        payload: {
          function: `${contractAddress}::RockPaperScissors::get_computer_move`,
          typeArguments: [],
          functionArguments: [address],
        },
      });
      return computerMove;
    } catch (err) {
      console.error(err);
    }
  },

  /**
   * fetch result of last game
   * @param {string} address
   * @returns {number} game result
   */
  async fetchGameResult(address: string) {
    try {
      const [gameResult] = await aptos.view({
        payload: {
          function: `${contractAddress}::RockPaperScissors::get_game_results`,
          typeArguments: [],
          functionArguments: [address],
        },
      });
      return gameResult;
    } catch (err) {
      console.error(err);
    }
  },

  /**
   * fetch game history for an account
   * @param {string} address
   * @returns {Array<GameSession>} game history
   */
  async fetchGameHistory(address: string) {
    try {
      const [gameHistory] = await aptos.view({
        payload: {
          function: `${contractAddress}::RockPaperScissors::get_game_history`,
          typeArguments: [],
          functionArguments: [address],
        },
      });
      return gameHistory; //  The game history should be an array of GameSession objects.
    } catch (err) {
      console.error(err);
    }
  },
};
