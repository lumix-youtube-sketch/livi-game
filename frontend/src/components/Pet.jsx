import React from 'react';

const Pet = ({ pet }) => {
  if (!pet) return <div>Loading Pet...</div>;

  const getEmoji = () => {
    if (pet.mood < 30) return '😢';
    if (pet.hunger < 30) return '🤤';
    if (pet.energy < 30) return '😴';
    return '😺';
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h2>{pet.name} {getEmoji()}</h2>
      
      <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto', background: '#f0f0f0', borderRadius: '50%' }}>
         {/* Base Pet Image (placeholder) */}
         <div style={{ fontSize: '100px', paddingTop: '40px' }}>🐱</div>
         
         {/* Clothing Overlay */}
         {pet.clothingUrl && (
           <img 
             src={`http://localhost:3000${pet.clothingUrl}`} 
             alt="clothing" 
             style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }}
           />
         )}
      </div>

      <div style={{ marginTop: '20px', textAlign: 'left', maxWidth: '300px', margin: '20px auto' }}>
        <div>Hunger: <progress value={pet.hunger} max="100"></progress></div>
        <div>Energy: <progress value={pet.energy} max="100"></progress></div>
        <div>Mood: <progress value={pet.mood} max="100"></progress></div>
      </div>
    </div>
  );
};

export default Pet;