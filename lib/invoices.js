// lib/invoices.js
import { nanoid } from 'nanoid';
import { getCollection, setCollection } from './store';

const KEY = 'invoices';

function buildInvoiceNumber(existingCount) {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const seq = String(existingCount + 1).padStart(4, '0');
  return `HC-${y}${m}${d}-${seq}`;
}

export async function listInvoices() {
  const invoices = await getCollection(KEY);
  return invoices.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function getInvoice(id) {
  const invoices = await getCollection(KEY);
  return invoices.find((i) => i.id === id) || null;
}

export async function createInvoice(input) {
  const invoices = await getCollection(KEY);
  const items = Array.isArray(input.items) ? input.items : [];
  const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);
  const discount = Number(input.discount) || 0;
  const total = Math.max(subtotal - discount, 0);

  const invoice = {
    id: nanoid(10),
    invoiceNumber: buildInvoiceNumber(invoices.length),
    customerName: input.customerName?.trim() || 'Pelanggan Umum',
    customerPhone: input.customerPhone?.trim() || '',
    items,
    subtotal,
    discount,
    total,
    paymentMethod: input.paymentMethod || 'Tunai',
    cashierName: input.cashierName?.trim() || '',
    createdAt: Date.now()
  };
  invoices.push(invoice);
  await setCollection(KEY, invoices);
  return invoice;
}
