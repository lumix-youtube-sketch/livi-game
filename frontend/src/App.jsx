import React, { useEffect, useState, Suspense } from 'react';
import WebApp from '@twa-dev/sdk';
import { login, createPet, joinPet } from './api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trophy, Share2, ArrowRight } from 'lucide-react';
import ModelViewer from './components/ModelViewer';

const Pet = React.lazy(() => import('./components/Pet'));
const Actions = React.lazy(() => import('./components/Actions'));

function App() {
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [currentPet, setCurrentPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('loading'); 
  const [activeAction, setActiveAction] = useState(null);

  const [creationStep, setCreationStep] = useState(false);
  const [newName, setNewName] = useState('Livi');
  const [newShape, setNewShape] = useState('capsule');
  const [partnerId, setPartnerId] = useState('');

  useEffect(() => {
    WebApp.ready();
    WebApp.expand();
    WebApp.setHeaderColor('#0f0f14'); 
    WebApp.setBackgroundColor('#0f0f14');

    const initAuth = async () => {
      try {
        const res = await login();
        setUser(res.data.user);
        const startParam = WebApp.initDataUnsafe?.start_param;
        if (startParam && startParam.startsWith('join_')) {
            const petId = startParam.replace('join_', '');
            const joinRes = await joinPet(petId);
            setCurrentPet(joinRes.data.pet);
            setView('game');
            return;
        }
        setPets(res.data.pets || []);
        setView('lobby');
      } catch (err) {
        console.error('Login error', err);
        setView('lobby');
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const handleActionTrigger = (type) => {
    setActiveAction(type);
    setTimeout(() => setActiveAction(null), 2000);
  };

  const handleCreatePet = async () => {
    try {
      const res = await createPet(partnerId || null, newName, newShape);
      setPets([...pets, res.data.pet]);
      setCurrentPet(res.data.pet);
      setCreationStep(false);
      setView('game');
    } catch (err) { alert(err.response?.data?.error || 'Error'); }
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f14' }}>
      <span className="loader"></span>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', maxWidth: '500px', margin: '0 auto', background: '#0f0f14', position: 'relative' }}>
      
      {/* LOBBY */}
      {view === 'lobby' && !creationStep && (
        <div style={{ padding: '30px 20px' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '900', color: 'white' }}>Livi</h1>
            <div className="hud-capsule"><span style={{ fontWeight: 800 }}>{pets.length}/10</span></div>
          </header>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <motion.div whileTap={{ scale: 0.95 }} onClick={() => setCreationStep(true)} className="glass-panel" style={{ height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed rgba(255,255,255,0.1)' }}>
              <Plus size={40} color="var(--primary)" /><span style={{ marginTop: '10px', fontWeight: 800 }}>New Pet</span>
            </motion.div>
            {pets.map(pet => (
              <motion.div key={pet._id} whileTap={{ scale: 0.95 }} onClick={() => { setCurrentPet(pet); setView('game'); }} className="glass-panel" style={{ height: '220px', padding: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ height: '120px' }}>
                   <ModelViewer type="pet" mood="happy" color={pet.skinColor} shape={pet.shape} accessories={pet.accessories} style={{ height: '100%' }} />
                </div>
                <div style={{ fontWeight: 900, textAlign: 'center' }}>{pet.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* CREATION */}
      {creationStep && (
        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} style={{ padding: '30px', color: 'white' }}>
            <button onClick={() => setCreationStep(false)} style={{ background: 'none', color: 'white', marginBottom: '20px' }}>← Back</button>
            <h2 style={{ fontSize: '28px', fontWeight: 900 }}>Create Pet</h2>
            <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '10px', opacity: 0.6 }}>Pet Name</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} style={{ width: '100%', padding: '15px', borderRadius: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '18px', fontWeight: 800 }} />
            </div>
            <label style={{ display: 'block', marginBottom: '10px', opacity: 0.6 }}>Choose Shape</label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
                {['capsule', 'round', 'boxy'].map(s => (
                    <button key={s} onClick={() => setNewShape(s)} style={{ flex: 1, padding: '10px', borderRadius: '12px', background: newShape === s ? 'var(--primary)' : 'rgba(255,255,255,0.05)', border: newShape === s ? '2px solid white' : 'none', color: 'white', fontWeight: 800 }}>{s.toUpperCase()}</button>
                ))}
            </div>
            <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', marginBottom: '10px', opacity: 0.6 }}>Partner ID (Optional)</label>
                <input placeholder="Paste friend's ID" value={partnerId} onChange={e => setPartnerId(e.target.value)} style={{ width: '100%', padding: '15px', borderRadius: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
            </div>
            <button onClick={handleCreatePet} style={{ width: '100%', padding: '20px', borderRadius: '20px', background: 'white', color: 'black', fontWeight: 900, fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>Start <ArrowRight size={20} /></button>
        </motion.div>
      )}

      {/* GAME */}
      {view === 'game' && currentPet && (
        <div style={{ height: '100vh', position: 'relative' }}>
           <button onClick={() => setView('lobby')} style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 1000, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: 'white', padding: '10px 20px', borderRadius: '15px', fontSize: '12px', fontWeight: 900, border: '1px solid rgba(255,255,255,0.1)' }}>Lobby</button>
           
           {/* Только Питомец грузится лениво, UI остается */}
           <Suspense fallback={<div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loader"></div></div>}>
              <Pet pet={currentPet} activeAction={activeAction} />
           </Suspense>

           <Suspense fallback={null}>
              <Actions pet={currentPet} onUpdate={setCurrentPet} onActionTrigger={handleActionTrigger} />
           </Suspense>
        </div>
      )}
    </div>
  );
}

export default App;