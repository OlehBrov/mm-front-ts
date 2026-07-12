import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';
import { RootState } from '../redux/store';
import { lockSetup, unlockSetup } from '../redux/features/setupAuthSlice';
import '../styles/_maintenance.scss';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:6006/api';

const NUMPAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

// Guards direct URL access to /setup and /setup/sales — same ServiceUsers.password
// check as the maintenance-mode gear icon flow (MaintenanceCover), so opening the
// config screen by URL/bookmark isn't a way to bypass the password.
export const SetupAuthGate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const unlocked = useSelector((s: RootState) => s.setupAuth.unlocked);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Re-lock whenever the gate unmounts (i.e. user navigates away from /setup entirely) —
  // so returning later requires the password again.
  useEffect(() => {
    return () => {
      dispatch(lockSetup());
    };
  }, [dispatch]);

  const appendDigit = (digit: string) => {
    setError('');
    setPassword((prev) => prev + digit);
  };

  const deleteDigit = () => setPassword((prev) => prev.slice(0, -1));

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
        dispatch(unlockSetup());
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

  // Barcode scanner support — same keyboard-wedge capture as MaintenanceCover.
  useEffect(() => {
    if (unlocked) return;

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
  }, [unlocked]);

  if (unlocked) return <Outlet />;

  return (
    <div className="setup-auth-gate">
      <div className="maintenance-dialog">
        <h2 className="maintenance-dialog-title">Введіть пароль</h2>

        <div className="maintenance-dialog-display">
          {password.length > 0
            ? '●'.repeat(password.length)
            : <span className="maintenance-dialog-placeholder">——</span>}
        </div>

        {error && <p className="maintenance-dialog-error">{error}</p>}

        <div className="maintenance-numpad">
          {NUMPAD.map((n) => (
            <button key={n} className="maintenance-numpad-btn" onClick={() => appendDigit(n)}>
              {n}
            </button>
          ))}

          <button className="maintenance-numpad-btn maintenance-numpad-btn--back" onClick={deleteDigit}>
            ⌫
          </button>

          <button className="maintenance-numpad-btn" onClick={() => appendDigit('0')}>
            0
          </button>

          <button
            className="maintenance-numpad-btn maintenance-numpad-btn--confirm"
            onClick={() => void handleSubmit()}
            disabled={loading || !password}
          >
            {loading ? '…' : '✓'}
          </button>
        </div>

        <button className="maintenance-dialog-btn maintenance-dialog-btn--cancel" onClick={() => navigate('/')}>
          Скасувати
        </button>
      </div>
    </div>
  );
};
