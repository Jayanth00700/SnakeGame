import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type Point = { x: number; y: number };
type Difficulty = 'beginner' | 'medium' | 'hard';

const GRID_SIZE = 20;

const initialSnake: Point[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const initialDirection: Point = { x: 0, y: -1 };

export default function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>(initialSnake);
  const [direction, setDirection] = useState<Point>(initialDirection);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  let initialSpeed = 150;
  let speedDecreasePerApple = 5;

  switch (difficulty) {
    case 'beginner':
      initialSpeed = 200;
      speedDecreasePerApple = 3;
      break;
    case 'medium':
      initialSpeed = 150;
      speedDecreasePerApple = 5;
      break;
    case 'hard':
      initialSpeed = 100;
      speedDecreasePerApple = 8;
      break;
  }

  const currentSpeed = Math.max(50, initialSpeed - Math.floor(score / 10) * speedDecreasePerApple);

  // Use a ref to hold the current direction to prevent rapid double-key presses from causing self-collision
  const currentDirectionRef = useRef(direction);

  useEffect(() => {
    currentDirectionRef.current = direction;
  }, [direction]);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // eslint-disable-next-line no-loop-func
      const isOnSnake = currentSnake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      );
      if (!isOnSnake) break;
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(initialSnake);
    setDirection(initialDirection);
    setScore(0);
    setGameOver(false);
    setFood(generateFood(initialSnake));
    setIsStarted(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (!isStarted && e.key === ' ') {
        resetGame();
        return;
      }
      
      if (gameOver && e.key === ' ') {
        resetGame();
        return;
      }

      const { x, y } = currentDirectionRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          if (y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
          if (y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
          if (x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
          if (x !== -1) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStarted, gameOver, generateFood]);

  useEffect(() => {
    if (!isStarted || gameOver) return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const newHead = {
          x: head.x + direction.x,
          y: head.y + direction.y,
        };

        // Check wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setGameOver(true);
          setHighScore((prev) => Math.max(prev, score));
          return prevSnake;
        }

        // Check self collision
        if (
          prevSnake.some(
            (segment) => segment.x === newHead.x && segment.y === newHead.y
          )
        ) {
          setGameOver(true);
          setHighScore((prev) => Math.max(prev, score));
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((s) => s + 10);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop(); // Remove tail if no food eaten
        }

        return newSnake;
      });
    };

    const intervalId = setInterval(moveSnake, currentSpeed);
    return () => clearInterval(intervalId);
  }, [direction, food, gameOver, isStarted, currentSpeed, score, generateFood]);

  return (
    <div className="flex flex-col items-center justify-center p-4 xl:p-8 h-full w-full max-w-[600px] border-[8px] border-neon-cyan bg-black shadow-[-16px_16px_0_var(--color-neon-pink)] shrink-0 relative">
      {/* Header */}
      <div className="flex justify-between w-full mb-6 font-mono items-center uppercase">
        <div className="text-neon-cyan flex flex-col">
          <span className="text-xl">SCORE</span>
          <span className="text-3xl sm:text-4xl font-bold glitch-text" data-text={score.toString().padStart(6, '0')}>{score.toString().padStart(6, '0')}</span>
        </div>
        
        <div className="hidden sm:flex text-neon-pink text-sm flex-col items-center justify-center border-4 border-neon-pink px-3 py-1 bg-neon-pink/10 shadow-[4px_4px_0_var(--color-neon-cyan)] animate-pulse">
           <span>FREQ_HZ</span>
           <span className="font-bold">{Math.floor(200 - currentSpeed)} bps</span>
        </div>

        <div className="text-neon-cyan flex flex-col items-end">
          <span className="text-xl">HIGH_SCORE</span>
          <span className="text-3xl sm:text-4xl font-bold glitch-text" data-text={highScore.toString().padStart(6, '0')}>{highScore.toString().padStart(6, '0')}</span>
        </div>
      </div>

      {/* Game Board Container */}
      <div 
        className="relative border-[8px] border-neon-pink bg-[#0a0a0a] w-full"
        style={{
          aspectRatio: '1/1',
        }}
      >
        <svg 
           width="100%" 
           height="100%" 
           viewBox={`0 0 ${GRID_SIZE * 10} ${GRID_SIZE * 10}`} 
           className="absolute top-0 left-0 mix-blend-screen"
        >
          {/* Grid lines (optional styling) */}
          <defs>
             <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
               <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(0, 255, 255, 0.2)" strokeWidth="0.5"/>
             </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Food */}
          <rect
            x={food.x * 10 + 1}
            y={food.y * 10 + 1}
            width="8"
            height="8"
            fill="var(--color-neon-pink)"
            stroke="var(--color-neon-cyan)"
            strokeWidth="1"
            className="animate-pulse"
          />

          {/* Snake */}
          {snake.map((segment, index) => {
            const isHead = index === 0;
            return (
              <rect
                key={`${segment.x}-${segment.y}-${index}`}
                x={segment.x * 10}
                y={segment.y * 10}
                width="10"
                height="10"
                fill={isHead ? 'var(--color-neon-cyan)' : 'transparent'}
                stroke={isHead ? 'var(--color-neon-pink)' : 'var(--color-neon-cyan)'}
                strokeWidth="2"
              />
            );
          })}
        </svg>

        {/* Start / Game Over Overlays */}
        <AnimatePresence>
          {!isStarted && !gameOver && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10 font-mono border-4 border-neon-cyan p-4"
            >
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 text-center glitch-text uppercase" data-text="070SnakeGame">
                070SnakeGame
              </h2>
              
               <div className="flex gap-2 mb-6">
                {(['beginner', 'medium', 'hard'] as Difficulty[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`px-3 py-1 border-2 uppercase text-sm font-bold transition-all ${
                      difficulty === level 
                        ? 'border-neon-pink bg-neon-pink text-black' 
                        : 'border-neon-cyan text-neon-cyan hover:bg-neon-cyan/20'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>

              <p className="text-neon-pink mb-8 max-w-[250px] text-center text-xl uppercase bg-black border-2 border-neon-pink p-2">
                OVERRIDE CONTROLS: ARROWS / WASD
              </p>
              <button 
                onClick={resetGame}
                className="px-6 py-3 border-4 border-neon-cyan bg-neon-cyan text-black font-bold text-2xl uppercase hover:bg-neon-pink hover:border-neon-pink hover:text-white transition-all active:scale-95"
              >
                PLAY
              </button>
            </motion.div>
          )}

          {gameOver && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-neon-pink mix-blend-hard-light z-10 font-mono p-4"
            >
              <h2 className="text-5xl md:text-6xl font-bold text-black mb-4 text-center uppercase border-t-[8px] border-b-[8px] border-black w-full py-4 bg-neon-cyan">
                Snake Crashed
              </h2>
              <div className="bg-black border-4 border-neon-cyan p-6 mb-4 flex flex-col items-center shadow-[10px_10px_0_var(--color-neon-cyan)] mt-4">
                 <p className="text-neon-pink text-xl uppercase mb-2">END_OF_LINE</p>
                 <p className="text-white text-6xl font-bold glitch-text" data-text={score.toString().padStart(6, '0')}>{score.toString().padStart(6, '0')}</p>
              </div>

              <div className="flex gap-2 mb-8">
                {(['beginner', 'medium', 'hard'] as Difficulty[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`px-3 py-1 border-4 uppercase text-lg font-bold transition-all ${
                      difficulty === level 
                        ? 'border-black bg-black text-neon-cyan' 
                        : 'border-black text-black hover:bg-black/20'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>

              <button 
                onClick={resetGame}
                className="px-8 py-3 border-[8px] border-black bg-black text-neon-cyan font-bold text-4xl uppercase hover:bg-white hover:text-black transition-all active:scale-95"
              >
                PLAY AGAIN
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Mobile controls */}
      <div className="mt-6 grid grid-cols-3 gap-2 sm:hidden w-full max-w-[200px] mb-4">
         <div />
         <button onClick={() => setDirection({x:0, y:-1})} className="h-16 bg-black border-[4px] border-neon-pink text-neon-cyan text-3xl active:bg-neon-cyan active:text-black hover:border-neon-cyan transition-colors">↑</button>
         <div />
         <button onClick={() => setDirection({x:-1, y:0})} className="h-16 bg-black border-[4px] border-neon-pink text-neon-cyan text-3xl active:bg-neon-cyan active:text-black hover:border-neon-cyan transition-colors">←</button>
         <button onClick={() => setDirection({x:0, y:1})} className="h-16 bg-black border-[4px] border-neon-pink text-neon-cyan text-3xl active:bg-neon-cyan active:text-black hover:border-neon-cyan transition-colors">↓</button>
         <button onClick={() => setDirection({x:1, y:0})} className="h-16 bg-black border-[4px] border-neon-pink text-neon-cyan text-3xl active:bg-neon-cyan active:text-black hover:border-neon-cyan transition-colors">→</button>
      </div>
    </div>
  );
}
