import React, { useState, useEffect, useRef } from 'react';
import { Rocket, Bomb, ArrowLeft, ArrowRight } from 'lucide-react';

const SpaceDodgeGame = ({ onEnd }) => {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [playerX, setPlayerX] = useState(50); // % position
  
  const obstaclesRef = useRef([]);
  const requestRef = useRef();
  const scoreRef = useRef(0);
  const isGameOverRef = useRef(false);
  
  useEffect(() => {
    let lastTime = Date.now();
    let spawnTimer = 0;
    
    const loop = () => {
        if (isGameOverRef.current) return;
        
        const now = Date.now();
        const dt = Math.min((now - lastTime) / 1000, 0.1); // Cap dt
        lastTime = now;
        
        // Spawn obstacles
        spawnTimer += dt;
        if (spawnTimer > Math.max(0.2, 0.6 - (scoreRef.current * 0.001))) {
            obstaclesRef.current.push({
                id: Date.now() + Math.random(),
                x: Math.random() * 90 + 5, // 5-95%
                y: -10,
                speed: 30 + (scoreRef.current * 0.2)
            });
            spawnTimer = 0;
        }

        // Update obstacles
        obstaclesRef.current.forEach(obs => {
            obs.y += obs.speed * dt;
        });

        // Remove off-screen
        obstaclesRef.current = obstaclesRef.current.filter(obs => obs.y < 110);

        // Collision Check (Simple box logic relative to percentage view)
        // Player is at playerX, 85% top (bottom 15%)
        // Width approx 10%, Height approx 5% aspect ratio dependent but lets approximate
        const pX = playerX;
        const pY = 85; 
        
        for (let obs of obstaclesRef.current) {
             // Distance check
             const dx = obs.x - pX;
             const dy = obs.y - pY;
             const dist = Math.sqrt(dx*dx + dy*dy);
             if (dist < 8) { // Hit radius
                 handleGameOver();
                 return;
             }
        }
        
        scoreRef.current += dt * 10;
        setScore(Math.floor(scoreRef.current));
        
        requestRef.current = requestAnimationFrame(loop);
    };
    
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);
  
  const handleGameOver = () => {
      isGameOverRef.current = true;
      setGameOver(true);
      if (window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      cancelAnimationFrame(requestRef.current);
  };
  
  const move = (dir) => {
      if (isGameOverRef.current) return;
      setPlayerX(prev => Math.max(10, Math.min(90, prev + dir * 15)));
      if (window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0f0f14', zIndex: 500, overflow: 'hidden', touchAction: 'none' }}>
        {/* Stars Bg */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.5 }}>
            {[...Array(20)].map((_, i) => (
                <div key={i} style={{ 
                    position: 'absolute', 
                    top: `${Math.random()*100}%`, 
                    left: `${Math.random()*100}%`, 
                    width: '2px', height: '2px', background: 'white' 
                }} />
            ))}
        </div>

        <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', fontWeight: 900, fontSize: '24px' }}>
            Score: {score}
        </div>
        
        <div style={{ position: 'absolute', top: 20, right: 20, color: 'rgba(255,255,255,0.5)', fontWeight: 800, fontSize: '12px' }}>
            Tap L/R to move
        </div>
        
        {/* Player */}
        <div style={{ position: 'absolute', top: '85%', left: `${playerX}%`, transform: 'translate(-50%, -50%)', transition: 'left 0.1s ease-out' }}>
            <Rocket size={48} color="#00d2ff" fill="#00d2ff" style={{ filter: 'drop-shadow(0 0 10px #00d2ff)' }} />
        </div>
        
        {/* Obstacles */}
        {obstaclesRef.current.map(obs => (
            <div key={obs.id} style={{ position: 'absolute', top: `${obs.y}%`, left: `${obs.x}%`, transform: 'translate(-50%, -50%)' }}>
                <Bomb size={32} color="#ff7675" fill="#ff7675" style={{ filter: 'drop-shadow(0 0 10px #ff7675)' }} />
            </div>
        ))}
        
        {/* Controls Overlay */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', zIndex: 10 }}>
            <div onClick={() => move(-1)} style={{ flex: 1, active: { background: 'rgba(255,255,255,0.05)' } }}></div>
            <div onClick={() => move(1)} style={{ flex: 1, active: { background: 'rgba(255,255,255,0.05)' } }}></div>
        </div>

        {gameOver && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', zIndex: 100 }}>
                <h1 style={{ fontSize: '48px', fontWeight: 900, marginBottom: '20px', color: '#ff7675' }}>CRASHED!</h1>
                <div style={{ fontSize: '24px', marginBottom: '40px', fontWeight: 800 }}>Score: {score}</div>
                <button onClick={() => onEnd(score)} style={{ padding: '16px 40px', background: 'white', border: 'none', color: 'black', borderRadius: '24px', fontWeight: 900, fontSize: '18px', boxShadow: '0 5px 20px rgba(255,255,255,0.2)' }}>Continue</button>
            </div>
        )}
    </div>
  );
};

export default SpaceDodgeGame;