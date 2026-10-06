export const inr = (value, decimals = 0) => {
  const n = Number(value) || 0;
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: decimals,
      minimumFractionDigits: 0,
    }).format(n);
  } catch {
    return `₹${n.toFixed(decimals)}`;
  }
};

export const num = (value) => {
  const n = Number(value) || 0;
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.00$/, '');
};

export const formatDate = (value) => {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(
      new Date(value)
    );
  } catch {
    return '—';
  }
};

export const relTime = (value) => {
  if (!value) return '—';
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  return formatDate(value);
};

export const digits = (phone) => String(phone || '').replace(/\D/g, '');

export const waLink = (phone, message) =>
  `https://wa.me/${digits(phone)}?text=${encodeURIComponent(message)}`;

export const telLink = (phone) => `tel:+${digits(phone)}`;
