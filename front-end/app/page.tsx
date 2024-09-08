"use client";

import { useToast } from "@/components/hooks/use-toast";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Wallet,
  PlayCircle,
  Hand,
  Scroll,
  Scissors,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  Eye,
  EyeOff,
  History,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useWallet, WalletName } from "@aptos-labs/wallet-adapter-react";
import { AptosClient, BCS, HexString, TxnBuilderTypes } from "aptos";
import { blockchainUtils } from "./utils/blockchainUtils";
import { toast } from "@/hooks/use-toast";

// Constants
const moveEmojis: { [key: string]: string } = {
  rock: "🪨",
  paper: "📄",
  scissors: "✂️",
};

export default function MoveMaster() {
  const [aptosClient, setAptosClient] = useState<AptosClient | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [dollarEstimate, setDollarEstimate] = useState<number | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerMove, setPlayerMove] = useState<string | null>(null);
  const [computerMove, setComputerMove] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const [gameSessions, setGameSessions] = useState<GameSession[]>([]);
  const [currentSession, setCurrentSession] = useState<GameSession | null>(
    null
  );
  const [showGameBoard, setShowGameBoard] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  const {
    connected,
    account,
    disconnect,
    connect,
    wallet,
    network,
    signAndSubmitTransaction,
  } = useWallet();
  useEffect(() => {
    // Connect to the Aptos network when wallet is connected
    if (connected && network && account?.address) {
      const { address } = account;
      console.log("Connected to wallet:", account);

      const client = new AptosClient(network.url);
      setAptosClient(client);
      setWalletConnected(true);
      setWalletAddress(address);
      fetchScore(); // Fetch the score
      setIsLoading(false);
    } else {
      setWalletConnected(false);
      setWalletAddress(null);
    }
  }, [connected, account]);

  // Function to fetch the score from the contract
  const fetchScore = async () => {
    if (!walletAddress) {
      return;
    }
    try {
      const score = await blockchainUtils.fetchScore(walletAddress);
      if (score !== null) {
        setPlayerScore(score);
      }
      // Fetch the computer's score if needed
    } catch (error) {
      console.error("Error fetching score:", error);
    }
  };

  // Function to handle wallet connection
  const handleConnectWallet = async () => {
    setIsLoading(true);
    try {
      await connect("Petra" as WalletName<"Petra">);
      fetchScore();
      fetchGameHistory();
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
    setIsLoading(false);
  };

  // Function to start a new game
  const handleStartGame = async () => {
    setIsLoading(true);
    if (!walletAddress) {
      return;
    }
    try {
      await signAndSubmitTransaction({
        sender: account?.address,
        data: {
          function: `${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}::RockPaperScissors::create_new_game`,
          typeArguments: [],
          functionArguments: [],
        },
      });
      const newSession = await createNewGameSession();
      setCurrentSession(newSession);
      setGameSessions((prevSessions) => [newSession, ...prevSessions]);
      setGameStarted(true);
      setPlayerMove(null);
      setComputerMove(null);
      setResult(null);
      fetchScore();
    } catch (error) {
      console.error("Error starting game:", error);
    }
    setIsLoading(false);
  };

  // Function to handle player move
  const handleMove = async (move: string) => {
    setIsLoading(true);
    setPlayerMove(move);
    if (!walletAddress) {
      return;
    }
    try {
      await signAndSubmitTransaction({
        sender: account?.address,
        data: {
          function: `${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}::RockPaperScissors::set_player_move`,
          typeArguments: [],
          functionArguments: [
            {
              type: "u8",
              value: moveToU8(move),
            },
          ],
        },
      });
      await signAndSubmitTransaction({
        sender: account?.address,
        data: {
          function: `${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}::RockPaperScissors::set_computer_move`,
          typeArguments: [],
          functionArguments: [],
        },
      });

      const computerMove = await blockchainUtils.fetchComputerMove(
        walletAddress
      );
      setComputerMove(computerMove);
      await signAndSubmitTransaction({
        sender: account?.address,
        data: {
          function: `${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}::RockPaperScissors::finalize_game_results`,
          typeArguments: [],
          functionArguments: [],
        },
      });
      const resultResponse = await blockchainUtils.fetchGameResult(
        walletAddress
      );
      const gameResult = getResult(move, resultResponse);
      setResult(gameResult);
      updateScores(gameResult);
      addMoveToCurrentSession(move, computerMove, gameResult);
      fetchScore();
    } catch (error) {
      console.error("Error submitting move:", error);
    }
    setIsLoading(false);
  };

  // Function to create a new game session
  const createNewGameSession = async () => {
    if (!walletAddress) {
      return;
    }
    try {
      await signAndSubmitTransaction({
        sender: account?.address,
        data: {
          function: `${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}::RockPaperScissors::create_new_game_session`,
          typeArguments: [],
          functionArguments: [],
        },
      });
      // Fetch the latest game session after successful creation
      const latestSession = await blockchainUtils.fetchGameHistory(
        walletAddress
      );
      // ... process latestSession to extract the session data
      return latestSession;
    } catch (error) {
      console.error("Error creating new game session:", error);
    }
  };

  const getResult = (playerMove: string, computerMove: string) => {
    if (playerMove === computerMove) return "It's a tie! 🤝";
    if (
      (playerMove === "rock" && computerMove === "scissors") ||
      (playerMove === "paper" && computerMove === "rock") ||
      (playerMove === "scissors" && computerMove === "paper")
    ) {
      return "You win! 🎉";
    }
    return "Computer wins! 💻";
  };

  const updateScores = (result: string) => {
    if (result === "You win! 🎉") {
      setPlayerScore((prevScore) => prevScore + 1);
    } else if (result === "Computer wins! 💻") {
      setComputerScore((prevScore) => prevScore + 1);
    }
  };

  const addMoveToCurrentSession = (
    playerMove: string,
    computerMove: string,
    result: string
  ) => {
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        moves: [...currentSession.moves, { playerMove, computerMove, result }],
      };
      setCurrentSession(updatedSession);
      setGameSessions((prevSessions) => [
        updatedSession,
        ...prevSessions.slice(1),
      ]);
    }
  };

  const resetGame = () => {
    setPlayerMove(null);
    setComputerMove(null);
    setResult(null);
  };

  const copyToClipboard = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const fetchGameHistory = async () => {
    if (!walletAddress) {
      return;
    }
    try {
      const history = await blockchainUtils.fetchGameHistory(walletAddress);
      setGameSessions(
        history.map((session) => ({
          id: session.timestamp,
          moves: session.moves.map((move) => ({
            playerMove: u8ToMove(move.player_move),
            computerMove: u8ToMove(move.computer_move),
            result: u8ToMove(move.result),
          })),
          timestamp: session.timestamp * 1000, // Convert from seconds to milliseconds
        }))
      );
    } catch (error) {
      console.error("Error fetching game history:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="flex justify-between items-start p-4 bg-white shadow-md">
        {walletConnected &&
        walletBalance !== null &&
        dollarEstimate !== null ? (
          <div className="text-left">
            <p className="font-bold">Balance: {walletBalance} APT</p>
            <p className="text-sm text-gray-600">
              ${dollarEstimate.toFixed(2)} USD
            </p>
          </div>
        ) : (
          <div></div>
        )}
        {walletConnected && walletAddress ? (
          <div className="flex flex-col items-end">
            <Button
              variant="outline"
              onClick={() => setShowAddress(!showAddress)}
              aria-expanded={showAddress}
              aria-controls="wallet-address"
            >
              Address{" "}
              {showAddress ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : (
                <ChevronDown className="ml-2 h-4 w-4" />
              )}
            </Button>
            <AnimatePresence>
              {showAddress && (
                <motion.div
                  id="wallet-address"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-2 bg-gray-100 p-2 rounded-md flex items-center justify-between"
                >
                  <span className="text-sm font-mono mr-2">
                    {walletAddress}
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={copyToClipboard}
                          aria-label="Copy wallet address"
                        >
                          {copied ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{copied ? "Copied!" : "Copy address"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div></div>
        )}
      </div>
      <div className="flex-grow flex items-center justify-center p-4">
        <BackgroundAnimation />
        <AnimatePresence>
          {showGameBoard && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md"
            >
              <Card className="w-full mx-auto relative z-10">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-3xl font-bold">
                    MoveMaster 🎮
                  </CardTitle>
                  {walletConnected && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleStartGame}
                      aria-label="New game"
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                  <ScoreBoard
                    playerScore={playerScore}
                    computerScore={computerScore}
                  />
                  {!account?.address && (
                    <Button
                      onClick={handleConnectWallet}
                      className="w-full"
                      disabled={isLoading}
                    >
                      <Wallet className="mr-2 h-4 w-4" />
                      {isLoading ? "Connecting..." : "Connect Wallet"}
                    </Button>
                  )}
                  {account?.address && !gameStarted && (
                    <Button
                      onClick={handleStartGame}
                      className="w-full"
                      disabled={isLoading}
                    >
                      <PlayCircle className="mr-2 h-4 w-4" />
                      {isLoading ? "Starting..." : "Start Game"}
                    </Button>
                  )}
                  {gameStarted && !playerMove && (
                    <div className="w-full flex justify-between">
                      {["rock", "paper", "scissors"].map((move) => (
                        <Button
                          key={move}
                          onClick={() => handleMove(move)}
                          disabled={isLoading}
                          className="flex-1 mx-1 flex flex-col items-center"
                        >
                          {move === "rock" && <Hand className="mb-2 h-6 w-6" />}
                          {move === "paper" && (
                            <Scroll className="mb-2 h-6 w-6" />
                          )}
                          {move === "scissors" && (
                            <Scissors className="mb-2 h-6 w-6" />
                          )}
                          {move.charAt(0).toUpperCase() + move.slice(1)}
                        </Button>
                      ))}
                    </div>
                  )}
                  {playerMove && (
                    <div className="text-center space-y-4">
                      <p className="text-xl">
                        Your move: {moveEmojis[playerMove]} {playerMove}
                      </p>
                      <p className="text-xl">
                        Computer's move: {moveEmojis[computerMove!]}{" "}
                        {computerMove}
                      </p>
                      <p className="text-2xl font-bold mt-4">{result}</p>
                      <Button onClick={resetGame} className="w-full">
                        Play Again 🔄
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, y: 300 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 300 }}
            transition={{ duration: 0.5 }}
            className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4"
            style={{ height: "60vh" }}
          >
            <h3 className="text-lg font-semibold mb-2">Game History</h3>
            <ScrollArea className="h-full">
              <Accordion type="single" collapsible className="w-full">
                {gameSessions.map((session, index) => (
                  <AccordionItem
                    key={session.id}
                    value={`session-${session.id}`}
                  >
                    <AccordionTrigger>
                      Game Session {gameSessions.length - index} -{" "}
                      {session.timestamp.toLocaleString()}
                    </AccordionTrigger>
                    <AccordionContent>
                      {session.moves.map((move, moveIndex) => (
                        <div
                          key={moveIndex}
                          className="flex justify-between items-center mt-1 p-2 bg-gray-100 rounded"
                        >
                          <div>
                            <span className="mr-2">
                              {moveEmojis[move.playerMove]}
                            </span>
                            <span>vs</span>
                            <span className="ml-2">
                              {moveEmojis[move.computerMove]}
                            </span>
                          </div>
                          <div className="text-sm">{move.result}</div>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="fixed bottom-4 right-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowGameBoard(!showGameBoard)}
                aria-label="Toggle game board"
              >
                {showGameBoard ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{showGameBoard ? "Hide game board" : "Show game board"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="fixed bottom-4 left-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowHistory(!showHistory)}
                aria-label="Toggle game history"
              >
                <History className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{showHistory ? "Hide game history" : "Show game history"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

function ScoreBoard({
  playerScore,
  computerScore,
}: {
  playerScore: number;
  computerScore: number;
}) {
  return (
    <div className="flex justify-between w-full mb-4">
      <motion.div
        className="text-center"
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 0.3 }}
      >
        <p className="font-bold">You</p>
        <p className="text-2xl">{playerScore}</p>
      </motion.div>
      <motion.div
        className="text-center"
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 0.3 }}
      >
        <p className="font-bold">Computer</p>
        <p className="text-2xl">{computerScore}</p>
      </motion.div>
    </div>
  );
}

function BackgroundAnimation() {
  const [symbols, setSymbols] = useState<
    Array<{ id: number; type: string; x: number; y: number }>
  >([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSymbols((prevSymbols) => {
        const newSymbol = {
          id: Date.now(),
          type: ["🪨", "📄", "✂️"][Math.floor(Math.random() * 3)],
          x: Math.random() * 100,
          y: -10,
        };
        return [...prevSymbols.slice(-20), newSymbol];
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {symbols.map((symbol) => (
        <motion.div
          key={symbol.id}
          className="absolute text-4xl opacity-20"
          initial={{ x: `${symbol.x}vw`, y: "-10vh" }}
          animate={{ y: "110vh" }}
          transition={{ duration: 10, ease: "linear" }}
          exit={{ opacity: 0 }}
        >
          {symbol.type}
        </motion.div>
      ))}
    </div>
  );
}

interface GameMove {
  playerMove: string;
  computerMove: string;
  result: string;
}

interface GameSession {
  id: number;
  moves: GameMove[];
  timestamp: number;
}
