import React, { useState, useEffect } from 'react';
import { performAction, getShop, buyItem, equipItem, uploadTexture, submitScore } from '../api';
import { Utensils, Gamepad2, Moon, ShoppingBag, X, Trophy, Upload, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import WebApp from '@twa-dev/sdk';

const Actions = ({ pet, onUpdate, onActionTrigger }) => {
  const [showShop, setShowShop] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [shopItems, setShopItems] = useState([]);
  const [activeTab, setActiveTab] = useState('head');
  const [gameScore, setGameScore] = useState(0);
  const [uploading, setUploading] = useState(false);

  // User's best score
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
        await submitScore(pet._id, gameScore);
        handleAction('play'); // Bonus for playing
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
        alert('Texture updated!');
    } catch (err) { alert('Upload failed'); }
    finally { setUploading(false); }
  };

  const ActionButton = ({ icon: Icon, label, onClick, gradient }) => (
    <motion.button whileTap={{ scale: 0.9 }} onClick={onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', background: 'none', color: 'var(--text)', padding: '0' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <Icon color="white" size={22} strokeWidth={2.5} />
      </div>
      <span style={{ fontSize: '10px', fontWeight: 800, opacity: 0.6 }}>{label}</span>
    </motion.button>
  );

  return (
    <>
      <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="glass-panel" style={{ position: 'fixed', bottom: '20px', left: '50%', x: '-50%', width: '85%', maxWidth: '360px', display: 'flex', justifyContent: 'space-around', padding: '12px 5px', zIndex: 100, borderRadius: '22px', background: 'rgba(15, 15, 20, 0.85)' }}>
        <ActionButton icon={Utensils} label="Feed" gradient="linear-gradient(135deg, #ff9a9e, #ff6b81)" onClick={() => handleAction('feed')} />
        <ActionButton icon={Gamepad2} label="Play" gradient="linear-gradient(120deg, #89f7fe, #66a6ff)" onClick={() => setShowGame(true)} />
        <ActionButton icon={Moon} label="Sleep" gradient="linear-gradient(to top, #c471f5, #fa71cd)" onClick={() => handleAction('sleep')} />
        <ActionButton icon={ShoppingBag} label="Shop" gradient="linear-gradient(to right, #4facfe, #00f2fe)" onClick={() => setShowShop(true)} />
      </motion.div>

      <AnimatePresence>
        {showGame && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-panel" style={{ position: 'fixed', inset: 0, zIndex: 300, background: '#0f0f14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
            <h2 style={{ fontSize: '32px', marginBottom: '10px' }}>Fast Tap!</h2>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', opacity: 0.7 }}>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '12px' }}>MY BEST</div><div style={{ fontSize: '24px', fontWeight: 900 }}>{myBestScore}</div></div>
            </div>
            <div style={{ fontSize: '64px', fontWeight: 900, marginBottom: '40px', color: 'var(--primary)' }}>{gameScore}</div>
            <motion.div whileTap={{ scale: 0.8 }} onClick={() => { setGameScore(s => s + 1); if(window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.impactOccurred('light'); }} style={{ width: '150px', height: '150px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px var(--primary-glow)' }}>
                <Gamepad2 size={60} color="white" />
            </motion.div>
            <button onClick={handleMiniGameEnd} style={{ marginTop: '60px', padding: '15px 40px', borderRadius: '15px', background: 'white', color: 'black', fontWeight: 800 }}>Finish</button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showShop && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px' }} onClick={() => setShowShop(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-panel" style={{ width: '100%', maxWidth: '340px', height: '80vh', padding: '20px', background: '#1a1a25', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 900 }}>Shop</h3>
                <button onClick={() => setShowShop(false)} style={{ background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '50%' }}><X size={18} color="white" /></button>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', overflowX: 'auto', paddingBottom: '5px' }}>
                {['head', 'body', 'legs', 'background'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '8px 12px', borderRadius: '10px', fontWeight: 900, fontSize: '11px', background: activeTab === tab ? 'var(--primary)' : 'rgba(255,255,255,0.03)', color: activeTab === tab ? 'white' : '#666', border: 'none', whiteSpace: 'nowrap' }}>{tab.toUpperCase()}</button>
                ))}
              </div>
              
              <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {shopItems.filter(i => i.type === activeTab).map(item => {
                    const isBg = item.type === 'background';
                    const owned = pet.inventory?.includes(item.id);
                    const equipped = isBg ? pet.currentBackground === item.id : pet.accessories?.[item.type] === item.id;
                    return (
                        <div key={item.id} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '14px', padding: '10px', textAlign: 'center', border: equipped ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ height: '80px', marginBottom: '5px' }}>
                                <ModelViewer type="preview" itemId={item.id} style={{ height: '100%' }} />
                            </div>
                            <div style={{ fontWeight: 800, fontSize: '12px', marginBottom: '8px' }}>{item.name}</div>
                            <div style={{ marginTop: 'auto' }}>
                                {owned ? (
                                    <button onClick={() => handleEquip(equipped ? null : item.id, item.type)} style={{ width: '100%', padding: '6px', borderRadius: '8px', background: equipped ? 'var(--secondary)' : 'rgba(255,255,255,0.05)', color: 'white', fontSize: '11px', fontWeight: 800 }}>{equipped ? (isBg ? 'Selected' : 'Unequip') : 'Equip'}</button>
                                ) : (
                                    <button onClick={() => handleBuy(item.id)} style={{ width: '100%', padding: '6px', borderRadius: '8px', background: 'white', color: 'black', fontSize: '11px', fontWeight: 800 }}>{item.price} 💰</button>
                                )}
                            </div>
                        </div>
                    );
                })}
                
                {/* UPLOAD CUSTOM TEXTURE CARD (Only for wearables) */}
                {activeTab !== 'background' && (
                    <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '14px', padding: '10px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ fontSize: '24px', marginBottom: '5px', opacity: 0.5 }}><ImageIcon /></div>
                        <div style={{ fontWeight: 800, fontSize: '11px', marginBottom: '8px', opacity: 0.5 }}>Custom Design</div>
                        <label style={{ width: '100%', padding: '6px', borderRadius: '8px', background: 'var(--accent)', color: 'white', fontSize: '11px', fontWeight: 800, cursor: 'pointer', display: 'block' }}>
                            {uploading ? '...' : 'Upload'}
                            <input type="file" hidden accept="image/*" onChange={(e) => handleUpload(e, activeTab)} />
                        </label>
                    </div>
                )}
              </div>
              <div style={{ textAlign: 'center', marginTop: '15px', opacity: 0.5, fontSize: '11px', fontWeight: 800 }}>Balance: {pet.petCoins} 💰</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Actions;