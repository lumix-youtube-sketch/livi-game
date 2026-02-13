import React, { useState, useEffect, Suspense } from 'react';
import { performAction, getShop, buyItem, equipItem, submitScore } from '../api';
import { Utensils, Gamepad2, Moon, ShoppingBag, X, Zap, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import WebApp from '@twa-dev/sdk';
import ModelViewer from './ModelViewer';

const SpaceDodgeGame = React.lazy(() => import('./SpaceDodgeGame'));

const Actions = ({ pet, onUpdate, onActionTrigger }) => {
  const [showShop, setShowShop] = useState(false);
  const [showGameMenu, setShowGameMenu] = useState(false);
  const [activeGame, setActiveGame] = useState(null);
  const [shopItems, setShopItems] = useState([]);
  const [activeTab, setActiveTab] = useState('head');

  useEffect(() => {
    if (showShop) getShop().then(res => setShopItems(res.data));
  }, [showShop]);

  const triggerHaptic = (type = 'light') => { try { WebApp.HapticFeedback.impactOccurred(type); } catch(e) {} };

  const handleAction = async (type) => {
      triggerHaptic('medium');
      if (onActionTrigger) onActionTrigger(type);
      try {
          const res = await performAction(pet._id, type);
          onUpdate(res.data.pet);
      } catch (err) { console.error(err); }
  };

  const handleBuyOrEquip = async (item) => {
      triggerHaptic('selection');
      const owned = pet.inventory?.includes(item.id);
      const equipped = pet.accessories?.[item.type] === item.id;
      
      try {
          if (owned) {
              const res = await equipItem(pet._id, equipped ? null : item.id, item.type);
              onUpdate(res.data.pet);
          } else {
              const res = await buyItem(pet._id, item.id);
              onUpdate(res.data.pet);
              triggerHaptic('success');
          }
      } catch (e) { triggerHaptic('error'); }
  };

  const DockItem = ({ icon: Icon, onClick, color }) => (
      <button 
        onClick={onClick}
        className="dock-btn"
        style={{ 
            width: '56px', height: '56px', borderRadius: '20px', 
            background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: color
        }}
      >
          <Icon size={26} strokeWidth={2.5} />
      </button>
  );

  return (
    <>
      <div style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '15px', zIndex: 100 }}>
        <DockItem icon={Utensils} color="#ff7675" onClick={() => handleAction('feed')} />
        <DockItem icon={Gamepad2} color="#00cec9" onClick={() => setShowGameMenu(true)} />
        <DockItem icon={Moon} color="#a29bfe" onClick={() => handleAction('sleep')} />
        <DockItem icon={ShoppingBag} color="#e056fd" onClick={() => setShowShop(true)} />
      </div>

      {/* SHOP MODAL */}
      <AnimatePresence>
        {showShop && (
          <div className="modal-overlay" onClick={() => setShowShop(false)}>
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} onClick={e => e.stopPropagation()} className="glass-panel-ultra" style={{ width: '100%', height: '85vh', position: 'absolute', bottom: 0, borderRadius: '30px 30px 0 0', display: 'flex', flexDirection: 'column', background: '#121212' }}>
              <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ margin: 0, fontSize: '20px' }}>Store</h3>
                <div style={{ fontSize: '14px', opacity: 0.6, fontWeight: 700 }}>{pet.petCoins} CC</div>
              </div>
              
              <div style={{ display: 'flex', padding: '15px 20px', gap: '10px' }}>
                  {['head', 'body'].map(tab => (
                      <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: activeTab === tab ? '#6c5ce7' : 'rgba(255,255,255,0.05)', color: 'white', border: 'none', fontWeight: 800 }}>{tab.toUpperCase()}</button>
                  ))}
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 40px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    {shopItems.filter(i => i.type === activeTab).map(item => {
                        const owned = pet.inventory?.includes(item.id);
                        const equipped = pet.accessories?.[item.type] === item.id;
                        return (
                            <div key={item.id} onClick={() => handleBuyOrEquip(item)} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '20px', padding: '10px', border: equipped ? '2px solid #6c5ce7' : '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                                <div style={{ height: '100px', marginBottom: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '15px' }}>
                                    <ModelViewer type="preview" itemId={item.id} />
                                </div>
                                <div style={{ fontSize: '13px', fontWeight: 800, marginBottom: '5px' }}>{item.name}</div>
                                <div style={{ fontSize: '12px', opacity: 0.6 }}>{owned ? (equipped ? 'Equipped' : 'Owned') : `${item.price} CC`}</div>
                            </div>
                        );
                    })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGameMenu && !activeGame && (
           <div className="modal-overlay" onClick={() => setShowGameMenu(false)}>
               <div className="glass-panel-ultra" style={{ padding: '25px', borderRadius: '24px', background: '#121212', width: '280px', display: 'grid', gap: '15px' }}>
                   <button onClick={() => setActiveGame('dodge')} style={{ padding: '20px', borderRadius: '16px', background: 'linear-gradient(45deg, #ff7675, #fab1a0)', border: 'none', color: 'white', fontWeight: 900, fontSize: '16px' }}>🚀 SPACE DODGE</button>
                   <button onClick={() => setActiveGame('clicker')} style={{ padding: '20px', borderRadius: '16px', background: 'linear-gradient(45deg, #a29bfe, #6c5ce7)', border: 'none', color: 'white', fontWeight: 900, fontSize: '16px' }}>⚡ FAST TAP</button>
               </div>
           </div>
        )}
      </AnimatePresence>

      <Suspense fallback={null}>
        {activeGame === 'dodge' && <SpaceDodgeGame onEnd={async (score) => {
            if (score > 0) {
                const res = await submitScore(pet._id, score);
                onUpdate(res.data.pet);
            }
            setActiveGame(null);
        }} />}
      </Suspense>
    </>
  );
};

export default Actions;