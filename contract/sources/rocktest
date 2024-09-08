address 0x735f161962a987af378e03dcc69b403db483783af0b7e9cd33b32099e94f2d30 {

module RockPaperScissors {
    use std::signer;
    use aptos_framework::randomness;

    // Constants representing the possible moves in the game
    const ROCK: u8 = 1;
    const PAPER: u8 = 2;
    const SCISSORS: u8 = 3;

    /// Struct representing the state of an active game for a player.
    /// Fields:
    /// - `player`: The address of the player.
    /// - `player_move`: The player's move (ROCK, PAPER, SCISSORS).
    /// - `computer_move`: The computer's randomly generated move.
    /// - `result`: The result of the game (1: Draw, 2: Player wins, 3: Computer wins).
    /// - `games_played`: Total number of games played by the player.
    /// - `player_wins`: Total number of games won by the player.
    /// - `computer_wins`: Total number of games won by the computer.
    struct Game has key {
        player: address,
        player_move: u8,
        computer_move: u8,
        result: u8,
        games_played: u64,
        player_wins: u64,
        computer_wins: u64,
    }

    /// Struct representing the history of past games for a player.
    /// Fields:
    /// - `player`: The address of the player.
    /// - `past_games`: A vector storing records of past games, including moves and results.
    struct GameHistory has key {
        player: address,
        past_games: vector<GameRecord>,
    }

    /// Struct representing a record of a single game.
    /// Fields:
    /// - `player_move`: The move made by the player.
    /// - `computer_move`: The move made by the computer.
    /// - `result`: The result of the game (1: Draw, 2: Player wins, 3: Computer wins).
    struct GameRecord has copy, drop, store {
        player_move: u8,
        computer_move: u8,
        result: u8,
    }

    /// Initializes a new game for the player or resets the current game.
    /// It assigns default values for the player's and computer's moves, the result, and the score counters.
    public entry fun start_game(account: &signer) {
        let player = signer::address_of(account);

        // Create a new game with initialized default values
        let game = Game {
            player,
            player_move: 0,
            computer_move: 0,
            result: 0,
            games_played: 0,
            player_wins: 0,
            computer_wins: 0,
        };

        move_to(account, game);
    }

    /// Creates a new game for the player without overriding previous game data.
    /// If the game history doesn't exist, it initializes a `GameHistory` struct.
    public entry fun create_new_game(account: &signer) {
        let player = signer::address_of(account);

        // Initialize a new game for the player
        let game = Game {
            player,
            player_move: 0,
            computer_move: 0,
            result: 0,
            games_played: 0,
            player_wins: 0,
            computer_wins: 0,
        };

        move_to(account, game);

        // Initialize the game history if it doesn't already exist for the player
        if (!exists<GameHistory>(player)) {
            let game_history = GameHistory {
                player,
                past_games: vector::empty<GameRecord>(),
            };
            move_to(account, game_history);
        }
    }

    /// Sets the player's move (ROCK, PAPER, or SCISSORS) for the current game.
    /// Arguments:
    /// - `player_move`: The move chosen by the player.
    public entry fun set_player_move(account: &signer, player_move: u8) acquires Game {
        let game = borrow_global_mut<Game>(signer::address_of(account));
        game.player_move = player_move;
    }

    /// Randomly generates the computer's move using the Aptos randomness module.
    #[randomness]
    entry fun randomly_set_computer_move(account: &signer) acquires Game {
        randomly_set_computer_move_internal(account);
    }

    /// Internal helper function that generates a random number between 1 and 3,
    /// representing ROCK, PAPER, or SCISSORS for the computer's move.
    public(friend) fun randomly_set_computer_move_internal(account: &signer) acquires Game {
        let game = borrow_global_mut<Game>(signer::address_of(account));
        let random_number = randomness::u8_range(1, 4);
        game.computer_move = random_number;
    }

    /// Finalizes the game by determining the result (win, draw, or loss) and updating the player's statistics.
    /// Also records the game in the player's game history.
    public entry fun finalize_game_results(account: &signer) acquires Game, GameHistory {
        let game = borrow_global_mut<Game>(signer::address_of(account));

        // Determine the winner based on the player and computer moves
        game.result = determine_winner(game.player_move, game.computer_move);

        // Update the game's statistics
        game.games_played = game.games_played + 1;
        if (game.result == 2) {
            game.player_wins = game.player_wins + 1; // Player wins
        } else if (game.result == 3) {
            game.computer_wins = game.computer_wins + 1; // Computer wins
        }

        // Record the completed game in the player's game history
        let history = borrow_global_mut<GameHistory>(signer::address_of(account));
        vector::push_back(&mut history.past_games, GameRecord {
            player_move: game.player_move,
            computer_move: game.computer_move,
            result: game.result,
        });
    }

    /// Helper function to determine the winner of the game.
    /// Returns:
    /// - 2 if the player wins.
    /// - 1 if it's a draw.
    /// - 3 if the computer wins.
    fun determine_winner(player_move: u8, computer_move: u8): u8 {
        if (player_move == ROCK && computer_move == SCISSORS) {
            2 // Player wins
        } else if (player_move == PAPER && computer_move == ROCK) {
            2 // Player wins
        } else if (player_move == SCISSORS && computer_move == PAPER) {
            2 // Player wins
        } else if (player_move == computer_move) {
            1 // Draw
        } else {
            3 // Computer wins
        }
    }

    /// View function to get the player's current move.
    /// Returns the player's move (ROCK, PAPER, or SCISSORS).
    #[view]
    public fun get_player_move(account_addr: address): u8 acquires Game {
        borrow_global<Game>(account_addr).player_move
    }

    /// View function to get the computer's current move.
    /// Returns the computer's move (ROCK, PAPER, or SCISSORS).
    #[view]
    public fun get_computer_move(account_addr: address): u8 acquires Game {
        borrow_global<Game>(account_addr).computer_move
    }

    /// View function to get the result of the current game.
    /// Returns:
    /// - 1 if it's a draw.
    /// - 2 if the player wins.
    /// - 3 if the computer wins.
    #[view]
    public fun get_game_results(account_addr: address): u8 acquires Game {
        borrow_global<Game>(account_addr).result
    }

    /// View function to retrieve the player's game history.
    /// Returns a vector of `GameRecord` structs, representing past games.
    #[view]
    public fun get_game_history(account_addr: address): vector<GameRecord> acquires GameHistory {
        borrow_global<GameHistory>(account_addr).past_games
    }

    /// View function to retrieve the player's score.
    /// Returns:
    /// - The total number of games played.
    /// - The total number of games won by the player.
    /// - The total number of games won by the computer.
    #[view]
    public fun get_score(account_addr: address): (u64, u64, u64) acquires Game {
        let game = borrow_global<Game>(account_addr);
        (game.games_played, game.player_wins, game.computer_wins)
    }
}
}
