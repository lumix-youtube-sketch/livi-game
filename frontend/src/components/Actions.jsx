import React, { useState, useEffect, Suspense } from 'react';
import { performAction, getShop, buyItem, equipItem } from '../api';
import { Utensils, Gamepad2, Moon, ShoppingBag, X } from 'lucide-react';
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

  return (
    <>
      <div className="glass-panel-ultra" style={{ position: 'fixed', bottom: '25px', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '380px', display: 'flex', justifyContent: 'space-around', padding: '10px', zIndex: 100, borderRadius: '24px', background: 'rgba(10, 10, 15, 0.8)' }}>
        <button onClick={() => { onActionTrigger('feed'); performAction(pet._id, 'feed').then(r => onUpdate(r.data.pet)); triggerHaptic('medium'); }} className="icon-btn"><Utensils size={20} color="#ff7675" /></button>
        <button onClick={() => setShowGameMenu(true)} className="icon-btn"><Gamepad2 size={20} color="#00cec9" /></button>
        <button onClick={() => { onActionTrigger('sleep'); performAction(pet._id, 'sleep').then(r => onUpdate(r.data.pet)); triggerHaptic('medium'); }} className="icon-btn"><Moon size={20} color="#a29bfe" /></button>
        <button onClick={() => setShowShop(true)} className="icon-btn"><ShoppingBag size={20} color="#e056fd" /></button>
      </div>

      <AnimatePresence>
        {showShop && (
          <div className="modal-overlay" onClick={() => setShowShop(false)}>
            <div className="glass-panel-ultra" onClick={e => e.stopPropagation()} style={{ width: '90%', height: '70vh', background: '#0a0a0f', borderRadius: '30px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0 }}>Shop</h3>
                <X onClick={() => setShowShop(false)} size={20} />
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {shopItems.map(item => {
                        const owned = pet.inventory?.includes(item.id);
                        const equipped = pet.accessories?.[item.type] === item.id;
                        return (
                            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '15px', border: equipped ? '1px solid #6c5ce7' : '1px solid transparent' }}>
                                <div style={{ width: '60px', height: '60px' }}><ModelViewer type="preview" itemId={item.id} /></div>
                                <div style={{ flex: 1, fontSize: '14px', fontWeight: 800 }}>{item.name}</div>
                                {owned ? (
                                    <button onClick={() => equipItem(pet._id, equipped ? null : item.id, item.type).then(r => onUpdate(r.data.pet))} style={{ padding: '8px 15px', borderRadius: '10px', background: equipped ? '#6c5ce7' : 'rgba(255,255,255,0.1)', color: 'white', border: 'none', fontSize: '10px' }}>{equipped ? 'ON' : 'USE'}</button>
                                ) : (
                                    <button onClick={() => buyItem(pet._id, item.id).then(r => onUpdate(r.data.pet))} style={{ padding: '8px 15px', borderRadius: '10px', background: 'white', color: 'black', border: 'none', fontSize: '10px', fontWeight: 900 }}>{item.price} CC</button>
                                )}
                            </div>
                        );
                    })}
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGameMenu && !activeGame && (
           <div className="modal-overlay" onClick={() => setShowGameMenu(false)}>
               <div className="glass-panel-ultra" style={{ padding: '20px', borderRadius: '24px', background: '#0a0a0f', width: '280px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                   <button onClick={() => setActiveGame('dodge')} style={{ height: '100px', borderRadius: '15px', background: '#ff7675', border: 'none', color: 'white', fontWeight: 800 }}>DODGE</button>
                   <button onClick={() => setActiveGame('clicker')} style={{ height: '100px', borderRadius: '15px', background: '#e056fd', border: 'none', color: 'white', fontWeight: 800 }}>TAP</button>
               </div>
           </div>
        )}
      </AnimatePresence>

      <Suspense fallback={null}>
        {activeGame === 'dodge' && <SpaceDodgeGame onEnd={() => setActiveGame(null)} />}
      </Suspense>
    </>
  );
};

export default Actions;