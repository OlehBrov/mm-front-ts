import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/_setup.scss';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:6006/api';

// Types whose discount is tiered by days-to-expiry (sale_discount_1/2/3 all apply) —
// every other type only ever uses sale_discount_1.
const TIERED_TYPES = new Set([1, 2]);
// The single cart-wide "мінімальний чек" type — the only one with a threshold_amount.
const THRESHOLD_TYPE = 10;

interface SaleItem {
  id: number;
  sale_custom_id: number | null;
  sale_name: string;
  sale_discount_1: string | null;
  sale_discount_2: string | null;
  sale_discount_3: string | null;
  sale_description: string | null;
  threshold_amount: string | null;
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

// Fraction (0.2) ↔ percent-input string ("20") — sale_discount_* are stored as fractions.
function fractionToPercentStr(v: string | null): string {
  if (v === null || v === undefined) return '';
  const n = Number(v);
  return Number.isNaN(n) ? '' : String(Math.round(n * 10000) / 100);
}
function percentStrToFraction(v: string): number | null {
  if (v.trim() === '') return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n / 100;
}

function Feedback({ msg, isError }: { msg: string; isError: boolean }) {
  if (!msg) return null;
  return <span className={`save-feedback ${isError ? 'err' : 'ok'}`}>{msg}</span>;
}

// ─── Sale row ───────────────────────────────────────────────────────────────

function SaleRow({ sale, onChanged }: { sale: SaleItem; onChanged: () => void }) {
  const [saving, setSaving] = useState(false);
  const [fb, setFb] = useState({ msg: '', err: false });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    discount1: fractionToPercentStr(sale.sale_discount_1),
    discount2: fractionToPercentStr(sale.sale_discount_2),
    discount3: fractionToPercentStr(sale.sale_discount_3),
    threshold: sale.threshold_amount ?? '',
  });

  const isTiered = sale.sale_custom_id !== null && TIERED_TYPES.has(sale.sale_custom_id);
  const isThreshold = sale.sale_custom_id === THRESHOLD_TYPE;

  const startEditing = () => {
    setForm({
      discount1: fractionToPercentStr(sale.sale_discount_1),
      discount2: fractionToPercentStr(sale.sale_discount_2),
      discount3: fractionToPercentStr(sale.sale_discount_3),
      threshold: sale.threshold_amount ?? '',
    });
    setFb({ msg: '', err: false });
    setEditing(true);
  };

  const toggle = async () => {
    if (sale.sale_custom_id === null) return;
    setSaving(true);
    setFb({ msg: '', err: false });
    try {
      await apiFetch(`/setup/sales/${sale.sale_custom_id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: !sale.is_active }),
      });
      onChanged();
    } catch (e) {
      setFb({ msg: (e as Error).message, err: true });
    } finally {
      setSaving(false);
    }
  };

  const saveDiscounts = async () => {
    if (sale.sale_custom_id === null) return;
    setSaving(true);
    setFb({ msg: '', err: false });
    try {
      const body: Record<string, unknown> = {
        sale_custom_id: sale.sale_custom_id,
        sale_discount_1: percentStrToFraction(form.discount1),
      };
      if (isTiered) {
        body.sale_discount_2 = percentStrToFraction(form.discount2);
        body.sale_discount_3 = percentStrToFraction(form.discount3);
      }
      if (isThreshold) {
        body.threshold_amount = form.threshold.trim() === '' ? null : Number(form.threshold);
      }
      await apiFetch<{ message: string }>('/setup/sales/edit', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      setFb({ msg: 'Збережено', err: false });
      setEditing(false);
      onChanged();
    } catch (e) {
      setFb({ msg: (e as Error).message, err: true });
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
        {!editing && discounts.length > 0 && (
          <div className="sale-row-discounts">
            {discounts.map((d, i) => (
              <span key={i} className="discount-chip">{d}</span>
            ))}
          </div>
        )}
        {!editing && isThreshold && sale.threshold_amount && (
          <div className="sale-row-discounts">
            <span className="discount-chip">від {sale.threshold_amount} грн</span>
          </div>
        )}

        {editing && (
          <div className="sale-edit-form">
            <div className="form-row">
              <label>{isTiered ? 'Знижка за 3 дні (%)' : 'Розмір знижки (%)'}</label>
              <input
                type="number"
                value={form.discount1}
                onChange={(e) => setForm((f) => ({ ...f, discount1: e.target.value }))}
                placeholder="10"
              />
            </div>
            {isTiered && (
              <>
                <div className="form-row">
                  <label>Знижка за 2 дні (%)</label>
                  <input
                    type="number"
                    value={form.discount2}
                    onChange={(e) => setForm((f) => ({ ...f, discount2: e.target.value }))}
                    placeholder="20"
                  />
                </div>
                <div className="form-row">
                  <label>Знижка &lt; 2 днів (%)</label>
                  <input
                    type="number"
                    value={form.discount3}
                    onChange={(e) => setForm((f) => ({ ...f, discount3: e.target.value }))}
                    placeholder="30"
                  />
                </div>
              </>
            )}
            {isThreshold && (
              <div className="form-row">
                <label>Поріг суми чека (грн)</label>
                <input
                  type="number"
                  value={form.threshold}
                  onChange={(e) => setForm((f) => ({ ...f, threshold: e.target.value }))}
                  placeholder="500"
                />
              </div>
            )}
            <div className="form-actions">
              <button className="btn btn-ghost" onClick={() => void saveDiscounts()} disabled={saving}>
                {saving ? '...' : 'Зберегти'}
              </button>
              <button className="btn btn-ghost" onClick={() => setEditing(false)} disabled={saving}>
                Скасувати
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="sale-row-actions">
        <Feedback msg={fb.msg} isError={fb.err} />
        {!editing && (
          <button
            className="btn btn-ghost"
            onClick={startEditing}
            disabled={sale.sale_custom_id === null}
            title="Змінити розмір знижки"
          >
            ✎ Змінити
          </button>
        )}
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

  return (
    <div className="setup-screen">
      <div className="setup-header">
        <h1>Налаштування акцій</h1>
        <button className="btn btn-ghost" onClick={() => navigate('/setup')}>
          ← Назад до налаштувань
        </button>
      </div>

      <p className="setup-hint">
        Зміна ставки знижки чи вимкнення/увімкнення акції з цього екрана набуває чинності одразу.
      </p>

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
            <SaleRow key={s.id} sale={s} onChanged={() => void load()} />
          ))}
        </div>
      )}
    </div>
  );
}
