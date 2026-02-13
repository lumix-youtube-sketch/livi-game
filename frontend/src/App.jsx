import React, { useEffect, useState, Suspense, useMemo } from 'react';
import WebApp from '@twa-dev/sdk';
import { login } from './api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, User as UserIcon, Loader2, ArrowRight } from 'lucide-react';
import ModelViewer from './components/ModelViewer';
import './App.css';

const Pet = React.lazy(() => import('./components/Pet'));
const Actions = React.lazy(() => import('./components/Actions'));

function App() {
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [currentPet, setCurrentPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('lobby'); 
  const [activeIdx, setActiveIdx] = useState(0);
  const [activeAction, setActiveAction] = useState(null);

  useEffect(() => {
    try { WebApp.ready(); WebApp.expand(); } catch(e) {}
    login().then(res => {
        if (res?.data) { setUser(res.data.user); setPets(res.data.pets || []); }
        setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const getCardStyle = (idx) => {
      const dist = idx - activeIdx;
      if (Math.abs(dist) > 1) return { opacity: 0, scale: 0.5, pointerEvents: 'none', position: 'absolute' };
      return {
          zIndex: dist === 0 ? 10 : 5,
          scale: dist === 0 ? 1 : 0.75,
          opacity: dist === 0 ? 1 : 0.3,
          x: dist * 200,
          rotateY: dist * -10,
          position: 'absolute'
      };
  };

  return (
    <div className="app-container" style={{ background: '#050508', minHeight: '100vh', color: 'white', overflow: 'hidden' }}>
      {loading ? (
          <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" /></div>
      ) : (
        <main style={{ width: '100%', height: '100vh', position: 'relative' }}>
          {view === 'lobby' && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <header style={{ padding: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 900 }}>LIVI</h2>
                <UserIcon size={18} opacity={0.5} />
              </header>

              <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: '1000px' }}>
                {pets.map((pet, idx) => (
                  <motion.div key={pet._id} animate={getCardStyle(idx)} onClick={() => idx === activeIdx ? (setCurrentPet(pet), setView('game')) : setActiveIdx(idx)} style={{ width: '220px', height: '360px', background: 'rgba(255,255,255,0.02)', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                    <div style={{ height: '70%' }}><ModelViewer type="pet" color={pet.skinColor} accessories={pet.accessories} isLobby={true} /></div>
                    <div style={{ padding: '15px', textAlign: 'center' }}><h3 style={{ margin: 0, fontSize: '18px' }}>{pet.name}</h3></div>
                  </motion.div>
                ))}
                <motion.div animate={getCardStyle(pets.length)} onClick={() => setActiveIdx(pets.length)} style={{ width: '220px', height: '360px', border: '2px dashed rgba(255,255,255,0.05)', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={30} opacity={0.2} /></motion.div>
              </div>
              <button onClick={() => pets[activeIdx] && (setCurrentPet(pets[activeIdx]), setView('game'))} style={{ margin: '30px auto', padding: '12px 40px', borderRadius: '15px', background: 'white', color: 'black', fontWeight: 900, border: 'none' }}>SELECT</button>
            </div>
          )}

          {view === 'game' && currentPet && (
            <div style={{ height: '100vh', position: 'relative' }}>
               <button onClick={() => setView('lobby')} style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 100, background: 'rgba(255,255,255,0.05)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}><ArrowRight size={16} color="white" style={{ transform: 'rotate(180deg)' }} /></button>
               <Suspense fallback={null}><Pet pet={currentPet} onUpdate={setCurrentPet} activeAction={activeAction} /><Actions pet={currentPet} onUpdate={setCurrentPet} onActionTrigger={setActiveAction} /></Suspense>
            </div>
          )}
        </main>
      )}
    </div>
  );
}

export default App;