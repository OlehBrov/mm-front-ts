import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MaintenanceIcon } from './icons/MaintenanceIcon';
import { setMaintenanceMode } from '../redux/features/maintenanceSlice';
import { unlockSetup } from '../redux/features/setupAuthSlice';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:6006/api';

const GearIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const BackspaceIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
    <line x1="18" y1="9" x2="12" y2="15" />
    <line x1="12" y1="9" x2="18" y2="15" />
  </svg>
);

export const MaintenanceCover = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const openDialog = () => {
    setPassword('');
    setError('');
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setPassword('');
    setError('');
  };

  const appendDigit = (digit: string) => {
    setError('');
    setPassword(prev => prev + digit);
  };

  const deleteDigit = () => {
    setPassword(prev => prev.slice(0, -1));
  };

  const handleSubmit = async () => {
    if (!password || loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/setup/service-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        dispatch(setMaintenanceMode(false));
        dispatch(unlockSetup());
        navigate('/setup');
      } else {
        setError('Невірний пароль');
        setPassword('');
      }
    } catch {
      setError('Помилка підключення');
    } finally {
      setLoading(false);
    }
  };

  // Barcode scanner support — capture phase so root.tsx handler never sees these events
  useEffect(() => {
    if (!dialogOpen) return;

    let buffer = '';
    let flushTimer: ReturnType<typeof setTimeout>;

    const onKey = (e: KeyboardEvent) => {
      e.stopImmediatePropagation();

      if (e.key === 'Enter') {
        clearTimeout(flushTimer);
        if (buffer.length > 0) {
          setPassword(buffer);
          setError('');
          buffer = '';
        }
        return;
      }

      if (e.key.length === 1 && /\d/.test(e.key)) {
        buffer += e.key;
        clearTimeout(flushTimer);
        flushTimer = setTimeout(() => { buffer = ''; }, 300);
      }
    };

    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      clearTimeout(flushTimer);
    };
  }, [dialogOpen]);

  const NUMPAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

  return (
    <div className="maintenance-cover">
      <button className="maintenance-gear-btn" onClick={openDialog} aria-label="Налаштування">
        <GearIcon />
      </button>

      <div className="maintenance-content">
        <div className="maintenance-icon-wrap">
          <MaintenanceIcon />
        </div>
        <h1 className="maintenance-title">Технічні роботи</h1>
        <p className="maintenance-subtitle">
          Кіоск тимчасово недоступний.<br />
          Просимо вибачення за незручності.
        </p>
      </div>

      {dialogOpen && (
        <div className="maintenance-dialog-overlay" onClick={closeDialog}>
          <div className="maintenance-dialog" onClick={(e) => e.stopPropagation()}>
            <h2 className="maintenance-dialog-title">Введіть пароль</h2>

            <div className="maintenance-dialog-display">
              {password.length > 0
                ? '●'.repeat(password.length)
                : <span className="maintenance-dialog-placeholder">——</span>
              }
            </div>

            {error && <p className="maintenance-dialog-error">{error}</p>}

            <div className="maintenance-numpad">
              {NUMPAD.map(n => (
                <button key={n} className="maintenance-numpad-btn" onClick={() => appendDigit(n)}>
                  {n}
                </button>
              ))}

              <button className="maintenance-numpad-btn maintenance-numpad-btn--back" onClick={deleteDigit}>
                <BackspaceIcon />
              </button>

              <button className="maintenance-numpad-btn" onClick={() => appendDigit('0')}>
                0
              </button>

              <button
                className="maintenance-numpad-btn maintenance-numpad-btn--confirm"
                onClick={handleSubmit}
                disabled={loading || !password}
              >
                {loading ? '…' : '✓'}
              </button>
            </div>

            <button className="maintenance-dialog-btn maintenance-dialog-btn--cancel" onClick={closeDialog}>
              Скасувати
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
