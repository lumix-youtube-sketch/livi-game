import React, { useState, useEffect, useRef } from 'react';
import { Rocket, Star, Bomb, ArrowLeft, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SpaceDodgeGame = ({ onEnd }) => {
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [playerX, setPlayerX] = useState(50);
  const [isHitting, setIsHitting] = useState(false);
  
  const itemsRef = useRef([]);
  const requestRef = useRef();
  const scoreRef = useRef(0);
  const isGameOverRef = useRef(false);
  
  useEffect(() => {
    let lastTime = Date.now();
    let spawnTimer = 0;
    
    const loop = () => {
        if (isGameOverRef.current) return;
        
        const now = Date.now();
        const dt = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;
        
        spawnTimer += dt;
        if (spawnTimer > 0.4) {
            const isCoin = Math.random() > 0.7;
            itemsRef.current.push({
                id: Math.random(),
                x: Math.random() * 90 + 5,
                y: -10,
                speed: 40 + (scoreRef.current * 0.1),
                type: isCoin ? 'coin' : 'enemy'
            });
            spawnTimer = 0;
        }

        itemsRef.current.forEach(item => { item.y += item.speed * dt; });

        // Collision
        for (let i = 0; i < itemsRef.current.length; i++) {
            const item = itemsRef.current[i];
            const dx = item.x - playerX;
            const dy = item.y - 85;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if (dist < 8) {
                if (item.type === 'enemy') {
                    handleGameOver();
                    return;
                } else {
                    setCoins(c => c + 1);
                    itemsRef.current.splice(i, 1);
                    try { window.Telegram.WebApp.HapticFeedback.impactOccurred('light'); } catch(e) {}
                }
            }
        }

        itemsRef.current = itemsRef.current.filter(i => i.y < 110);
        scoreRef.current += dt * 10;
        setScore(Math.floor(scoreRef.current));
        requestRef.current = requestAnimationFrame(loop);
    };
    
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [playerX]);
  
  const handleGameOver = () => {
      isGameOverRef.current = true;
      setIsHitting(true);
      setGameOver(true);
      try { window.Telegram.WebApp.HapticFeedback.notificationOccurred('error'); } catch(e) {}
  };
  
  const move = (dir) => {
      setPlayerX(prev => Math.max(10, Math.min(90, prev + dir * 15)));
      try { window.Telegram.WebApp.HapticFeedback.selectionChanged(); } catch(e) {}
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#050508', zIndex: 1000, overflow: 'hidden', touchAction: 'none' }}>
        {/* Parallax Stars */}
        <div className="parallax-stars" style={{ position: 'absolute', inset: 0 }}>
            {[...Array(30)].map((_, i) => (
                <motion.div key={i} animate={{ y: ['0vh', '100vh'] }} transition={{ duration: 2 + Math.random()*2, repeat: Infinity, ease: 'linear' }} style={{ position: 'absolute', left: `${Math.random()*100}%`, top: `-5%`, width: '2px', height: '2px', background: 'white', opacity: 0.3 }} />
            ))}
        </div>

        <div style={{ position: 'absolute', top: 40, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', color: 'white', zIndex: 10 }}>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: '10px', opacity: 0.5 }}>SCORE</div><div style={{ fontWeight: 900, fontSize: '24px' }}>{score}</div></div>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: '10px', opacity: 0.5 }}>STARS</div><div style={{ fontWeight: 900, fontSize: '24px', color: '#ffd700' }}>{coins}</div></div>
        </div>
        
        {/* Player Rocket */}
        <motion.div animate={isHitting ? { x: [0, -10, 10, 0] } : {}} style={{ position: 'absolute', top: '85%', left: `${playerX}%`, transform: 'translate(-50%, -50%)', transition: 'left 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
            <div style={{ position: 'relative' }}>
                <Rocket size={48} color="#00cec9" fill="#00cec9" />
                <motion.div animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.2 }} style={{ position: 'absolute', bottom: -20, left: '50%', x: '-50%', width: 15, height: 30, background: 'orange', borderRadius: '50%', filter: 'blur(10px)' }} />
            </div>
        </motion.div>
        
        {/* Items */}
        {itemsRef.current.map(item => (
            <div key={item.id} style={{ position: 'absolute', top: `${item.y}%`, left: `${item.x}%`, transform: 'translate(-50%, -50%)' }}>
                {item.type === 'coin' ? <Star size={30} color="#ffd700" fill="#ffd700" /> : <Bomb size={32} color="#ff7675" fill="#ff7675" />}
            </div>
        ))}
        
        {/* Controls */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', zIndex: 5 }}>
            <div onClick={() => move(-1)} style={{ flex: 1 }}></div>
            <div onClick={() => move(1)} style={{ flex: 1 }}></div>
        </div>

        <AnimatePresence>
            {gameOver && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', zIndex: 100 }}>
                    <h1 style={{ fontSize: '40px', fontWeight: 900, marginBottom: '10px' }}>MISSION ENDED</h1>
                    <div style={{ fontSize: '20px', marginBottom: '40px', opacity: 0.7 }}>Earned {coins} Stars</div>
                    <button onClick={() => onEnd(score)} style={{ padding: '18px 60px', background: 'white', border: 'none', color: 'black', borderRadius: '20px', fontWeight: 900, fontSize: '16px' }}>CONTINUE</button>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

export default SpaceDodgeGame;