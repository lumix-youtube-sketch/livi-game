import React, { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import { login, joinPair } from './api';
import Pet from './components/Pet';
import Actions from './components/Actions';

function App() {
  const [user, setUser] = useState(null);
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pairIdInput, setPairIdInput] = useState('');

  useEffect(() => {
    // Initialize Telegram WebApp
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
      // Re-fetch user to update pairId status
      const userRes = await login(); 
      setUser(userRes.data.user);
    } catch (err) {
      alert('Failed to join: ' + (err.response?.data?.error || err.message));
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
          <p>This is a co-op pet game.</p>
          <p>To start, you need to pair up with a friend.</p>
          
          <div style={{ margin: '20px 0', border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
            <p><strong>Option 1:</strong> Share your Telegram ID with a friend:</p>
            <code style={{ background: '#eee', padding: '5px', fontSize: '1.2em' }}>{user.telegramId}</code>
          </div>

          <div style={{ margin: '20px 0', border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
            <p><strong>Option 2:</strong> Enter your friend's Telegram ID to join them:</p>
            <input 
              type="text" 
              placeholder="Friend's Telegram ID" 
              value={pairIdInput}
              onChange={(e) => setPairIdInput(e.target.value)}
              style={{ padding: '8px', width: '80%' }}
            />
            <br/><br/>
            <button onClick={handleJoin} style={{ padding: '10px 20px', background: '#3390ec', color: 'white', border: 'none', borderRadius: '4px' }}>
              Start Game Together
            </button>
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