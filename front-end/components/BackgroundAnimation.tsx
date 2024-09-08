import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function BackgroundAnimation() {
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
