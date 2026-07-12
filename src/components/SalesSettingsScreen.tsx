import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/_setup.scss';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:6006/api';

interface SaleItem {
  id: number;
  sale_custom_id: number | null;
  sale_name: string;
  sale_discount_1: string | null;
  sale_discount_2: string | null;
  sale_discount_3: string | null;
  sale_description: string | null;
  is_active: boolean;
}

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(opts?.headers ?? {}) },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : {}) as T;
}

function formatDiscount(v: string | null): string | null {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  if (Number.isNaN(n)) return null;
  return `${Math.round(n * 100)}%`;
}

// ─── Sale row ───────────────────────────────────────────────────────────────

function SaleRow({ sale, onToggled }: { sale: SaleItem; onToggled: (updated: SaleItem) => void }) {
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const toggle = async () => {
    if (sale.sale_custom_id === null) return;
    setSaving(true);
    setErr('');
    try {
      const result = await apiFetch<{ data: SaleItem }>(`/sales/${sale.sale_custom_id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: !sale.is_active }),
      });
      onToggled(result.data);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const discounts = [sale.sale_discount_1, sale.sale_discount_2, sale.sale_discount_3]
    .map(formatDiscount)
    .filter((d): d is string => d !== null);

  return (
    <div className={`sale-row ${sale.is_active ? '' : 'sale-inactive'}`}>
      <div className="sale-row-main">
        <div className="sale-row-name">
          {sale.sale_name}
          <span className="sale-id-chip">#{sale.sale_custom_id ?? '—'}</span>
        </div>
        <div className="sale-row-desc">{sale.sale_description || 'Опис відсутній'}</div>
        {discounts.length > 0 && (
          <div className="sale-row-discounts">
            {discounts.map((d, i) => (
              <span key={i} className="discount-chip">{d}</span>
            ))}
          </div>
        )}
      </div>
      <div className="sale-row-actions">
        {err && <span className="save-feedback err">{err}</span>}
        <label className="toggle-switch" title={sale.is_active ? 'Вимкнути акцію' : 'Увімкнути акцію'}>
          <input
            type="checkbox"
            checked={sale.is_active}
            disabled={saving || sale.sale_custom_id === null}
            onChange={() => void toggle()}
          />
          <span className="toggle-slider" />
        </label>
        <span className={`status-badge ${sale.is_active ? 'ok' : 'err'}`}>
          {sale.is_active ? 'Активна' : 'Вимкнена'}
        </span>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function SalesSettingsScreen() {
  const navigate = useNavigate();
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const result = await apiFetch<{ message: string; data?: SaleItem[] }>('/sales');
      setSales(result.data ?? []);
      setError('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleToggled = (updated: SaleItem) => {
    setSales((prev) => prev.map((s) => (s.sale_custom_id === updated.sale_custom_id ? updated : s)));
  };

  return (
    <div className="setup-screen">
      <div className="setup-header">
        <h1>Налаштування акцій</h1>
        <button className="btn btn-ghost" onClick={() => navigate('/setup')}>
          ← Назад до налаштувань
        </button>
      </div>

      {loading && <p style={{ color: '#484f58' }}>Завантаження...</p>}

      {!loading && error && (
        <>
          <p style={{ color: '#f85149' }}>Помилка з'єднання: {error}</p>
          <button className="btn btn-ghost" onClick={() => void load()}>Повторити</button>
        </>
      )}

      {!loading && !error && (
        <div className="sales-list">
          {sales.length === 0 && <p style={{ color: '#484f58' }}>Акцій не знайдено</p>}
          {sales.map((s) => (
            <SaleRow key={s.id} sale={s} onToggled={handleToggled} />
          ))}
        </div>
      )}
    </div>
  );
}
