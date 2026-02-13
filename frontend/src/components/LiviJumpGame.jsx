import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const LiviJumpGame = ({ onEnd }) => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Game constants
  const GRAVITY = 0.6;
  const JUMP_FORCE = -12;
  const OBSTACLE_SPEED = 5;
  const SPAWN_INTERVAL = 1500; // ms

  // Game state refs (to avoid closure issues in loop)
  const gameState = useRef({
    livi: { y: 150, vy: 0, width: 40, height: 40, isJumping: false },
    obstacles: [],
    frameId: null,
    lastSpawn: 0,
    speed: OBSTACLE_SPEED,
    score: 0
  });

  const playSound = (type) => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    if (type === 'jump') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'hit') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } else if (type === 'point') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.setValueAtTime(1000, audioCtx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    }
  };

  const jump = () => {
    if (!gameState.current.livi.isJumping && !gameOver) {
      gameState.current.livi.vy = JUMP_FORCE;
      gameState.current.livi.isJumping = true;
      playSound('jump');
    }
    if (!gameStarted) setGameStarted(true);
    if (gameOver) resetGame();
  };

  const resetGame = () => {
    gameState.current = {
      livi: { y: 150, vy: 0, width: 40, height: 40, isJumping: false },
      obstacles: [],
      frameId: null,
      lastSpawn: 0,
      speed: OBSTACLE_SPEED,
      score: 0
    };
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const update = (time) => {
      if (!gameStarted || gameOver) {
        gameState.current.frameId = requestAnimationFrame(update);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // --- LIVI LOGIC ---
      const { livi } = gameState.current;
      livi.vy += GRAVITY;
      livi.y += livi.vy;

      const groundY = canvas.height - 50;
      if (livi.y > groundY - livi.height) {
        livi.y = groundY - livi.height;
        livi.vy = 0;
        livi.isJumping = false;
      }

      // Draw Livi (Chrome style but purple/cute)
      ctx.fillStyle = '#6c5ce7';
      // Simple Livi body
      ctx.beginPath();
      ctx.roundRect(50, livi.y, livi.width, livi.height, 10);
      ctx.fill();
      // Eyes
      ctx.fillStyle = 'white';
      ctx.fillRect(75, livi.y + 10, 5, 5);
      
      // --- OBSTACLES LOGIC ---
      if (time - gameState.current.lastSpawn > SPAWN_INTERVAL / (1 + gameState.current.score / 100)) {
        gameState.current.obstacles.push({
          x: canvas.width,
          width: 20 + Math.random() * 30,
          height: 30 + Math.random() * 40
        });
        gameState.current.lastSpawn = time;
      }

      ctx.fillStyle = '#ff7675';
      gameState.current.obstacles.forEach((obs, index) => {
        obs.x -= gameState.current.speed + (gameState.current.score / 50);
        
        // Draw obstacle (Cactus-like)
        ctx.beginPath();
        ctx.roundRect(obs.x, groundY - obs.height, obs.width, obs.height, 5);
        ctx.fill();

        // Collision detection
        if (
          50 < obs.x + obs.width &&
          50 + livi.width > obs.x &&
          livi.y < (groundY - obs.height) + obs.height &&
          livi.y + livi.height > groundY - obs.height
        ) {
          setGameOver(true);
          playSound('hit');
        }

        // Point detection
        if (!obs.passed && obs.x < 50) {
            obs.passed = true;
            gameState.current.score += 1;
            setScore(gameState.current.score);
            if (gameState.current.score % 10 === 0) playSound('point');
        }
      });

      // Cleanup
      gameState.current.obstacles = gameState.current.obstacles.filter(obs => obs.x + obs.width > 0);

      // --- GROUND LINE ---
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(canvas.width, groundY);
      ctx.stroke();

      gameState.current.frameId = requestAnimationFrame(update);
    };

    gameState.current.frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(gameState.current.frameId);
  }, [gameStarted, gameOver]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zHost: 2000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', touchAction: 'none' }} onClick={jump}>
      <button onClick={(e) => { e.stopPropagation(); onEnd(score); }} style={{ position: 'absolute', top: '40px', right: '30px', background: 'none', border: 'none', color: 'white' }}>
        <X size={32} />
      </button>

      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '14px', opacity: 0.6, letterSpacing: '2px' }}>LIVI JUMP</div>
        <div style={{ fontSize: '48px', fontWeight: 900, fontFamily: 'monospace' }}>{score.toString().padStart(5, '0')}</div>
      </div>

      <canvas 
        ref={canvasRef} 
        width={window.innerWidth > 500 ? 500 : window.innerWidth} 
        height={300}
        style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '20px' }}
      />

      <AnimatePresence>
        {!gameStarted && !gameOver && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '20px', fontWeight: 800 }}>TAP TO JUMP</motion.div>
        )}
        {gameOver && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', marginTop: '20px' }}>
            <div style={{ color: '#ff7675', fontWeight: 900, fontSize: '24px' }}>GAME OVER</div>
            <div style={{ opacity: 0.6, marginTop: '10px' }}>TAP TO RESTART</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiviJumpGame;
