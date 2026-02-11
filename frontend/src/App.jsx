import React, { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import { login, joinPair, createSoloPet } from './api';
import Pet from './components/Pet';
import Actions from './components/Actions';

function App() {
  const [user, setUser] = useState(null);
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pairIdInput, setPairIdInput] = useState('');

  useEffect(() => {
    WebApp.ready();
    WebApp.expand();

    const initAuth = async () => {
      try {
        const res = await login();
        setUser(res.data.user);
        setPet(res.data.pet);
      } catch (err) {
        console.error('Login failed', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const handleJoin = async () => {
    if (!pairIdInput) return;
    try {
      const res = await joinPair(pairIdInput);
      setPet(res.data.pet);
      const userRes = await login(); 
      setUser(userRes.data.user);
    } catch (err) {
      alert('Failed to join: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleCreateSolo = async () => {
    try {
      const res = await createSoloPet();
      setPet(res.data.pet);
      const userRes = await login();
      setUser(userRes.data.user);
    } catch (err) {
      alert('Failed to create: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) return <div>Loading Livi...</div>;
  if (!user) return <div>Error loading user data.</div>;

  return (
    <div style={{ fontFamily: 'sans-serif', paddingBottom: '50px' }}>
      <header style={{ padding: '10px', background: '#3390ec', color: 'white' }}>
        <h1>Livi 🐾</h1>
        <small>Hi, {user.firstName || user.username}</small>
      </header>

      {!pet ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h3>Welcome to Livi!</h3>
          
          <div style={{ margin: '15px 0', border: '1px solid #ddd', padding: '10px', borderRadius: '8px', background: '#e8f5e9' }}>
            <p><strong>Quick Start:</strong></p>
            <button onClick={handleCreateSolo} style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
              🐾 Create My Pet
            </button>
          </div>

          <div style={{ margin: '15px 0', border: '1px solid #ddd', padding: '10px', borderRadius: '8px' }}>
            <p><strong>Or Play with a Friend:</strong></p>
            <code style={{ background: '#eee', padding: '5px' }}>ID: {user.telegramId}</code>
            <div style={{ marginTop: '10px' }}>
              <input 
                type="text" 
                placeholder="Friend's ID" 
                value={pairIdInput}
                onChange={(e) => setPairIdInput(e.target.value)}
                style={{ padding: '5px', width: '60%' }}
              />
              <button onClick={handleJoin} style={{ padding: '5px 10px', marginLeft: '5px' }}>Join</button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <Pet pet={pet} />
          <Actions onUpdate={setPet} />
        </>
      )}
    </div>
  );
}

export default App;