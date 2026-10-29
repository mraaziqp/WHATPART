import 'server-only';
import { createHash } from 'node:crypto';
import { promises as dns } from 'node:dns';

// PayFast public sandbox credentials are used until real merchant details are configured.
const SANDBOX = { merchantId: '10000100', merchantKey: '46f0cd694581a', passphrase: 'jt7NOE43FZPn' };

// Env values exported by some tools carry literal "\r\n" text; strip it and whitespace.
const env = (name: string) => (process.env[name] ?? '').replace(/\\r|\\n/g, '').trim();

/**
 * Uses WHATPART's own merchant credentials when set (sandbox or live per PAYFAST_SANDBOX).
 * Without them it falls back to PayFast's shared sandbox merchant, whose passphrase anyone can
 * change, so real testing needs WHATPART's own sandbox account.
 */
export const payfastConfig = () => {
  const id = env('PAYFAST_MERCHANT_ID');
  const key = env('PAYFAST_MERCHANT_KEY');
  const own = !!id && !!key && id !== SANDBOX.merchantId;
  const sandbox = !own || env('PAYFAST_SANDBOX') !== 'false';
  return {
    sandbox,
    merchantId: own ? id : SANDBOX.merchantId,
    merchantKey: own ? key : SANDBOX.merchantKey,
    passphrase: own ? env('PAYFAST_PASSPHRASE') : SANDBOX.passphrase,
    host: sandbox ? 'sandbox.payfast.co.za' : 'www.payfast.co.za',
  };
};

// PHP urlencode semantics, which PayFast's signature is computed with.
const phpEncode = (v: string) =>
  encodeURIComponent(v).replace(/%20/g, '+').replace(/[!'()*~]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);

// Checkout signatures skip empty fields and trim values; ITN signatures use every posted field as received.
type Mode = 'checkout' | 'itn';

export const paramString = (fields: [string, string][], mode: Mode = 'checkout') =>
  fields
    .filter(([k, v]) => k !== 'signature' && (mode === 'itn' || v !== ''))
    .map(([k, v]) => `${k}=${phpEncode(mode === 'checkout' ? v.trim() : v)}`)
    .join('&');

export const signature = (fields: [string, string][], passphrase: string, mode: Mode = 'checkout') =>
  createHash('md5').update(paramString(fields, mode) + (passphrase ? `&passphrase=${phpEncode(passphrase.trim())}` : '')).digest('hex');

type Checkout = {
  orderNumber: string;
  amountCents: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  itemName: string;
  siteUrl: string;
};

/** Fields for the browser to POST to PayFast's hosted payment page. Order matters for the signature. */
export function buildPaymentForm(c: Checkout) {
  const cfg = payfastConfig();
  const fields: [string, string][] = [
    ['merchant_id', cfg.merchantId],
    ['merchant_key', cfg.merchantKey],
    ['return_url', `${c.siteUrl}/checkout/success?order=${c.orderNumber}`],
    ['cancel_url', `${c.siteUrl}/checkout/cancelled?order=${c.orderNumber}`],
    ['notify_url', `${c.siteUrl}/api/payfast/itn`],
    ['name_first', c.firstName.slice(0, 100)],
    ['name_last', c.lastName.slice(0, 100)],
    ['email_address', c.email],
    ['cell_number', c.phone.replace(/\D/g, '').replace(/^27/, '0')],
    ['m_payment_id', c.orderNumber],
    ['amount', (c.amountCents / 100).toFixed(2)],
    ['item_name', c.itemName.slice(0, 100)],
  ];
  return {
    action: `https://${cfg.host}/eng/process`,
    fields: [...fields.filter(([, v]) => v !== ''), ['signature', signature(fields, cfg.passphrase)]] as [string, string][],
  };
}

const VALID_HOSTS = ['www.payfast.co.za', 'sandbox.payfast.co.za', 'w1w.payfast.co.za', 'w2w.payfast.co.za'];

export async function isPayfastIp(ip: string | null) {
  if (!ip) return false;
  const lists = await Promise.all(VALID_HOSTS.map((h) => dns.resolve4(h).catch(() => [] as string[])));
  return lists.flat().includes(ip);
}

/** Server-to-server confirmation that PayFast really sent this notification. */
export async function confirmWithPayfast(fields: [string, string][]) {
  const cfg = payfastConfig();
  const res = await fetch(`https://${cfg.host}/eng/query/validate`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: paramString(fields, 'itn'),
  });
  return (await res.text()).trim() === 'VALID';
}
