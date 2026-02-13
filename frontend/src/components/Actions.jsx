import React, { useState, useEffect, Suspense } from 'react';
import { performAction, getShop, buyItem, equipItem, uploadTexture, submitScore } from '../api';
import { Utensils, Gamepad2, Moon, ShoppingBag, X, Upload, Image as ImageIcon, Rocket, Zap, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import WebApp from '@twa-dev/sdk';
import ModelViewer from './ModelViewer';

const SpaceDodgeGame = React.lazy(() => import('./SpaceDodgeGame'));

const Actions = ({ pet, onUpdate, onActionTrigger }) => {
  const [showShop, setShowShop] = useState(false);
  const [showGameMenu, setShowGameMenu] = useState(false);
  const [activeGame, setActiveGame] = useState(null); // 'clicker', 'dodge'
  const [shopItems, setShopItems] = useState([]);
  const [activeTab, setActiveTab] = useState('head');
  const [gameScore, setGameScore] = useState(0);
  const [uploading, setUploading] = useState(false);

  const userId = WebApp.initDataUnsafe?.user?.id.toString();
  const myBestScore = (pet.highScores && typeof pet.highScores === 'object') ? (pet.highScores[userId] || 0) : 0;

  useEffect(() => {
    if (showShop) getShop().then(res => setShopItems(res.data));
  }, [showShop]);

  const handleAction = async (type) => {
    try {
      if (window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
      if (onActionTrigger) onActionTrigger(type);
      const res = await performAction(pet._id, type);
      onUpdate(res.data.pet);
      if (res.data.leveledUp) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    } catch (err) { console.error(err); }
  };

  const handleGameEnd = async (finalScore) => {
    // Submit score logic
    // For dodge game, score is typically lower but sustained. 
    // We might want separate leaderboards later, but for now max score wins.
    if (finalScore > myBestScore) {
        const res = await submitScore(pet._id, finalScore);
        onUpdate(res.data.pet);
    }
    // Grant coins based on score
    if (finalScore > 0) {
        // Simple mock coin grant via 'play' action or specialized endpoint
        // For now let's just use 'play' action to grant rewards if score was decent
        if (finalScore > 10) performAction(pet._id, 'play'); 
    }
    setActiveGame(null);
    setGameScore(0);
  };

  // Clicker Game Handlers
  const handleClickerEnd = () => handleGameEnd(gameScore);

  const handleBuy = async (itemId) => {
    try {
      const res = await buyItem(pet._id, itemId);
      onUpdate(res.data.pet);
    } catch (err) { alert(err.response?.data?.error || 'Error'); }
  };

  const handleEquip = async (itemId, type) => {
    try {
      const res = await equipItem(pet._id, itemId, type);
      onUpdate(res.data.pet);
    } catch (err) { alert(err.response?.data?.error || 'Error'); }
  };

  const handleUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
        const res = await uploadTexture(pet._id, file, type);
        onUpdate(res.data.pet);
    } catch (err) { alert('Upload failed'); }
    finally { setUploading(false); }
  };

  return (
    <>
      <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="glass-panel" style={{ position: 'fixed', bottom: '25px', left: '50%', x: '-50%', width: '90%', maxWidth: '400px', display: 'flex', justifyContent: 'space-around', padding: '12px 10px', zIndex: 100, borderRadius: '24px', background: 'rgba(20, 20, 30, 0.9)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <button onClick={() => handleAction('feed')} className="icon-action"><Utensils size={24} color="#ff9a9e" /><span>Feed</span></button>
        <button onClick={() => setShowGameMenu(true)} className="icon-action"><Gamepad2 size={24} color="#89f7fe" /><span>Play</span></button>
        <button onClick={() => handleAction('sleep')} className="icon-action"><Moon size={24} color="#c471f5" /><span>Sleep</span></button>
        <button onClick={() => setShowShop(true)} className="icon-action"><ShoppingBag size={24} color="#4facfe" /><span>Shop</span></button>
      </motion.div>

      {/* Game Menu */}
      <AnimatePresence>
        {showGameMenu && !activeGame && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowGameMenu(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <div className="glass-panel" onClick={e => e.stopPropagation()} style={{ padding: '30px', borderRadius: '32px', display: 'flex', gap: '20px', flexDirection: 'column' }}>
                   <h2 style={{ textAlign: 'center', color: 'white', margin: 0, marginBottom: '20px' }}>Choose Game</h2>
                   <div style={{ display: 'flex', gap: '20px' }}>
                       <button onClick={() => setActiveGame('clicker')} style={{ width: '120px', height: '120px', background: 'var(--primary)', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', border: 'none', color: 'white' }}>
                           <Zap size={40} />
                           <span style={{ fontWeight: 800 }}>Fast Tap</span>
                       </button>
                       <button onClick={() => setActiveGame('dodge')} style={{ width: '120px', height: '120px', background: '#ff7675', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', border: 'none', color: 'white' }}>
                           <Rocket size={40} />
                           <span style={{ fontWeight: 800 }}>Dodge</span>
                       </button>
                   </div>
               </div>
           </motion.div>
        )}
      </AnimatePresence>

      {/* Games */}
      <AnimatePresence>
        {activeGame === 'clicker' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 300, background: '#0f0f14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', top: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: 800 }}>BEST: {myBestScore}</div>
            </div>
            <div style={{ fontSize: '100px', fontWeight: 900, color: 'white' }}>{gameScore}</div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={() => { setGameScore(s => s + 1); if(window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.impactOccurred('light'); }} style={{ width: '200px', height: '200px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 50px var(--primary-glow)' }}><Gamepad2 size={80} color="white" /></motion.div>
            <button onClick={handleClickerEnd} style={{ marginTop: '60px', padding: '15px 50px', borderRadius: '20px', background: 'white', color: 'black', fontWeight: 900 }}>Finish</button>
          </motion.div>
        )}
        
        {activeGame === 'dodge' && (
             <Suspense fallback={<div className="loader-center">Loading...</div>}>
                 <SpaceDodgeGame onEnd={handleGameEnd} />
             </Suspense>
        )}
      </AnimatePresence>

      {/* Shop */}
      <AnimatePresence>
        {showShop && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(15px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px' }} onClick={() => setShowShop(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-panel shop-container" onClick={e => e.stopPropagation()}>
              <div className="shop-header">
                <h3>Catalog</h3>
                <button onClick={() => setShowShop(false)} className="close-btn"><X size={20} color="white" /></button>
              </div>
              <div className="shop-tabs">
                {['head', 'body', 'legs', 'background'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={activeTab === tab ? 'active' : ''}>{tab.toUpperCase()}</button>
                ))}
              </div>
              <div className="shop-scroll">
                <div className="shop-grid">
                    {shopItems.filter(i => i.type === activeTab).map(item => {
                        const isBg = item.type === 'background';
                        const owned = pet.inventory?.includes(item.id);
                        const equipped = isBg ? pet.currentBackground === item.id : pet.accessories?.[item.type] === item.id;
                        return (
                            <div key={item.id} className={`shop-card ${equipped ? 'equipped' : ''}`}>
                                <div className="preview-container">
                                    <Suspense fallback={<div className="loader-small"></div>}>
                                        <ModelViewer type="preview" itemId={item.id} style={{ height: '100%' }} isLobby={true} />
                                    </Suspense>
                                </div>
                                <div className="item-name">{item.name}</div>
                                {owned ? (
                                    <button onClick={() => handleEquip(equipped ? (isBg ? 'bg_default' : null) : item.id, item.type)} className={`equip-btn ${equipped ? 'active' : ''}`}>{equipped ? 'SELECTED' : 'USE'}</button>
                                ) : (
                                    <button onClick={() => handleBuy(item.id)} className="buy-btn">{item.price} 💰</button>
                                )}
                            </div>
                        );
                    })}
                    {activeTab !== 'background' && (
                        <div className="shop-card upload-card">
                            <ImageIcon size={24} color="#444" />
                            <label className="upload-label">
                                {uploading ? '...' : 'CUSTOM'}
                                <input type="file" hidden accept="image/*" onChange={(e) => handleUpload(e, activeTab)} />
                            </label>
                        </div>
                    )}
                </div>
              </div>
              <div className="shop-footer">BALANCE: {pet.petCoins} 💰</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Actions;