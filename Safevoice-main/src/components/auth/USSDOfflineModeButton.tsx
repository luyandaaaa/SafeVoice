import React, { useState, useRef, useEffect } from 'react';

// Types for USSD screens and history
interface USSDHistory {
  screen: USSDScreen;
  option?: string;
}

type USSDScreen =
  | 'main'
  | 'emergency'
  | 'report'
  | 'resources'
  | 'legal'
  | 'contacts'
  | 'location';

const initialMainMenu = [
  { key: '1', label: 'Emergency SOS' },
  { key: '2', label: 'Report Incident' },
  { key: '3', label: 'Safety Resources' },
  { key: '4', label: 'Legal Assistance' },
  { key: '5', label: 'Trusted Contacts' },
  { key: '6', label: 'Get Help Location' },
  { key: '0', label: 'Exit System' },
];

const blinkAnimation = `@keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }`;

const ussdStyles = `
${blinkAnimation}
.ussd-modal { 
  display: flex; 
  position: fixed; 
  top: 0; 
  left: 0; 
  width: 100vw; 
  height: 100vh; 
  background: rgba(0,0,0,0.8); 
  z-index: 1000; 
  align-items: center; 
  justify-content: center; 
}
.ussd-modal-content { 
  background: linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%); 
  width: 320px; 
  margin: auto; 
  border-radius: 25px; 
  box-shadow: 0 8px 40px rgba(0,0,0,0.5); 
  padding: 20px; 
  position: relative; 
  border: 3px solid #444; 
}
.ussd-modal-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 15px; 
}
.ussd-close-modal { 
  background: #e53e3e; 
  border: none; 
  font-size: 1.2rem; 
  color: #fff; 
  cursor: pointer; 
  width: 30px; 
  height: 30px; 
  border-radius: 50%; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  transition: all 0.2s; 
}
.ussd-close-modal:hover { 
  background: #dc2626 !important; 
  transform: scale(1.1); 
}
.ussd-phone-body {
  background: linear-gradient(135deg, #222 0%, #444 100%);
  border-radius: 18px 18px 32px 32px;
  padding: 15px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.7);
  border: 4px solid #222;
  width: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.ussd-phone-screen {
  width: 240px;
  height: 150px;
  font-family: 'Courier New', monospace;
  font-size: 0.95rem;
  color: #00ff00;
  background: linear-gradient(135deg, #001100 0%, #003300 100%);
  border-radius: 8px 8px 16px 16px;
  padding: 10px;
  margin-bottom: 15px;
  overflow-y: auto;
  border: 2.5px solid #00aa00;
  box-shadow: inset 0 2px 10px rgba(0,0,0,0.7);
  position: relative;
  line-height: 1.3;
}
.ussd-phone-keypad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 10px;
  width: 240px;
}
.ussd-key {
  height: 40px;
  font-size: 1.1rem;
  background: linear-gradient(135deg, #4a4a4a 0%, #3a3a3a 100%);
  color: #fff;
  border: 1px solid #666;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.15s;
  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}
.ussd-key:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(0,0,0,0.4) !important;
}
.ussd-keypad-actions {
  display: flex;
  justify-content: space-between;
  width: 240px;
  margin-top: 5px;
}
.ussd-key-call {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(34,197,94,0.3);
  transition: all 0.2s;
  width: 48%;
}
.ussd-key-call:hover {
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%) !important;
  box-shadow: 0 5px 15px rgba(34,197,94,0.5) !important;
}
.ussd-key-end {
  background: linear-gradient(135deg, #e53e3e 0%, #dc2626 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(229,62,62,0.3);
  transition: all 0.2s;
  width: 48%;
}
.ussd-key-end:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%) !important;
  box-shadow: 0 5px 15px rgba(229,62,62,0.5) !important;
}
.ussd-key-back {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(107,114,128,0.3);
  transition: all 0.2s;
  width: 100%;
}
.ussd-key-back:hover {
  background: linear-gradient(135deg, #4b5563 0%, #374151 100%) !important;
  box-shadow: 0 5px 15px rgba(107,114,128,0.5) !important;
}
@media (max-width: 400px) {
  .ussd-modal-content { 
    width: 95vw; 
    padding: 15px; 
    border-radius: 20px;
  }
  .ussd-phone-body { 
    width: 100%; 
    padding: 10px; 
  }
  .ussd-phone-screen { 
    width: 100%; 
    height: 35vh; 
    font-size: 0.9rem; 
    padding: 8px; 
  }
  .ussd-phone-keypad, .ussd-keypad-actions { 
    width: 100%; 
  }
}
`;

// Helper for playing beep sounds
function playBeep(frequency: number, duration: number, volume: number = 0.1) {
  try {
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(volume, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration);
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + duration);
    setTimeout(() => context.close(), (duration + 0.1) * 1000);
  } catch {}
}

// USSD Modal React Component
export const USSDModal: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  const [screen, setScreen] = useState<USSDScreen>('main');
  const [history, setHistory] = useState<USSDHistory[]>([]);
  const [input, setInput] = useState<string>('');
  const [showGoodbye, setShowGoodbye] = useState(false);
  const screenRef = useRef<HTMLDivElement>(null);

  // Play startup beep on open
  useEffect(() => {
    if (open) playBeep(800, 0.3, 0.1);
  }, [open]);

  // Focus for keyboard support
  useEffect(() => {
    if (open) {
      const handleKey = (e: KeyboardEvent) => {
        if (!open) return;
        if ([...'1234567890*#'].includes(e.key)) {
          e.preventDefault();
          handleKeyPress(e.key);
          playBeep(400, 0.1, 0.05);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        } else if (e.key === 'Backspace') {
          e.preventDefault();
          goBack();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          handleCall();
        }
      };
      window.addEventListener('keydown', handleKey);
      return () => window.removeEventListener('keydown', handleKey);
    }
  }, [open, screen, history, input]);

  // Scroll to bottom on content change
  useEffect(() => {
    if (screenRef.current) {
      screenRef.current.scrollTop = screenRef.current.scrollHeight;
    }
  }, [screen, input]);

  const handleKeyPress = (key: string) => {
    playBeep(800, 0.1, 0.05);
    if (screen === 'main') {
      handleMenuSelection(key);
    } else {
      setInput(prev => prev + key);
    }
  };

  const handleMenuSelection = (key: string) => {
    const option = initialMainMenu.find(item => item.key === key);
    if (!option) return;

    if (key === '0') {
      setShowGoodbye(true);
      setTimeout(() => {
        onClose();
        setShowGoodbye(false);
      }, 1500);
      return;
    }

    let newScreen: USSDScreen;
    switch (key) {
      case '1': newScreen = 'emergency'; break;
      case '2': newScreen = 'report'; break;
      case '3': newScreen = 'resources'; break;
      case '4': newScreen = 'legal'; break;
      case '5': newScreen = 'contacts'; break;
      case '6': newScreen = 'location'; break;
      default: return;
    }

    setHistory(prev => [...prev, { screen, option: key }]);
    setScreen(newScreen);
    setInput('');
  };

  const handleCall = () => {
    playBeep(1200, 0.2, 0.1);
    if (screen === 'main') return;
    
    // Process input based on current screen
    let response = '';
    switch (screen) {
      case 'emergency':
        response = `Emergency alert sent to authorities with code: ${input || 'NONE'}`;
        break;
      case 'report':
        response = `Incident report submitted. Case ID: ${Math.floor(1000 + Math.random() * 9000)}`;
        break;
      case 'resources':
        response = `Resources for code ${input || 'NONE'} sent to your phone via SMS.`;
        break;
      case 'legal':
        response = `Legal assistance request received. Lawyer will contact you shortly.`;
        break;
      case 'contacts':
        response = `Your trusted contacts have been notified with code: ${input || 'HELP'}`;
        break;
      case 'location':
        response = `Nearest safe location sent to your phone. Coordinates: ${(Math.random() * 90).toFixed(4)}°N, ${(Math.random() * 180).toFixed(4)}°W`;
        break;
      default:
        return;
    }

    setInput('');
    setHistory(prev => [...prev, { screen, option: input }]);
    setScreen('main');
    
    // Show response for 2 seconds before returning to main menu
    const tempContent = (
      <div>
        <p style={{ margin: '3px 0', textAlign: 'center' }}>==================</p>
        <p style={{ margin: '3px 0', textAlign: 'center' }}>{response}</p>
        <p style={{ margin: '3px 0', textAlign: 'center' }}>==================</p>
      </div>
    );
    
    setScreenContent(tempContent);
    setTimeout(() => {
      setScreenContent(null);
    }, 2000);
  };

  const goBack = () => {
    playBeep(600, 0.1, 0.05);
    if (screen === 'main') {
      onClose();
    } else {
      const lastScreen = history.length > 0 ? history[history.length - 1].screen : 'main';
      setScreen(lastScreen);
      setHistory(prev => prev.slice(0, -1));
      setInput('');
    }
  };

  const renderMainMenu = () => (
    <>
      <p style={{ margin: '3px 0', fontWeight: 'bold', textAlign: 'center', color: '#00ffff' }}>SafeVoice USSD</p>
      <p style={{ margin: '3px 0', textAlign: 'center' }}>==================</p>
      {initialMainMenu.map((item) => (
        <p key={item.key} style={{ margin: '3px 0' }}>{item.key}. {item.label}</p>
      ))}
      <p style={{ margin: '3px 0', textAlign: 'center' }}>==================</p>
      <p style={{ margin: '3px 0', textAlign: 'center', animation: 'blink 1.5s infinite' as any }}>Select option (1-6, 0)</p>
    </>
  );

  const renderScreenContent = () => {
    if (showGoodbye) {
      return (
        <p style={{ textAlign: 'center', marginTop: '30px', animation: 'blink 0.5s infinite' as any }}>
          Goodbye...
        </p>
      );
    }

    if (screenContent) return screenContent;

    switch (screen) {
      case 'main':
        return renderMainMenu();
      case 'emergency':
        return (
          <>
            <p style={{ margin: '3px 0', fontWeight: 'bold', textAlign: 'center', color: '#ff0000' }}>EMERGENCY SOS</p>
            <p style={{ margin: '3px 0', textAlign: 'center' }}>==================</p>
            <p style={{ margin: '3px 0' }}>Enter emergency code if available</p>
            <p style={{ margin: '3px 0' }}>Input: {input}</p>
            <p style={{ margin: '3px 0', textAlign: 'center' }}>==================</p>
            <p style={{ margin: '3px 0', textAlign: 'center', animation: 'blink 1.5s infinite' as any }}>Press CALL to send alert</p>
          </>
        );
      case 'report':
        return (
          <>
            <p style={{ margin: '3px 0', fontWeight: 'bold', textAlign: 'center', color: '#ffff00' }}>REPORT INCIDENT</p>
            <p style={{ margin: '3px 0', textAlign: 'center' }}>==================</p>
            <p style={{ margin: '3px 0' }}>Enter details about incident:</p>
            <p style={{ margin: '3px 0' }}>1. Type (1-9)</p>
            <p style={{ margin: '3px 0' }}>2. Location if known</p>
            <p style={{ margin: '3px 0' }}>Input: {input}</p>
            <p style={{ margin: '3px 0', textAlign: 'center' }}>==================</p>
            <p style={{ margin: '3px 0', textAlign: 'center', animation: 'blink 1.5s infinite' as any }}>Press CALL to submit</p>
          </>
        );
      case 'resources':
        return (
          <>
            <p style={{ margin: '3px 0', fontWeight: 'bold', textAlign: 'center', color: '#00ff00' }}>SAFETY RESOURCES</p>
            <p style={{ margin: '3px 0', textAlign: 'center' }}>==================</p>
            <p style={{ margin: '3px 0' }}>Enter resource code:</p>
            <p style={{ margin: '3px 0' }}>1. Shelters</p>
            <p style={{ margin: '3px 0' }}>2. Hotlines</p>
            <p style={{ margin: '3px 0' }}>3. Support Groups</p>
            <p style={{ margin: '3px 0' }}>Input: {input}</p>
            <p style={{ margin: '3px 0', textAlign: 'center' }}>==================</p>
            <p style={{ margin: '3px 0', textAlign: 'center', animation: 'blink 1.5s infinite' as any }}>Press CALL to request</p>
          </>
        );
      case 'legal':
        return (
          <>
            <p style={{ margin: '3px 0', fontWeight: 'bold', textAlign: 'center', color: '#00ffff' }}>LEGAL ASSISTANCE</p>
            <p style={{ margin: '3px 0', textAlign: 'center' }}>==================</p>
            <p style={{ margin: '3px 0' }}>Enter your legal need:</p>
            <p style={{ margin: '3px 0' }}>1. Restraining Order</p>
            <p style={{ margin: '3px 0' }}>2. Custody Help</p>
            <p style={{ margin: '3px 0' }}>3. Legal Advice</p>
            <p style={{ margin: '3px 0' }}>Input: {input}</p>
            <p style={{ margin: '3px 0', textAlign: 'center' }}>==================</p>
            <p style={{ margin: '3px 0', textAlign: 'center', animation: 'blink 1.5s infinite' as any }}>Press CALL to request help</p>
          </>
        );
      case 'contacts':
        return (
          <>
            <p style={{ margin: '3px 0', fontWeight: 'bold', textAlign: 'center', color: '#ff00ff' }}>TRUSTED CONTACTS</p>
            <p style={{ margin: '3px 0', textAlign: 'center' }}>==================</p>
            <p style={{ margin: '3px 0' }}>Enter message code:</p>
            <p style={{ margin: '3px 0' }}>1. I need help</p>
            <p style={{ margin: '3px 0' }}>2. Call me now</p>
            <p style={{ margin: '3px 0' }}>3. Come get me</p>
            <p style={{ margin: '3px 0' }}>Input: {input}</p>
            <p style={{ margin: '3px 0', textAlign: 'center' }}>==================</p>
            <p style={{ margin: '3px 0', textAlign: 'center', animation: 'blink 1.5s infinite' as any }}>Press CALL to notify contacts</p>
          </>
        );
      case 'location':
        return (
          <>
            <p style={{ margin: '3px 0', fontWeight: 'bold', textAlign: 'center', color: '#ffffff' }}>GET HELP LOCATION</p>
            <p style={{ margin: '3px 0', textAlign: 'center' }}>==================</p>
            <p style={{ margin: '3px 0' }}>Enter your location code if known</p>
            <p style={{ margin: '3px 0' }}>Input: {input}</p>
            <p style={{ margin: '3px 0', textAlign: 'center' }}>==================</p>
            <p style={{ margin: '3px 0', textAlign: 'center', animation: 'blink 1.5s infinite' as any }}>Press CALL to find nearest help</p>
          </>
        );
      default:
        return renderMainMenu();
    }
  };

  const [screenContent, setScreenContent] = useState<React.ReactNode>(null);

  // Modal content
  if (!open) return null;
  return (
    <div className="ussd-modal" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <style>{ussdStyles}</style>
      <div className="ussd-modal-content">
        <div className="ussd-modal-header">
          <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.2rem', color: '#fff', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>SafeVoice USSD</h3>
          <button className="ussd-close-modal" onClick={onClose}>&times;</button>
        </div>
        <div className="ussd-modal-body">
          <div className="phone-simulator" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="ussd-phone-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ width: 40, height: 8, background: '#222', borderRadius: 4, boxShadow: '0 1px 3px #000', marginRight: 8 }} />
                <div style={{ width: 12, height: 12, background: '#444', borderRadius: '50%', boxShadow: '0 1px 3px #000' }} />
              </div>
              <div className="ussd-phone-screen" ref={screenRef}>
                {renderScreenContent()}
              </div>
              
              {/* Keypad */}
              <div className="ussd-phone-keypad">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(key => (
                  <button key={key} className="ussd-key" onClick={() => handleKeyPress(key)}>
                    {key}
                  </button>
                ))}
              </div>
              
              {/* Action buttons */}
              <div className="ussd-keypad-actions">
                <button className="ussd-key-call" onClick={handleCall}>
                  CALL
                </button>
                <button className="ussd-key-end" onClick={onClose}>
                  END
                </button>
              </div>
              <button className="ussd-key-back" onClick={goBack}>
                BACK
              </button>
            </div>
          </div>
          <p style={{ textAlign: 'center', marginTop: 15, color: '#bbb', fontSize: '0.85rem' }}>
            To access in real life, dial <strong style={{ color: '#00ff00' }}>*384*SOS#</strong> from any mobile phone
          </p>
        </div>
      </div>
    </div>
  );
};

// Floating Offline Mode Button
export const OfflineModeButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      zIndex: 1100,
      background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
      color: '#fff',
      borderRadius: 50,
      padding: '12px 24px',
      fontSize: '1rem',
      border: '2px solid #555',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    }}
    onClick={onClick}
  >
    Offline Mode
  </button>
);