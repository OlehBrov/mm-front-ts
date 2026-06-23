import { useState, useEffect, useCallback } from 'react';
import '../styles/_setup.scss';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:6006/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StoreInfo {
  store_name: string | null;
  store_address: string | null;
  active_bank: string | null;
  alert_email: string | null;
  default_merchant: string | null;
  VAT_excise_merchant: string | null;
  is_single_merchant: boolean | null;
}

interface TerminalConfig {
  bank: string;
  name: string | null;
  host: string | null;
  port: number | null;
}

interface FiscalConfig {
  merchant_id: string;
  merchant_name: string | null;
  merchant_code: string | null;
  fiscal_token: string | null;
}

interface SetupData {
  store: StoreInfo | null;
  terminalConfigs: TerminalConfig[];
  fiscalConfigs: FiscalConfig[];
}

interface TokenStatus {
  valid: boolean;
  errortxt: string;
  fisid?: string;
  shift_status?: number;
  online_status?: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(opts?.headers ?? {}) },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function SaveFeedback({ msg, isError }: { msg: string; isError: boolean }) {
  if (!msg) return null;
  return <p className={`save-feedback ${isError ? 'error' : 'ok'}`}>{msg}</p>;
}

// ─── Store Info section ───────────────────────────────────────────────────────

function StoreSection({ store, onSaved }: { store: StoreInfo | null; onSaved: () => void }) {
  const [form, setForm] = useState({
    store_name: store?.store_name ?? '',
    store_address: store?.store_address ?? '',
    active_bank: store?.active_bank ?? 'monobank',
    alert_email: store?.alert_email ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ msg: '', error: false });

  useEffect(() => {
    setForm({
      store_name: store?.store_name ?? '',
      store_address: store?.store_address ?? '',
      active_bank: store?.active_bank ?? 'monobank',
      alert_email: store?.alert_email ?? '',
    });
  }, [store]);

  const save = async () => {
    setSaving(true);
    setFeedback({ msg: '', error: false });
    try {
      await apiFetch('/setup/store', {
        method: 'PATCH',
        body: JSON.stringify({
          store_name: form.store_name || undefined,
          store_address: form.store_address || undefined,
          active_bank: form.active_bank || undefined,
          alert_email: form.alert_email || null,
        }),
      });
      setFeedback({ msg: '✓ Збережено', error: false });
      onSaved();
    } catch (e) {
      setFeedback({ msg: `Помилка: ${(e as Error).message}`, error: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="setup-card">
      <h2>Магазин</h2>
      <div className="form-row">
        <label>Назва торгової точки</label>
        <input
          value={form.store_name}
          onChange={(e) => setForm({ ...form, store_name: e.target.value })}
          placeholder="Супермаркет «Назва»"
        />
      </div>
      <div className="form-row">
        <label>Адреса</label>
        <input
          value={form.store_address}
          onChange={(e) => setForm({ ...form, store_address: e.target.value })}
          placeholder="вул. Незалежності, 1"
        />
      </div>
      <div className="form-row">
        <label>Активний банк (термінал)</label>
        <select
          value={form.active_bank}
          onChange={(e) => setForm({ ...form, active_bank: e.target.value })}
        >
          <option value="monobank">MonoBank</option>
          <option value="privatbank">PrivatBank</option>
        </select>
      </div>
      <div className="form-row">
        <label>Email для сповіщень про помилки фіскалізації</label>
        <input
          type="email"
          value={form.alert_email}
          onChange={(e) => setForm({ ...form, alert_email: e.target.value })}
          placeholder="admin@example.com"
        />
      </div>
      <div className="form-actions">
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? 'Збереження...' : 'Зберегти'}
        </button>
      </div>
      <SaveFeedback msg={feedback.msg} isError={feedback.error} />
    </div>
  );
}

// ─── Terminal Config section ──────────────────────────────────────────────────

function TerminalSection({
  bank,
  label,
  config,
  onSaved,
}: {
  bank: string;
  label: string;
  config: TerminalConfig | undefined;
  onSaved: () => void;
}) {
  const defaultPort = bank === 'monobank' ? 3000 : 2000;
  const [form, setForm] = useState({
    name: config?.name ?? '',
    host: config?.host ?? '',
    port: config?.port ?? defaultPort,
  });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ msg: '', error: false });

  useEffect(() => {
    setForm({
      name: config?.name ?? '',
      host: config?.host ?? '',
      port: config?.port ?? defaultPort,
    });
  }, [config, defaultPort]);

  const save = async () => {
    setSaving(true);
    setFeedback({ msg: '', error: false });
    try {
      await apiFetch(`/setup/terminal/${bank}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: form.name || undefined,
          host: form.host || undefined,
          port: Number(form.port) || undefined,
        }),
      });
      setFeedback({ msg: '✓ Збережено', error: false });
      onSaved();
    } catch (e) {
      setFeedback({ msg: `Помилка: ${(e as Error).message}`, error: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="setup-card">
      <h2>Термінал — {label}</h2>
      <div className="form-row">
        <label>Назва (необов'язково)</label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder={`${label} Terminal #1`}
        />
      </div>
      <div className="form-row">
        <label>IP-адреса</label>
        <input
          value={form.host}
          onChange={(e) => setForm({ ...form, host: e.target.value })}
          placeholder="192.168.0.182"
        />
      </div>
      <div className="form-row">
        <label>Порт (за замовчуванням {defaultPort})</label>
        <input
          type="number"
          value={form.port}
          onChange={(e) => setForm({ ...form, port: parseInt(e.target.value) || defaultPort })}
        />
      </div>
      <div className="form-actions">
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? 'Збереження...' : 'Зберегти'}
        </button>
      </div>
      <SaveFeedback msg={feedback.msg} isError={feedback.error} />
    </div>
  );
}

// ─── Single Fiscal Merchant card ──────────────────────────────────────────────

function FiscalMerchantCard({
  merchantId,
  role,
  config,
  onSaved,
  onDeleted,
}: {
  merchantId: string;
  role?: string;
  config: FiscalConfig | undefined;
  onSaved: () => void;
  onDeleted?: () => void;
}) {
  const [form, setForm] = useState({
    merchant_name: config?.merchant_name ?? '',
    merchant_code: config?.merchant_code ?? '',
    fiscal_token: config?.fiscal_token ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<TokenStatus | null>(null);
  const [feedback, setFeedback] = useState({ msg: '', error: false });

  useEffect(() => {
    setForm({
      merchant_name: config?.merchant_name ?? '',
      merchant_code: config?.merchant_code ?? '',
      fiscal_token: config?.fiscal_token ?? '',
    });
    setTokenStatus(null);
  }, [config]);

  const save = async () => {
    setSaving(true);
    setFeedback({ msg: '', error: false });
    setTokenStatus(null);
    try {
      const result = await apiFetch<{ config: FiscalConfig; tokenStatus: TokenStatus | null }>(
        `/setup/fiscal/${merchantId}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            merchant_name: form.merchant_name || undefined,
            merchant_code: form.merchant_code || undefined,
            fiscal_token: form.fiscal_token || null,
          }),
        },
      );
      setTokenStatus(result.tokenStatus);
      setFeedback({ msg: '✓ Збережено', error: false });
      onSaved();
    } catch (e) {
      setFeedback({ msg: `Помилка: ${(e as Error).message}`, error: true });
    } finally {
      setSaving(false);
    }
  };

  const verify = async () => {
    setVerifying(true);
    setTokenStatus(null);
    try {
      const status = await apiFetch<TokenStatus>(`/setup/fiscal/${merchantId}/verify`, {
        method: 'POST',
      });
      setTokenStatus(status);
    } catch (e) {
      setTokenStatus({ valid: false, errortxt: (e as Error).message });
    } finally {
      setVerifying(false);
    }
  };

  const deleteConfig = async () => {
    if (!confirm(`Видалити фіскальну конфігурацію для мерчанта ${merchantId}?`)) return;
    try {
      await apiFetch(`/setup/fiscal/${merchantId}`, { method: 'DELETE' });
      onDeleted?.();
    } catch (e) {
      setFeedback({ msg: `Помилка видалення: ${(e as Error).message}`, error: true });
    }
  };

  return (
    <div className="fiscal-merchant">
      <div className="merchant-header">
        <span className="merchant-id">{merchantId}</span>
        {role && <span className="merchant-role">{role}</span>}
      </div>

      <div className="form-row">
        <label>Назва ТОВ / ФОП</label>
        <input
          value={form.merchant_name}
          onChange={(e) => setForm({ ...form, merchant_name: e.target.value })}
          placeholder="ТОВ «Назва компанії»"
        />
      </div>
      <div className="form-row">
        <label>ЄДРПОУ (для ТОВ) або ІПН (для ФОП)</label>
        <input
          value={form.merchant_code}
          onChange={(e) => setForm({ ...form, merchant_code: e.target.value })}
          placeholder="12345678"
        />
      </div>
      <div className="form-row">
        <label>Токен Вчасно Каса</label>
        <div className="form-row-inline">
          <input
            value={form.fiscal_token}
            onChange={(e) => setForm({ ...form, fiscal_token: e.target.value })}
            placeholder="IvJTwmNP2Wx810QX..."
          />
          <button className="btn btn-verify" onClick={verify} disabled={verifying || !config?.fiscal_token}>
            {verifying ? '...' : 'Перевірити'}
          </button>
        </div>
      </div>

      {tokenStatus && (
        <span className={`status-badge ${tokenStatus.valid ? 'ok' : 'error'}`}>
          {tokenStatus.valid
            ? `✓ Активний | зміна: ${tokenStatus.shift_status === 1 ? 'відкрита' : 'закрита'} | онлайн: ${tokenStatus.online_status === 1 ? 'так' : 'ні'}`
            : `✗ ${tokenStatus.errortxt || 'Недійсний токен'}`}
        </span>
      )}

      <div className="form-actions">
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? 'Збереження...' : 'Зберегти'}
        </button>
        {config && (
          <button className="btn btn-danger" onClick={deleteConfig}>
            Видалити
          </button>
        )}
      </div>
      <SaveFeedback msg={feedback.msg} isError={feedback.error} />
    </div>
  );
}

// ─── Fiscal section ───────────────────────────────────────────────────────────

function FiscalSection({
  store,
  fiscalConfigs,
  onSaved,
}: {
  store: StoreInfo | null;
  fiscalConfigs: FiscalConfig[];
  onSaved: () => void;
}) {
  const [newMerchantId, setNewMerchantId] = useState('');

  // Merchants known from terminal sync
  const knownMerchants: Array<{ id: string; role: string }> = [];
  if (store?.default_merchant) {
    knownMerchants.push({ id: store.default_merchant, role: 'Основний' });
  }
  if (store?.VAT_excise_merchant && store.VAT_excise_merchant !== store.default_merchant) {
    knownMerchants.push({ id: store.VAT_excise_merchant, role: 'ПДВ / Акциз' });
  }

  // Fiscal configs that are NOT in the known list (manually added)
  const knownIds = new Set(knownMerchants.map((m) => m.id));
  const extraConfigs = fiscalConfigs.filter((c) => !knownIds.has(c.merchant_id));

  const configByMerchant = (id: string) => fiscalConfigs.find((c) => c.merchant_id === id);

  const addNewMerchant = () => {
    const id = newMerchantId.trim();
    if (!id) return;
    if (knownIds.has(id) || extraConfigs.find((c) => c.merchant_id === id)) return;
    knownMerchants.push({ id, role: 'Додатковий' });
    setNewMerchantId('');
  };

  return (
    <div className="setup-card full-width">
      <h2>Фіскальна конфігурація (Вчасно Каса)</h2>

      {knownMerchants.length === 0 && extraConfigs.length === 0 && (
        <p style={{ color: '#718096', fontSize: 14, marginBottom: 16 }}>
          Мерчанти з'являться автоматично після першого підключення термінала. Або додайте вручну нижче.
        </p>
      )}

      {knownMerchants.map(({ id, role }) => (
        <FiscalMerchantCard
          key={id}
          merchantId={id}
          role={role}
          config={configByMerchant(id)}
          onSaved={onSaved}
          onDeleted={onSaved}
        />
      ))}

      {extraConfigs.map((c) => (
        <FiscalMerchantCard
          key={c.merchant_id}
          merchantId={c.merchant_id}
          config={c}
          onSaved={onSaved}
          onDeleted={onSaved}
        />
      ))}

      <div className="fiscal-new">
        <input
          value={newMerchantId}
          onChange={(e) => setNewMerchantId(e.target.value)}
          placeholder="ID мерчанта (наприклад: 1234567)"
          onKeyDown={(e) => e.key === 'Enter' && addNewMerchant()}
        />
        <button className="btn btn-ghost" onClick={addNewMerchant}>
          + Додати мерчанта
        </button>
      </div>
    </div>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function SetupScreen() {
  const [data, setData] = useState<SetupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const result = await apiFetch<SetupData>('/setup');
      setData(result);
      setError('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (loading) {
    return (
      <div className="setup-screen">
        <h1>Налаштування кіоску</h1>
        <p style={{ color: '#718096' }}>Завантаження...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="setup-screen">
        <h1>Налаштування кіоску</h1>
        <p style={{ color: '#fc8181' }}>Помилка: {error}</p>
        <button className="btn btn-ghost" onClick={() => void load()}>Повторити</button>
      </div>
    );
  }

  const monoConfig = data?.terminalConfigs.find((t) => t.bank === 'monobank');
  const privatConfig = data?.terminalConfigs.find((t) => t.bank === 'privatbank');

  return (
    <div className="setup-screen">
      <h1>Налаштування кіоску</h1>
      <div className="setup-grid">
        <StoreSection store={data?.store ?? null} onSaved={() => void load()} />

        <TerminalSection
          bank="monobank"
          label="MonoBank"
          config={monoConfig}
          onSaved={() => void load()}
        />
        <TerminalSection
          bank="privatbank"
          label="PrivatBank"
          config={privatConfig}
          onSaved={() => void load()}
        />

        <FiscalSection
          store={data?.store ?? null}
          fiscalConfigs={data?.fiscalConfigs ?? []}
          onSaved={() => void load()}
        />
      </div>
    </div>
  );
}
