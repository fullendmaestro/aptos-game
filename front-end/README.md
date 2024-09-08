## Move Master: A Rock Paper Scissors Game on Aptos

This project implements a fun and interactive Rock Paper Scissors game powered by the Aptos blockchain. It showcases the use of Move smart contracts for game logic and a Next.js frontend for user interaction.

### Features:

- **Wallet Integration:** Players can connect to the Petra wallet using the `@aptos-labs/wallet-adapter-react` library.
- **Blockchain Game Logic:** The core game logic (random move generation, move comparison, result determination, and scorekeeping) is implemented in a Move smart contract.
- **Game History:** All game sessions are recorded on the blockchain, providing a transparent and immutable history of moves and results.
- **Intuitive Frontend:** The Next.js frontend provides a user-friendly interface with:
  - A Connect Wallet button to connect to the Petra wallet.
  - A Start Game button to begin a new game.
  - Rock, Paper, and Scissors buttons for player moves.
  - Display of the computer's move and the game result.
  - Scoreboard showing the player's score and the computer's score.
  - An interactive game history section to view past sessions.

### Project Structure:

- **`move-master`:** The root directory of the project.
- **`front-end`:** The Next.js frontend application directory.
  - **`pages`:** Contains the main component (`MoveMaster.tsx`).
  - **`components`:** Holds reusable UI components (like `ScoreBoard`, `BackgroundAnimation`, etc.).
  - **`utils`:** Contains the `blockchainUtils.js` module for interacting with the smart contract.
- **`sources`:** The Move smart contract directory.
  - **`RockPaperScissors.move`:** The Move smart contract file.

### How to Run:

1.  **Clone the Repository:** Clone the project repository.
2.  **Install Dependencies:**
    - Navigate to the `front-end` directory: `cd front-end`.
    - Run `pnpm install` to install project dependencies.
3.  **Configure Wallet Adapter:**
    - Ensure you have the Petra wallet extension installed in your browser.
    - Set up the wallet adapter in `_app.tsx` as described in the previous responses (ensure `@aptos-labs/wallet-adapter-petra` is installed).
4.  **Deploy the Smart Contract:**
    - Navigate to the `sources` directory: `cd sources`.
    - Compile and deploy the smart contract using the Aptos CLI (e.g., `aptos move publish`).
    - Replace the `contractAddress` constant in the frontend code with the actual address of your deployed smart contract.
5.  **Run the Frontend:**
    - Navigate back to the `front-end` directory: `cd ..`.
    - Start the development server: `pnpm dev`.

### Smart Contract Details:

The Move smart contract `RockPaperScissors.move` handles the game logic, including:

- **Game Initialization:** The `create_new_game` entry function starts a new game.
- **Player Move:** The `set_player_move` entry function sets the player's chosen move.
- **Computer Move:** The `set_computer_move` entry function (using a randomness module) sets the computer's move.
- **Result Calculation:** The `determine_winner` function compares moves and calculates the winner.
- **Scorekeeping:** The `finalize_game_results` entry function updates the score and game history.
- **Game Session Creation:** The `create_new_game_session` entry function creates a new game session, which is used for storing moves.

### Additional Information:

- The project is currently set up to use the Aptos Devnet. You can adapt it to work with the Aptos mainnet by changing the network configuration and deploying the smart contract to the mainnet.
- You can enhance the project with additional features, such as:
  - A user profile to store player statistics.
  - A betting system using Aptos coins (APT).
  - A leaderboard to track top players.

This README provides a general overview of the Move Master project. Feel free to explore the code and experiment with the features to learn more about building games on the Aptos blockchain.
