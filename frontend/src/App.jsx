import React, { useEffect, useState, Suspense } from 'react';
import WebApp from '@twa-dev/sdk';
import { login } from './api';
import { Plus, User as UserIcon, Loader2, ArrowRight } from 'lucide-react';
import ModelViewer from './components/ModelViewer';
import './App.css';

// Lazy load components
const Pet = React.lazy(() => import('./components/Pet'));
const Actions = React.lazy(() => import('./components/Actions'));

function App() {
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [currentPet, setCurrentPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Initializing...');
  const [view, setView] = useState('lobby');

  useEffect(() => {
    const initApp = async () => {
      try {
        setStatus('Connecting to Telegram...');
        WebApp.ready(); WebApp.expand();
        
        setStatus('Authenticating...');
        const res = await login();
        
        if (res?.data) {
          setUser(res.data.user);
          setPets(res.data.pets || []);
          setStatus('Ready!');
        } else {
          setStatus('Server error. Using guest mode.');
        }
      } catch (err) {
        console.error('App Error:', err);
        setStatus('Connection failed. Retrying...');
      } finally {
        setLoading(false);
      }
    };

    initApp();
    // Safety Force Stop Loading
    const timer = setTimeout(() => setLoading(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return (
    <div style={{ height: '100vh', background: '#050508', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'sans-serif' }}>
      <div className="loader-ring"></div>
      <h1 style={{ marginTop: '20px', letterSpacing: '4px' }}>LIVI</h1>
      <p style={{ opacity: 0.5, fontSize: '12px', marginTop: '10px' }}>{status}</p>
    </div>
  );

  return (
    <div className="app-container" style={{ background: '#050508', minHeight: '100vh', color: 'white' }}>
      {view === 'lobby' && (
        <div style={{ padding: '20px' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
            <h2 style={{ margin: 0 }}>{user?.firstName || 'Player'}</h2>
            <UserIcon size={24} opacity={0.5} />
          </header>

          <div style={{ display: 'flex', overflowX: 'auto', gap: '20px', paddingBottom: '20px' }} className="hide-scroll">
            {pets.map(pet => (
              <div 
                key={pet._id} 
                onClick={() => { setCurrentPet(pet); setView('game'); }}
                style={{ minWidth: '260px', height: '400px', background: 'rgba(255,255,255,0.03)', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}
              >
                <div style={{ height: '70%' }}>
                  <ModelViewer color={pet.skinColor} />
                </div>
                <div style={{ textAlign: 'center', padding: '10px' }}>
                  <h3 style={{ margin: 0 }}>{pet.name}</h3>
                  <div style={{ fontSize: '12px', opacity: 0.5 }}>Level {pet.level}</div>
                </div>
              </div>
            ))}
            
            <div 
              style={{ minWidth: '260px', height: '400px', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => alert('New pet creation coming soon!')}
            >
              <Plus size={40} opacity={0.2} />
              <span style={{ opacity: 0.2, marginTop: '10px' }}>ADD NEW</span>
            </div>
          </div>
        </div>
      )}

      {view === 'game' && currentPet && (
        <div style={{ height: '100vh', position: 'relative' }}>
          <button 
            onClick={() => setView('lobby')} 
            style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 100, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '10px 20px', borderRadius: '15px' }}
          >
            ← BACK
          </button>
          
          <Suspense fallback={<div className="loader-center"><Loader2 className="animate-spin" /></div>}>
            <Pet pet={currentPet} onUpdate={setCurrentPet} />
            <Actions pet={currentPet} onUpdate={setCurrentPet} />
          </Suspense>
        </div>
      )}
    </div>
  );
}

export default App;