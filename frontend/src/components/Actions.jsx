import React, { useState, useEffect } from 'react';
import { performAction, getShop, buyItem, equipItem } from '../api';
import { Utensils, Gamepad2, Moon, ShoppingBag, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const Actions = ({ pet, onUpdate, onActionTrigger }) => {
  const [showShop, setShowShop] = useState(false);
  const [shopItems, setShopItems] = useState([]);
  const [activeTab, setActiveTab] = useState('head'); // head | body | legs

  useEffect(() => {
    if (showShop) {
      getShop().then(res => setShopItems(res.data));
    }
  }, [showShop]);

  const handleAction = async (type) => {
    try {
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
      }
      
      if (onActionTrigger) onActionTrigger(type);

      const res = await performAction(pet._id, type);
      onUpdate(res.data.pet);
      
      if (res.data.leveledUp) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8c52ff', '#00d2ff', '#ff007a']
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBuy = async (itemId) => {
    try {
      const res = await buyItem(pet._id, itemId);
      onUpdate(res.data.pet);
      alert('Purchased!');
    } catch (err) { alert(err.response?.data?.error || 'Error'); }
  };

  const handleEquip = async (itemId, type) => {
    try {
      const res = await equipItem(pet._id, itemId, type);
      onUpdate(res.data.pet);
    } catch (err) { alert(err.response?.data?.error || 'Error'); }
  };

  const ActionButton = ({ icon: Icon, label, onClick, color, gradient }) => (
    <motion.button
      whileHover={{ y: -5, scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
        background: 'none', color: 'var(--text)', padding: '0',
        position: 'relative'
      }}
    >
      <div style={{ 
        width: '56px', height: '56px', borderRadius: '18px', 
        background: gradient || color, 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Icon color="white" size={26} strokeWidth={2.5} />
      </div>
      <span style={{ fontSize: '11px', fontWeight: 700, opacity: 0.7, marginTop: '4px' }}>{label}</span>
    </motion.button>
  );

  return (
    <>
      {/* iOS Style Floating Dock */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="glass-panel"
        style={{ 
          position: 'fixed', bottom: '30px', left: '50%', x: '-50%',
          width: '90%', maxWidth: '400px',
          display: 'flex', justifyContent: 'space-evenly', padding: '16px 10px',
          zIndex: 100, borderRadius: '28px', 
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(20, 20, 30, 0.85)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
        }}
      >
        <ActionButton icon={Utensils} label="Feed" gradient="linear-gradient(135deg, #ff9a9e 0%, #ff6b81 100%)" onClick={() => handleAction('feed')} />
        <ActionButton icon={Gamepad2} label="Play" gradient="linear-gradient(120deg, #89f7fe 0%, #66a6ff 100%)" onClick={() => handleAction('play')} />
        <ActionButton icon={Moon} label="Sleep" gradient="linear-gradient(to top, #c471f5 0%, #fa71cd 100%)" onClick={() => handleAction('sleep')} />
        <ActionButton icon={ShoppingBag} label="Shop" gradient="linear-gradient(to right, #4facfe 0%, #00f2fe 100%)" onClick={() => setShowShop(true)} />
      </motion.div>

      {/* SHOP & WARDROBE MODAL */}
      <AnimatePresence>
        {showShop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 200,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
            }}
            onClick={() => setShowShop(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel" 
              style={{ width: '100%', maxWidth: '350px', height: '80vh', padding: '20px', background: '#1e1e2e', display: 'flex', flexDirection: 'column' }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 800 }}>Shop</h3>
                <button onClick={() => setShowShop(false)} style={{ background: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '50%' }}>
                  <X size={20} color="white" />
                </button>
              </div>

              {/* TABS */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                {['head', 'body', 'legs'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{ 
                            flex: 1, padding: '10px', borderRadius: '12px', fontWeight: 800, textTransform: 'uppercase', fontSize: '12px',
                            background: activeTab === tab ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                            color: activeTab === tab ? 'white' : 'rgba(255,255,255,0.5)'
                        }}
                    >
                        {tab}
                    </button>
                ))}
              </div>
              
              {/* ITEMS GRID */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {shopItems.filter(i => i.type === activeTab).map(item => {
                    const owned = pet.inventory?.includes(item.id);
                    const equipped = pet.accessories?.[item.type] === item.id;
                    
                    return (
                        <div key={item.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '15px', textAlign: 'center', border: equipped ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ fontSize: '40px', marginBottom: '10px' }}>{item.icon}</div>
                            <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '5px' }}>{item.name}</div>
                            
                            {owned ? (
                                <button 
                                    onClick={() => handleEquip(equipped ? null : item.id, item.type)}
                                    style={{ width: '100%', padding: '8px', borderRadius: '8px', background: equipped ? 'var(--secondary)' : 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 800 }}
                                >
                                    {equipped ? 'Unequip' : 'Equip'}
                                </button>
                            ) : (
                                <button 
                                    onClick={() => handleBuy(item.id)}
                                    style={{ width: '100%', padding: '8px', borderRadius: '8px', background: 'var(--accent)', color: 'white', fontWeight: 800 }}
                                >
                                    {item.price} 💰
                                </button>
                            )}
                        </div>
                    );
                })}
              </div>

              <div style={{ textAlign: 'center', marginTop: '20px', opacity: 0.5, fontSize: '12px' }}>
                  Your Balance: {pet.petCoins} 💰
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Actions;