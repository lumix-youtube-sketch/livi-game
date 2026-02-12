import React, { useState, useEffect, Suspense } from 'react';
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

  const userId = WebApp.initDataUnsafe?.user?.id.toString();
  const myBestScore = pet.highScores?.[userId] || 0;

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

  const ActionButton = ({ icon: Icon, label, onClick, gradient }) => (
    <motion.button whileTap={{ scale: 0.9 }} onClick={onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', color: 'white', padding: '0' }}>
      <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <Icon color="white" size={24} strokeWidth={2.5} />
      </div>
      <span style={{ fontSize: '11px', fontWeight: 800, opacity: 0.8 }}>{label}</span>
    </motion.button>
  );

  return (
    <>
      <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="glass-panel" style={{ position: 'fixed', bottom: '25px', left: '50%', x: '-50%', width: '90%', maxWidth: '400px', display: 'flex', justifyContent: 'space-around', padding: '15px 10px', zIndex: 100, borderRadius: '24px', background: 'rgba(20, 20, 30, 0.9)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <ActionButton icon={Utensils} label="Feed" gradient="linear-gradient(135deg, #ff9a9e, #ff6b81)" onClick={() => handleAction('feed')} />
        <ActionButton icon={Gamepad2} label="Play" gradient="linear-gradient(120deg, #89f7fe, #66a6ff)" onClick={() => setShowGame(true)} />
        <ActionButton icon={Moon} label="Sleep" gradient="linear-gradient(to top, #c471f5, #fa71cd)" onClick={() => handleAction('sleep')} />
        <ActionButton icon={ShoppingBag} label="Shop" gradient="linear-gradient(to right, #4facfe, #00f2fe)" onClick={() => setShowShop(true)} />
      </motion.div>

      {/* GAME MODAL */}
      <AnimatePresence>
        {showGame && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 300, background: '#0f0f14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
            <div style={{ position: 'absolute', top: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px' }}>Personal Best</div>
                <div style={{ fontSize: '32px', fontWeight: 900, color: 'white' }}>{myBestScore}</div>
            </div>
            <div style={{ fontSize: '80px', fontWeight: 900, marginBottom: '20px', color: 'white', textShadow: '0 0 20px var(--primary-glow)' }}>{gameScore}</div>
            <motion.div whileTap={{ scale: 0.8 }} onClick={() => { setGameScore(s => s + 1); if(window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.impactOccurred('light'); }} style={{ width: '180px', height: '180px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px var(--primary-glow)', cursor: 'pointer' }}>
                <Gamepad2 size={80} color="white" />
            </motion.div>
            <button onClick={handleMiniGameEnd} style={{ marginTop: '60px', padding: '18px 60px', borderRadius: '20px', background: 'white', color: 'black', fontWeight: 900, fontSize: '18px' }}>Finish & Save</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SHOP MODAL */}
      <AnimatePresence>
        {showShop && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(15px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowShop(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="glass-panel" style={{ width: '100%', maxWidth: '380px', height: '80vh', padding: '25px', background: '#161620', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.1)' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: 'white' }}>Catalog</h3>
                <button onClick={() => setShowShop(false)} style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '50%' }}><X size={20} color="white" /></button>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'none' }}>
                {['head', 'body', 'legs', 'background'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '10px 20px', borderRadius: '12px', fontWeight: 900, fontSize: '12px', background: activeTab === tab ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: activeTab === tab ? 'white' : '#888', border: 'none', transition: 'all 0.3s' }}>{tab.toUpperCase()}</button>
                ))}
              </div>
              
              <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', paddingRight: '5px' }}>
                {shopItems.filter(i => i.type === activeTab).map(item => {
                    const isBg = item.type === 'background';
                    const owned = pet.inventory?.includes(item.id);
                    const equipped = isBg ? pet.currentBackground === item.id : pet.accessories?.[item.type] === item.id;
                    return (
                        <div key={item.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '20px', padding: '15px', textAlign: 'center', border: equipped ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s' }}>
                            <div style={{ height: '90px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '15px' }}>
                                <Suspense fallback={<div className="loader" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>}>
                                    <ModelViewer type="preview" itemId={item.id} style={{ height: '100%' }} />
                                </Suspense>
                            </div>
                            <div style={{ fontWeight: 800, fontSize: '13px', marginBottom: '12px', color: 'white' }}>{item.name}</div>
                            <div style={{ marginTop: 'auto' }}>
                                {owned ? (
                                    <button onClick={() => handleEquip(equipped ? (isBg ? 'bg_default' : null) : item.id, item.type)} style={{ width: '100%', padding: '10px', borderRadius: '10px', background: equipped ? 'var(--primary)' : 'rgba(255,255,255,0.1)', color: 'white', fontSize: '12px', fontWeight: 800 }}>{equipped ? 'SELECTED' : 'USE'}</button>
                                ) : (
                                    <button onClick={() => handleBuy(item.id)} style={{ width: '100%', padding: '10px', borderRadius: '10px', background: 'white', color: 'black', fontSize: '12px', fontWeight: 900 }}>{item.price} 💰</button>
                                )}
                            </div>
                        </div>
                    );
                })}
                {activeTab !== 'background' && (
                    <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '20px', padding: '15px', textAlign: 'center', border: '2px dashed rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '150px' }}>
                        <ImageIcon size={30} color="#444" style={{ marginBottom: '10px' }} />
                        <div style={{ fontWeight: 800, fontSize: '12px', color: '#666', marginBottom: '15px' }}>CUSTOM PRINT</div>
                        <label style={{ width: '100%', padding: '10px', borderRadius: '10px', background: 'var(--accent)', color: 'white', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>
                            {uploading ? '...' : 'UPLOAD'}
                            <input type="file" hidden accept="image/*" onChange={(e) => handleUpload(e, activeTab)} />
                        </label>
                    </div>
                )}
              </div>
              <div style={{ textAlign: 'center', marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '15px' }}>
                  <span style={{ color: '#888', fontSize: '12px', fontWeight: 800 }}>WALLET:</span>
                  <span style={{ color: 'white', fontSize: '16px', fontWeight: 900, marginLeft: '10px' }}>{pet.petCoins} 💰</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Actions;