import React, { useState, useEffect, useRef } from 'react';
import { Rocket, Star, Bomb, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SpaceDodgeGame = ({ onEnd }) => {
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [playerX, setPlayerX] = useState(50);
  const [shake, setShake] = useState(false);
  
  const itemsRef = useRef([]);
  const requestRef = useRef();
  const scoreRef = useRef(0);
  
  useEffect(() => {
    let lastTime = Date.now();
    let spawnTimer = 0;
    
    const loop = () => {
        if (gameOver) return;
        const now = Date.now();
        const dt = (now - lastTime) / 1000;
        lastTime = now;
        
        spawnTimer += dt;
        if (spawnTimer > 0.4) {
            itemsRef.current.push({
                id: Math.random(),
                x: Math.random() * 90 + 5,
                y: -10,
                speed: 50 + scoreRef.current * 0.1,
                type: Math.random() > 0.8 ? 'coin' : 'enemy'
            });
            spawnTimer = 0;
        }

        itemsRef.current.forEach(item => {
            item.y += item.speed * dt;
            const dx = item.x - playerX;
            const dy = item.y - 85;
            if (Math.sqrt(dx*dx + dy*dy) < 8) {
                if (item.type === 'enemy') {
                    setShake(true);
                    setGameOver(true);
                    try { window.Telegram.WebApp.HapticFeedback.notificationOccurred('error'); } catch(e) {}
                } else {
                    setCoins(c => c + 1);
                    item.y = 200; // Улетает за экран
                    try { window.Telegram.WebApp.HapticFeedback.impactOccurred('light'); } catch(e) {}
                }
            }
        });

        itemsRef.current = itemsRef.current.filter(i => i.y < 110);
        scoreRef.current += dt * 10;
        setScore(Math.floor(scoreRef.current));
        requestRef.current = requestAnimationFrame(loop);
    };
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [playerX, gameOver]);

  return (
    <motion.div animate={shake ? { x: [-10, 10, -5, 5, 0] } : {}} style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 1000, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 40, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', color: 'white' }}>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: '10px', opacity: 0.5 }}>SCORE</div><div style={{ fontWeight: 900, fontSize: '24px' }}>{score}</div></div>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: '10px', opacity: 0.5 }}>STARS</div><div style={{ fontWeight: 900, fontSize: '24px', color: '#ffd700' }}>{coins}</div></div>
        </div>
        
        <motion.div style={{ position: 'absolute', top: '85%', left: `${playerX}%`, transform: 'translate(-50%, -50%)', transition: 'left 0.1s' }}>
            <Rocket size={40} color="#00cec9" fill="#00cec9" />
            <motion.div animate={{ opacity: [0.2, 0.8, 0.2] }} transition={{ repeat: Infinity, duration: 0.1 }} style={{ position: 'absolute', top: 40, left: '50%', x: '-50%', width: 10, height: 20, background: 'orange', filter: 'blur(5px)' }} />
        </motion.div>
        
        {itemsRef.current.map(item => (
            <div key={item.id} style={{ position: 'absolute', top: `${item.y}%`, left: `${item.x}%`, transform: 'translate(-50%, -50%)' }}>
                {item.type === 'coin' ? <Star size={24} color="#ffd700" fill="#ffd700" /> : <Bomb size={28} color="#ff7675" fill="#ff7675" />}
            </div>
        ))}
        
        <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
            <div onClick={() => setPlayerX(p => Math.max(10, p - 15))} style={{ flex: 1 }}></div>
            <div onClick={() => setPlayerX(p => Math.min(90, p + 15))} style={{ flex: 1 }}></div>
        </div>

        {gameOver && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <h2 style={{ color: 'white', fontSize: '32px' }}>CRASHED</h2>
                <button onClick={() => onEnd(score)} style={{ marginTop: '20px', padding: '15px 40px', borderRadius: '20px', background: 'white', border: 'none', fontWeight: 900 }}>RETRY</button>
            </div>
        )}
    </motion.div>
  );
};

export default SpaceDodgeGame;