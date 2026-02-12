import React, { useState, useEffect, Suspense, useRef } from 'react';
import { performAction, getShop, buyItem, equipItem, uploadTexture, submitScore } from '../api';
import { Utensils, Gamepad2, Moon, ShoppingBag, X, Trophy, Upload, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import WebApp from '@twa-dev/sdk';
import ModelViewer from './ModelViewer';

const Actions = ({ pet, onUpdate, onActionTrigger }) => {
  const [showShop, setShowShop] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [shopItems, setShopItems] = useState([]);
  const [activeTab, setActiveTab] = useState('head');
  const [gameScore, setGameScore] = useState(0);
  const [uploading, setUploading] = useState(false);
  
  const clickRef = useRef(0);

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

  const handleMiniGameEnd = async () => {
    if (gameScore > myBestScore) {
        const res = await submitScore(pet._id, gameScore);
        onUpdate(res.data.pet);
    }
    setShowGame(false);
    setGameScore(0);
  };

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
      {/* Floating Dock */}
      <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="glass-panel" style={{ position: 'fixed', bottom: '25px', left: '50%', x: '-50%', width: '90%', maxWidth: '400px', display: 'flex', justifyContent: 'space-around', padding: '12px 10px', zIndex: 100, borderRadius: '24px', background: 'rgba(20, 20, 30, 0.9)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <button onClick={() => handleAction('feed')} className="icon-action"><Utensils size={24} color="#ff9a9e" /><span>Feed</span></button>
        <button onClick={() => setShowGame(true)} className="icon-action"><Gamepad2 size={24} color="#89f7fe" /><span>Play</span></button>
        <button onClick={() => handleAction('sleep')} className="icon-action"><Moon size={24} color="#c471f5" /><span>Sleep</span></button>
        <button onClick={() => setShowShop(true)} className="icon-action"><ShoppingBag size={24} color="#4facfe" /><span>Shop</span></button>
      </motion.div>

      {/* GAME MODAL */}
      <AnimatePresence>
        {showGame && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 300, background: '#0f0f14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', top: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: 800 }}>BEST: {myBestScore}</div>
            </div>
            <div style={{ fontSize: '100px', fontWeight: 900, color: 'white' }}>{gameScore}</div>
            <motion.div 
                whileTap={{ scale: 0.9 }} 
                onClick={() => {
                    setGameScore(s => s + 1);
                    if(window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
                }} 
                style={{ width: '200px', height: '200px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 50px var(--primary-glow)' }}
            >
                <Gamepad2 size={80} color="white" />
            </motion.div>
            <button onClick={handleMiniGameEnd} style={{ marginTop: '60px', padding: '15px 50px', borderRadius: '20px', background: 'white', color: 'black', fontWeight: 900 }}>Finish</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SHOP MODAL */}
      <AnimatePresence>
        {showShop && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(15px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px' }} onClick={() => setShowShop(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-panel" style={{ width: '100%', maxWidth: '380px', height: '75vh', padding: '20px', background: '#161620', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.1)' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 900, color: 'white' }}>Catalog</h3>
                <button onClick={() => setShowShop(false)} style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '50%' }}><X size={20} color="white" /></button>
              </div>
              
              <div className="shop-tabs">
                {['head', 'body', 'legs', 'background'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={activeTab === tab ? 'active' : ''}>{tab.toUpperCase()}</button>
                ))}
              </div>
              
              <div className="shop-grid">
                {shopItems.filter(i => i.type === activeTab).map(item => {
                    const isBg = item.type === 'background';
                    const owned = pet.inventory?.includes(item.id);
                    const equipped = isBg ? pet.currentBackground === item.id : pet.accessories?.[item.type] === item.id;
                    return (
                        <div key={item.id} className={`shop-card ${equipped ? 'equipped' : ''}`}>
                            <div className="preview-container">
                                <Suspense fallback={<div className="loader-small"></div>}>
                                    <ModelViewer type="preview" itemId={item.id} style={{ height: '100%' }} />
                                </Suspense>
                            </div>
                            <div className="item-name">{item.name}</div>
                            {owned ? (
                                <button onClick={() => handleEquip(equipped ? (isBg ? 'bg_default' : null) : item.id, item.type)} className="equip-btn">{equipped ? 'SELECTED' : 'USE'}</button>
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
              <div className="shop-footer">WALLET: {pet.petCoins} 💰</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Actions;