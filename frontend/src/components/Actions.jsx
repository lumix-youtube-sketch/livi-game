import React, { useState } from 'react';
import { performAction, uploadClothing } from '../api';

const Actions = ({ onUpdate }) => {
  const [uploading, setUploading] = useState(false);

  const handleAction = async (type) => {
    try {
      const res = await performAction(type);
      onUpdate(res.data.pet);
    } catch (err) {
      alert('Action failed');
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const res = await uploadClothing(formData);
      onUpdate(res.data.pet);
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button onClick={() => handleAction('feed')}>🍔 Feed</button>
        <button onClick={() => handleAction('play')}>🎾 Play</button>
      </div>
      
      <div style={{ borderTop: '1px solid #ccc', paddingTop: '10px' }}>
        <p>Customize Outfit (PNG):</p>
        <input type="file" accept="image/png" onChange={handleFileChange} disabled={uploading} />
      </div>
    </div>
  );
};

export default Actions;