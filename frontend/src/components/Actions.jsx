import React, { useState, useEffect, Suspense } from 'react';
import { performAction, getShop, buyItem, equipItem, uploadTexture, submitScore } from '../api';
import { Utensils, Gamepad2, Moon, ShoppingBag, X, Image as ImageIcon, Rocket, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import WebApp from '@twa-dev/sdk';
import ModelViewer from './ModelViewer';

const SpaceDodgeGame = React.lazy(() => import('./SpaceDodgeGame'));

const Actions = ({ pet, onUpdate, onActionTrigger }) => {
  const [showShop, setShowShop] = useState(false);
  const [showGameMenu, setShowGameMenu] = useState(false);
  const [activeGame, setActiveGame] = useState(null);
  const [shopItems, setShopItems] = useState([]);
  const [activeTab, setActiveTab] = useState('head');
  const [gameScore, setGameScore] = useState(0);

  const userId = WebApp.initDataUnsafe?.user?.id.toString();
  const myBestScore = (pet.highScores && typeof pet.highScores === 'object') ? (pet.highScores[userId] || 0) : 0;

  useEffect(() => {
    if (showShop) {
        getShop().then(res => setShopItems(res.data));
        triggerHaptic('light');
    }
  }, [showShop]);

  const triggerHaptic = (type = 'light') => {
      try { WebApp.HapticFeedback.impactOccurred(type); } catch(e) {}
  };

  const handleAction = async (type) => {
    try {
      triggerHaptic('medium');
      if (onActionTrigger) onActionTrigger(type);
      const res = await performAction(pet._id, type);
      onUpdate(res.data.pet);
      if (res.data.leveledUp) {
          triggerHaptic('heavy');
          confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      }
    } catch (err) { console.error(err); }
  };

  const handleGameEnd = async (finalScore) => {
    triggerHaptic('heavy');
    if (finalScore > myBestScore) {
        const res = await submitScore(pet._id, finalScore);
        onUpdate(res.data.pet);
    }
    setActiveGame(null);
    setGameScore(0);
  };

  const handleBuy = async (itemId) => {
    try {
      triggerHaptic('medium');
      const res = await buyItem(pet._id, itemId);
      onUpdate(res.data.pet);
      triggerHaptic('heavy');
    } catch (err) { alert(err.response?.data?.error || 'Error'); }
  };

  const handleEquip = async (itemId, type) => {
    try {
      triggerHaptic('light');
      const res = await equipItem(pet._id, itemId, type);
      onUpdate(res.data.pet);
    } catch (err) { alert(err.response?.data?.error || 'Error'); }
  };

  const DockItem = ({ icon: Icon, label, onClick, color }) => (
    <motion.button 
        whileTap={{ scale: 0.9 }} 
        onClick={onClick}
        style={{ 
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
            background: 'transparent', border: 'none', padding: '0 8px'
        }}
    >
        <div className="glass-panel-ultra" style={{ width: '52px', height: '52px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Icon size={24} color={color} />
        </div>
        <span style={{ fontSize: '10px', fontWeight: 800, color: 'white', opacity: 0.6 }}>{label}</span>
    </motion.button>
  );

  return (
    <>
      <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="glass-panel-ultra" style={{ position: 'fixed', bottom: '25px', left: '50%', x: '-50%', width: '90%', maxWidth: '400px', display: 'flex', justifyContent: 'space-around', padding: '12px', zIndex: 100, borderRadius: '24px', background: 'rgba(10, 10, 15, 0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <DockItem label="Feed" icon={Utensils} color="#ff7675" onClick={() => handleAction('feed')} />
        <DockItem label="Play" icon={Gamepad2} color="#00cec9" onClick={() => setShowGameMenu(true)} />
        <DockItem label="Sleep" icon={Moon} color="#a29bfe" onClick={() => handleAction('sleep')} />
        <DockItem label="Shop" icon={ShoppingBag} color="#e056fd" onClick={() => setShowShop(true)} />
      </motion.div>

      {/* Shop Modal */}
      <AnimatePresence>
        {showShop && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setShowShop(false)}>
            <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="glass-panel-ultra shop-container" onClick={e => e.stopPropagation()} style={{ background: '#0a0a0f', height: '80vh', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="shop-header" style={{ padding: '20px' }}>
                <h3 style={{ margin: 0, color: 'white' }}>Catalog</h3>
                <button onClick={() => setShowShop(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%' }}><X size={18} /></button>
              </div>
              <div className="shop-tabs" style={{ display: 'flex', gap: '10px', padding: '0 20px 15px' }}>
                {['head', 'body'].map(tab => (
                    <button key={tab} onClick={() => { setActiveTab(tab); triggerHaptic('light'); }} style={{ flex: 1, padding: '10px', borderRadius: '12px', background: activeTab === tab ? '#6c5ce7' : 'rgba(255,255,255,0.05)', color: 'white', fontWeight: 800, border: 'none' }}>{tab.toUpperCase()}</button>
                ))}
              </div>
              <div className="shop-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    {shopItems.filter(i => i.type === activeTab).map(item => {
                        const owned = pet.inventory?.includes(item.id);
                        const equipped = pet.accessories?.[item.type] === item.id;
                        return (
                            <div key={item.id} className="shop-card" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '20px', padding: '15px', border: equipped ? '1px solid #6c5ce7' : '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ height: '100px', marginBottom: '10px' }}>
                                    <ModelViewer type="preview" itemId={item.id} />
                                </div>
                                <div style={{ fontSize: '12px', fontWeight: 800, textAlign: 'center', marginBottom: '10px' }}>{item.name}</div>
                                {owned ? (
                                    <button onClick={() => handleEquip(equipped ? null : item.id, item.type)} style={{ width: '100%', padding: '8px', borderRadius: '10px', background: equipped ? '#6c5ce7' : 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 800, border: 'none' }}>{equipped ? 'EQUIPPED' : 'USE'}</button>
                                ) : (
                                    <button onClick={() => handleBuy(item.id)} style={{ width: '100%', padding: '8px', borderRadius: '10px', background: 'white', color: 'black', fontWeight: 800, border: 'none' }}>{item.price} CC</button>
                                )}
                            </div>
                        );
                    })}
                </div>
              </div>
              <div style={{ padding: '20px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ opacity: 0.5, fontSize: '12px' }}>BALANCE: {pet.petCoins} CC</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Menu */}
      <AnimatePresence>
        {showGameMenu && !activeGame && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setShowGameMenu(false)}>
               <div className="glass-panel-ultra" style={{ padding: '30px', borderRadius: '32px', background: '#0a0a0f', width: '80%', maxWidth: '340px' }}>
                   <h2 style={{ textAlign: 'center', color: 'white', margin: 0, marginBottom: '20px' }}>Games</h2>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                       <button onClick={() => { setActiveGame('clicker'); triggerHaptic('medium'); }} style={{ height: '120px', borderRadius: '20px', background: '#e056fd', border: 'none', color: 'white', fontWeight: 800, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                           <Zap size={32} /> Fast Tap
                       </button>
                       <button onClick={() => { setActiveGame('dodge'); triggerHaptic('medium'); }} style={{ height: '120px', borderRadius: '20px', background: '#ff7675', border: 'none', color: 'white', fontWeight: 800, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                           <Rocket size={32} /> Dodge
                       </button>
                   </div>
               </div>
           </motion.div>
        )}
      </AnimatePresence>

      <Suspense fallback={null}>
        {activeGame === 'dodge' && <SpaceDodgeGame onEnd={handleGameEnd} />}
      </Suspense>
    </>
  );
};

export default Actions;