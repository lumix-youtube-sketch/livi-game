import React, { useEffect, useState, Suspense } from 'react';
import WebApp from '@twa-dev/sdk';
import { login, createPet, joinPet } from './api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Share2, ArrowRight, Clock } from 'lucide-react';
import ModelViewer from './components/ModelViewer';

const Pet = React.lazy(() => import('./components/Pet'));
const Actions = React.lazy(() => import('./components/Actions'));

// Helper to calculate age string
const getPetAge = (createdAt) => {
    const start = new Date(createdAt);
    const now = new Date();
    const diff = now - start;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
};

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
    WebApp.ready(); WebApp.expand();
    WebApp.setHeaderColor('#0f0f14'); WebApp.setBackgroundColor('#0f0f14');

    const initAuth = async () => {
      try {
        const res = await login();
        setUser(res.data.user);
        const startParam = WebApp.initDataUnsafe?.start_param;
        if (startParam && startParam.startsWith('join_')) {
            const petId = startParam.replace('join_', '');
            const joinRes = await joinPet(petId);
            setCurrentPet(joinRes.data.pet); setView('game'); return;
        }
        setPets(res.data.pets || []); setView('lobby');
      } catch (err) { console.error(err); setView('lobby'); }
      finally { setLoading(false); }
    };
    initAuth();
  }, []);

  const handleCreatePet = async () => {
    try {
      const res = await createPet(partnerId || null, newName, newShape);
      setPets([...pets, res.data.pet]); setCurrentPet(res.data.pet);
      setCreationStep(false); setView('game');
    } catch (err) { alert(err.response?.data?.error || 'Error'); }
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f14' }}>
      <span className="loader"></span>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', maxWidth: '500px', margin: '0 auto', background: '#0f0f14', position: 'relative' }}>
      
      {view === 'lobby' && !creationStep && (
        <div style={{ padding: '30px 20px' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '900', color: 'white' }}>Livi</h1>
            <div className="hud-capsule" style={{ borderRadius: '24px' }}><span style={{ fontWeight: 800 }}>{pets.length}/10</span></div>
          </header>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <motion.div whileTap={{ scale: 0.95 }} onClick={() => setCreationStep(true)} className="glass-panel" style={{ height: '240px', borderRadius: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed rgba(255,255,255,0.1)' }}>
              <Plus size={40} color="var(--primary)" /><span style={{ marginTop: '10px', fontWeight: 800 }}>New Friend</span>
            </motion.div>
            {pets.map(pet => (
              <motion.div key={pet._id} whileTap={{ scale: 0.95 }} onClick={() => { setCurrentPet(pet); setView('game'); }} className="glass-panel" style={{ height: '240px', borderRadius: '32px', padding: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.6, fontSize: '10px', fontWeight: 900 }}>
                        <Clock size={12} /> {getPetAge(pet.createdAt)}
                    </div>
                </div>
                <div style={{ height: '130px', margin: '0 -15px' }}>
                   <ModelViewer type="pet" color={pet.skinColor} shape={pet.shape} accessories={pet.accessories} background={pet.currentBackground} isLobby={true} style={{ height: '100%' }} />
                </div>
                <div style={{ fontWeight: 900, textAlign: 'center', color: 'white' }}>{pet.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {creationStep && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ padding: '30px', color: 'white' }}>
            <button onClick={() => setCreationStep(false)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '10px 20px', borderRadius: '20px', marginBottom: '30px' }}>← Back</button>
            <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '30px' }}>New Companion</h2>
            <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '10px', opacity: 0.6, fontWeight: 800 }}>NAME</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} style={{ width: '100%', padding: '18px', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '18px', fontWeight: 800 }} />
            </div>
            <label style={{ display: 'block', marginBottom: '10px', opacity: 0.6, fontWeight: 800 }}>SHAPE</label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                {['capsule', 'round', 'boxy'].map(s => (
                    <button key={s} onClick={() => setNewShape(s)} style={{ flex: 1, padding: '15px', borderRadius: '18px', background: newShape === s ? 'var(--primary)' : 'rgba(255,255,255,0.05)', border: newShape === s ? '2px solid white' : 'none', color: 'white', fontWeight: 800, textTransform: 'uppercase', fontSize: '11px' }}>{s}</button>
                ))}
            </div>
            <button onClick={handleCreatePet} style={{ width: '100%', padding: '22px', borderRadius: '24px', background: 'white', color: 'black', fontWeight: 900, fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 10px 30px rgba(255,255,255,0.1)' }}>Create <ArrowRight size={20} /></button>
        </motion.div>
      )}

      {view === 'game' && currentPet && (
        <div style={{ height: '100vh', position: 'relative' }}>
           <button onClick={() => setView('lobby')} style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 1000, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: 'white', padding: '10px 20px', borderRadius: '20px', fontSize: '12px', fontWeight: 900 }}>Lobby</button>
           <Suspense fallback={<div className="loader-center"><div className="loader"></div></div>}>
              <Pet pet={currentPet} activeAction={activeAction} onUpdate={setCurrentPet} />
           </Suspense>
           <Suspense fallback={null}>
              <Actions pet={currentPet} onUpdate={setCurrentPet} onActionTrigger={setActiveAction} />
           </Suspense>
        </div>
      )}
    </div>
  );
}

export default App;