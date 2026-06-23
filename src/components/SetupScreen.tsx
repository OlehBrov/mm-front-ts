import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/_setup.scss';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:6006/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StoreInfo {
  store_name: string | null;
  store_address: string | null;
  active_bank: string | null;
  alert_email: string | null;
  support_email: string | null;
  feedback_email: string | null;
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

const TAXGRP_OPTIONS = [
  { value: 1,  label: '1 — ПДВ 20%' },
  { value: 2,  label: '2 — Без ПДВ' },
  { value: 3,  label: '3 — ПДВ 20% + акциз 5%' },
  { value: 4,  label: '4 — ПДВ 7%' },
  { value: 5,  label: '5 — ПДВ 0%' },
  { value: 6,  label: '6 — Без ПДВ + акциз 5%' },
  { value: 7,  label: '7 — Не є об\'єктом ПДВ' },
  { value: 8,  label: '8 — ПДВ 20% + ПФ 7.5%' },
  { value: 9,  label: '9 — ПДВ 14%' },
  { value: 10, label: '10 — ПДФО 18% ВЗ 1.5%' },
] as const;

interface FiscalConfig {
  merchant_id: string;
  merchant_name: string | null;
  merchant_code: string | null;
  fiscal_token: string | null;
  taxgrp: number | null;
}

interface MerchantInfo {
  merchantId: string;
  merchantName?: string;
}

interface SetupData {
  store: StoreInfo | null;
  terminalConfigs: TerminalConfig[];
  fiscalConfigs: FiscalConfig[];
}

interface TokenStatus {
  valid: boolean;
  errortxt: string;
  shift_status?: number;  // -1 unknown, 0 closed, 1 open, 2 blocked
  shift_dt?: string;      // YYYYMMDDHHMMSS | "0" | ""
  online_status?: number; // -1 unknown, 0 online, 1 offline, 2 blocked
}

// ─── API helpers ──────────────────────────────────────────────────────────────

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

function Feedback({ msg, isError }: { msg: string; isError: boolean }) {
  if (!msg) return null;
  return <span className={`save-feedback ${isError ? 'err' : 'ok'}`}>{msg}</span>;
}

// ─── Store Info card (full width) ─────────────────────────────────────────────

function StoreCard({
  store,
  activeBank,
  onBankChange,
  onSaved,
}: {
  store: StoreInfo | null;
  activeBank: string;
  onBankChange: (bank: string) => void;
  onSaved: (updated: Partial<StoreInfo>) => void;
}) {
  const [form, setForm] = useState({
    store_name: store?.store_name ?? '',
    store_address: store?.store_address ?? '',
    alert_email: store?.alert_email ?? '',
    support_email: store?.support_email ?? '',
    feedback_email: store?.feedback_email ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [fb, setFb] = useState({ msg: '', err: false });

  useEffect(() => {
    setForm({
      store_name: store?.store_name ?? '',
      store_address: store?.store_address ?? '',
      alert_email: store?.alert_email ?? '',
      support_email: store?.support_email ?? '',
      feedback_email: store?.feedback_email ?? '',
    });
  }, [store]);

  const save = async () => {
    setSaving(true);
    setFb({ msg: '', err: false });
    try {
      const updated = await apiFetch<StoreInfo>('/setup/store', {
        method: 'PATCH',
        body: JSON.stringify({
          store_name: form.store_name || undefined,
          store_address: form.store_address || undefined,
          active_bank: activeBank,
          alert_email: form.alert_email || null,
          support_email: form.support_email || null,
          feedback_email: form.feedback_email || null,
        }),
      });
      setFb({ msg: '✓ Збережено', err: false });
      onSaved(updated);
    } catch (e) {
      setFb({ msg: `Помилка: ${(e as Error).message}`, err: true });
    } finally {
      setSaving(false);
    }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="setup-card">
      <h2>Магазин / Торгова точка</h2>
      <div className="form-row">
        <label>Назва торгової точки *</label>
        <input value={form.store_name} onChange={set('store_name')} placeholder="Супермаркет «Назва»" />
      </div>
      <div className="form-row">
        <label>Адреса *</label>
        <input value={form.store_address} onChange={set('store_address')} placeholder="вул. Незалежності, 1, м. Київ" />
      </div>
      <div className="form-row">
        <label>Email для сповіщень про помилки фіскалізації</label>
        <input type="email" value={form.alert_email} onChange={set('alert_email')} placeholder="fiscal@example.com" />
      </div>
      <div className="form-row">
        <label>Email технічної підтримки</label>
        <input type="email" value={form.support_email} onChange={set('support_email')} placeholder="support@example.com" />
      </div>
      <div className="form-row">
        <label>Email для щоденного звіту по оцінках (01:00)</label>
        <input type="email" value={form.feedback_email} onChange={set('feedback_email')} placeholder="manager@example.com" />
      </div>
      <div className="form-actions">
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? 'Збереження...' : 'Зберегти'}
        </button>
        <Feedback msg={fb.msg} isError={fb.err} />
      </div>
    </div>
  );
}

// ─── Terminal card ─────────────────────────────────────────────────────────────

interface CheckResult {
  online: boolean;
  merchants: MerchantInfo[];
  error?: string;
  terminalConfig?: { host: string | null; port: number | null } | null;
}

function TerminalCard({
  bank,
  label,
  isActive,
  config,
  onBankSelect,
  onSaved,
  onChecked,
}: {
  bank: string;
  label: string;
  isActive: boolean;
  config: TerminalConfig | undefined;
  onBankSelect: () => void;
  onSaved: () => void;
  onChecked: (result: CheckResult) => void;
}) {
  const defaultPort = bank === 'monobank' ? 3000 : 2000;
  const [form, setForm] = useState({
    name: config?.name ?? '',
    host: config?.host ?? '',
    port: config?.port ?? defaultPort,
  });
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);
  const [fb, setFb] = useState({ msg: '', err: false });

  useEffect(() => {
    setForm({
      name: config?.name ?? '',
      host: config?.host ?? '',
      port: config?.port ?? defaultPort,
    });
  }, [config, defaultPort]);

  const save = async () => {
    setSaving(true);
    setFb({ msg: '', err: false });
    try {
      await apiFetch(`/setup/terminal/${bank}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: form.name || undefined,
          host: form.host || undefined,
          port: Number(form.port) || undefined,
        }),
      });
      setFb({ msg: '✓ Збережено', err: false });
      onSaved();
    } catch (e) {
      setFb({ msg: `Помилка: ${(e as Error).message}`, err: true });
    } finally {
      setSaving(false);
    }
  };

  const check = async () => {
    setChecking(true);
    setCheckResult(null);
    try {
      const result = await apiFetch<CheckResult>(`/setup/terminal/${bank}/check`, { method: 'POST' });
      setCheckResult(result);
      // Pre-fill form with actual DB values the server is connected to
      if (result.online && result.terminalConfig) {
        setForm((f) => ({
          ...f,
          host: result.terminalConfig?.host ?? f.host,
          port: result.terminalConfig?.port ?? f.port,
        }));
      }
      onChecked(result);
    } catch (e) {
      const r = { online: false, merchants: [], error: (e as Error).message };
      setCheckResult(r);
      onChecked(r);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className={`setup-card ${isActive ? 'card-active-bank' : ''}`}>
      <div className="card-header">
        <h2>{label}</h2>
        <label className={`bank-radio ${isActive ? '' : 'inactive'}`}>
          <input
            type="radio"
            name="active_bank"
            checked={isActive}
            onChange={onBankSelect}
          />
          {isActive ? 'Активний' : 'Обрати'}
        </label>
      </div>

      <div className="form-row">
        <label>Назва (опціонально)</label>
        <input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder={`${label} Terminal #1`}
        />
      </div>
      <div className="form-row">
        <label>IP-адреса *</label>
        <input
          value={form.host}
          onChange={(e) => setForm((f) => ({ ...f, host: e.target.value }))}
          placeholder="192.168.0.182"
        />
      </div>
      <div className="form-row">
        <label>Порт (за замовч. {defaultPort})</label>
        <input
          type="number"
          value={form.port}
          onChange={(e) => setForm((f) => ({ ...f, port: parseInt(e.target.value) || defaultPort }))}
        />
      </div>

      <div className="form-actions">
        <button className="btn btn-ghost" onClick={save} disabled={saving}>
          {saving ? '...' : 'Зберегти'}
        </button>
        <button className="btn btn-blue" onClick={check} disabled={checking || !isActive}>
          {checking ? 'Перевірка...' : 'Перевірити зв\'язок'}
        </button>
        <Feedback msg={fb.msg} isError={fb.err} />
      </div>

      {checkResult && (
        <div className={`terminal-status ${checkResult.online ? 'online' : checkResult.error ? 'warn' : 'offline'}`}>
          {checkResult.online
            ? `✓ Онлайн — знайдено мерчантів: ${checkResult.merchants.length}`
            : checkResult.error
              ? `⚠ ${checkResult.error}`
              : '✗ Термінал не відповідає'}
        </div>
      )}
    </div>
  );
}

// ─── Token status helpers ─────────────────────────────────────────────────────

function formatShift(status?: number, dt?: string): string {
  switch (status) {
    case 1: {
      if (dt && dt !== '0' && dt !== '') {
        // YYYYMMDDHHMMSS → DD.MM.YYYY HH:MM
        const d = dt.padEnd(14, '0');
        const fmt = `${d.slice(6, 8)}.${d.slice(4, 6)}.${d.slice(0, 4)} ${d.slice(8, 10)}:${d.slice(10, 12)}`;
        return `зміна відкрита з ${fmt}`;
      }
      return 'зміна відкрита';
    }
    case 0:  return 'зміна закрита';
    case 2:  return 'зміна заблокована';
    default: return 'зміна невідома';
  }
}

function formatOnline(status?: number): string {
  switch (status) {
    case 0:  return 'ДФС онлайн';
    case 1:  return 'ДФС офлайн';
    case 2:  return 'ДФС заблоковано';
    default: return 'ДФС невідомо';
  }
}

// ─── Fiscal merchant card ─────────────────────────────────────────────────────

function FiscalCard({
  merchantId,
  role,
  config,
  onSaved,
}: {
  merchantId: string;
  role: 'no-vat' | 'vat';
  config: FiscalConfig | undefined;
  onSaved: (updated: FiscalConfig) => void;
}) {
  const [form, setForm] = useState({
    merchant_name: config?.merchant_name ?? '',
    merchant_code: config?.merchant_code ?? '',
    fiscal_token: config?.fiscal_token ?? '',
    taxgrp: config?.taxgrp ?? null as number | null,
  });
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<TokenStatus | null>(null);
  const [fb, setFb] = useState({ msg: '', err: false });

  useEffect(() => {
    setForm({
      merchant_name: config?.merchant_name ?? '',
      merchant_code: config?.merchant_code ?? '',
      fiscal_token: config?.fiscal_token ?? '',
      taxgrp: config?.taxgrp ?? null,
    });
    setTokenStatus(null);
  }, [config]);

  const save = async () => {
    setSaving(true);
    setFb({ msg: '', err: false });
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
            taxgrp: form.taxgrp ?? null,
          }),
        },
      );
      setTokenStatus(result.tokenStatus);
      setFb({ msg: '✓ Збережено', err: false });
      onSaved(result.config);
    } catch (e) {
      setFb({ msg: `Помилка: ${(e as Error).message}`, err: true });
    } finally {
      setSaving(false);
    }
  };

  const verify = async () => {
    setVerifying(true);
    setTokenStatus(null);
    try {
      const s = await apiFetch<TokenStatus>(`/setup/fiscal/${merchantId}/verify`, { method: 'POST' });
      setTokenStatus(s);
    } catch (e) {
      setTokenStatus({ valid: false, errortxt: (e as Error).message });
    } finally {
      setVerifying(false);
    }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="setup-card">
      <div className="card-header">
        <h2>
          <span className={`merchant-role-label ${role}`}>
            {role === 'no-vat' ? 'Без ПДВ' : 'З ПДВ / Акциз'}
          </span>
          <span className="merchant-id-chip">{merchantId}</span>
        </h2>
      </div>

      <div className="form-row">
        <label>Назва ТОВ / ФОП *</label>
        <input value={form.merchant_name} onChange={set('merchant_name')} placeholder="ТОВ «Назва компанії»" />
      </div>
      <div className="form-row">
        <label>ЄДРПОУ (для ТОВ) або ІПН (для ФОП) *</label>
        <input value={form.merchant_code} onChange={set('merchant_code')} placeholder="12345678" />
      </div>
      <div className="form-row">
        <label>Код податкової групи (taxgrp) *</label>
        <select
          value={form.taxgrp ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, taxgrp: e.target.value ? Number(e.target.value) : null }))}
        >
          <option value="">— оберіть —</option>
          {TAXGRP_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <label>Токен Вчасно Каса *</label>
        <div className="form-row-split">
          <input
            value={form.fiscal_token}
            onChange={set('fiscal_token')}
            placeholder="IvJTwmNP2Wx810QX..."
          />
          <button
            className="btn btn-verify"
            onClick={verify}
            disabled={verifying || !config?.fiscal_token}
            title={!config?.fiscal_token ? 'Спочатку збережіть токен' : 'Перевірити через vchasno'}
          >
            {verifying ? '...' : 'Перевірити'}
          </button>
        </div>
      </div>

      {tokenStatus && (
        <div style={{ margin: '8px 0' }}>
          <span className={`status-badge ${tokenStatus.valid ? 'ok' : 'err'}`}>
            {tokenStatus.valid
              ? `✓ Активний · ${formatShift(tokenStatus.shift_status, tokenStatus.shift_dt)} · ${formatOnline(tokenStatus.online_status)}`
              : `✗ ${tokenStatus.errortxt || 'Недійсний'}`}
          </span>
        </div>
      )}

      <div className="form-actions">
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? 'Збереження...' : 'Зберегти'}
        </button>
        <Feedback msg={fb.msg} isError={fb.err} />
      </div>
    </div>
  );
}

// ─── Merchants section ────────────────────────────────────────────────────────

function MerchantsSection({
  store,
  terminalMerchants,
  fiscalConfigs,
  terminalChecked,
  onAssigned,
  onFiscalSaved,
}: {
  store: StoreInfo | null;
  terminalMerchants: MerchantInfo[];
  fiscalConfigs: FiscalConfig[];
  terminalChecked: boolean;
  onAssigned: (noVat: string, vat: string | null) => void;
  onFiscalSaved: (updated: FiscalConfig) => void;
}) {
  const [noVat, setNoVat] = useState<string>(store?.default_merchant ?? '');
  const [vat, setVat] = useState<string | null>(store?.VAT_excise_merchant ?? null);
  const [saving, setSaving] = useState(false);
  const [fb, setFb] = useState({ msg: '', err: false });

  // Sync from store when data loads
  const prevStoreRef = useRef<StoreInfo | null>(null);
  useEffect(() => {
    if (store && store !== prevStoreRef.current) {
      prevStoreRef.current = store;
      setNoVat(store.default_merchant ?? '');
      setVat(store.VAT_excise_merchant ?? null);
    }
  }, [store]);

  // When terminal check returns merchants — apply default assignment
  const prevMerchantsRef = useRef<MerchantInfo[]>([]);
  useEffect(() => {
    if (terminalMerchants.length === 0) return;
    if (terminalMerchants === prevMerchantsRef.current) return;
    prevMerchantsRef.current = terminalMerchants;

    const [first, second] = terminalMerchants;
    setNoVat(first.merchantId);
    setVat(second?.merchantId ?? null);
  }, [terminalMerchants]);

  const swap = () => {
    if (!vat) return;
    setNoVat(vat);
    setVat(noVat);
  };

  const save = async () => {
    if (!noVat) return;
    setSaving(true);
    setFb({ msg: '', err: false });
    try {
      await apiFetch('/setup/assign-merchants', {
        method: 'POST',
        body: JSON.stringify({ default_merchant: noVat, vat_merchant: vat ?? null }),
      });
      setFb({ msg: '✓ Мерчантів збережено', err: false });
      onAssigned(noVat, vat);
    } catch (e) {
      setFb({ msg: `Помилка: ${(e as Error).message}`, err: true });
    } finally {
      setSaving(false);
    }
  };

  const disabled = !terminalChecked;

  // Determine which merchants to show fiscal cards for
  const showNoVat = noVat || store?.default_merchant;
  const showVat = vat || store?.VAT_excise_merchant;

  const fiscalByMerchant = (id: string) => fiscalConfigs.find((f) => f.merchant_id === id);

  return (
    <div className={`setup-card ${disabled ? 'card-disabled' : ''}`}>
      <h2>Мерчанти та фіскальні токени</h2>

      {disabled && (
        <div className="merchants-placeholder">
          Спочатку перевірте зв'язок з терміналом — мерчанти завантажаться автоматично
        </div>
      )}

      {!disabled && terminalMerchants.length === 0 && !showNoVat && (
        <div className="merchants-placeholder">
          Термінал підключений, але мерчантів не знайдено. Перевірте конфігурацію термінала.
        </div>
      )}

      {!disabled && (showNoVat || terminalMerchants.length > 0) && (
        <>
          {/* Assignment row */}
          <div style={{ marginBottom: 20, padding: '14px 16px', background: '#0d1117', borderRadius: 8, border: '1px solid #21262d' }}>
            <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Розподіл мерчантів
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 10, alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, color: '#484f58', marginBottom: 4 }}>БЕЗ ПДВ (основний)</div>
                <select
                  value={noVat}
                  onChange={(e) => setNoVat(e.target.value)}
                  style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 6, color: '#e2e8f0', fontSize: 13, padding: '8px 10px', fontFamily: 'inherit' }}
                >
                  <option value="">— оберіть —</option>
                  {terminalMerchants.map((m) => (
                    <option key={m.merchantId} value={m.merchantId}>
                      {m.merchantId}{m.merchantName ? ` (${m.merchantName})` : ''}
                    </option>
                  ))}
                  {/* Fallback: show stored merchant if not in terminal list */}
                  {store?.default_merchant && !terminalMerchants.find(m => m.merchantId === store.default_merchant) && (
                    <option value={store.default_merchant}>{store.default_merchant}</option>
                  )}
                </select>
              </div>

              <div className="merchant-swap">
                <button onClick={swap} title="Поміняти місцями" disabled={!vat}>⇄</button>
              </div>

              <div>
                <div style={{ fontSize: 11, color: '#484f58', marginBottom: 4 }}>З ПДВ / АКЦИЗ</div>
                <select
                  value={vat ?? ''}
                  onChange={(e) => setVat(e.target.value || null)}
                  style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 6, color: '#e2e8f0', fontSize: 13, padding: '8px 10px', fontFamily: 'inherit' }}
                >
                  <option value="">Не використовується</option>
                  {terminalMerchants.map((m) => (
                    <option key={m.merchantId} value={m.merchantId}>
                      {m.merchantId}{m.merchantName ? ` (${m.merchantName})` : ''}
                    </option>
                  ))}
                  {store?.VAT_excise_merchant && !terminalMerchants.find(m => m.merchantId === store.VAT_excise_merchant) && (
                    <option value={store.VAT_excise_merchant}>{store.VAT_excise_merchant}</option>
                  )}
                </select>
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: 12 }}>
              <button className="btn btn-ghost" onClick={save} disabled={saving || !noVat}>
                {saving ? 'Збереження...' : 'Зберегти розподіл'}
              </button>
              <Feedback msg={fb.msg} isError={fb.err} />
            </div>
          </div>

          {/* Fiscal config cards */}
          <div className="setup-row col-fiscal">
            {showNoVat && (
              <FiscalCard
                merchantId={showNoVat}
                role="no-vat"
                config={fiscalByMerchant(showNoVat)}
                onSaved={onFiscalSaved}
              />
            )}
            {showVat && showVat !== showNoVat && (
              <FiscalCard
                merchantId={showVat}
                role="vat"
                config={fiscalByMerchant(showVat)}
                onSaved={onFiscalSaved}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Launch checklist + button ────────────────────────────────────────────────

function LaunchSection({
  store,
  activeBank,
  terminalConfigs,
  fiscalConfigs,
  terminalChecked,
}: {
  store: StoreInfo | null;
  activeBank: string;
  terminalConfigs: TerminalConfig[];
  fiscalConfigs: FiscalConfig[];
  terminalChecked: boolean;
}) {
  const navigate = useNavigate();

  const terminalCfg = terminalConfigs.find((t) => t.bank === activeBank);

  const noVatId = store?.default_merchant;
  const vatId = store?.VAT_excise_merchant;
  const noVatFiscal = fiscalConfigs.find((f) => f.merchant_id === noVatId);
  const vatFiscal = vatId ? fiscalConfigs.find((f) => f.merchant_id === vatId) : null;

  const checks = [
    { label: 'Назва торгової точки', done: !!store?.store_name?.trim() },
    { label: 'Адреса торгової точки', done: !!store?.store_address?.trim() },
    { label: 'Активний термінал обрано', done: !!activeBank },
    { label: `IP та порт для ${activeBank} налаштовано`, done: !!(terminalCfg?.host && terminalCfg?.port) },
    { label: 'Термінал перевірено і відповідає', done: terminalChecked },
    { label: 'Основний мерчант призначено', done: !!noVatId },
    { label: 'Токен Вчасно Каса для основного мерчанта', done: !!noVatFiscal?.fiscal_token },
    ...(vatId
      ? [{ label: 'Токен Вчасно Каса для ПДВ мерчанта', done: !!vatFiscal?.fiscal_token }]
      : []),
  ];

  const canLaunch = checks.every((c) => c.done);

  return (
    <div className="launch-section">
      <ul className="launch-checklist">
        {checks.map((c) => (
          <li key={c.label} className={c.done ? 'done' : 'fail'}>
            <span className="check-icon">{c.done ? '✓' : '○'}</span>
            {c.label}
          </li>
        ))}
      </ul>

      <button
        className="btn btn-launch"
        disabled={!canLaunch}
        onClick={() => navigate('/')}
        title={canLaunch ? 'Перейти на головний екран кіоску' : 'Заповніть всі обов\'язкові поля'}
      >
        {canLaunch ? '🚀 Запустити кіоск' : 'Заповніть всі обов\'язкові поля'}
      </button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function SetupScreen() {
  const [setup, setSetup] = useState<SetupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeBank, setActiveBank] = useState('monobank');
  const [terminalMerchants, setTerminalMerchants] = useState<MerchantInfo[]>([]);
  const [terminalChecked, setTerminalChecked] = useState(false);
  const [fiscalConfigs, setFiscalConfigs] = useState<FiscalConfig[]>([]);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<SetupData>('/setup');
      setSetup(data);
      setActiveBank(data.store?.active_bank ?? 'monobank');
      setFiscalConfigs(data.fiscalConfigs);
      setError('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleBankSelect = async (bank: string) => {
    setActiveBank(bank);
    setTerminalChecked(false);
    setTerminalMerchants([]);
    // Auto-save active_bank immediately
    try {
      await apiFetch('/setup/store', {
        method: 'PATCH',
        body: JSON.stringify({ active_bank: bank }),
      });
    } catch { /* non-critical */ }
  };

  const handleTerminalChecked = (result: CheckResult) => {
    setTerminalChecked(result.online);
    setTerminalMerchants(result.merchants);
  };

  const handleAssigned = (_noVat: string, _vat: string | null) => {
    // Reload to get updated store + new FiscalConfig placeholders
    void load();
  };

  const handleFiscalSaved = (updated: FiscalConfig) => {
    setFiscalConfigs((prev) => {
      const idx = prev.findIndex((f) => f.merchant_id === updated.merchant_id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updated;
        return next;
      }
      return [...prev, updated];
    });
  };

  if (loading) {
    return (
      <div className="setup-screen">
        <h1>Налаштування кіоску</h1>
        <p style={{ color: '#484f58' }}>Завантаження...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="setup-screen">
        <h1>Налаштування кіоску</h1>
        <p style={{ color: '#f85149' }}>Помилка з'єднання: {error}</p>
        <button className="btn btn-ghost" onClick={() => void load()}>Повторити</button>
      </div>
    );
  }

  const monoConfig = setup?.terminalConfigs.find((t) => t.bank === 'monobank');
  const privatConfig = setup?.terminalConfigs.find((t) => t.bank === 'privatbank');

  return (
    <div className="setup-screen">
      <h1>Налаштування кіоску</h1>

      <p className="setup-section-label">Магазин</p>
      <div className="setup-row col-1">
        <StoreCard
          store={setup?.store ?? null}
          activeBank={activeBank}
          onBankChange={handleBankSelect}
          onSaved={(upd) => setSetup((s) => s ? { ...s, store: { ...(s.store ?? {} as StoreInfo), ...upd } } : s)}
        />
      </div>

      <p className="setup-section-label">Термінали</p>
      <div className="setup-row col-2">
        <TerminalCard
          bank="monobank"
          label="MonoBank"
          isActive={activeBank === 'monobank'}
          config={monoConfig}
          onBankSelect={() => void handleBankSelect('monobank')}
          onSaved={load}
          onChecked={handleTerminalChecked}
        />
        <TerminalCard
          bank="privatbank"
          label="PrivatBank"
          isActive={activeBank === 'privatbank'}
          config={privatConfig}
          onBankSelect={() => void handleBankSelect('privatbank')}
          onSaved={load}
          onChecked={handleTerminalChecked}
        />
      </div>

      <p className="setup-section-label">Мерчанти та фіскалізація</p>
      <div className="setup-row col-1">
        <MerchantsSection
          store={setup?.store ?? null}
          terminalMerchants={terminalMerchants}
          fiscalConfigs={fiscalConfigs}
          terminalChecked={terminalChecked}
          onAssigned={handleAssigned}
          onFiscalSaved={handleFiscalSaved}
        />
      </div>

      <p className="setup-section-label">Готовність до запуску</p>
      <div className="setup-row col-1">
        <div className="setup-card">
          <LaunchSection
            store={setup?.store ?? null}
            activeBank={activeBank}
            terminalConfigs={setup?.terminalConfigs ?? []}
            fiscalConfigs={fiscalConfigs}
            terminalChecked={terminalChecked}
          />
        </div>
      </div>
    </div>
  );
}
