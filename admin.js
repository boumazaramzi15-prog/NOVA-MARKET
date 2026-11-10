const $ = id => document.getElementById(id);
let api = '';
let token = '';

const headers = () => ({
  Authorization: 'Bearer ' + token,
  'Content-Type': 'application/json'
});
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

async function apiCall(path, options = {}) {
  const response = await fetch(api.replace(/\/$/, '') + path, {
    ...options,
    headers: { ...headers(), ...(options.headers || {}) }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || body.error || ('HTTP ' + response.status));
  return body;
}

function status(element, message, ok = false) {
  element.textContent = message;
  element.className = ok ? 'admin-status admin-success' : 'admin-status admin-error';
}

async function load() {
  const [products, approvals, suppliers] = await Promise.all([
    apiCall('/api/admin/products'),
    apiCall('/api/admin/approvals'),
    apiCall('/api/admin/suppliers')
  ]);

  $('overview').textContent =
    products.products.length + ' product records · ' +
    approvals.approvals.length + ' pending approvals · ' +
    suppliers.suppliers.length + ' supplier records';

  $('approvals').innerHTML = approvals.approvals.length
    ? approvals.approvals.map(item => `
      <div class="admin-row">
        <strong>${esc(item.action_type)}</strong> · ${esc(item.status)}
        <br><small>${esc(item.id)}</small>
        <p class="admin-status">Recording a decision does not publish a product or execute a financial action.</p>
        <button class="admin-action" type="button" data-approval-id="${esc(item.id)}" data-decision="approved">Record approval</button>
        <button class="admin-action" type="button" data-approval-id="${esc(item.id)}" data-decision="rejected">Record rejection</button>
      </div>`).join('')
    : 'No pending approvals';

  $('suppliers').innerHTML = suppliers.suppliers.map(item =>
    '<div class="admin-row"><strong>' + esc(item.display_name) +
    '</strong> · ' + esc(item.integration_status) + '</div>'
  ).join('');
}

$('connect').addEventListener('click', async () => {
  api = $('apiBase').value.trim();
  token = $('ownerToken').value;
  if (!/^https?:\/\//.test(api) || token.length < 32) {
    status($('connection'), 'Enter a valid API URL and owner token (at least 32 characters).');
    return;
  }
  try {
    await load();
    status($('connection'), 'Backend connected for this page session.', true);
  } catch (error) {
    status($('connection'), error.message);
  }
});

$('approvals').addEventListener('click', async event => {
  const button = event.target.closest('button[data-approval-id][data-decision]');
  if (!button) return;
  const decision = button.dataset.decision;
  const approvalId = button.dataset.approvalId;
  const label = decision === 'approved' ? 'record approval' : 'record rejection';
  if (!window.confirm('Are you sure you want to ' + label + '? This records the decision only; it does not publish or pay.')) return;
  button.disabled = true;
  try {
    await apiCall('/api/admin/approvals/' + encodeURIComponent(approvalId) + '/decision', {
      method: 'POST',
      body: JSON.stringify({ decision, note: 'Recorded from NOVA AI MANAGER dashboard.' })
    });
    status($('connection'), 'Decision recorded. No publication or payment was executed.', true);
    await load();
  } catch (error) {
    status($('connection'), error.message);
    button.disabled = false;
  }
});

$('draftForm').addEventListener('submit', async event => {
  event.preventDefault();
  if (!api || !token) {
    status($('draftMessage'), 'Connect to the backend first.');
    return;
  }
  const form = new FormData(event.currentTarget);
  const body = Object.fromEntries(form.entries());
  body.public_price = body.public_price === '' ? null : Number(body.public_price);
  body.public_currency = body.public_currency === '' ? null : body.public_currency.toUpperCase();
  try {
    const result = await apiCall('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(body)
    });
    status($('draftMessage'), 'Draft saved: ' + result.product.id, true);
    event.currentTarget.reset();
    await load();
  } catch (error) {
    status($('draftMessage'), error.message);
  }
});
