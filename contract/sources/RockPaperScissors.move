address 0xbba33b0f1b7cbe42bac68eab636ffa3b349debbad7650a3e39cce13d2c749bdf {

module RockPaperScissors {
    use std::signer;
    use aptos_framework::randomness;
    use aptos_framework::vector;
    use aptos_framework::timestamp;

    const ROCK: u8 = 1;
    const PAPER: u8 = 2;
    const SCISSORS: u8 = 3;

    struct Game has key {
        player: address,
        player_move: u8,
        computer_move: u8,
        result: u8,
        games_played: u64,
        player_wins: u64,
        computer_wins: u64,
    }

    struct GameHistory has key {
        player: address,
        past_games: vector<GameSession>,
    }

    struct GameSession has copy, drop, store {
        timestamp: u64,
        moves: vector<GameRecord>,
    }

    struct GameRecord has copy, drop, store {
        player_move: u8,
        computer_move: u8,
        result: u8,
    }

    public entry fun create_new_game(account: &signer) {
        let player = signer::address_of(account);

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

        if (!exists<GameHistory>(player)) {
            let game_history = GameHistory {
                player,
                past_games: vector::empty<GameSession>(),
            };
            move_to(account, game_history);
        }
    }

    public entry fun set_player_move(account: &signer, player_move: u8) acquires Game {
        let game = borrow_global_mut<Game>(signer::address_of(account));
        assert!(game.result == 0, 100);
        game.player_move = player_move;
    }

    fun randomly_set_computer_move_internal(): u8 {
        randomness::u8_range(1, 4)
    }

    #[randomness]
    public(friend) entry fun set_computer_move(account: &signer) acquires Game {
        let game = borrow_global_mut<Game>(signer::address_of(account));
        assert!(game.result == 0, 100);
        let random_number = randomly_set_computer_move_internal();
        game.computer_move = random_number;
    }

    public entry fun finalize_game_results(account: &signer) acquires Game, GameHistory {
        let player = signer::address_of(account);
        let game = borrow_global_mut<Game>(player);
        assert!(game.player_move != 0 && game.computer_move != 0, 102);
        game.result = determine_winner(game.player_move, game.computer_move);
        game.games_played = game.games_played + 1;
        if (game.result == 2) {
            game.player_wins = game.player_wins + 1;
        } else if (game.result == 3) {
            game.computer_wins = game.computer_wins + 1;
        };

        let history = borrow_global_mut<GameHistory>(player);
        let now = timestamp::now_seconds(); // Get current timestamp
        let session = GameSession {
            timestamp: now,
            moves: vector::empty<GameRecord>(),
        };
        vector::push_back(&mut history.past_games, session);

        // Get the index of the last session and safely access it
        let last_session_index = vector::length(&history.past_games) - 1;
        let last_session_ref = vector::borrow_mut(&mut history.past_games, last_session_index);

        // Add the current move to the last game session
        vector::push_back(&mut last_session_ref.moves, GameRecord {
            player_move: game.player_move,
            computer_move: game.computer_move,
            result: game.result,
        });
    }

    public entry fun create_new_game_session(account: &signer) acquires GameHistory {
        let player = signer::address_of(account);
        let history = borrow_global_mut<GameHistory>(player);
        let now = timestamp::now_seconds(); // Get current timestamp
        let session = GameSession {
            timestamp: now,
            moves: vector::empty<GameRecord>(),
        };
        vector::push_back(&mut history.past_games, session);
    }

    // Determine the winner: 2 = player wins, 1 = draw, 3 = computer wins
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

    // Reset the game after it concludes to allow starting a new round
    public entry fun reset_game(account: &signer) acquires Game {
        let game = borrow_global_mut<Game>(signer::address_of(account));

        // Ensure the game has been finalized before resetting
        assert!(game.result != 0, 103); // 103 = Game is still in progress

        game.player_move = 0;
        game.computer_move = 0;
        game.result = 0;
    }

    // View function to check if the game is in progress (result == 0 means in progress)
    #[view]
    public fun is_game_in_progress(account_addr: address): bool acquires Game {
        let game = borrow_global<Game>(account_addr);
        game.result == 0
    }

    // View function to get the player's move
    #[view]
    public fun get_player_move(account_addr: address): u8 acquires Game {
        borrow_global<Game>(account_addr).player_move
    }

    // View function to get the computer's move
    #[view]
    public fun get_computer_move(account_addr: address): u8 acquires Game {
        borrow_global<Game>(account_addr).computer_move
    }

    // View function to get the game results
    #[view]
    public fun get_game_results(account_addr: address): u8 acquires Game {
        borrow_global<Game>(account_addr).result
    }

    // View function to get the player's game history
    #[view]
    public fun get_game_history(account_addr: address): vector<GameSession> acquires GameHistory {
        borrow_global<GameHistory>(account_addr).past_games
    }

    // View function to get the player's score (games played, player wins, computer wins)
    #[view]
    public fun get_score(account_addr: address): (u64, u64, u64) acquires Game {
        let game = borrow_global<Game>(account_addr);
        (game.games_played, game.player_wins, game.computer_wins)
    }
}

}
