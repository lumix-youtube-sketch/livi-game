import React, { useEffect, useState, Suspense } from 'react';
import WebApp from '@twa-dev/sdk';
import { login, createPet, joinPet } from './api';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Trophy, Sparkles, Share2, Check, ArrowRight } from 'lucide-react';
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

  // Creation State
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
        console.error('Login failed', err);
        setView('lobby');
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const handleCreatePet = async () => {
    if (!partnerId && pets.length === 0) {
        alert("You must invite a friend to create your first pet!");
        return;
    }
    try {
      const res = await createPet(partnerId || null, newName, newShape);
      setPets([...pets, res.data.pet]);
      setCurrentPet(res.data.pet);
      setCreationStep(false);
      setView('game');
    } catch (err) { alert(err.response?.data?.error || 'Error'); }
  };

  const handleShareInvite = () => {
    const link = `https://t.me/livi_game_bot/app?startapp=join_new`; // Link to trigger creation flow
    WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent("Grow a pet with me! 🐾")}`);
  };

  const selectPet = (pet) => {
    setCurrentPet(pet);
    setView('game');
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f14' }}>
      <span className="loader"></span>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', maxWidth: '500px', margin: '0 auto', position: 'relative', background: '#0f0f14' }}>
      
      {/* LOBBY VIEW */}
      {view === 'lobby' && !creationStep && (
        <div style={{ padding: '30px 20px' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '900', color: 'white' }}>Livi</h1>
              <p style={{ margin: 0, opacity: 0.5 }}>Your Family of Friends</p>
            </div>
            <div className="hud-capsule">
              <span style={{ fontSize: '14px', fontWeight: 800 }}>{pets.length}/10</span>
            </div>
          </header>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <motion.div 
              whileTap={{ scale: 0.95 }}
              onClick={() => setCreationStep(true)}
              className="glass-panel"
              style={{ height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed rgba(255,255,255,0.1)' }}
            >
              <Plus size={40} color="var(--primary)" />
              <span style={{ marginTop: '10px', fontWeight: 800 }}>New Pet</span>
            </motion.div>

            {pets.map(pet => (
              <motion.div key={pet._id} whileTap={{ scale: 0.95 }} onClick={() => selectPet(pet)} className="glass-panel" style={{ height: '220px', padding: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ height: '120px' }}>
                   <ModelViewer type="pet" mood="happy" color={pet.skinColor} shape={pet.shape} accessories={pet.accessories} style={{ height: '100%' }} />
                </div>
                <div style={{ fontWeight: 900, textAlign: 'center' }}>{pet.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* CREATION FLOW */}
      {creationStep && (
        <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} style={{ padding: '30px', color: 'white' }}>
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
                <label style={{ display: 'block', marginBottom: '10px', opacity: 0.6 }}>Friend ID (Mandatory for Co-op)</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input placeholder="Friend's Telegram ID" value={partnerId} onChange={e => setPartnerId(e.target.value)} style={{ flex: 1, padding: '15px', borderRadius: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                    <button onClick={handleShareInvite} style={{ padding: '15px', borderRadius: '15px', background: 'rgba(255,255,255,0.1)' }}><Share2 size={20} color="white" /></button>
                </div>
                <p style={{ fontSize: '12px', marginTop: '10px', opacity: 0.4 }}>Send link to your friend or paste their ID if they are already in Livi.</p>
            </div>

            <button onClick={handleCreatePet} style={{ width: '100%', padding: '20px', borderRadius: '20px', background: 'white', color: 'black', fontWeight: 900, fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                Start Growing <ArrowRight size={20} />
            </button>
        </motion.div>
      )}

      {/* GAME VIEW */}
      {view === 'game' && currentPet && (
        <Suspense fallback={null}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
             <button onClick={() => setView('lobby')} style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 100, background: 'rgba(255,255,255,0.1)', color: 'white', padding: '10px 20px', borderRadius: '15px', fontSize: '12px', fontWeight: 900 }}>Lobby</button>
             <Pet pet={currentPet} activeAction={activeAction} />
             <Actions pet={currentPet} onUpdate={setCurrentPet} onActionTrigger={setActiveAction} />
          </motion.div>
        </Suspense>
      )}
    </div>
  );
}

export default App;