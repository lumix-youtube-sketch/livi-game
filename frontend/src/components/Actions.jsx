import React, { useState, useEffect, Suspense } from 'react';
import { performAction, getShop, buyItem, equipItem, uploadTexture, submitScore } from '../api';
import { Utensils, Gamepad2, Moon, ShoppingBag, X, Upload, Image as ImageIcon, Rocket, Zap, Trophy, Palette } from 'lucide-react';
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
      if (res.data.leveledUp) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#6c5ce7', '#00cec9', '#e056fd'] });
    } catch (err) { console.error(err); }
  };

  const handleGameEnd = async (finalScore) => {
    if (finalScore > myBestScore) {
        const res = await submitScore(pet._id, finalScore);
        onUpdate(res.data.pet);
    }
    if (finalScore > 10) performAction(pet._id, 'play'); 
    setActiveGame(null);
    setGameScore(0);
  };

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

  const DockItem = ({ icon: Icon, label, onClick, color }) => (
    <motion.button 
        whileHover={{ scale: 1.1, y: -5 }} 
        whileTap={{ scale: 0.9 }} 
        onClick={onClick}
        style={{ 
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
            background: 'transparent', border: 'none', padding: '0 8px', position: 'relative'
        }}
    >
        <div className="glass-panel-ultra" style={{ width: '56px', height: '56px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 20px -5px ${color}55`, border: `1px solid ${color}33` }}>
            <Icon size={26} color={color} />
        </div>
        <span style={{ fontSize: '11px', fontWeight: 800, opacity: 0.7, letterSpacing: '0.5px', color: 'white' }}>{label}</span>
    </motion.button>
  );

  return (
    <>
      <motion.div 
        initial={{ y: 150 }} 
        animate={{ y: 0 }} 
        transition={{ type: 'spring', stiffness: 50, damping: 20 }}
        className="glass-panel-ultra" 
        style={{ 
            position: 'fixed', bottom: '30px', left: '50%', x: '-50%', 
            width: '90%', maxWidth: '420px', 
            display: 'flex', justifyContent: 'space-around', alignItems: 'center',
            padding: '16px 12px', zIndex: 100, borderRadius: '32px',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)'
        }}
      >
        <DockItem label="Feed" icon={Utensils} color="#ff7675" onClick={() => handleAction('feed')} />
        <DockItem label="Play" icon={Gamepad2} color="#00cec9" onClick={() => setShowGameMenu(true)} />
        <DockItem label="Sleep" icon={Moon} color="#a29bfe" onClick={() => handleAction('sleep')} />
        <DockItem label="Shop" icon={ShoppingBag} color="#e056fd" onClick={() => setShowShop(true)} />
      </motion.div>

      {/* Game Menu */}
      <AnimatePresence>
        {showGameMenu && !activeGame && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowGameMenu(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(16px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel-ultra" onClick={e => e.stopPropagation()} style={{ padding: '32px', borderRadius: '40px', display: 'flex', gap: '20px', flexDirection: 'column', width: '90%', maxWidth: '340px' }}>
                   <h2 style={{ textAlign: 'center', color: 'white', margin: 0, marginBottom: '20px', fontSize: '28px', fontWeight: 900 }}>Game Center</h2>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                       <button onClick={() => setActiveGame('clicker')} className="glass-panel" style={{ height: '140px', background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                           <div style={{ padding: '12px', background: '#e056fd', borderRadius: '16px', boxShadow: '0 0 20px #e056fd66' }}><Zap size={32} color="white" /></div>
                           <span style={{ fontWeight: 800, color: 'white' }}>Fast Tap</span>
                       </button>
                       <button onClick={() => setActiveGame('dodge')} className="glass-panel" style={{ height: '140px', background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                           <div style={{ padding: '12px', background: '#ff7675', borderRadius: '16px', boxShadow: '0 0 20px #ff767566' }}><Rocket size={32} color="white" /></div>
                           <span style={{ fontWeight: 800, color: 'white' }}>Dodge</span>
                       </button>
                   </div>
               </motion.div>
           </motion.div>
        )}
      </AnimatePresence>

      {/* Games */}
      <AnimatePresence>
        {activeGame === 'clicker' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} style={{ position: 'fixed', inset: 0, zIndex: 300, background: '#0f0f14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div className="nebula-bg" />
            <div style={{ position: 'absolute', top: '60px', textAlign: 'center' }}>
                <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', fontWeight: 800, letterSpacing: '1px' }}>PERSONAL BEST</div>
                <div style={{ fontSize: '24px', color: 'white', fontWeight: 900 }}>{myBestScore}</div>
            </div>
            <div style={{ fontSize: '120px', fontWeight: 900, color: 'white', fontFamily: 'Rajdhani', marginBottom: '40px', textShadow: '0 0 40px rgba(255,255,255,0.5)' }}>{gameScore}</div>
            <motion.div whileTap={{ scale: 0.85 }} onClick={() => { setGameScore(s => s + 1); if(window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.impactOccurred('light'); }} style={{ width: '220px', height: '220px', background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 80px rgba(108, 92, 231, 0.4)', border: '4px solid rgba(255,255,255,0.2)' }}><Zap size={80} color="white" /></motion.div>
            <button onClick={handleClickerEnd} style={{ marginTop: '80px', padding: '20px 60px', borderRadius: '24px', background: 'white', color: 'black', fontWeight: 900, fontSize: '18px', boxShadow: '0 10px 30px rgba(255,255,255,0.2)' }}>Finish Game</button>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowShop(false)}>
            <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} className="glass-panel-ultra shop-container" onClick={e => e.stopPropagation()} style={{ height: '85vh', maxWidth: '440px', width: '95%' }}>
              <div className="shop-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ padding: '8px', background: 'var(--primary)', borderRadius: '10px' }}><ShoppingBag size={20} color="white" /></div>
                    <h3>Boutique</h3>
                </div>
                <button onClick={() => setShowShop(false)} className="close-btn" style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} color="white" /></button>
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
                                    <button onClick={() => handleEquip(equipped ? (isBg ? 'bg_default' : null) : item.id, item.type)} className={`equip-btn ${equipped ? 'active' : ''}`}>{equipped ? 'EQUIPPED' : 'WEAR'}</button>
                                ) : (
                                    <button onClick={() => handleBuy(item.id)} className="buy-btn">{item.price} 💰</button>
                                )}
                            </div>
                        );
                    })}
                </div>
              </div>
              <div className="shop-footer">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <span style={{ fontSize: '12px', opacity: 0.4, fontWeight: 800, letterSpacing: '1px' }}>ACCOUNT_BALANCE</span>
                      <span style={{ fontSize: '20px', color: 'white', fontFamily: 'Rajdhani', fontWeight: 700 }}>{pet.petCoins} CC</span>
                  </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Actions;