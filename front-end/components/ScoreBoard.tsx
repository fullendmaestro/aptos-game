import { motion } from "framer-motion";

export default function ScoreBoard({
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
