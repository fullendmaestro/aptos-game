"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Wallet, PlayCircle, Hand, Scroll, Scissors } from "lucide-react";

// Placeholder functions (same as before)
const connectWallet = async () => {
  return new Promise((resolve) => setTimeout(() => resolve(true), 1000));
};

const startGame = async () => {
  return new Promise((resolve) => setTimeout(() => resolve(true), 1000));
};

const submitMove = async (move: string) => {
  return new Promise((resolve) =>
    setTimeout(() => {
      const computerMove = ["rock", "paper", "scissors"][
        Math.floor(Math.random() * 3)
      ];
      resolve(computerMove);
    }, 1000)
  );
};

const moveEmojis: { [key: string]: string } = {
  rock: "🪨",
  paper: "📄",
  scissors: "✂️",
};

export default function Component() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerMove, setPlayerMove] = useState<string | null>(null);
  const [computerMove, setComputerMove] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);

  const handleConnectWallet = async () => {
    setIsLoading(true);
    const connected = await connectWallet();
    setWalletConnected(connected);
    setIsLoading(false);
  };

  const handleStartGame = async () => {
    setIsLoading(true);
    const started = await startGame();
    setGameStarted(started);
    setIsLoading(false);
  };

  const handleMove = async (move: string) => {
    setIsLoading(true);
    setPlayerMove(move);
    const computerMove = (await submitMove(move)) as string;
    setComputerMove(computerMove);
    const gameResult = getResult(move, computerMove);
    setResult(gameResult);
    updateScores(gameResult);
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

  const resetGame = () => {
    setPlayerMove(null);
    setComputerMove(null);
    setResult(null);
  };

  return (
    <>
      <BackgroundAnimation />
      <Card className="w-full max-w-md mx-auto relative z-10">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            MoveMaster 🎮
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <ScoreBoard playerScore={playerScore} computerScore={computerScore} />
          <AnimatePresence mode="wait">
            {!walletConnected && (
              <motion.div
                key="connect"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <Button
                  onClick={handleConnectWallet}
                  className="w-full"
                  disabled={isLoading}
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  {isLoading ? "Connecting..." : "Connect Wallet"}
                </Button>
              </motion.div>
            )}
            {walletConnected && !gameStarted && (
              <motion.div
                key="start"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <Button
                  onClick={handleStartGame}
                  className="w-full"
                  disabled={isLoading}
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  {isLoading ? "Starting..." : "Start Game"}
                </Button>
              </motion.div>
            )}
            {gameStarted && !playerMove && (
              <motion.div
                key="moves"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.3 }}
                className="w-full flex justify-between"
              >
                {["rock", "paper", "scissors"].map((move) => (
                  <Button
                    key={move}
                    onClick={() => handleMove(move)}
                    disabled={isLoading}
                    className="flex-1 mx-1 flex flex-col items-center"
                  >
                    {move === "rock" && <Hand className="mb-2 h-6 w-6" />}
                    {move === "paper" && <Scroll className="mb-2 h-6 w-6" />}
                    {move === "scissors" && (
                      <Scissors className="mb-2 h-6 w-6" />
                    )}
                    {move.charAt(0).toUpperCase() + move.slice(1)}
                  </Button>
                ))}
              </motion.div>
            )}
            {playerMove && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="text-center space-y-4"
              >
                <p className="text-xl">
                  Your move: {moveEmojis[playerMove]} {playerMove}
                </p>
                <p className="text-xl">
                  Computer's move: {moveEmojis[computerMove!]} {computerMove}
                </p>
                <motion.p
                  className="text-2xl font-bold mt-4"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  {result}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        {result && (
          <CardFooter>
            <Button onClick={resetGame} className="w-full">
              Play Again 🔄
            </Button>
          </CardFooter>
        )}
      </Card>
    </>
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
