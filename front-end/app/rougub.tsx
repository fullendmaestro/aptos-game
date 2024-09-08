"use client";

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
import BackgroundAnimation from "@/components/BackgroundAnimation";
import ScoreBoard from "@/components/ScoreBoard";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { AptosClient, BCS, HexString, TxnBuilderTypes } from "aptos";
import { useNetwork } from "@aptos-labs/wallet-adapter-react";
import { useAccount } from "@aptos-labs/wallet-adapter-react";
import { blockchainUtils } from "@/utils/blockchainUtils"; // Import your blockchain utils module

// Constants
const moveEmojis: { [key: string]: string } = {
  rock: "🪨",
  paper: "📄",
  scissors: "✂️",
};

export default function MoveMaster() {
  const {
    connected,
    account, // This object contains network and address
    disconnect,
    connect, // Use the connect function
  } = useWallet();

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
  const [gameLoading, setGameLoading] = useState(false);
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

  useEffect(() => {
    // Connect to the Aptos network when wallet is connected
    if (connected && account?.network && account.address) {
      const { network, address } = account;
      const client = new AptosClient(network.rpcUrl);
      setAptosClient(client);
      setWalletConnected(true);
      setWalletAddress(address);
      fetchScore();
    } else {
      setWalletConnected(false);
      setWalletAddress(null);
    }
  }, [connected, account]);

  // Function to fetch the score from the contract
  const fetchScore = async () => {
    if (!aptosClient || !walletAddress) {
      return;
    }
    try {
      const score = await blockchainUtils.fetchScore(
        aptosClient,
        walletAddress
      );
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
    try {
      await connect(); // Use connect() from useWallet to connect to Petra
      fetchScore();
      fetchGameHistory();
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  // Function to start the game
  const handleStartGame = async () => {
    setIsLoading(true);
    if (!aptosClient || !walletAddress) {
      return;
    }
    try {
      await blockchainUtils.createNewGame(aptosClient, walletAddress); // Start a new game using blockchainUtils
      const newSession = await blockchainUtils.createNewGameSession(
        aptosClient,
        walletAddress
      ); // Create a new game session using blockchainUtils
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
    setGameLoading(false);
  };

  const handleMove = async (move: string) => {
    setIsLoading(true);
    setPlayerMove(move);
    if (!aptosClient || !walletAddress) {
      return;
    }
    try {
      await blockchainUtils.setPlayerMove(aptosClient, walletAddress, move);
      await blockchainUtils.setComputerMove(aptosClient, walletAddress);
      const computerMove = await blockchainUtils.getComputerMove(
        aptosClient,
        walletAddress
      );
      setComputerMove(computerMove);
      await blockchainUtils.finalizeGameResults(aptosClient, walletAddress);
      const resultResponse = await blockchainUtils.getGameResults(
        aptosClient,
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
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleStartGame}
                    aria-label="New game"
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                  <ScoreBoard
                    playerScore={playerScore}
                    computerScore={computerScore}
                  />
                  {!walletConnected && (
                    <Button
                      onClick={handleConnectWallet}
                      className="w-full"
                      disabled={isLoading}
                    >
                      <Wallet className="mr-2 h-4 w-4" />
                      {isLoading ? "Connecting..." : "Connect Wallet"}
                    </Button>
                  )}
                  {walletConnected && !gameStarted && (
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
