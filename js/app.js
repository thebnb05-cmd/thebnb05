// ===== th3 bnb servicio técnico — App Data & State =====

const STORAGE_KEY = 'th3-bnb-app-state-v1';
const THEME_KEY = 'th3-bnb-theme-v1';
const AUTH_KEY = 'th3-bnb-auth-v1';
const AUTH_USERS_KEY = 'th3-bnb-users-v1';
const BUSINESS_NAME_KEY = 'th3-bnb-business-name-v1';
const BUSINESS_PHONE_KEY = 'th3-bnb-business-phone-v1';
const BUSINESS_ADDRESS_KEY = 'th3-bnb-business-address-v1';
const USER_BRANDS_KEY = 'th3-bnb-user-brands-v1';
const USER_LOGOS_KEY = 'th3-bnb-user-logos-v1';
const USER_LOGO_STYLES_KEY = 'th3-bnb-user-logo-styles-v1';
const RECEIPT_TERMS_KEY = 'th3-bnb-receipt-terms-v1';
const REMITO_TERMS_KEY = 'th3-bnb-remito-terms-v1';
const DEFAULT_BUSINESS_NAME = 'TH3 BNB servicio técnico';
const DEFAULT_RECEIPT_TERMS = 'Conserve este comprobante para retirar su equipo. El presupuesto puede demorar hasta 96 hs. Equipos no retirados en 30 días se consideran abandonados según normativa vigente.';
const DEFAULT_REMITO_TERMS = 'El costo de los presupuestos es de $5,000 pesos si no acepta la reparación. Si la reparación no fuere retirada dentro de los 10 días corridos a la fecha, se facturará según la lista vigente. Dependiendo de la falla, el presupuesto puede demorar hasta 96 horas o más. La garantía del equipo no cubre por ningún concepto equipos mojados o con rastro de humedad. Los equipos reparados y no retirados dentro de los 30 días se consideran abandonados (LEY 2525/2526 código civil), quedando así dispuesto a la empresa a darle el curso conveniente. La garantía cubre lo descrito en los controles de ingreso y egreso del equipo una vez ingresado a la oficina de reparación. Mediante la firma del presente documento, el cliente acepta que nuestro taller haga uso de sus datos personales (número de teléfono y correo) para el envío de información publicitaria y estado del servicio técnico.';

function getStoredTerms(key, fallback) {
  return localStorage.getItem(key) ?? fallback;
}

function getBusinessName() {
  const user = getStoredSession();
  const accountBrand = user?.businessName || getUserBrand(user?.username);
  if (accountBrand?.trim()) return accountBrand.trim();

  const stored = localStorage.getItem(BUSINESS_NAME_KEY);
  return stored?.trim() || DEFAULT_BUSINESS_NAME;
}

function getBusinessPhone() {
  const stored = localStorage.getItem(BUSINESS_PHONE_KEY);
  return (stored === null ? getStoredSession()?.phone || '' : stored).trim();
}

function getBusinessAddress() {
  const stored = localStorage.getItem(BUSINESS_ADDRESS_KEY);
  return (stored === null ? getStoredSession()?.address || '' : stored).trim();
}

function getBusinessContactMarkup() {
  const phone = getBusinessPhone();
  const address = getBusinessAddress();
  if (!phone && !address) return '';
  return `<div class="business-contact">${phone ? `<div>Tel: ${escapeHTML(phone)}</div>` : ''}${address ? `<div>Dirección: ${escapeHTML(address)}</div>` : ''}</div>`;
}

function getUserBrand(username) {
  if (!username) return '';
  try {
    const brands = JSON.parse(localStorage.getItem(USER_BRANDS_KEY) || '{}');
    return typeof brands[username] === 'string' ? brands[username] : '';
  } catch (error) {
    return '';
  }
}

function getUserLogo(username) {
  if (!username) return '';
  try {
    const logos = JSON.parse(localStorage.getItem(USER_LOGOS_KEY) || '{}');
    return typeof logos[username] === 'string' ? logos[username] : '';
  } catch (error) {
    return '';
  }
}

function getBusinessLogo() {
  const user = getStoredSession();
  return user?.logo || getUserLogo(user?.username);
}

function getUserLogoStyle(username) {
  const fallback = { text: '', primaryColor: '#1a1a2e', secondaryColor: '#0072bb' };
  if (!username) return fallback;
  try {
    const styles = JSON.parse(localStorage.getItem(USER_LOGO_STYLES_KEY) || '{}');
    const style = styles[username] || {};
    return {
      text: typeof style.text === 'string' ? style.text : '',
      primaryColor: /^#[\da-f]{6}$/i.test(style.primaryColor) ? style.primaryColor : fallback.primaryColor,
      secondaryColor: /^#[\da-f]{6}$/i.test(style.secondaryColor) ? style.secondaryColor : fallback.secondaryColor,
    };
  } catch (error) {
    return fallback;
  }
}

function getBusinessLogoStyle() {
  const user = getStoredSession();
  return getUserLogoStyle(user?.username);
}

function renderLogoText(style) {
  return style.text.trim().split(/\s+/).map((word, index) => {
    const color = index % 2 === 0 ? style.primaryColor : style.secondaryColor;
    return `<span style="color:${color}">${escapeHTML(word)}</span>`;
  }).join(' ');
}

function updateLogoTextPreview() {
  const preview = document.getElementById('settings-logo-text-preview');
  const text = document.getElementById('settings-logo-text').value.trim();
  const style = {
    text,
    primaryColor: document.getElementById('settings-logo-color-primary').value,
    secondaryColor: document.getElementById('settings-logo-color-secondary').value,
  };
  preview.innerHTML = text ? renderLogoText(style) : 'Vista previa del logotipo';
}

function readBusinessLogo(file) {
  if (!file) return Promise.resolve('');
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
    alert('El logo debe estar en formato PNG, JPG o WebP.');
    return Promise.resolve(null);
  }
  if (file.size > 1536 * 1024) {
    alert('El logo no puede superar 1,5 MB.');
    return Promise.resolve(null);
  }

  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

function getBusinessNameMarkup() {
  const logoStyle = getBusinessLogoStyle();
  const logo = getBusinessLogo();
  const logoMarkup = logoStyle.text
    ? renderLogoText(logoStyle)
    : logo
    ? `<img src="${escapeHTML(logo)}" alt="" style="max-width:120px;max-height:48px;object-fit:contain;vertical-align:middle;margin-right:8px">`
    : '';
  if (getBusinessName() === DEFAULT_BUSINESS_NAME) {
    return `${logoMarkup}${logoStyle.text ? '' : 'TH3 <span class="brand-blue">BNB</span>'}`;
  }
  const nameMarkup = escapeHTML(getBusinessName());
  const nameAlreadyInLogo = logoStyle.text.toLowerCase() === getBusinessName().toLowerCase();
  return `${logoMarkup}${logoStyle.text && nameAlreadyInLogo ? '' : nameMarkup}`;
}

function updateBusinessNameDisplay() {
  const title = document.getElementById('business-name-title');
  const subtitle = document.getElementById('business-name-subtitle');
  if (!title || !subtitle) return;

  const logoStyle = getBusinessLogoStyle();
  const logo = getBusinessLogo();
  if (logoStyle.text) {
    title.innerHTML = renderLogoText(logoStyle);
    subtitle.textContent = getBusinessName();
    subtitle.hidden = logoStyle.text.toLowerCase() === getBusinessName().toLowerCase();
    title.classList.remove('has-logo');
    title.classList.add('is-custom');
    return;
  }
  if (logo) {
    title.innerHTML = `<img class="business-logo" src="${escapeHTML(logo)}" alt="">`;
    subtitle.textContent = getBusinessName();
    subtitle.hidden = false;
    title.classList.remove('is-custom');
    title.classList.add('has-logo');
    return;
  }

  title.classList.remove('has-logo');
  if (getBusinessName() === DEFAULT_BUSINESS_NAME) {
    title.innerHTML = '<span class="brand-dark">TH3</span> <span class="brand-blue">BNB</span>';
    subtitle.textContent = 'servicio técnico';
    subtitle.hidden = false;
    title.classList.remove('is-custom');
    return;
  }

  title.textContent = getBusinessName();
  subtitle.hidden = true;
  title.classList.add('is-custom');
}

function saveBusinessName(name) {
  const normalized = String(name || '').trim();
  if (!normalized) return false;
  localStorage.setItem(BUSINESS_NAME_KEY, normalized);
  updateBusinessNameDisplay();
  return true;
}

function saveCurrentUserBrand(name, logo, removeLogo = false, logoStyle = null) {
  const user = getCurrentUser();
  if (!user) return false;

  let brands;
  try {
    brands = JSON.parse(localStorage.getItem(USER_BRANDS_KEY) || '{}');
  } catch (error) {
    brands = {};
  }

  const normalized = String(name || '').trim();
  if (normalized) brands[user.username] = normalized;
  else delete brands[user.username];
  localStorage.setItem(USER_BRANDS_KEY, JSON.stringify(brands));

  let logos;
  try {
    logos = JSON.parse(localStorage.getItem(USER_LOGOS_KEY) || '{}');
  } catch (error) {
    logos = {};
  }
  if (logo) logos[user.username] = logo;
  else if (removeLogo) delete logos[user.username];
  localStorage.setItem(USER_LOGOS_KEY, JSON.stringify(logos));

  if (logoStyle) {
    let styles;
    try {
      styles = JSON.parse(localStorage.getItem(USER_LOGO_STYLES_KEY) || '{}');
    } catch (error) {
      styles = {};
    }
    styles[user.username] = logoStyle;
    localStorage.setItem(USER_LOGO_STYLES_KEY, JSON.stringify(styles));
  }

  user.businessName = normalized;
  if (logo) user.logo = logo;
  else if (removeLogo) user.logo = '';
  saveSession(user);
  const account = AUTH_USERS.find(item => item.username === user.username);
  if (account) {
    account.businessName = normalized;
    if (logo) account.logo = logo;
    else if (removeLogo) account.logo = '';
    persistCustomAuthUsers();
  }
  updateBusinessNameDisplay();
  return true;
}

function loadCustomAuthUsers() {
  try {
    const stored = localStorage.getItem(AUTH_USERS_KEY);
    const users = stored ? JSON.parse(stored) : [];
    return Array.isArray(users) ? users : [];
  } catch (error) {
    return [];
  }
}

const AUTH_USERS = [
  { username: 'admin', password: 'admin123', role: 'admin', name: 'Administrador' },
  ...loadCustomAuthUsers(),
];

const DEFAULT_DB = {
  repairs: [
    {
      id: 'R-10023',
      device: 'iPhone 14 Pro',
      deviceIcon: '📱',
      client: 'Julien Martin',
      clientId: 'C001',
      problem: 'Pantalla rota, no responde al tacto',
      diagnosis: 'Módulo de pantalla dañado, requiere reemplazo completo',
      status: 'en_progreso',
      priority: 'alta',
      progress: 65,
      dateIn: '2026-06-05',
      dateEst: '2026-06-10',
      price: 12500,
      notes: 'Cliente dejó cargador original',
      parts: ['Pantalla iPhone 14 Pro OEM'],
      history: [
        { date: '2026-06-05', action: 'Ingreso del equipo', user: 'Técnico' },
        { date: '2026-06-06', action: 'Diagnóstico completado', user: 'Técnico' },
        { date: '2026-06-07', action: 'Pedido de repuesto realizado', user: 'Técnico' },
        { date: '2026-06-08', action: 'Repuesto recibido, inicio de reparación', user: 'Técnico' },
      ]
    },
    {
      id: 'R-10024',
      device: 'Samsung S23 Ultra',
      deviceIcon: '📱',
      client: 'Sarah Benali',
      clientId: 'C002',
      problem: 'No enciende después de caída',
      diagnosis: 'En diagnóstico — posible daño en placa',
      status: 'diagnostico',
      priority: 'media',
      progress: 30,
      dateIn: '2026-06-06',
      dateEst: '2026-06-12',
      price: 8000,
      notes: '',
      parts: [],
      history: [
        { date: '2026-06-06', action: 'Ingreso del equipo', user: 'Técnico' },
        { date: '2026-06-07', action: 'Inicio de diagnóstico', user: 'Técnico' },
      ]
    },
    {
      id: 'R-10025',
      device: 'iPad Air 5',
      deviceIcon: '📟',
      client: 'Thomas Leroy',
      clientId: 'C003',
      problem: 'Batería se hincha, no carga',
      diagnosis: 'Batería defectuosa, requiere reemplazo',
      status: 'espera_repuesto',
      priority: 'alta',
      progress: 15,
      dateIn: '2026-06-07',
      dateEst: '2026-06-14',
      price: 6500,
      notes: 'Esperando batería del proveedor',
      parts: ['Batería iPad Air 5'],
      history: [
        { date: '2026-06-07', action: 'Ingreso del equipo', user: 'Técnico' },
        { date: '2026-06-08', action: 'Diagnóstico: batería hinchada', user: 'Técnico' },
        { date: '2026-06-08', action: 'Pedido de batería al proveedor', user: 'Técnico' },
      ]
    },
    {
      id: 'R-10022',
      device: 'Motorola Edge 40',
      deviceIcon: '📱',
      client: 'Diego Fernández',
      clientId: 'C004',
      problem: 'Cambio de módulo de carga',
      diagnosis: 'Puerto USB-C dañado',
      status: 'listo',
      priority: 'media',
      progress: 100,
      dateIn: '2026-06-03',
      dateEst: '2026-06-08',
      price: 3500,
      notes: '',
      parts: ['Puerto USB-C Motorola Edge 40'],
      history: [
        { date: '2026-06-03', action: 'Ingreso del equipo', user: 'Técnico' },
        { date: '2026-06-04', action: 'Diagnóstico completado', user: 'Técnico' },
        { date: '2026-06-05', action: 'Reparación completada', user: 'Técnico' },
        { date: '2026-06-05', action: 'Listo para entregar', user: 'Técnico' },
      ]
    },
    {
      id: 'R-10021',
      device: 'iPhone 12 Pro',
      deviceIcon: '📱',
      client: 'Lucía Martínez',
      clientId: 'C005',
      problem: 'Falla de micrófono en llamadas',
      diagnosis: 'Micrófono inferior dañado',
      status: 'listo',
      priority: 'baja',
      progress: 100,
      dateIn: '2026-06-02',
      dateEst: '2026-06-07',
      price: 42000,
      notes: '',
      parts: ['Micrófono iPhone 12 Pro'],
      history: [
        { date: '2026-06-02', action: 'Ingreso del equipo', user: 'Técnico' },
        { date: '2026-06-03', action: 'Diagnóstico completado', user: 'Técnico' },
        { date: '2026-06-04', action: 'Reparación completada', user: 'Técnico' },
        { date: '2026-06-04', action: 'Listo para entregar', user: 'Técnico' },
      ]
    },
  ],

  clients: [
    { id: 'C001', name: 'Julien Martin', phone: '11-4523-8901', email: 'julien@email.com', address: 'Av. Corrientes 1234', dateAdded: '2026-05-15', repairs: ['R-10023'] },
    { id: 'C002', name: 'Sarah Benali', phone: '11-3312-4567', email: 'sarah@email.com', address: 'Palermo, CABA', dateAdded: '2026-05-14', repairs: ['R-10024'] },
    { id: 'C003', name: 'Thomas Leroy', phone: '11-6789-0123', email: 'thomas@email.com', address: 'Belgrano, CABA', dateAdded: '2026-05-13', repairs: ['R-10025'] },
    { id: 'C004', name: 'Diego Fernández', phone: '11-2234-5678', email: 'diego@email.com', address: 'San Telmo, CABA', dateAdded: '2026-06-01', repairs: ['R-10022'] },
    { id: 'C005', name: 'Lucía Martínez', phone: '11-9876-5432', email: 'lucia@email.com', address: 'Recoleta, CABA', dateAdded: '2026-06-02', repairs: ['R-10021'] },
  ],

  products: [
    { id: 'P001', name: 'Pantalla iPhone 14 Pro', category: 'Repuesto', icon: '📱', stock: 3, minStock: 2, price: 8500, cost: 6000 },
    { id: 'P002', name: 'Batería Samsung S23', category: 'Repuesto', icon: '🔋', stock: 5, minStock: 3, price: 3200, cost: 2000 },
    { id: 'P003', name: 'Batería iPad Air 5', category: 'Repuesto', icon: '🔋', stock: 1, minStock: 2, price: 4500, cost: 3000 },
    { id: 'P004', name: 'Puerto USB-C Universal', category: 'Repuesto', icon: '🔌', stock: 8, minStock: 5, price: 1200, cost: 700 },
    { id: 'P005', name: 'Vidrio templado iPhone 14', category: 'Accesorio', icon: '🛡️', stock: 12, minStock: 5, price: 800, cost: 300 },
    { id: 'P006', name: 'Funda silicona Samsung', category: 'Accesorio', icon: '📦', stock: 7, minStock: 5, price: 1500, cost: 600 },
    { id: 'P007', name: 'Cable USB-C 1m', category: 'Accesorio', icon: '🔌', stock: 15, minStock: 8, price: 900, cost: 400 },
    { id: 'P008', name: 'Cargador 20W', category: 'Accesorio', icon: '⚡', stock: 2, minStock: 4, price: 2800, cost: 1800 },
  ],

  suppliers: [
    { id: 'S001', name: 'TechParts SRL', contact: 'María Gómez', phone: '11-5555-2200', email: 'ventas@techparts.com', category: 'Repuestos', leadTime: '48h', balance: 145000, rating: 4.8 },
    { id: 'S002', name: 'CellStore', contact: 'Lucas Rojas', phone: '11-4444-7788', email: 'info@cellstore.com', category: 'Accesorios', leadTime: '72h', balance: 62000, rating: 4.6 },
    { id: 'S003', name: 'PowerLine Import', contact: 'Ana Díaz', phone: '11-3333-9911', email: 'import@powerline.com', category: 'Baterías', leadTime: '36h', balance: 98000, rating: 4.9 },
  ],

  sales: [
    { id: 'V-2001', client: 'Lucía Martínez', amount: 42000, status: 'cobrado', dueDate: '2026-09-28', date: '2026-09-20', invoice: 'FV-1042' },
    { id: 'V-2002', client: 'Julien Martin', amount: 12500, status: 'pendiente', dueDate: '2026-10-02', date: '2026-09-22', invoice: 'FV-1043' },
    { id: 'V-2003', client: 'Thomas Leroy', amount: 6500, status: 'pendiente', dueDate: '2026-10-04', date: '2026-09-25', invoice: 'FV-1044' },
    { id: 'V-2004', client: 'Sarah Benali', amount: 8000, status: 'cobrado', dueDate: '2026-09-30', date: '2026-09-26', invoice: 'FV-1045' },
  ],

  purchases: [
    { id: 'P-3001', supplier: 'TechParts SRL', amount: 18000, status: 'pagado', dueDate: '2026-09-27', date: '2026-09-18', invoice: 'FC-201' },
    { id: 'P-3002', supplier: 'CellStore', amount: 6500, status: 'pendiente', dueDate: '2026-10-01', date: '2026-09-20', invoice: 'FC-202' },
    { id: 'P-3003', supplier: 'PowerLine Import', amount: 9200, status: 'pendiente', dueDate: '2026-10-03', date: '2026-09-22', invoice: 'FC-203' },
  ],

  tasks: [
    { id: 'T-101', title: 'Confirmar entrega de batería para iPad Air 5', type: 'proveedor', dueDate: '2026-09-30', status: 'pendiente', priority: 'alta', assignee: 'Técnico', notes: 'Revisar stock y coordinar retiro.' },
    { id: 'T-102', title: 'Seguimiento a cliente Lucía Martínez', type: 'seguimiento', dueDate: '2026-10-02', status: 'hoy', priority: 'media', assignee: 'Administración', notes: 'Avisar entrega y cierre de servicio.' },
    { id: 'T-103', title: 'Control de caja y cobros pendientes', type: 'finanzas', dueDate: '2026-10-01', status: 'pendiente', priority: 'alta', assignee: 'Admin', notes: 'Confirmar cuotas y facturación.' }
  ],

  nextRepairId: 10026,
  nextClientId: 6,
  nextTaskId: 104,
  customModels: {},
};

function loadAppState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return structuredClone(DEFAULT_DB);
    const parsed = JSON.parse(stored);
    return {
      ...structuredClone(DEFAULT_DB),
      ...parsed,
      repairs: Array.isArray(parsed.repairs) ? parsed.repairs : structuredClone(DEFAULT_DB.repairs),
      clients: Array.isArray(parsed.clients) ? parsed.clients : structuredClone(DEFAULT_DB.clients),
      products: Array.isArray(parsed.products) ? parsed.products : structuredClone(DEFAULT_DB.products),
      suppliers: Array.isArray(parsed.suppliers) ? parsed.suppliers : structuredClone(DEFAULT_DB.suppliers),
      sales: Array.isArray(parsed.sales) ? parsed.sales : structuredClone(DEFAULT_DB.sales),
      purchases: Array.isArray(parsed.purchases) ? parsed.purchases : structuredClone(DEFAULT_DB.purchases),
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : structuredClone(DEFAULT_DB.tasks),
      customModels: parsed.customModels && typeof parsed.customModels === 'object' && !Array.isArray(parsed.customModels)
        ? parsed.customModels
        : {},
    };
  } catch (error) {
    console.warn('No se pudo cargar el estado guardado:', error);
    return structuredClone(DEFAULT_DB);
  }
}

const DB = loadAppState();

function persistAppState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DB));
  } catch (error) {
    console.warn('No se pudo guardar el estado:', error);
  }
}

function getPreferredTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme = getPreferredTheme()) {
  document.body.dataset.theme = theme;

  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro');
  }

  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme === 'dark' ? '#081a2b' : '#0072bb');
  }

  localStorage.setItem(THEME_KEY, theme);
}

function getStoredSession() {
  try {
    const stored = localStorage.getItem(AUTH_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    return null;
  }
}

function getCurrentUser() {
  return getStoredSession();
}

function userHasPermission(action) {
  const user = getCurrentUser();
  if (!user) return false;

  const permissions = {
    admin: ['new_repair', 'new_client', 'new_product', 'new_supplier', 'new_sale', 'new_purchase', 'new_task', 'edit_repair', 'delete_records', 'view_reports', 'manage_inventory'],
    operator: ['new_repair', 'new_client', 'new_sale', 'new_task', 'edit_repair']
  };

  return (permissions[user.role] || []).includes(action);
}

function syncActionPermissions() {
  const user = getCurrentUser();
  const settingsButton = document.getElementById('legal-settings-btn');
  if (settingsButton) settingsButton.style.display = user ? 'flex' : 'none';
  document.querySelectorAll('[data-action]').forEach((button) => {
    const permitted = user ? userHasPermission(button.dataset.action) : false;
    button.disabled = !permitted;
    button.classList.toggle('is-disabled', !permitted);
    if (!permitted && button.dataset.action === 'new_product') {
      button.title = 'Requiere permisos de administrador';
    }
  });
}

function saveSession(user) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

function persistCustomAuthUsers() {
  const customUsers = AUTH_USERS.filter(user => !['admin', 'operador'].includes(user.username));
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(customUsers));
}

function clearSession() {
  localStorage.removeItem(AUTH_KEY);
}

function updateUserBadge(user) {
  const badge = document.getElementById('user-badge');
  const logoutBtn = document.getElementById('logout-btn');
  if (badge) {
    badge.textContent = user ? (user.role === 'admin' ? 'Admin' : 'Operador') : 'Invitado';
  }
  if (logoutBtn) {
    logoutBtn.style.display = user ? 'flex' : 'none';
  }
}

function loginUser(username, password) {
  const normalizedUsername = username.trim().toLowerCase();
  const user = AUTH_USERS.find(u => u.username.toLowerCase() === normalizedUsername && u.password === password);
  if (!user) return null;

  const safeUser = {
    username: user.username,
    role: user.role,
    name: user.name,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    phone: user.phone || '',
    address: user.address || '',
    businessName: user.businessName || getUserBrand(user.username) || '',
    logo: user.logo || getUserLogo(user.username),
  };
  saveSession(safeUser);
  updateUserBadge(safeUser);
  updateBusinessNameDisplay();
  return safeUser;
}

function logoutUser() {
  clearSession();
  updateUserBadge(null);
  updateBusinessNameDisplay();
  syncActionPermissions();
  navigate(currentPage);
  openModal('modal-login');
  showToast('Sesión cerrada', 'info');
}

function openNewAccess() {
  document.getElementById('new-access-form').reset();
  showAccessStep('credentials');
  openModal('modal-new-access');
}

function showAccessStep(step) {
  document.getElementById('access-step-credentials').hidden = step !== 'credentials';
  document.getElementById('access-step-profile').hidden = step !== 'profile';
}

function continueNewAccess() {
  const username = document.getElementById('access-user').value.trim().toLowerCase();
  const password = document.getElementById('access-password').value;
  const passwordConfirm = document.getElementById('access-password-confirm').value;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username)) {
    alert('Ingresá un email válido.');
    return;
  }
  if (AUTH_USERS.some(user => user.username.toLowerCase() === username)) {
    alert('Ese email ya está registrado.');
    return;
  }
  if (password.length < 8) {
    alert('La contraseña debe tener al menos 8 caracteres.');
    return;
  }
  if (password !== passwordConfirm) {
    alert('Las contraseñas no coinciden.');
    return;
  }

  showAccessStep('profile');
}

async function saveNewAccess() {
  const username = document.getElementById('access-user').value.trim().toLowerCase();
  const password = document.getElementById('access-password').value;
  const firstName = document.getElementById('access-first-name').value.trim();
  const lastName = document.getElementById('access-last-name').value.trim();
  const phone = document.getElementById('access-phone').value.trim();
  const address = document.getElementById('access-address').value.trim();
  const role = document.getElementById('access-role').value;
  const businessName = document.getElementById('access-brand').value.trim();

  if (!firstName || !lastName || !phone || !address) {
    alert('Completá nombre, apellido, celular y dirección del local.');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username) || password.length < 8) {
    showAccessStep('credentials');
    alert('Revisá el email y la contraseña. Debe tener al menos 8 caracteres.');
    return;
  }
  if (AUTH_USERS.some(user => user.username.toLowerCase() === username)) {
    showAccessStep('credentials');
    alert('Ese email ya está registrado.');
    return;
  }

  const logoFile = document.getElementById('access-logo').files[0];
  const logo = await readBusinessLogo(logoFile);
  if (logo === null) return;

  const name = `${firstName} ${lastName}`;
  const user = {
    username,
    password,
    role,
    name,
    firstName,
    lastName,
    phone,
    address,
    businessName: businessName || DEFAULT_BUSINESS_NAME,
    logo,
  };
  AUTH_USERS.push(user);
  persistCustomAuthUsers();
  if (role === 'admin') {
    if (localStorage.getItem(BUSINESS_PHONE_KEY) === null) localStorage.setItem(BUSINESS_PHONE_KEY, phone);
    if (localStorage.getItem(BUSINESS_ADDRESS_KEY) === null) localStorage.setItem(BUSINESS_ADDRESS_KEY, address);
  }
  if (logo) {
    const logos = JSON.parse(localStorage.getItem(USER_LOGOS_KEY) || '{}');
    logos[username] = logo;
    localStorage.setItem(USER_LOGOS_KEY, JSON.stringify(logos));
  }
  const session = { username, role, name, firstName, lastName, phone, address, businessName: user.businessName, logo };
  saveSession(session);
  updateUserBadge(session);
  updateBusinessNameDisplay();
  syncActionPermissions();
  closeModal('modal-new-access');
  closeModal('modal-login');
  document.getElementById('new-access-form').reset();
  showToast('Acceso creado correctamente', 'success');
}

function openLegalSettings() {
  const user = getCurrentUser();
  if (!user) {
    showToast('Iniciá sesión para configurar tu marca.', 'info');
    return;
  }

  document.getElementById('settings-brand').value = getBusinessName();
  document.getElementById('settings-business-phone').value = getBusinessPhone();
  document.getElementById('settings-business-address').value = getBusinessAddress();
  const logoStyle = getBusinessLogoStyle();
  document.getElementById('settings-logo-text').value = logoStyle.text;
  document.getElementById('settings-logo-color-primary').value = logoStyle.primaryColor;
  document.getElementById('settings-logo-color-secondary').value = logoStyle.secondaryColor;
  updateLogoTextPreview();
  document.getElementById('settings-logo').value = '';
  document.getElementById('settings-remove-logo').checked = false;
  const logoPreview = document.getElementById('settings-logo-preview');
  const logo = getBusinessLogo();
  logoPreview.hidden = !logo;
  if (logo) logoPreview.src = logo;
  const legalFields = document.getElementById('legal-terms-fields');
  legalFields.hidden = user.role !== 'admin';
  document.getElementById('business-contact-fields').hidden = user.role !== 'admin';
  if (user.role === 'admin') {
    document.getElementById('receipt-terms').value = getStoredTerms(RECEIPT_TERMS_KEY, DEFAULT_RECEIPT_TERMS);
  }
  openModal('modal-legal-settings');
}

async function saveLegalSettings() {
  const user = getCurrentUser();
  if (!user) return;

  let receiptTerms;
  if (user.role === 'admin') {
    receiptTerms = document.getElementById('receipt-terms').value.trim();
    if (!receiptTerms) {
      showToast('Completá las condiciones de la boleta cliente.', 'info');
      return;
    }
  }

  const logoFile = document.getElementById('settings-logo').files[0];
  const logo = await readBusinessLogo(logoFile);
  if (logo === null) return;

  saveCurrentUserBrand(
    document.getElementById('settings-brand').value,
    logo || undefined,
    document.getElementById('settings-remove-logo').checked,
    {
      text: document.getElementById('settings-logo-text').value.trim(),
      primaryColor: document.getElementById('settings-logo-color-primary').value,
      secondaryColor: document.getElementById('settings-logo-color-secondary').value,
    }
  );
  if (user.role === 'admin') {
    localStorage.setItem(BUSINESS_PHONE_KEY, document.getElementById('settings-business-phone').value.trim());
    localStorage.setItem(BUSINESS_ADDRESS_KEY, document.getElementById('settings-business-address').value.trim());
    localStorage.setItem(RECEIPT_TERMS_KEY, receiptTerms);
  }
  closeModal('modal-legal-settings');
  showToast(user.role === 'admin' ? 'Marca y condiciones guardadas' : 'Marca guardada', 'success');
}

function showToast(message, type = 'info') {
  const existing = document.getElementById('app-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'app-toast';
  toast.className = `app-toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 220);
  }, 2200);
}

let deferredInstallPrompt = null;

function initPwa() {
  const installBtn = document.getElementById('install-btn');

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations()
      .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
      .then(() => navigator.serviceWorker.register('./sw.js'))
      .then((registration) => registration.update())
      .catch(() => {
        console.warn('No se pudo registrar el service worker');
      });
  }

  const updateInstallButton = () => {
    if (!installBtn) return;
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    installBtn.classList.toggle('hidden', standalone || !deferredInstallPrompt);
  };

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    updateInstallButton();
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    if (installBtn) installBtn.classList.add('hidden');
  });

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (!deferredInstallPrompt) {
        showToast('La instalación no está disponible en este navegador.', 'info');
        return;
      }

      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      updateInstallButton();
    });
  }

  updateInstallButton();
}

// ===== STATUS CONFIG =====
const STATUS = {
  recibido:       { label: 'Recibido',           badge: 'badge-gray',   icon: '📥' },
  diagnostico:    { label: 'Diagnóstico',         badge: 'badge-orange', icon: '🔍' },
  espera_repuesto:{ label: 'Espera repuesto',     badge: 'badge-orange', icon: '⏳' },
  en_progreso:    { label: 'En progreso',         badge: 'badge-blue',   icon: '🛠️' },
  listo:          { label: 'Listo para entregar', badge: 'badge-green',  icon: '✅' },
  entregado:      { label: 'Entregado',           badge: 'badge-gray',   icon: '📤' },
};

const PRIORITY = {
  alta:  { label: 'Alta',  dot: 'priority-high' },
  media: { label: 'Media', dot: 'priority-med'  },
  baja:  { label: 'Baja',  dot: 'priority-low'  },
};

// ===== NAVIGATION =====
let currentPage = 'home';
let currentRepairFilter = 'all';
const MORE_NAV_PAGES = ['inventory', 'agenda', 'suppliers', 'sales', 'purchases', 'reports'];

function closeMoreMenu() {
  const menu = document.getElementById('nav-more-menu');
  const button = document.getElementById('nav-more-button');
  if (menu) menu.hidden = true;
  if (button) {
    button.setAttribute('aria-expanded', 'false');
    button.classList.toggle('active', MORE_NAV_PAGES.includes(currentPage));
  }
}

function toggleMoreMenu() {
  const menu = document.getElementById('nav-more-menu');
  const button = document.getElementById('nav-more-button');
  if (!menu || !button) return;

  menu.hidden = !menu.hidden;
  button.setAttribute('aria-expanded', String(!menu.hidden));
  button.classList.toggle('active', !menu.hidden || MORE_NAV_PAGES.includes(currentPage));
}

function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const targetPage = document.getElementById('page-' + page);
  const navTarget = document.querySelector(`[data-page="${page}"]`);
  if (targetPage) targetPage.classList.add('active');
  if (navTarget) navTarget.classList.add('active');
  currentPage = page;
  closeMoreMenu();
  if (page === 'home') renderHome();
  if (page === 'repairs') renderRepairs();
  if (page === 'clients') renderClients();
  if (page === 'inventory') renderInventory();
  if (page === 'repuestos') renderSpareParts();
  if (page === 'agenda') renderAgenda();
  if (page === 'suppliers') renderSuppliers();
  if (page === 'sales') renderSales();
  if (page === 'purchases') renderPurchases();
  if (page === 'reports') renderReports();
}

// ===== HELPERS =====
function formatDate(d) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

function formatMoney(n) {
  return '$' + Number(n).toLocaleString('es-AR');
}

function parseMoneyAmount(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const normalized = String(value || '').replace(/[^0-9,.-]/g, '').replace(/\./g, '').replace(',', '.');
  const amount = parseFloat(normalized);
  return Number.isFinite(amount) ? amount : 0;
}

function updateNewRepairBalance() {
  const price = parseFloat(document.getElementById('nr-price')?.value) || 0;
  const deposit = parseFloat(document.getElementById('nr-deposit')?.value) || 0;
  const total = document.getElementById('nr-total');
  if (total) total.value = formatMoney(Math.max(0, price - deposit));
}

function updateStockAlertBadge() {
  const badge = document.getElementById('stock-alert-badge');
  if (!badge) return;
  const lowStockCount = DB.products.filter(p => p.stock <= p.minStock).length;
  badge.textContent = lowStockCount > 99 ? '99+' : String(lowStockCount);
  badge.hidden = lowStockCount === 0;
}

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function clampProgress(value) {
  return Math.min(100, Math.max(0, Number(value) || 0));
}

function getDeviceIcon(brand, model) {
  const text = `${brand || ''} ${model || ''}`.toLowerCase();
  if (text.includes('ipad') || text.includes('tablet')) return '📟';
  if (text.includes('watch')) return '⌚';
  if (text.includes('macbook') || text.includes('notebook') || text.includes('laptop')) return '💻';
  return '📱';
}

const REPAIR_DEVICE_ICONS = {
  'Celular': '📱',
  'Tablet': '📟',
  'Notebook': '💻',
  'Parlante': '🔊',
  'PC de escritorio': '🖥️',
  'Consola / joystick': '🎮',
  'Smartwatch': '⌚',
  'Auriculares': '🎧',
  'Otros equipos': '🧰',
};
const NOTEBOOK_FUNCTIONAL_GROUPS = [
  ['power', 'Enciende', ['OK', 'No', 'No probado']],
  ['discDrive', 'Lector de discos', ['OK', 'Falla', 'No tiene']],
  ['hdmi', 'Imagen HDMI', ['OK', 'Falla', 'No probado']],
  ['fan', 'Ventilador', ['OK', 'Falla', 'No probado']],
];
const CONSOLE_FUNCTIONAL_GROUPS = [
  ['power', 'Enciende', ['OK', 'No', 'No probado']],
  ['discDrive', 'Lector de discos', ['OK', 'Falla', 'No tiene']],
  ['hdmi', 'Imagen HDMI', ['OK', 'Falla', 'No probado']],
  ['fan', 'Ventilador', ['OK', 'Ruidoso', 'No funciona']],
];

const REPAIR_MODELS = {
  Samsung: ['Galaxy A04', 'Galaxy A05', 'Galaxy A14', 'Galaxy A15', 'Galaxy A24', 'Galaxy A34', 'Galaxy A54', 'Galaxy S21', 'Galaxy S22', 'Galaxy S23', 'Galaxy S23 Ultra', 'Galaxy S24', 'Galaxy S24 Ultra', 'Galaxy Note 20', 'Galaxy Z Flip 4', 'Galaxy Z Fold 4'],
  Apple: ['iPhone 11', 'iPhone 11 Pro', 'iPhone 12', 'iPhone 12 Pro', 'iPhone 13', 'iPhone 13 Pro', 'iPhone 14', 'iPhone 14 Pro', 'iPhone 15', 'iPhone 15 Pro', 'iPhone 16', 'iPhone 16 Pro', 'iPad 9', 'iPad 10', 'iPad Air 4', 'iPad Air 5', 'iPad Pro 11', 'iPad Pro 12.9', 'MacBook Air', 'MacBook Pro', 'Apple Watch'],
  Motorola: ['Moto E22', 'Moto E32', 'Moto E40', 'Moto G20', 'Moto G22', 'Moto G32', 'Moto G42', 'Moto G52', 'Moto G53', 'Moto G60', 'Moto G71', 'Moto G72', 'Moto G82', 'Moto Edge 20', 'Moto Edge 30', 'Motorola Edge 40', 'Motorola Edge 50'],
  Xiaomi: ['Redmi 9', 'Redmi 10', 'Redmi 12', 'Redmi Note 10', 'Redmi Note 11', 'Redmi Note 12', 'Redmi Note 13', 'Poco X3', 'Poco X4 Pro', 'Poco X5 Pro', 'Xiaomi 12', 'Xiaomi 13', 'Xiaomi 14'],
  Huawei: ['P30 Lite', 'P30 Pro', 'P40 Lite', 'P40 Pro', 'P Smart 2021', 'Nova 9', 'Mate 20', 'Mate 30 Pro', 'Mate 40 Pro'],
  Realme: ['C11', 'C21', 'C25', 'C35', '8', '9', '10', '11 Pro', 'GT Neo 2', 'GT 2 Pro'],
  Nokia: ['2.4', '3.4', '5.3', '5.4', '6.2', '7.2', 'G10', 'G20', 'G21', 'C10', 'C20'],
  LG: ['K22', 'K41S', 'K51S', 'K52', 'K61', 'G8', 'G8S', 'G8X', 'V40', 'V50', 'V60'],
  Otro: ['Tablet', 'Notebook', 'Otro modelo'],
};

function updateRepairModelOptions(brand = document.getElementById('nr-brand')?.value) {
  const modelSelect = document.getElementById('nr-model');
  if (!modelSelect) return;

  const models = [...(REPAIR_MODELS[brand] || REPAIR_MODELS.Otro), ...(DB.customModels[brand] || [])];
  modelSelect.replaceChildren(new Option('Seleccioná un modelo', ''));
  models.forEach(model => modelSelect.add(new Option(model, model)));
  modelSelect.add(new Option('+ Agregar modelo...', '__add_model__'));
}

function handleRepairModelChange(model) {
  if (model !== '__add_model__') return;

  const brand = document.getElementById('nr-brand').value;
  const modelSelect = document.getElementById('nr-model');
  const newModel = prompt(`Ingresá el modelo para ${brand}:`)?.trim();
  if (!newModel) {
    modelSelect.value = '';
    return;
  }

  const existingModel = [...(REPAIR_MODELS[brand] || REPAIR_MODELS.Otro), ...(DB.customModels[brand] || [])]
    .find(modelName => modelName.toLowerCase() === newModel.toLowerCase());
  if (existingModel) {
    updateRepairModelOptions(brand);
    modelSelect.value = existingModel;
    return;
  }

  DB.customModels[brand] = [...(DB.customModels[brand] || []), newModel];
  persistAppState();
  updateRepairModelOptions(brand);
  modelSelect.value = newModel;
}

function buildDeviceLabel(brand, model) {
  const parts = [brand, model].map(v => (v || '').trim()).filter(Boolean);
  return parts.join(' ') || 'Equipo sin identificar';
}

function isNotebookRepair(repair) {
  return repair?.deviceType === 'Notebook' || /\bnotebook\b/i.test(repair?.device || '');
}

function isSpeakerRepair(repair) {
  return repair?.deviceType === 'Parlante' || /^Parlante\b/i.test(repair?.device || '');
}

function isConsoleRepair(repair) {
  return repair?.deviceType === 'Consola / joystick' || /^Consola \/ joystick\b/i.test(repair?.device || '');
}

function getRepairTicketDisplayId(repair) {
  const id = String(repair?.id || '');
  return isNotebookRepair(repair) ? id.replace(/^R-/, 'RN-') : id;
}

function getCheckedAccessories() {
  const deviceType = document.getElementById('nr-device-type').value;
  if (deviceType === 'Parlante') return [];
  if (deviceType === 'Consola / joystick') {
    const labels = { joystick1: 'Joystick 1', joystick2: 'Joystick 2', hdmi: 'Cable HDMI', power: 'Cable de poder' };
    return Object.entries(getNewRepairConsoleAccessories())
      .filter(([, value]) => value === 'Sí')
      .map(([key]) => labels[key]);
  }
  const container = document.getElementById(deviceType === 'Notebook'
    ? 'nr-accessories-notebook'
    : 'nr-accessories-default');
  return Array.from(container.querySelectorAll('input[name="nr-acc"]:checked')).map(el => el.value);
}

function getNewRepairPhysicalState() {
  const fields = {
    screen: 'Pantalla',
    back: 'Tapa trasera',
    frame: 'Marco / Bisel',
    corrosion: 'Corrosión / Óxido',
    port: 'Puerto de carga',
    previous: 'Reparación anterior',
    general: 'Estado general',
    scratches: 'Rayones',
    impacts: 'Golpes visibles',
  };

  return Object.fromEntries(Object.entries(fields).map(([key]) => [
    key,
    document.querySelector(`input[name="nr-physical-${key}"]:checked`)?.value || '',
  ]));
}

function getNewRepairSpeakerPhysicalState() {
  return Object.fromEntries(['general', 'scratches', 'impacts', 'light'].map(key => [
    key,
    document.querySelector(`input[name="nr-physical-speaker-${key}"]:checked`)?.value || '',
  ]));
}

function getNewRepairConsolePhysicalState() {
  return Object.fromEntries(['general', 'scratches', 'impacts'].map(key => [
    key,
    document.querySelector(`input[name="nr-physical-console-${key}"]:checked`)?.value || '',
  ]));
}

function getNewRepairConsoleAccessories() {
  return Object.fromEntries(['joystick1', 'joystick2', 'hdmi', 'power'].map(key => [
    key,
    document.querySelector(`input[name="nr-console-accessory-${key}"]:checked`)?.value || 'No',
  ]));
}

function getNewRepairFunctionalState() {
  const fields = {
    power: 'Enciende',
    touch: 'Touch / Táctil',
    charge: 'Carga',
    sound: 'Sonido',
    microphone: 'Micrófono',
    wifi: 'WiFi',
    buttons: 'Botones',
    biometric: 'Huella / FaceID',
  };

  return Object.fromEntries(Object.entries(fields).map(([key]) => [
    key,
    document.querySelector(`input[name="nr-functional-${key}"]:checked`)?.value || '',
  ]));
}
function getNewRepairNotebookFunctionalState() {
  return Object.fromEntries(NOTEBOOK_FUNCTIONAL_GROUPS.map(([key]) => [
    key,
    document.querySelector(`input[name="nr-functional-notebook-${key === 'discDrive' ? 'disc-drive' : key}"]:checked`)?.value || '',
  ]));
}

function getNewRepairConsoleFunctionalState() {
  return Object.fromEntries(CONSOLE_FUNCTIONAL_GROUPS.map(([key]) => [
    key,
    document.querySelector(`input[name="nr-functional-console-${key === 'discDrive' ? 'disc-drive' : key}"]:checked`)?.value || '',
  ]));
}

// ===== PATRÓN DIGITAL =====
let nrPatternLock = null;

function createPatternLock(canvas, options = {}) {
  const size = options.size || 240;
  const dotRadius = 14;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const padding = 36;
  const spacing = (size - padding * 2) / 2;
  const dots = [];

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      dots.push({
        index: row * 3 + col + 1,
        x: padding + col * spacing,
        y: padding + row * spacing,
      });
    }
  }

  let path = [];
  let isDrawing = false;

  function draw() {
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = '#1A1A2E';
    ctx.fillRect(0, 0, size, size);

    if (path.length > 1) {
      ctx.strokeStyle = '#0072BB';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      const first = dots.find(d => d.index === path[0]);
      ctx.moveTo(first.x, first.y);
      for (let i = 1; i < path.length; i++) {
        const dot = dots.find(d => d.index === path[i]);
        ctx.lineTo(dot.x, dot.y);
      }
      ctx.stroke();
    }

    dots.forEach(dot => {
      const active = path.includes(dot.index);
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dotRadius, 0, Math.PI * 2);
      ctx.fillStyle = active ? '#0072BB' : '#3a3a52';
      ctx.fill();
      ctx.strokeStyle = active ? '#cce5f6' : '#555';
      ctx.lineWidth = 2;
      ctx.stroke();
      if (active) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(path.indexOf(dot.index) + 1), dot.x, dot.y);
      }
    });
  }

  function getDotAt(x, y) {
    return dots.find(d => Math.hypot(d.x - x, d.y - y) < dotRadius + 12);
  }

  function addDot(index) {
    if (!index || path.includes(index)) return;
    path.push(index);
    draw();
    options.onChange?.([...path]);
  }

  function clear() {
    path = [];
    draw();
    options.onChange?.([]);
  }

  function setPath(newPath) {
    path = Array.isArray(newPath) ? newPath.filter(n => n >= 1 && n <= 9) : [];
    draw();
  }

  function getPath() {
    return [...path];
  }

  function pointerPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  function pointerDown(e) {
    isDrawing = true;
    const { x, y } = pointerPos(e);
    const dot = getDotAt(x, y);
    if (dot) {
      path = [dot.index];
      draw();
      options.onChange?.([...path]);
    }
  }

  function pointerMove(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = pointerPos(e);
    const dot = getDotAt(x, y);
    if (dot) addDot(dot.index);
  }

  function pointerUp() {
    isDrawing = false;
    options.onChange?.([...path]);
  }

  canvas.addEventListener('mousedown', pointerDown);
  canvas.addEventListener('mousemove', pointerMove);
  canvas.addEventListener('mouseup', pointerUp);
  canvas.addEventListener('mouseleave', pointerUp);
  canvas.addEventListener('touchstart', pointerDown, { passive: false });
  canvas.addEventListener('touchmove', pointerMove, { passive: false });
  canvas.addEventListener('touchend', pointerUp);

  draw();
  return { clear, setPath, getPath, draw };
}

function updatePatternPreview(path) {
  const el = document.getElementById('nr-pattern-preview');
  if (!el) return;
  el.textContent = path.length
    ? `Patrón guardado: ${path.join(' → ')}`
    : 'Dibujá el patrón conectando los puntos';
}

function initNewRepairPatternLock() {
  const canvas = document.getElementById('nr-pattern-canvas');
  if (!canvas) return;
  nrPatternLock = createPatternLock(canvas, { onChange: updatePatternPreview });
}

function clearNewRepairPattern() {
  nrPatternLock?.clear();
}

function switchSecurityTab(tab) {
  document.querySelectorAll('.sec-tab-btn').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.sec === tab)
  );
  document.getElementById('sec-panel-pin').hidden = tab !== 'pin';
  document.getElementById('sec-panel-pattern').hidden = tab !== 'pattern';
  if (tab === 'pattern' && !nrPatternLock) initNewRepairPatternLock();
}

function getNewRepairSecurity() {
  const pin = document.getElementById('nr-device-key')?.value.trim() || '';
  const pattern = nrPatternLock?.getPath() || [];
  return { pin, pattern };
}

function formatPatternSequence(pattern) {
  if (!Array.isArray(pattern) || pattern.length === 0) return '—';
  return pattern.join(' → ');
}

function patternGridPrintHTML(pattern, compact) {
  const steps = Array.isArray(pattern) ? pattern : [];
  const positions = {
    1: [0, 0], 2: [1, 0], 3: [2, 0],
    4: [0, 1], 5: [1, 1], 6: [2, 1],
    7: [0, 2], 8: [1, 2], 9: [2, 2],
  };
  const cell = compact ? 18 : 26;
  const pad = compact ? 8 : 12;
  const w = pad * 2 + cell * 2;
  const h = w;

  const dotCoords = steps.map(step => {
    const [cx, cy] = positions[step] || [0, 0];
    return [pad + cx * cell, pad + cy * cell];
  });
  const polyline = dotCoords.map(c => c.join(',')).join(' ');

  const dotsSVG = Object.entries(positions).map(([num, [cx, cy]]) => {
    const x = pad + cx * cell;
    const y = pad + cy * cell;
    const active = steps.includes(Number(num));
    const order = steps.indexOf(Number(num));
    return `
      <circle cx="${x}" cy="${y}" r="${compact ? 7 : 9}" fill="${active ? '#0072BB' : '#e9ecef'}" stroke="${active ? '#005a96' : '#adb5bd'}" stroke-width="1.5"/>
      ${active ? `<text x="${x}" y="${y + 3}" text-anchor="middle" font-size="${compact ? 7 : 8}" font-weight="700" fill="#fff">${order + 1}</text>` : ''}
    `;
  }).join('');

  return `
    <div class="pattern-print-wrap${compact ? ' compact' : ''}">
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
        ${steps.length > 1 ? `<polyline points="${polyline}" fill="none" stroke="#0072BB" stroke-width="${compact ? 2.5 : 3.5}" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
        ${dotsSVG}
      </svg>
      <div class="pattern-print-seq">${formatPatternSequence(steps)}</div>
    </div>
  `;
}

function getClient(id) {
  return DB.clients.find(c => c.id === id);
}

// ===== HOME PAGE =====
function renderHome() {
  const active = DB.repairs.filter(r => r.status !== 'entregado');
  const ready = DB.repairs.filter(r => r.status === 'listo');
  const recent = DB.clients.slice(-3).reverse();

  // Stats
  document.getElementById('home-stat-active').textContent = active.length;
  document.getElementById('home-stat-ready').textContent = ready.length;
  document.getElementById('home-stat-clients').textContent = DB.clients.length;

  // Active repairs (top 3)
  const repairList = document.getElementById('home-repairs');
  const top3 = active.slice(0, 3);
  repairList.innerHTML = top3.map(r => repairCardHTML(r)).join('');

  // Recent clients
  const clientList = document.getElementById('home-clients');
  clientList.innerHTML = recent.map(c => `
    <div class="client-row" onclick="openClientDetail('${c.id}')">
      <div class="client-avatar">${initials(c.name)}</div>
      <div class="client-name">${c.name}</div>
      <div class="client-date">${formatDate(c.dateAdded)}</div>
      <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="color:var(--gray-400)"><path d="M9 18l6-6-6-6"/></svg>
    </div>
  `).join('');
}

function repairCardHTML(r) {
  const st = STATUS[r.status] || STATUS.recibido;
  const pr = PRIORITY[r.priority] || PRIORITY.media;
  const progress = clampProgress(r.progress);
  return `
    <div class="repair-card" onclick="openRepairDetail('${r.id}')">
      <div class="repair-device-icon">${r.deviceIcon}</div>
      <div class="repair-info">
        <div class="repair-top">
          <div class="repair-device">${r.device}</div>
          <span class="badge ${st.badge}">${st.label}</span>
        </div>
        <div class="repair-meta">
          <span class="priority-dot ${pr.dot}"></span>${r.client} · Ticket: ${getRepairTicketDisplayId(r)}
        </div>
        <div class="repair-progress-row">
          <div class="progress-bar-wrap">
            <div class="progress-bar-fill" style="width:${progress}%"></div>
          </div>
          <div class="progress-pct">${progress}%</div>
        </div>
      </div>
    </div>
  `;
}

// ===== REPAIRS PAGE =====
function renderRepairs(filter) {
  if (filter) currentRepairFilter = filter;
  const tabs = document.querySelectorAll('#page-repairs .tab-btn');
  tabs.forEach(t => t.classList.toggle('active', t.dataset.filter === currentRepairFilter));

  let list = DB.repairs;
  if (currentRepairFilter !== 'all') {
    if (currentRepairFilter === 'activas') list = list.filter(r => !['listo','entregado'].includes(r.status));
    else if (currentRepairFilter === 'listas') list = list.filter(r => r.status === 'listo');
    else if (currentRepairFilter === 'entregadas') list = list.filter(r => r.status === 'entregado');
  }

  const search = document.getElementById('repair-search')?.value?.toLowerCase() || '';
  if (search) list = list.filter(r =>
    r.device.toLowerCase().includes(search) ||
    r.client.toLowerCase().includes(search) ||
    r.id.toLowerCase().includes(search)
  );

  const container = document.getElementById('repairs-list');
  if (list.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">🔧</div><p>No hay reparaciones</p></div>`;
    return;
  }
  container.innerHTML = list.map(r => repairCardHTML(r)).join('');
}

// ===== CLIENTS PAGE =====
function renderClients(search) {
  let list = DB.clients;
  const q = (search || document.getElementById('client-search')?.value || '').toLowerCase();
  if (q) list = list.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.phone.includes(q) ||
    c.email.toLowerCase().includes(q)
  );

  const container = document.getElementById('clients-list');
  if (list.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">👥</div><p>No hay clientes</p></div>`;
    return;
  }
  container.innerHTML = list.map(c => `
    <div class="client-row" onclick="openClientDetail('${c.id}')">
      <div class="client-avatar">${initials(c.name)}</div>
      <div style="flex:1">
        <div class="client-name">${c.name}</div>
        <div style="font-size:12px;color:var(--gray-500)">${c.phone}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:12px;color:var(--gray-500)">${c.repairs.length} reparación${c.repairs.length !== 1 ? 'es' : ''}</div>
        <div style="font-size:11px;color:var(--gray-400)">${formatDate(c.dateAdded)}</div>
      </div>
      <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="color:var(--gray-400);margin-left:4px"><path d="M9 18l6-6-6-6"/></svg>
    </div>
  `).join('');
}

// ===== INVENTORY PAGE =====
function renderInventory(filter) {
  const activeFilter = filter || document.querySelector('#page-inventory .tab-btn.active')?.dataset?.filter || 'all';
  document.querySelectorAll('#page-inventory .tab-btn').forEach(t =>
    t.classList.toggle('active', t.dataset.filter === activeFilter)
  );

  let list = DB.products;
  if (activeFilter === 'repuestos') list = list.filter(p => p.category === 'Repuesto');
  if (activeFilter === 'accesorios') list = list.filter(p => p.category === 'Accesorio');
  if (activeFilter === 'bajo_stock') list = list.filter(p => p.stock <= p.minStock);

  const search = document.getElementById('inventory-search')?.value?.toLowerCase() || '';
  if (search) list = list.filter(p => p.name.toLowerCase().includes(search));

  const container = document.getElementById('inventory-list');
  if (list.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">📦</div><p>No hay productos</p></div>`;
    updateStockAlertBadge();
    return;
  }
  container.innerHTML = list.map(p => {
    const low = p.stock <= p.minStock;
    const categoryLabel = [p.category, p.subcategory].filter(Boolean).join(' · ');
    return `
      <div class="product-card" onclick="openProductDetail('${p.id}')">
        <div class="product-icon">${p.icon}</div>
        <div class="product-info">
          <div class="product-name">${p.name}</div>
          <div class="product-meta">${categoryLabel} · ${formatMoney(p.price)}</div>
        </div>
        <div class="product-stock ${low ? 'stock-low' : ''}">
          <div class="stock-num">${p.stock}</div>
          <div class="stock-label">en stock</div>
          ${low ? '<div style="font-size:10px;color:var(--red);font-weight:600">⚠ Bajo</div>' : ''}
        </div>
      </div>
    `;
  }).join('');

  updateStockAlertBadge();
}

function renderSpareParts() {
  const totalEl = document.getElementById('spares-total');
  const lowEl = document.getElementById('spares-low');
  const valueEl = document.getElementById('spares-value');
  const listEl = document.getElementById('spares-list');
  if (!totalEl || !lowEl || !valueEl || !listEl) return;

  const list = DB.products.filter(p => p.category === 'Repuesto');
  const search = document.getElementById('spares-search')?.value?.toLowerCase() || '';
  const filtered = search ? list.filter(p => p.name.toLowerCase().includes(search)) : list;

  totalEl.textContent = String(filtered.length);
  lowEl.textContent = String(filtered.filter(p => p.stock <= p.minStock).length);
  valueEl.textContent = formatMoney(filtered.reduce((sum, p) => sum + (Number(p.stock || 0) * Number(p.cost || 0)), 0));

  if (!filtered.length) {
    listEl.innerHTML = '<div class="empty-state"><div class="empty-icon">🔩</div><p>No hay repuestos cargados.</p></div>';
    return;
  }

  listEl.innerHTML = filtered.map((part) => {
    const low = part.stock <= part.minStock;
    return `
      <div class="spare-card ${low ? 'low-stock' : ''}">
        <div class="spare-header">
          <div class="spare-main">
            <div class="spare-icon">${part.icon || '🔩'}</div>
            <div>
              <div class="spare-name">${part.name}</div>
              <div class="spare-meta">${[part.category, part.subcategory].filter(Boolean).join(' · ')} · ${formatMoney(part.price)}</div>
            </div>
          </div>
          <span class="spare-stock ${low ? 'low' : ''}">${low ? 'Bajo stock' : 'En stock'}</span>
        </div>
        <div class="spare-body">
          <div class="spare-row"><span>Stock actual</span><strong>${part.stock} u.</strong></div>
          <div class="spare-row"><span>Stock mínimo</span><strong>${part.minStock} u.</strong></div>
          <div class="spare-row"><span>Valor de reposición</span><strong>${formatMoney(part.cost || 0)}</strong></div>
        </div>
        ${userHasPermission('delete_records') ? `<button class="btn btn-outline" style="width:100%;margin-top:10px;color:var(--red);border-color:var(--red)" onclick="deleteProduct('${part.id}')">🗑️ Eliminar repuesto</button>` : ''}
      </div>
    `;
  }).join('');
}

function renderSuppliers() {
  const container = document.getElementById('suppliers-list');
  if (!container) return;

  const totalSuppliers = DB.suppliers.length;
  const totalDebt = DB.suppliers.reduce((sum, supplier) => sum + Number(supplier.balance || 0), 0);
  const avgLeadTime = DB.suppliers.length
    ? (DB.suppliers.reduce((sum, supplier) => sum + Number(supplier.leadTime.replace(/\D/g, '') || 0), 0) / DB.suppliers.length).toFixed(0)
    : '0';

  document.getElementById('suppliers-count')?.replaceChildren(document.createTextNode(String(totalSuppliers)));
  document.getElementById('suppliers-debt')?.replaceChildren(document.createTextNode(formatMoney(totalDebt)));
  document.getElementById('suppliers-lead')?.replaceChildren(document.createTextNode(`${avgLeadTime}h`));

  if (!DB.suppliers.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">🏭</div><p>No hay proveedores cargados.</p></div>';
    return;
  }

  container.innerHTML = DB.suppliers.map((supplier) => `
    <div class="supplier-card">
      <div class="supplier-header">
        <div class="supplier-badge">${supplier.name.slice(0, 2).toUpperCase()}</div>
        <div>
          <div class="supplier-name">${supplier.name}</div>
          <div class="supplier-meta">${supplier.category} · ${supplier.contact}</div>
        </div>
        <div class="supplier-rating">★ ${supplier.rating}</div>
      </div>
      <div class="supplier-body">
        <div class="supplier-row"><span>Teléfono</span><strong>${supplier.phone}</strong></div>
        <div class="supplier-row"><span>Email</span><strong>${supplier.email}</strong></div>
        <div class="supplier-row"><span>Plazo</span><strong>${supplier.leadTime}</strong></div>
        <div class="supplier-row"><span>Saldo</span><strong class="supplier-balance">${formatMoney(supplier.balance)}</strong></div>
      </div>
      ${userHasPermission('delete_records') ? `<div class="sale-actions"><button class="btn btn-secondary" type="button" onclick="deleteSupplier('${supplier.id}')">🗑️ Eliminar</button></div>` : ''}
    </div>
  `).join('');
}

function deleteSupplier(id) {
  if (!userHasPermission('delete_records')) {
    showToast('Solo un administrador puede eliminar proveedores.', 'info');
    return;
  }
  const supplier = DB.suppliers.find(item => item.id === id);
  if (!supplier || !confirm(`¿Eliminar al proveedor "${supplier.name}"?`)) return;

  DB.suppliers = DB.suppliers.filter(item => item.id !== id);
  persistAppState();
  renderSuppliers();
  showToast('Proveedor eliminado', 'info');
}

function renderSales() {
  const totalEl = document.getElementById('sales-total');
  const pendingEl = document.getElementById('sales-pending');
  const collectedEl = document.getElementById('sales-collected');
  const listEl = document.getElementById('sales-list');
  if (!totalEl || !pendingEl || !collectedEl || !listEl) return;

  const total = DB.sales.reduce((sum, sale) => sum + Number(sale.amount || 0), 0);
  const pending = DB.sales.filter(sale => sale.status === 'pendiente').reduce((sum, sale) => sum + Number(sale.amount || 0), 0);
  const collected = DB.sales.filter(sale => sale.status === 'cobrado').reduce((sum, sale) => sum + Number(sale.amount || 0), 0);

  totalEl.textContent = formatMoney(total);
  pendingEl.textContent = formatMoney(pending);
  collectedEl.textContent = formatMoney(collected);

  if (!DB.sales.length) {
    listEl.innerHTML = '<div class="empty-state"><div class="empty-icon">💰</div><p>No hay ventas registradas.</p></div>';
    return;
  }

  listEl.innerHTML = DB.sales.map((sale) => `
    <div class="sale-card ${sale.status === 'cobrado' ? 'is-paid' : ''}">
      <div class="sale-top">
        <div>
          <div class="sale-id">${sale.id}</div>
          <div class="sale-client">${sale.client}</div>
        </div>
        <span class="sale-status ${sale.status === 'cobrado' ? 'paid' : 'pending'}">${sale.status === 'cobrado' ? 'Cobrado' : 'Pendiente'}</span>
      </div>
      <div class="sale-body">
        <div class="sale-row"><span>Factura</span><strong>${sale.invoice}</strong></div>
        <div class="sale-row"><span>Fecha</span><strong>${formatDate(sale.date)}</strong></div>
        <div class="sale-row"><span>Vencimiento</span><strong>${formatDate(sale.dueDate)}</strong></div>
        <div class="sale-row"><span>Monto</span><strong class="sale-amount">${formatMoney(sale.amount)}</strong></div>
      </div>
      <div class="sale-actions">
        <button class="btn btn-secondary" type="button" onclick="markSalePaid('${sale.id}')" ${sale.status === 'cobrado' ? 'disabled' : ''}>Cobrar</button>
        ${userHasPermission('delete_records') ? `<button class="btn btn-secondary" type="button" onclick="deleteSale('${sale.id}')">🗑️ Eliminar</button>` : ''}
      </div>
    </div>
  `).join('');
}

function markSalePaid(saleId) {
  const sale = DB.sales.find(item => item.id === saleId);
  if (!sale) return;
  sale.status = 'cobrado';
  sale.dueDate = sale.dueDate || new Date().toISOString().slice(0, 10);
  persistAppState();
  renderSales();
  renderReports();
  showToast('Cobro registrado', 'success');
}

function collectRepairPayment(repairId) {
  if (!userHasPermission('new_sale')) {
    showToast('No tenés permisos para registrar cobros.', 'info');
    return;
  }

  const repair = DB.repairs.find(item => item.id === repairId);
  if (!repair || repair.status !== 'entregado') return;
  if (DB.sales.some(sale => sale.repairId === repairId)) {
    showToast('El pago de esta reparación ya está registrado.', 'info');
    return;
  }

  const deposit = parseMoneyAmount(repair.deposit ?? repair.remitoDeposit ?? 0);
  const amount = Math.max(0, Number(repair.price || 0) - deposit);
  if (!amount) {
    showToast('Esta reparación no tiene saldo pendiente.', 'info');
    return;
  }

  const saleNumber = DB.sales.reduce((max, sale) => {
    const match = /^V-(\d+)$/.exec(sale.id);
    return Math.max(max, match ? Number(match[1]) : 0);
  }, 2000) + 1;
  const today = new Date().toISOString().slice(0, 10);
  DB.sales.unshift({
    id: `V-${saleNumber}`,
    client: repair.client,
    amount,
    status: 'cobrado',
    dueDate: today,
    date: today,
    invoice: repairId,
    repairId,
  });

  persistAppState();
  renderSales();
  renderReports();
  openRepairDetail(repairId);
  showToast('Pago de reparación registrado', 'success');
}

function deleteSale(saleId) {
  if (!userHasPermission('delete_records')) {
    showToast('Solo un administrador puede eliminar ventas.', 'info');
    return;
  }
  const sale = DB.sales.find(item => item.id === saleId);
  if (!sale || !confirm(`¿Eliminar la venta ${sale.id}?`)) return;

  DB.sales = DB.sales.filter(item => item.id !== saleId);
  persistAppState();
  renderSales();
  renderReports();
  showToast('Venta eliminada', 'info');
}

function renderPurchases() {
  const totalEl = document.getElementById('purchases-total');
  const pendingEl = document.getElementById('purchases-pending');
  const paidEl = document.getElementById('purchases-paid');
  const listEl = document.getElementById('purchases-list');
  if (!totalEl || !pendingEl || !paidEl || !listEl) return;

  const total = DB.purchases.reduce((sum, purchase) => sum + Number(purchase.amount || 0), 0);
  const pending = DB.purchases.filter(purchase => purchase.status === 'pendiente').reduce((sum, purchase) => sum + Number(purchase.amount || 0), 0);
  const paid = DB.purchases.filter(purchase => purchase.status === 'pagado').reduce((sum, purchase) => sum + Number(purchase.amount || 0), 0);

  totalEl.textContent = formatMoney(total);
  pendingEl.textContent = formatMoney(pending);
  paidEl.textContent = formatMoney(paid);

  if (!DB.purchases.length) {
    listEl.innerHTML = '<div class="empty-state"><div class="empty-icon">🧾</div><p>No hay compras registradas.</p></div>';
    return;
  }

  listEl.innerHTML = DB.purchases.map((purchase) => `
    <div class="purchase-card ${purchase.status === 'pagado' ? 'is-paid' : ''}">
      <div class="sale-top">
        <div>
          <div class="sale-id">${purchase.id}</div>
          <div class="sale-client">${purchase.supplier}</div>
        </div>
        <span class="sale-status ${purchase.status === 'pagado' ? 'paid' : 'pending'}">${purchase.status === 'pagado' ? 'Pagado' : 'Pendiente'}</span>
      </div>
      <div class="sale-body">
        <div class="sale-row"><span>Factura</span><strong>${purchase.invoice}</strong></div>
        <div class="sale-row"><span>Fecha</span><strong>${formatDate(purchase.date)}</strong></div>
        <div class="sale-row"><span>Vencimiento</span><strong>${formatDate(purchase.dueDate)}</strong></div>
        <div class="sale-row"><span>Monto</span><strong class="sale-amount">${formatMoney(purchase.amount)}</strong></div>
      </div>
      <div class="sale-actions">
        <button class="btn btn-secondary" type="button" onclick="markPurchasePaid('${purchase.id}')" ${purchase.status === 'pagado' ? 'disabled' : ''}>Pagar</button>
        ${userHasPermission('delete_records') ? `<button class="btn btn-secondary" type="button" onclick="deletePurchase('${purchase.id}')">🗑️ Eliminar</button>` : ''}
      </div>
    </div>
  `).join('');
}

function markPurchasePaid(purchaseId) {
  const purchase = DB.purchases.find(item => item.id === purchaseId);
  if (!purchase) return;
  purchase.status = 'pagado';
  purchase.dueDate = purchase.dueDate || new Date().toISOString().slice(0, 10);
  persistAppState();
  renderPurchases();
  showToast('Pago registrado', 'success');
}

function deletePurchase(purchaseId) {
  if (!userHasPermission('delete_records')) {
    showToast('Solo un administrador puede eliminar compras.', 'info');
    return;
  }
  const purchase = DB.purchases.find(item => item.id === purchaseId);
  if (!purchase || !confirm(`¿Eliminar la compra ${purchase.id}?`)) return;

  DB.purchases = DB.purchases.filter(item => item.id !== purchaseId);
  persistAppState();
  renderPurchases();
  renderReports();
  showToast('Compra eliminada', 'info');
}

function openNewSupplier() {
  if (!userHasPermission('new_supplier')) {
    showToast('Solo un administrador puede agregar proveedores.', 'info');
    return;
  }

  const form = document.getElementById('new-supplier-form');
  if (form) form.reset();
  openModal('modal-new-supplier');
}

function openNewSale() {
  if (!userHasPermission('new_sale')) {
    showToast('No tenés permisos para registrar ventas.', 'info');
    return;
  }

  const form = document.getElementById('new-sale-form');
  if (form) form.reset();
  document.getElementById('sale-due-date').value = new Date().toISOString().slice(0, 10);
  openModal('modal-new-sale');
}

function openNewPurchase() {
  if (!userHasPermission('new_purchase')) {
    showToast('Solo un administrador puede registrar compras.', 'info');
    return;
  }

  const form = document.getElementById('new-purchase-form');
  if (form) form.reset();
  document.getElementById('purchase-due-date').value = new Date().toISOString().slice(0, 10);
  openModal('modal-new-purchase');
}

function saveNewSale() {
  const client = document.getElementById('sale-client').value.trim();
  const amount = parseFloat(document.getElementById('sale-amount').value) || 0;
  const invoice = document.getElementById('sale-invoice').value.trim();
  const dueDate = document.getElementById('sale-due-date').value || new Date().toISOString().slice(0, 10);
  const status = document.getElementById('sale-status').value;

  if (!client || !amount) {
    alert('Completá cliente y monto de la venta.');
    return;
  }

  DB.sales.unshift({
    id: 'V-' + String((DB.sales.length || 0) + 2001),
    client,
    amount,
    status,
    dueDate,
    date: new Date().toISOString().slice(0, 10),
    invoice: invoice || 'FV-' + String((DB.sales.length || 0) + 1042),
  });

  persistAppState();
  closeModal('modal-new-sale');
  renderSales();
  renderReports();
  showToast('Venta registrada', 'success');
}

function saveNewPurchase() {
  const supplier = document.getElementById('purchase-supplier').value.trim();
  const invoice = document.getElementById('purchase-invoice').value.trim();
  const amount = parseFloat(document.getElementById('purchase-amount').value) || 0;
  const status = document.getElementById('purchase-status').value;
  const dueDate = document.getElementById('purchase-due-date').value || new Date().toISOString().slice(0, 10);

  if (!supplier || !amount) {
    alert('Completá proveedor y monto de la compra.');
    return;
  }

  DB.purchases.unshift({
    id: 'P-' + String((DB.purchases.length || 0) + 3001),
    supplier,
    amount,
    status,
    dueDate,
    date: new Date().toISOString().slice(0, 10),
    invoice: invoice || 'FC-' + String((DB.purchases.length || 0) + 201),
  });

  persistAppState();
  closeModal('modal-new-purchase');
  renderPurchases();
  showToast('Compra registrada', 'success');
}

function saveNewSupplier() {
  const name = document.getElementById('supplier-name').value.trim();
  const contact = document.getElementById('supplier-contact').value.trim();
  const phone = document.getElementById('supplier-phone').value.trim();
  const email = document.getElementById('supplier-email').value.trim();
  const category = document.getElementById('supplier-category').value;
  const leadTime = document.getElementById('supplier-lead-time').value;
  const balance = parseFloat(document.getElementById('supplier-balance').value) || 0;

  if (!name || !contact) {
    alert('Completá nombre y contacto del proveedor.');
    return;
  }

  DB.suppliers.push({
    id: 'S' + String(DB.suppliers.length + 1).padStart(3, '0'),
    name,
    contact,
    phone,
    email,
    category,
    leadTime,
    balance,
    rating: 4.7,
  });

  persistAppState();
  closeModal('modal-new-supplier');
  renderSuppliers();
  showToast('Proveedor agregado', 'success');
}

// ===== REPORTS PAGE =====
let currentReportRange = 'all';

function getReportRangeStart(range) {
  if (range === 'all') return null;
  const days = Number(range) || 30;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  return start;
}

function getFilteredRepairsForRange(range = currentReportRange) {
  const start = getReportRangeStart(range);
  if (!start) return [...DB.repairs];

  return DB.repairs.filter((repair) => {
    if (!repair.dateIn) return false;
    const date = new Date(`${repair.dateIn}T00:00:00`);
    return date >= start;
  });
}

function getFilteredSalesForRange(range = currentReportRange) {
  const start = getReportRangeStart(range);
  if (!start) return [...DB.sales];

  return DB.sales.filter((sale) => {
    if (!sale.date) return false;
    const date = new Date(`${sale.date}T00:00:00`);
    return date >= start;
  });
}

function getFilteredPurchasesForRange(range = currentReportRange) {
  const start = getReportRangeStart(range);
  if (!start) return [...DB.purchases];

  return DB.purchases.filter((purchase) => {
    if (!purchase.date) return false;
    const date = new Date(`${purchase.date}T00:00:00`);
    return date >= start;
  });
}

function renderReports(range = currentReportRange) {
  currentReportRange = range;

  document.querySelectorAll('.report-filter').forEach((button) => {
    button.classList.toggle('active', button.dataset.range === currentReportRange);
  });

  const filtered = getFilteredRepairsForRange(currentReportRange);
  const filteredSales = getFilteredSalesForRange(currentReportRange);
  const filteredPurchases = getFilteredPurchasesForRange(currentReportRange);
  const total = filtered.length;
  const active = filtered.filter(r => !['entregado', 'listo'].includes(r.status)).length;
  const ready = filtered.filter(r => r.status === 'listo').length;
  const delivered = filtered.filter(r => r.status === 'entregado').length;
  const revenue = filteredSales.reduce((sum, sale) => sum + Number(sale.amount || 0), 0);
  const pending_revenue = filteredSales
    .filter(sale => sale.status === 'pendiente')
    .reduce((sum, sale) => sum + Number(sale.amount || 0), 0);
  const purchasesTotal = filteredPurchases.reduce((sum, purchase) => sum + Number(purchase.amount || 0), 0);
  const averageTicket = filteredSales.length ? revenue / filteredSales.length : 0;

  document.getElementById('rep-total').textContent = total;
  document.getElementById('rep-active').textContent = active;
  document.getElementById('rep-ready').textContent = ready;
  document.getElementById('rep-delivered').textContent = delivered;
  document.getElementById('rep-revenue').textContent = formatMoney(revenue);
  document.getElementById('rep-pending-rev').textContent = formatMoney(pending_revenue);
  document.getElementById('rep-purchases').textContent = formatMoney(purchasesTotal);
  document.getElementById('rep-result').textContent = formatMoney(revenue - purchasesTotal);
  document.getElementById('rep-clients').textContent = new Set(filtered.map(r => r.clientId)).size;
  document.getElementById('rep-products').textContent = DB.products.length;
  document.getElementById('rep-average').textContent = formatMoney(averageTicket);

  const trend = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    if (currentReportRange === '7') {
      date.setDate(date.getDate() - (5 - index));
    } else {
      date.setDate(date.getDate() - (5 - index) * (currentReportRange === '90' ? 15 : 5));
    }
    const label = date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
    const value = filteredSales
      .filter((sale) => sale.date === date.toISOString().slice(0, 10))
      .reduce((sum, sale) => sum + Number(sale.amount || 0), 0);
    return { label, value };
  });

  const maxValue = Math.max(...trend.map(p => p.value), 1);
  document.getElementById('report-trend').innerHTML = trend.map((point) => `
    <div class="report-bar-col">
      <div class="report-bar" style="height:${Math.max(18, (point.value / maxValue) * 100)}%"></div>
      <div class="report-bar-label">${point.label}</div>
    </div>
  `).join('');

  const clientMap = filteredSales.reduce((acc, sale) => {
    const client = sale.client || 'Sin cliente';
    acc[client] = (acc[client] || 0) + Number(sale.amount || 0);
    return acc;
  }, {});

  const topClients = Object.entries(clientMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  document.getElementById('report-top-clients').innerHTML = topClients.length
    ? topClients.map(([name, value]) => `
        <div class="report-client-row">
          <div class="report-client-name"><span>👤</span>${name}</div>
          <div class="report-client-value">${formatMoney(value)}</div>
        </div>
      `).join('')
    : '<div style="color:var(--gray-500);font-size:12px;padding:8px 0">Sin ventas en este período.</div>';

  const lowStock = DB.products.filter(p => p.stock <= p.minStock);
  const lowStockEl = document.getElementById('rep-low-stock');
  if (lowStock.length > 0) {
    lowStockEl.innerHTML = lowStock.map(p =>
      `<div class="info-row"><span class="key">${p.icon} ${p.name}</span><span class="val" style="color:var(--red)">${p.stock} unid.</span></div>`
    ).join('');
  } else {
    lowStockEl.innerHTML = '<div style="text-align:center;color:var(--green);font-size:13px;padding:8px">✅ Todo el stock en orden</div>';
  }

  updateStockAlertBadge();
}

function renderAgenda() {
  const container = document.getElementById('agenda-list');
  const pendingEl = document.getElementById('agenda-pending');
  const todayEl = document.getElementById('agenda-today');
  const urgentEl = document.getElementById('agenda-urgent');

  if (!container || !pendingEl || !todayEl || !urgentEl) return;

  const today = new Date().toISOString().slice(0, 10);
  const pending = DB.tasks.filter(task => task.status !== 'completado');
  const tasksDueToday = pending.filter(task => task.dueDate === today).length;
  const urgent = pending.filter(task => task.priority === 'alta').length;

  pendingEl.textContent = pending.length;
  todayEl.textContent = tasksDueToday;
  urgentEl.textContent = urgent;

  if (!DB.tasks.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">📅</div><p>No hay tareas programadas</p></div>';
    return;
  }

  const sortedTasks = [...DB.tasks].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  container.innerHTML = sortedTasks.map((task) => {
    const priorityClass = task.priority === 'alta' ? 'agenda-priority high' : task.priority === 'media' ? 'agenda-priority med' : 'agenda-priority low';
    const statusText = task.status === 'completado' ? 'Completada' : task.status === 'hoy' ? 'Hoy' : 'Pendiente';
    return `
      <div class="agenda-item ${task.status === 'completado' ? 'done' : ''}">
        <div class="agenda-main">
          <div class="agenda-icon">${task.type === 'proveedor' ? '📦' : task.type === 'seguimiento' ? '📞' : '💼'}</div>
          <div class="agenda-copy">
            <div class="agenda-title-row">
              <strong>${task.title}</strong>
              <span class="${priorityClass}">${task.priority}</span>
            </div>
            <div class="agenda-meta">${task.assignee} · ${formatDate(task.dueDate)} · ${statusText}</div>
            <div class="agenda-notes">${task.notes || 'Sin comentarios adicionales.'}</div>
          </div>
        </div>
        <div class="agenda-actions">
          <button class="mini-btn success" type="button" onclick="completeTask('${task.id}')">✅</button>
          ${userHasPermission('delete_records') ? `<button class="mini-btn danger" type="button" onclick="deleteTask('${task.id}')">🗑️</button>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function completeTask(taskId) {
  const task = DB.tasks.find(item => item.id === taskId);
  if (!task) return;
  task.status = 'completado';
  persistAppState();
  renderAgenda();
  showToast('Tarea completada', 'success');
}

function deleteTask(taskId) {
  if (!userHasPermission('delete_records')) {
    showToast('Solo un administrador puede eliminar tareas.', 'info');
    return;
  }
  const task = DB.tasks.find(item => item.id === taskId);
  if (!task || !confirm(`¿Eliminar la tarea "${task.title}"?`)) return;
  DB.tasks = DB.tasks.filter(item => item.id !== taskId);
  persistAppState();
  renderAgenda();
  showToast('Tarea eliminada', 'info');
}

function openNewTask() {
  if (!userHasPermission('new_task')) {
    showToast('No tenés permisos para crear tareas.', 'info');
    return;
  }
  const form = document.getElementById('new-task-form');
  if (form) form.reset();
  openModal('modal-new-task');
}

function saveNewTask() {
  const title = document.getElementById('task-title').value.trim();
  const type = document.getElementById('task-type').value;
  const assignee = document.getElementById('task-assignee').value.trim();
  const dueDate = document.getElementById('task-due-date').value || new Date().toISOString().slice(0, 10);
  const priority = document.getElementById('task-priority').value;
  const status = document.getElementById('task-status').value;
  const notes = document.getElementById('task-notes').value.trim();

  if (!title) {
    alert('Ingresá un título para la tarea.');
    return;
  }

  const task = {
    id: 'T-' + (DB.nextTaskId || 100),
    title,
    type,
    assignee: assignee || 'Equipo',
    dueDate,
    status,
    priority,
    notes
  };

  DB.tasks.unshift(task);
  DB.nextTaskId = (DB.nextTaskId || 100) + 1;
  persistAppState();
  closeModal('modal-new-task');
  renderAgenda();
  showToast('Tarea creada', 'success');
}

// ===== REPAIR DETAIL =====
function openRepairDetail(id) {
  const r = DB.repairs.find(x => x.id === id);
  if (!r) return;
  const isSpeaker = isSpeakerRepair(r);
  const isConsole = isConsoleRepair(r);
  const st = STATUS[r.status] || STATUS.recibido;
  const pr = PRIORITY[r.priority] || PRIORITY.media;
  const client = getClient(r.clientId);
  const repairTotal = Number(r.price || 0);
  const repairDeposit = parseMoneyAmount(r.deposit ?? r.remitoDeposit ?? 0);
  const repairBalance = Math.max(0, repairTotal - repairDeposit);
  const repairPayment = DB.sales.find(sale => sale.repairId === r.id);
  const repairPaymentAction = r.status !== 'entregado'
    ? ''
    : repairPayment
      ? '<div class="info-row"><span class="key">Pago</span><span class="val" style="color:var(--green);font-weight:700">Cobrado</span></div>'
      : repairBalance > 0
        ? `<button class="btn btn-primary" style="width:100%;margin-top:10px" onclick="collectRepairPayment('${r.id}')">💳 Registrar pago · ${formatMoney(repairBalance)}</button>`
        : '<div class="info-row"><span class="key">Pago</span><span class="val" style="color:var(--green);font-weight:700">Sin saldo pendiente</span></div>';
  const clientPhone = client?.phone && client.phone !== '—' ? client.phone : '';
  const whatsappNumber = getWhatsAppNumber(clientPhone);
  const clientPhoneMarkup = whatsappNumber
    ? `<a id="repair-whatsapp-phone-${r.id}" href="${escapeHTML(getRepairWhatsAppUrl(r))}" target="_blank" rel="noopener noreferrer" style="color:#128c7e;text-decoration:underline">${escapeHTML(clientPhone)}</a>`
    : escapeHTML(clientPhone || '—');
  const whatsappMessageSelector = whatsappNumber
    ? `<div style="margin-top:8px">
        <label class="form-label" for="repair-whatsapp-template-${r.id}">Mensaje para WhatsApp</label>
        <select id="repair-whatsapp-template-${r.id}" class="form-select" onchange="updateRepairWhatsAppLink('${r.id}')">
          <option value="status">Estado actual</option>
          <option value="received">Equipo recibido</option>
          <option value="diagnosis">Diagnóstico y presupuesto</option>
          <option value="ready">Listo para retirar</option>
          <option value="delivered">Equipo entregado</option>
        </select>
      </div>`
    : '';
  const physicalStateLabels = {
    screen: 'Pantalla',
    back: 'Tapa trasera',
    frame: 'Marco / Bisel',
    corrosion: 'Corrosión / Óxido',
    port: 'Puerto de carga',
    previous: 'Reparación anterior',
    general: 'Estado general',
    scratches: 'Rayones',
    impacts: 'Golpes visibles',
    light: 'Prende luz',
  };
  const functionalStateLabels = {
    power: 'Enciende',
    touch: 'Touch / Táctil',
    charge: 'Carga',
    sound: 'Sonido',
    microphone: 'Micrófono',
    wifi: 'WiFi',
    buttons: 'Botones',
    biometric: 'Huella / FaceID',
    discDrive: 'Lector de discos',
    hdmi: 'Imagen HDMI',
    fan: 'Ventilador',
  };
  const physicalStateRows = Object.entries(physicalStateLabels)
    .filter(([key]) => r.physicalState?.[key])
    .map(([key, label]) => `<div class="info-row"><span class="key">${label}</span><span class="val">${r.physicalState[key]}</span></div>`)
    .join('');
  const functionalStateRows = Object.entries(functionalStateLabels)
    .filter(([key]) => r.functionalState?.[key])
    .map(([key, label]) => `<div class="info-row"><span class="key">${label}</span><span class="val">${r.functionalState[key]}</span></div>`)
    .join('');

  const overlay = document.getElementById('repair-detail');
  overlay.innerHTML = `
    <div class="detail-header">
      <button class="back-btn" onclick="closeDetail('repair-detail')">
        <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <div class="detail-title">Reparación ${getRepairTicketDisplayId(r)}</div>
      <span class="badge ${st.badge}" style="margin-left:auto">${st.label}</span>
    </div>
    <div class="detail-body">
      <div class="info-block">
        <div class="info-block-title">Dispositivo</div>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
          <div style="font-size:40px">${r.deviceIcon}</div>
          <div>
            <div style="font-size:18px;font-weight:800;color:var(--navy)">${r.device}</div>
            <div style="font-size:13px;color:var(--gray-500)">Ticket: ${getRepairTicketDisplayId(r)}</div>
          </div>
        </div>
        <div class="info-row"><span class="key">Problema</span><span class="val">${r.problem}</span></div>
        <div class="info-row"><span class="key">Diagnóstico</span><span class="val">${r.diagnosis}</span></div>
        <div class="info-row"><span class="key">Prioridad</span><span class="val"><span class="priority-dot ${pr.dot}"></span>${pr.label}</span></div>
        <div class="info-row"><span class="key">Progreso</span><span class="val">${clampProgress(r.progress)}%</span></div>
        <div style="margin-top:8px">
          <div class="progress-bar-wrap" style="height:8px">
            <div class="progress-bar-fill" style="width:${clampProgress(r.progress)}%"></div>
          </div>
        </div>
      </div>

      ${r.brand || r.model || r.color || r.imei1 || r.serial || (!isSpeaker && !isConsole && r.capacity) ? `
      <div class="info-block">
        <div class="info-block-title">Equipo</div>
        ${r.brand ? `<div class="info-row"><span class="key">Marca</span><span class="val">${r.brand}</span></div>` : ''}
        ${r.model ? `<div class="info-row"><span class="key">Modelo</span><span class="val">${r.model}</span></div>` : ''}
        ${r.color ? `<div class="info-row"><span class="key">Color</span><span class="val">${r.color}</span></div>` : ''}
        ${r.capacity && !isSpeaker && !isConsole ? `<div class="info-row"><span class="key">Capacidad</span><span class="val">${r.capacity}</span></div>` : ''}
        ${r.imei1 ? `<div class="info-row"><span class="key">${isSpeaker ? 'IMEI / Serie' : 'IMEI'}</span><span class="val">${r.imei1}</span></div>` : ''}
        ${r.serial ? `<div class="info-row"><span class="key">Serie</span><span class="val">${r.serial}</span></div>` : ''}
      </div>` : ''}

      ${isConsole ? `
      <div class="info-block">
        <div class="info-block-title">Accesorios entregados</div>
        ${[['joystick1', 'Joystick 1'], ['joystick2', 'Joystick 2'], ['hdmi', 'Cable HDMI'], ['power', 'Cable de poder']].map(([key, label]) => `<div class="info-row"><span class="key">${label}</span><span class="val">${r.consoleAccessories?.[key] || 'No'}</span></div>`).join('')}
      </div>` : !isSpeaker && r.accessories?.length ? `
      <div class="info-block">
        <div class="info-block-title">Accesorios</div>
        <div style="font-size:13px;color:var(--gray-700)">${r.accessories.join(' · ')}</div>
      </div>` : ''}

      ${physicalStateRows ? `
      <div class="info-block">
        <div class="info-block-title">✅ CHECK IN · Estado físico</div>
        ${physicalStateRows}
      </div>` : ''}

      ${functionalStateRows ? `
      <div class="info-block">
        <div class="info-block-title">⚙️ CHECK IN · Estado funcional</div>
        ${functionalStateRows}
      </div>` : ''}

      ${r.deviceKey || r.devicePattern?.length ? `
      <div class="info-block">
        <div class="info-block-title">🔐 Seguridad del equipo</div>
        ${r.deviceKey ? `<div class="info-row"><span class="key">PIN / Clave</span><span class="val">${r.deviceKey}</span></div>` : ''}
        ${r.devicePattern?.length ? `<div style="margin-top:8px">${patternGridPrintHTML(r.devicePattern, true)}</div>` : ''}
      </div>` : ''}

      <div class="info-block">
        <div class="info-block-title">Cliente</div>
        <div class="info-row"><span class="key">Nombre</span><span class="val">${r.client}</span></div>
        ${client ? `<div class="info-row"><span class="key">Teléfono</span><span class="val">${clientPhoneMarkup}</span></div>${whatsappMessageSelector}` : ''}
        ${client ? `<div class="info-row"><span class="key">Email</span><span class="val">${client.email}</span></div>` : ''}
      </div>

      <div class="info-block">
        <div class="info-block-title">Fechas y Precio</div>
        <div class="info-row"><span class="key">Ingreso</span><span class="val">${formatDate(r.dateIn)}</span></div>
        <div class="info-row"><span class="key">Entrega estimada</span><span class="val">${formatDate(r.dateEst)}</span></div>
        <div class="info-row"><span class="key">Precio</span><span class="val" style="color:var(--blue);font-size:16px">${formatMoney(r.price)}</span></div>
        <div class="info-row"><span class="key">Anticipo / Seña</span><span class="val" style="color:var(--green);font-size:16px">${formatMoney(r.deposit || 0)}</span></div>
        <div class="info-row"><span class="key">Total pendiente</span><span class="val" style="color:var(--blue);font-size:16px;font-weight:800">${formatMoney(repairBalance)}</span></div>
        ${repairPaymentAction}
      </div>

      ${r.parts.length > 0 ? `
      <div class="info-block">
        <div class="info-block-title">Repuestos utilizados</div>
        ${r.parts.map(p => `<div class="info-row"><span class="key">🔩</span><span class="val">${p}</span></div>`).join('')}
      </div>` : ''}

      ${r.notes ? `
      <div class="info-block">
        <div class="info-block-title">Notas</div>
        <div style="font-size:13px;color:var(--gray-700)">${r.notes}</div>
      </div>` : ''}

      <div class="info-block">
        <div class="info-block-title">Historial</div>
        ${r.history.map(h => `
          <div class="info-row">
            <span class="key">${formatDate(h.date)}</span>
            <span class="val">${h.action}</span>
          </div>
        `).join('')}
      </div>

      <div style="display:flex;flex-direction:column;gap:10px;margin-top:4px">
        <button class="btn btn-primary" onclick="printVoletas('${r.id}')">🖨️ Voletas (cliente + taller + etiqueta)</button>
        <button class="btn btn-outline" onclick="printSticker('${r.id}')">🏷️ Solo etiqueta equipo</button>
        <button class="btn btn-outline" onclick="openEditRepair('${r.id}')">✏️ Editar Reparación</button>
        ${userHasPermission('delete_records') ? `<button class="btn btn-outline" style="color:var(--red);border-color:var(--red)" onclick="deleteRepair('${r.id}')">🗑️ Eliminar Reparación</button>` : ''}
      </div>
    </div>
  `;
  overlay.classList.add('open');
}

function deleteRepair(id) {
  if (!userHasPermission('delete_records')) {
    showToast('Solo un administrador puede eliminar reparaciones.', 'info');
    return;
  }
  const repair = DB.repairs.find(item => item.id === id);
  if (!repair || !confirm(`¿Eliminar la reparación ${getRepairTicketDisplayId(repair)}? Esta acción no se puede deshacer.`)) return;

  DB.repairs = DB.repairs.filter(item => item.id !== id);
  DB.clients.forEach(client => {
    client.repairs = Array.isArray(client.repairs) ? client.repairs.filter(repairId => repairId !== id) : [];
  });
  persistAppState();
  closeDetail('repair-detail');
  renderRepairs();
  renderHome();
  renderClients();
  renderReports();
  showToast('Reparación eliminada', 'info');
}

// ===== CLIENT DETAIL =====
function openClientDetail(id) {
  const c = DB.clients.find(x => x.id === id);
  if (!c) return;
  const clientRepairs = DB.repairs.filter(r => c.repairs.includes(r.id));

  const overlay = document.getElementById('client-detail');
  overlay.innerHTML = `
    <div class="detail-header">
      <button class="back-btn" onclick="closeDetail('client-detail')">
        <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <div class="detail-title">${c.name}</div>
    </div>
    <div class="detail-body">
      <div style="text-align:center;padding:20px 0">
        <div style="width:72px;height:72px;background:var(--blue-light);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;color:var(--blue);margin:0 auto 12px">${initials(c.name)}</div>
        <div style="font-size:20px;font-weight:800;color:var(--navy)">${c.name}</div>
        <div style="font-size:13px;color:var(--gray-500)">Cliente desde ${formatDate(c.dateAdded)}</div>
      </div>

      <div class="info-block">
        <div class="info-block-title">Contacto</div>
        <div class="info-row"><span class="key">📞 Teléfono</span><span class="val">${c.phone}</span></div>
        <div class="info-row"><span class="key">✉️ Email</span><span class="val">${c.email}</span></div>
        <div class="info-row"><span class="key">📍 Dirección</span><span class="val">${c.address}</span></div>
      </div>

      <div class="info-block">
        <div class="info-block-title">Reparaciones (${clientRepairs.length})</div>
        ${clientRepairs.length === 0
          ? '<div style="text-align:center;color:var(--gray-400);font-size:13px;padding:8px">Sin reparaciones</div>'
          : clientRepairs.map(r => {
              const st = STATUS[r.status] || STATUS.recibido;
              return `
                <div class="info-row" style="cursor:pointer" onclick="closeDetail('client-detail');openRepairDetail('${r.id}')">
                  <span class="key">${r.deviceIcon} ${r.device}</span>
                  <span class="val"><span class="badge ${st.badge}">${st.label}</span></span>
                </div>`;
            }).join('')
        }
      </div>

      <button class="btn btn-primary" onclick="openNewRepairForClient('${c.id}')">🔧 Nueva Reparación</button>
      ${userHasPermission('delete_records') ? `<button class="btn btn-outline" style="color:var(--red);border-color:var(--red)" onclick="deleteClient('${c.id}')">🗑️ Eliminar Cliente</button>` : ''}
    </div>
  `;
  overlay.classList.add('open');
}

// ===== PRODUCT DETAIL =====
function openProductDetail(id) {
  const p = DB.products.find(x => x.id === id);
  if (!p) return;
  const low = p.stock <= p.minStock;

  const overlay = document.getElementById('product-detail');
  overlay.innerHTML = `
    <div class="detail-header">
      <button class="back-btn" onclick="closeDetail('product-detail')">
        <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <div class="detail-title">${p.name}</div>
    </div>
    <div class="detail-body">
      <div style="text-align:center;padding:20px 0">
        <div style="font-size:56px;margin-bottom:8px">${p.icon}</div>
        <div style="font-size:18px;font-weight:800;color:var(--navy)">${p.name}</div>
        <div style="font-size:13px;color:var(--gray-500)">${p.category}</div>
      </div>

      <div class="info-block">
        <div class="info-block-title">Stock</div>
        <div class="info-row">
          <span class="key">Stock actual</span>
          <span class="val" style="${low ? 'color:var(--red)' : 'color:var(--green)'};font-size:20px;font-weight:800">${p.stock} unid.</span>
        </div>
        <div class="info-row"><span class="key">Stock mínimo</span><span class="val">${p.minStock} unid.</span></div>
        ${low ? '<div style="background:var(--red-light);color:var(--red);padding:8px 12px;border-radius:8px;font-size:12px;font-weight:600;margin-top:8px">⚠️ Stock bajo el mínimo recomendado</div>' : ''}
      </div>

      <div class="info-block">
        <div class="info-block-title">Precios</div>
        <div class="info-row"><span class="key">Precio de venta</span><span class="val" style="color:var(--blue);font-weight:700">${formatMoney(p.price)}</span></div>
        <div class="info-row"><span class="key">Costo</span><span class="val">${formatMoney(p.cost)}</span></div>
        <div class="info-row"><span class="key">Margen</span><span class="val" style="color:var(--green)">${formatMoney(p.price - p.cost)} (${Math.round((p.price-p.cost)/p.price*100)}%)</span></div>
      </div>

      <div style="display:flex;gap:10px;margin-top:4px">
        <button class="btn btn-outline" style="flex:1" onclick="adjustStock('${p.id}', -1)">− Restar</button>
        <button class="btn btn-primary" style="flex:1" onclick="adjustStock('${p.id}', 1)">+ Agregar</button>
      </div>
      ${userHasPermission('delete_records') ? `<button class="btn btn-outline" style="width:100%;margin-top:10px;color:var(--red);border-color:var(--red)" onclick="deleteProduct('${p.id}')">🗑️ Eliminar producto</button>` : ''}
    </div>
  `;
  overlay.classList.add('open');
}

function adjustStock(id, delta) {
  const p = DB.products.find(x => x.id === id);
  if (!p) return;
  p.stock = Math.max(0, p.stock + delta);
  openProductDetail(id);
  renderInventory();
  updateStockAlertBadge();
}

function deleteProduct(id) {
  if (!userHasPermission('delete_records')) {
    showToast('Solo un administrador puede eliminar productos.', 'info');
    return;
  }
  const product = DB.products.find(item => item.id === id);
  if (!product || !confirm(`¿Eliminar el producto "${product.name}"?`)) return;

  DB.products = DB.products.filter(item => item.id !== id);
  persistAppState();
  closeDetail('product-detail');
  renderInventory();
  renderSpareParts();
  renderReports();
  updateStockAlertBadge();
  showToast('Producto eliminado', 'info');
}

function closeDetail(id) {
  document.getElementById(id).classList.remove('open');
}

// ===== REMITO (Repair Receipt) =====
function generateRemitoHTML(repair, client, copyLabel) {
  const isNotebook = isNotebookRepair(repair);
  const isSpeaker = isSpeakerRepair(repair);
  const isConsole = isConsoleRepair(repair);
  const today = new Date().toISOString().split('T')[0];
  const checkInDate = repair.dateIn || today;
  const clientName = client ? client.name : repair.client;
  const clientPhone = client ? client.phone : '';
  const clientDNI = client?.dni || repair.clientDni || '';
  const deviceModel = repair.device || '';
  const imei = repair.imei1 || '';
  const problem = repair.problem || '';
  const price = repair.price || 0;
  const deposit = parseMoneyAmount(repair.deposit ?? repair.remitoDeposit ?? 0);
  const copyKey = copyLabel.replace(/\s/g, '');

  const checkInGroups = [
    {
      title: 'Estado físico',
      stateKey: 'physicalState',
      state: repair.physicalState || {},
      groups: isSpeaker ? [
        ['general', 'Estado general', ['OK', 'Regular', 'Malo']],
        ['scratches', 'Rayones', ['No', 'Leves', 'Severos']],
        ['impacts', 'Golpes visibles', ['No', 'Leves', 'Severos']],
        ['light', 'Prende luz', ['Sí', 'No']],
      ] : isNotebook || isConsole ? [
        ['general', 'Estado general', ['OK', 'Regular', 'Malo']],
        ['scratches', 'Rayones', ['No', 'Leves', 'Severos']],
        ['impacts', 'Golpes visibles', ['No', 'Leves', 'Severos']],
      ] : [
        ['screen', 'Pantalla', ['OK', 'Rayada', 'Rota']],
        ['back', 'Tapa trasera', ['OK', 'Despegada', 'Rayada', 'Rota']],
        ['frame', 'Marco / Bisel', ['OK', 'Doblado', 'Dañado']],
        ['corrosion', 'Corrosión / Óxido', ['No', 'Leve', 'Severa']],
        ['port', 'Puerto de carga', ['OK', 'Sucio', 'Dañado']],
        ['previous', 'Reparación anterior', ['No', 'Sí']],
        ['general', 'Estado general', ['OK', 'Regular', 'Malo']],
        ['scratches', 'Rayones', ['No', 'Leves', 'Severos']],
        ['impacts', 'Golpes visibles', ['No', 'Leves', 'Severos']],
      ],
    },
    ...(!isSpeaker ? [{
      title: 'Estado funcional',
      stateKey: 'functionalState',
      state: repair.functionalState || {},
      groups: isConsole ? CONSOLE_FUNCTIONAL_GROUPS : isNotebook ? NOTEBOOK_FUNCTIONAL_GROUPS : [
        ['power', 'Enciende', ['OK', 'No', 'No probado']],
        ['touch', 'Touch / Táctil', ['OK', 'Falla', 'No probado']],
        ['charge', 'Carga', ['OK', 'No', 'No probado']],
        ['sound', 'Sonido', ['OK', 'Falla', 'No probado']],
        ['microphone', 'Micrófono', ['OK', 'Falla', 'No probado']],
        ['wifi', 'WiFi', ['OK', 'Falla', 'No probado']],
        ['buttons', 'Botones', ['OK', 'Falla', 'No probado']],
        ['biometric', 'Huella / FaceID', ['OK', 'Falla', 'No tiene']],
      ],
    }] : []),
    ...(isConsole ? [{
      title: 'Accesorios entregados',
      stateKey: 'consoleAccessories',
      state: repair.consoleAccessories || {},
      groups: [
        ['joystick1', 'Joystick 1', ['No', 'Sí']],
        ['joystick2', 'Joystick 2', ['No', 'Sí']],
        ['hdmi', 'Cable HDMI', ['No', 'Sí']],
        ['power', 'Cable de poder', ['No', 'Sí']],
      ],
    }] : []),
  ];

  const renderCheckInGroups = (prefix, states, includeAccessories = true) => checkInGroups
    .filter(section => includeAccessories || section.stateKey !== 'consoleAccessories')
    .map((section) => `
    <div class="remito-checkin-section">
      <div class="remito-checkin-title">${section.title}</div>
      ${section.groups.map(([key, label, options]) => `
        <div class="remito-checkin-row">
          <strong>${label}</strong>
          <div class="remito-checkin-options">
            ${options.map((option, index) => `
              <label>
                <input type="radio" name="${copyKey}-${prefix}-${key}" value="${option}" ${states[section.stateKey]?.[key] === option ? 'checked' : ''}>
                ${option}
              </label>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `).join('');
  const checkInHTML = renderCheckInGroups('checkin', {
    physicalState: repair.physicalState || {},
    functionalState: repair.functionalState || {},
    consoleAccessories: repair.consoleAccessories || {},
  });
  const checkOutHTML = renderCheckInGroups('checkout', {
    physicalState: repair.checkoutPhysicalState || {},
    functionalState: repair.checkoutFunctionalState || {},
  }, false);

  const patternHTML = `
    <div class="remito-pattern-wrap" data-pattern-wrap="${copyKey}">
      <div class="remito-pattern-caption">Patrón digital · dibujá o tocá en orden</div>
      <div class="remito-pattern-grid" data-pattern-grid="${copyKey}">
        ${Array.from({ length: 9 }, (_, i) => {
          const step = i + 1;
          return `<button type="button" class="dot" data-step="${step}" data-copy="${copyKey}" onclick="window.__onRemitoPatternDot(this);"><span>${step}</span></button>`;
        }).join('')}
      </div>
      <button type="button" class="remito-pattern-clear" onclick="window.__clearRemitoPattern('${copyKey}')">Limpiar patrón</button>
      <div class="remito-pattern-seq" data-pattern-seq="${copyKey}">${formatPatternSequence(repair.devicePattern)}</div>
      <input type="hidden" data-remito-field="pattern-seq" value="${(repair.devicePattern || []).join(',')}">
    </div>
  `;

  const defaultBrand = getBusinessName() === DEFAULT_BUSINESS_NAME;
  const brandHTML = getBusinessNameMarkup();

  return `
    <div class="remito-form" data-remito-copy="${copyLabel}">
      <div class="remito-copy-label">${copyLabel}</div>
      <div class="remito-header">
        <div class="remito-brand">${brandHTML}${defaultBrand ? ' servicio técnico' : ''}</div>
        <h2>${isNotebook ? 'Remito de Notebook' : 'Servicio Técnico Remito'}</h2>
        <div class="remito-ticket">N° ${getRepairTicketDisplayId(repair)}</div>
      </div>
      <div class="remito-body">
        <div class="remito-col">
          <div class="remito-col-title">Recepción</div>
          <div class="remito-date-field">
            <strong>Fecha:</strong>
            <input type="date" value="${checkInDate}" class="remito-input-date">
          </div>
          <div style="font-weight:700;font-size:10px;text-transform:uppercase;margin-bottom:4px;color:var(--blue)">CHECK IN</div>
          ${checkInHTML}
        </div>

        <div class="remito-col">
          <div class="remito-center-fields">
            <div class="remito-field">
              <label>Nombre:</label>
              <input type="text" value="${clientName}" data-remito-field="client-name">
            </div>
            <div class="remito-field">
              <label>DNI:</label>
              <input type="text" value="${clientDNI}" placeholder="—" data-remito-field="client-dni">
            </div>
            <div class="remito-field">
              <label>WhatsApp:</label>
              <input type="text" value="${clientPhone}" data-remito-field="client-phone">
            </div>
            ${isConsole
              ? `<div class="remito-field"><label>Modelo:</label><input type="text" value="${escapeHTML(repair.model || '')}" data-remito-field="model"></div>`
              : `<div class="remito-field"><label>Marca/Modelo:</label><input type="text" value="${deviceModel}" data-remito-field="device"></div>`}
            ${!isConsole ? `<div class="remito-field"><label>${isNotebook || isSpeaker ? 'IMEI / N° Serie:' : 'IMEI:'}</label><input type="text" value="${imei}" placeholder="—" data-remito-field="imei"></div>` : ''}
              ${isSpeaker || isConsole ? `<div class="remito-field"><label>Color:</label><input type="text" value="${repair.color || ''}" placeholder="—" data-remito-field="color"></div>` : ''}
            <div class="remito-field" style="align-items:flex-start">
              <label>Falla:</label>
              <textarea data-remito-field="problem">${problem}</textarea>
            </div>
            <div class="remito-field" style="align-items:flex-start">
              <label>Clave/Patrón:</label>
              <div>
                <input type="text" placeholder="PIN o clave" style="margin-bottom:4px" value="${repair.deviceKey || ''}" data-remito-field="pattern-key">
                ${patternHTML}
              </div>
            </div>
            <div class="remito-field">
              <label>Presupuesto:</label>
              <input type="text" value="${price > 0 ? '$' + Number(price).toLocaleString('es-AR') : ''}" data-remito-field="price">
            </div>
            <div class="remito-field">
              <label>Aprobado:</label>
              <select data-remito-field="approved">
                <option value="">—</option>
                <option value="si">Sí</option>
                <option value="no">No</option>
              </select>
            </div>
            <div class="remito-field">
              <label>Seña:</label>
              <input type="text" value="${deposit > 0 ? '$' + Number(deposit).toLocaleString('es-AR') : ''}" placeholder="$0" data-remito-field="deposit">
            </div>
            <div class="remito-field" style="align-items:flex-start">
              <label>Resultado:</label>
              <div class="remito-result-options">
                <label><input type="radio" name="result-${copyKey}" value="reparado"> Reparado</label>
                <label><input type="radio" name="result-${copyKey}" value="no_se_pudo"> No se pudo</label>
                <label><input type="radio" name="result-${copyKey}" value="no_responde"> Cliente no responde</label>
              </div>
            </div>
            <div class="remito-field" style="align-items:flex-start">
              <label>Diag. Técnico:</label>
              <textarea placeholder="Diagnóstico técnico..." data-remito-field="diagnosis">${repair.diagnosis && repair.diagnosis !== 'Pendiente de diagnóstico' ? repair.diagnosis : ''}</textarea>
            </div>
          </div>
        </div>

        <div class="remito-col">
          <div class="remito-col-title">Entrega</div>
          <div class="remito-date-field">
            <strong>Fecha:</strong>
            <input type="date" value="" class="remito-input-date">
          </div>
          <div style="font-weight:700;font-size:10px;text-transform:uppercase;margin-bottom:4px;color:var(--blue)">CHECK OUT</div>
          ${checkOutHTML}
        </div>
      </div>

      <div class="remito-footer">
        <div class="remito-signatures">
          <div class="remito-sig-block">
            <div class="remito-sig-line">Responsable</div>
          </div>
          <div class="remito-sig-block">
            <div class="remito-sig-line">Cliente</div>
          </div>
        </div>
        <div class="remito-legal">${escapeHTML(getStoredTerms(REMITO_TERMS_KEY, DEFAULT_REMITO_TERMS))}</div>
      </div>
    </div>
  `;
}

function openRemito(repairId) {
  const repair = DB.repairs.find(r => r.id === repairId);
  if (!repair) return;

  const client = getClient(repair.clientId);
  const content = [
    generateRemitoHTML(repair, client, 'ORIGINAL'),
    `<div class="remito-copy-print">${generateRemitoHTML(repair, client, 'COPIA')}</div>`
  ].join('');

  const win = window.open('', '_blank');

  win.document.write(`
  <!DOCTYPE html>
  <html>
  <head>
  <meta charset="UTF-8">
  <title>Remito Servicio Técnico</title>

  <style>
  :root{
      --remito-page-width: 190mm;
      --remito-scale: 1;
  }

  @page{
      size:A4 portrait;
      margin:10mm;
  }

  *{ box-sizing:border-box; }

  body{
      font-family: Arial, sans-serif;
      background:#f2f2f2;
      color:#000;
      margin:0;
      padding:0;
  }

  .remito-toolbar{
      position:sticky;
      top:0;
      z-index:20;
      display:flex;
      gap:8px;
      flex-wrap:wrap;
      justify-content:center;
      padding:12px;
      background:#f2f2f2;
      border-bottom:1px solid #ddd;
  }

  .remito-toolbar button{
      background:#0072BB;
      color:white;
      border:none;
      padding:8px 14px;
      border-radius:8px;
      cursor:pointer;
      font-size:13px;
      font-weight:700;
  }

  .remito-toolbar button.is-active{
      background:#005a96;
  }

    .remito-print-menu{
      position:relative;
    }

    .remito-print-menu summary{
      list-style:none;
      background:#0072BB;
      color:white;
      border-radius:8px;
      padding:8px 14px;
      cursor:pointer;
      font-size:13px;
      font-weight:700;
    }

    .remito-print-menu summary::-webkit-details-marker{
      display:none;
    }

    .remito-print-menu summary::after{
      content:' ▾';
    }

    .remito-print-options{
      position:absolute;
      top:calc(100% + 5px);
      left:0;
      z-index:30;
      display:flex;
      flex-direction:column;
      gap:4px;
      min-width:190px;
      padding:6px;
      background:#fff;
      border:1px solid #d5dce2;
      border-radius:6px;
      box-shadow:0 4px 12px #0002;
    }

    .remito-toolbar .remito-print-options button{
      width:100%;
      text-align:left;
      border-radius:4px;
    }

    .remito-print-options-label{
      padding:4px 8px 0;
      color:#666;
      font-size:10px;
      font-weight:700;
      text-transform:uppercase;
    }

  .remito-stage{
      display:flex;
      justify-content:center;
      padding:12px 10px 20px;
  }

  .remito-page{
      width:min(100%, var(--remito-page-width));
      transform:scale(var(--remito-scale));
      transform-origin: top center;
      display:flex;
      flex-direction:column;
      gap:12px;
  }

    .remito-copy-print{
      display:none;
    }

  .remito-form{
      border:2px solid #0072BB;
      margin:0;
      page-break-inside:avoid;
      background:white;
  }

  .remito-copy-label{
      background:#0072BB;
      color:white;
      text-align:center;
      font-size:14px;
      font-weight:bold;
      padding:6px;
  }

  .remito-header{
      text-align:center;
      padding:8px 10px;
      border-bottom:2px solid #0072BB;
  }

  .remito-brand{
      font-size:20px;
      font-weight:bold;
      color:#000;
      letter-spacing:0.2px;
    }

    .remito-brand .brand-blue{
      color:#0072BB;
  }

  .remito-ticket{
      font-size:16px;
      font-weight:bold;
      margin-top:4px;
  }

  .remito-body{
      display:grid;
      grid-template-columns:0.95fr 1.6fr 0.95fr;
  }

  .remito-col{
      padding:7px;
      border-right:1px solid #ccc;
  }

  .remito-col:last-child{
      border-right:none;
  }

  .remito-col-title{
      font-weight:bold;
      text-align:center;
      color:#0072BB;
      margin-bottom:8px;
  }

  .remito-field{
      display:flex;
      margin-bottom:4px;
      align-items:center;
  }

  .remito-field label{
      width:74px;
      font-size:10px;
      font-weight:bold;
  }

  .remito-field input,
  .remito-field textarea,
  .remito-field select{
      flex:1;
      border:none;
      border-bottom:1px solid #aaa;
      font-size:10px;
      padding:2px;
  }

  textarea{
      min-height:34px;
  }

  .remito-checklist{
      list-style:none;
      padding:0;
      margin:0;
  }

  .remito-checklist li{
      margin-bottom:3px;
      font-size:9px;
  }

    .remito-checkin-section{
      margin-bottom:7px;
    }

    .remito-checkin-title{
      color:#0072BB;
      font-size:9px;
      font-weight:700;
      text-transform:uppercase;
      margin-bottom:3px;
    }

    .remito-checkin-row{
      margin-bottom:3px;
      font-size:8px;
    }

    .remito-checkin-row strong{
      display:block;
      margin-bottom:1px;
    }

    .remito-checkin-options{
      display:flex;
      flex-wrap:wrap;
      gap:2px 5px;
    }

    .remito-checkin-options label{
      display:flex;
      align-items:center;
      gap:2px;
      white-space:nowrap;
    }

    .remito-checkin-options input{
      width:10px;
      height:10px;
      margin:0;
    }

  .remito-pattern-wrap{
      display:flex;
      flex-direction:column;
      gap:4px;
  }

  .remito-pattern-caption{
      font-size:9px;
      font-weight:700;
      color:#0072BB;
      text-transform:uppercase;
      letter-spacing:0.4px;
  }

  .remito-pattern-grid{
      display:grid;
      grid-template-columns:repeat(3, 22px);
      gap:4px;
      align-items:center;
      justify-content:start;
      width:max-content;
  }

  .remito-pattern-grid .dot{
      width:22px;
      height:22px;
      border-radius:50%;
      border:1.5px solid #999;
      background:#fff;
      color:#666;
      font-size:9px;
      font-weight:700;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:0;
        box-shadow: inset 0 0 0 1px rgba(255,255,255,0.65);
  }

  .remito-pattern-grid .dot.active{
      background:#0072BB;
      border-color:#0072BB;
      color:#fff;
  }

  .remito-pattern-clear{
      margin-top:4px;
      width:100%;
      border:1px solid #ccc;
      background:#f5f5f5;
      border-radius:6px;
      padding:4px 6px;
      font-size:9px;
      font-weight:700;
      cursor:pointer;
  }

  .remito-pattern-seq{
      margin-top:4px;
      font-size:9px;
      font-weight:700;
      color:#0072BB;
      text-align:center;
  }

    .remito-pattern-grid .dot.is-start,
    .remito-pattern-grid .dot.is-end{
      box-shadow: 0 0 0 2px rgba(0,114,187,0.2);
      transform: scale(1.03);
    }

    .remito-pattern-grid .dot.is-start{
      outline: 1px solid rgba(0,114,187,0.45);
    }

    .remito-pattern-grid .dot.is-end{
      outline: 1px solid rgba(0,114,187,0.7);
    }

  .remito-result-options{
      display:flex;
      gap:6px;
      flex-wrap:wrap;
      margin:2px 0;
  }

  .remito-result-options label{
      display:flex;
      align-items:center;
      gap:3px;
      font-size:9px;
      font-weight:500;
      min-width:auto;
  }

  .remito-result-options input[type="radio"]{
      width:12px;
      height:12px;
      accent-color:#0072BB;
  }

  .remito-footer{
      border-top:2px solid #0072BB;
      padding:8px;
  }

  .remito-signatures{
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:20px;
      margin-top:6px;
      margin-bottom:8px;
  }

  .remito-sig-block{
      text-align:center;
  }

  .remito-sig-line{
      border-top:1px solid black;
      margin-top:26px;
      padding-top:4px;
      font-size:10px;
      font-weight:700;
      color:#000;
  }

  .remito-legal{
      font-size:7px;
      text-align:justify;
      color:#555;
      line-height:1.3;
  }

    .remito-legal strong,
    .remito-legal b{
      color:#000;
    }

  .no-print{
      text-align:center;
      margin:20px;
  }

  .remito-toolbar button,
  .no-print button{
      background:#0072BB;
      color:white;
      border:none;
      padding:10px 20px;
      border-radius:8px;
      cursor:pointer;
      font-size:15px;
      font-weight:700;
  }

  @media print{
      @page{
          margin:8mm;
      }
      body{
          background:white;
      }
      .no-print,
      .remito-toolbar{
          display:none !important;
      }
      .remito-stage{
          padding:0;
      }
      .remito-page{
          width:100%;
          transform:none;
          gap:0;
      }
      .remito-form{
          margin:0;
          box-shadow:none;
      }
      .remito-copy-print{
          display:block;
      }
        .remito-body{
          grid-template-columns: 0.9fr 1.5fr 0.9fr;
        }
        .remito-field,
        .remito-field label,
        .remito-field input,
        .remito-field textarea,
        .remito-field select,
        .remito-checklist li,
        .remito-pattern-caption,
        .remito-result-options label,
        .remito-legal{
          font-size:9px;
        }
        .remito-brand{
          font-size:18px;
        }
        .remito-ticket{
          font-size:14px;
        }
        .remito-sig-line{
          margin-top:22px;
        }
  }

  </style>

  <script>
    const REMITO_REPAIR_ID = '${repair.id}';
    const REMITO_PATTERN = ${JSON.stringify(repair.devicePattern || [])};
    let remitoPatternPath = Array.isArray(REMITO_PATTERN) ? [...REMITO_PATTERN] : [];
    const sizeStyles = {
      a4: { page: 'A4 portrait', margin: '10mm', width: '190mm', scale: '1' },
      a5: { page: 'A5 portrait', margin: '8mm', width: '132mm', scale: '0.88' },
      ticket: { page: '80mm 297mm', margin: '4mm', width: '80mm', scale: '0.72' },
    };

    function getOriginalForm() {
      return document.querySelector('.remito-form[data-remito-copy="ORIGINAL"]');
    }

    function getOriginalField(name) {
      const form = getOriginalForm();
      return form ? form.querySelector('[data-remito-field="' + name + '"]') : null;
    }

    function parseMoney(value) {
      const normalized = String(value || '').replace(/[^0-9,.-]/g, '').replace(/\./g, '').replace(',', '.');
      const amount = parseFloat(normalized);
      return Number.isFinite(amount) ? amount : 0;
    }

    function persistRemitoData(showMessage) {
      if (!window.opener || window.opener.closed) {
        if (showMessage) alert('No se pudo guardar porque la ventana principal no está disponible.');
        return false;
      }

      const openerDB = window.opener.DB;
      const repair = openerDB && openerDB.repairs.find(r => r.id === REMITO_REPAIR_ID);
      if (!repair) {
        if (showMessage) alert('No se encontró la reparación para guardar.');
        return false;
      }

      const clientName = getOriginalField('client-name')?.value.trim() || repair.client;
      const clientPhone = getOriginalField('client-phone')?.value.trim() || '';
      const device = getOriginalField('device')?.value.trim() || repair.device;
      const modelField = getOriginalField('model');
      const imeiField = getOriginalField('imei');
      const colorField = getOriginalField('color');
      const problem = getOriginalField('problem')?.value.trim() || repair.problem;
      const price = parseMoney(getOriginalField('price')?.value || repair.price);
      const diagnosis = getOriginalField('diagnosis')?.value.trim() || '';
      const approved = getOriginalField('approved')?.value || '';
      const deposit = parseMoney(getOriginalField('deposit')?.value ?? repair.deposit ?? repair.remitoDeposit);
      const inDate = document.querySelector('.remito-form[data-remito-copy="ORIGINAL"] .remito-col:first-child .remito-input-date')?.value || repair.dateIn;
      const outDate = document.querySelector('.remito-form[data-remito-copy="ORIGINAL"] .remito-col:last-child .remito-input-date')?.value || repair.dateEst;

      repair.client = clientName;
      if (modelField) {
        repair.model = modelField.value.trim();
        repair.device = (repair.deviceType || 'Consola / joystick') + ' · ' + buildDeviceLabel('', repair.model);
      } else {
        repair.device = device;
      }
      if (imeiField) repair.imei1 = imeiField.value.trim();
      if (colorField) repair.color = colorField.value.trim();
      repair.problem = problem;
      repair.price = price;
      repair.diagnosis = diagnosis || 'Pendiente de diagnóstico';
      repair.dateIn = inDate;
      repair.dateEst = outDate;
      repair.remitoApproved = approved;
      repair.deposit = deposit;
      repair.remitoDeposit = deposit;
      repair.deviceKey = getOriginalField('pattern-key')?.value.trim() || repair.deviceKey || '';
      repair.devicePattern = [...remitoPatternPath];

      const readCheckInState = (keys) => keys.reduce((state, key) => {
        const selected = document.querySelector('input[name="ORIGINAL-checkin-' + key + '"]:checked');
        state[key] = selected?.value || '';
        return state;
      }, {});
      const readCheckOutState = (keys) => keys.reduce((state, key) => {
        const selected = document.querySelector('input[name="ORIGINAL-checkout-' + key + '"]:checked');
        state[key] = selected?.value || '';
        return state;
      }, {});
      const isNotebook = isNotebookRepair(repair);
      const isSpeaker = isSpeakerRepair(repair);
      const isConsole = isConsoleRepair(repair);
      const physicalKeys = isSpeaker
        ? ['general', 'scratches', 'impacts', 'light']
        : isNotebook || isConsole
          ? ['general', 'scratches', 'impacts']
          : ['screen', 'back', 'frame', 'corrosion', 'port', 'previous', 'general', 'scratches', 'impacts'];
      const functionalKeys = isSpeaker
        ? []
        : isConsole
          ? CONSOLE_FUNCTIONAL_GROUPS.map(([key]) => key)
          : isNotebook
          ? NOTEBOOK_FUNCTIONAL_GROUPS.map(([key]) => key)
          : ['power', 'touch', 'charge', 'sound', 'microphone', 'wifi', 'buttons', 'biometric'];
      repair.physicalState = readCheckInState(physicalKeys);
      repair.functionalState = readCheckInState(functionalKeys);
      repair.checkoutPhysicalState = readCheckOutState(physicalKeys);
      repair.checkoutFunctionalState = readCheckOutState(functionalKeys);
      if (isConsole) repair.consoleAccessories = readCheckInState(['joystick1', 'joystick2', 'hdmi', 'power']);

      const patternField = getOriginalField('pattern-seq');
      if (patternField) patternField.value = remitoPatternPath.join(',');

      let client = repair.clientId ? openerDB.clients.find(c => c.id === repair.clientId) : null;
      if (!client && clientName) {
        client = openerDB.clients.find(c => c.name.toLowerCase() === clientName.toLowerCase()) || null;
      }

      if (client) {
        repair.clientId = client.id;
        client.name = clientName;
        if (clientPhone) client.phone = clientPhone;
        if (!Array.isArray(client.repairs)) client.repairs = [];
        if (!client.repairs.includes(repair.id)) client.repairs.push(repair.id);
      } else if (clientName) {
        const newClient = {
          id: 'C' + String(openerDB.nextClientId++).padStart(3, '0'),
          name: clientName,
          phone: clientPhone || '—',
          email: '',
          address: '',
          dateAdded: new Date().toISOString().split('T')[0],
          repairs: [repair.id]
        };
        openerDB.clients.push(newClient);
        repair.clientId = newClient.id;
        const isConsole = isConsoleRepair(repair);

      if (typeof window.opener.persistAppState === 'function') window.opener.persistAppState();

      if (typeof window.opener.renderHome === 'function') window.opener.renderHome();
      if (typeof window.opener.renderRepairs === 'function') window.opener.renderRepairs();
      if (typeof window.opener.renderClients === 'function') window.opener.renderClients();
      if (typeof window.opener.renderInventory === 'function') window.opener.renderInventory();
      if (typeof window.opener.renderReports === 'function') window.opener.renderReports();

      if (showMessage) alert('Datos guardados.');
      return true;
    }

    function printPhoneLabel() {
      persistRemitoData(false);
      if (window.opener && !window.opener.closed && typeof window.opener.printSticker === 'function') {
        window.opener.printSticker(REMITO_REPAIR_ID);
      }
    }

    function updateRemitoPatternUI(copyKey) {
      const form = copyKey === 'COPIA'
        ? document.querySelector('.remito-copy-print .remito-form[data-remito-copy="COPIA"]')
        : getOriginalForm();
      if (!form) return;

      const activeSet = new Set(remitoPatternPath);
      form.querySelectorAll('.remito-pattern-grid .dot').forEach(dot => {
        const step = Number(dot.dataset.step || 0);
        const order = remitoPatternPath.indexOf(step);
        const isActive = order >= 0;
        dot.classList.toggle('active', isActive);
        dot.classList.toggle('is-start', step === remitoPatternPath[0]);
        dot.classList.toggle('is-end', step === remitoPatternPath[remitoPatternPath.length - 1] && remitoPatternPath.length > 0);
        const label = dot.querySelector('span');
        if (label) label.textContent = isActive ? String(order + 1) : String(step);
      });

      form.querySelectorAll('[data-pattern-seq]').forEach(el => {
        el.textContent = remitoPatternPath.length ? remitoPatternPath.join(' → ') : '—';
      });

      const hidden = form.querySelector('[data-remito-field="pattern-seq"]');
      if (hidden) hidden.value = remitoPatternPath.join(',');
    }

    function onRemitoPatternDot(button) {
      const step = Number(button?.dataset?.step || 0);
      if (!step || remitoPatternPath.includes(step)) return;
      remitoPatternPath.push(step);
      updateRemitoPatternUI('ORIGINAL');
      syncRemitoCopy();
    }

    function clearRemitoPattern(copyKey) {
      remitoPatternPath = [];
      updateRemitoPatternUI('ORIGINAL');
      syncRemitoCopy();
    }

    function syncRemitoCopy() {
      const originalForm = document.querySelector('.remito-form[data-remito-copy="ORIGINAL"]');
      const copyForm = document.querySelector('.remito-copy-print .remito-form[data-remito-copy="COPIA"]');
      if (!originalForm || !copyForm) return;

      const originalFields = originalForm.querySelectorAll('input, textarea, select');
      const copyFields = copyForm.querySelectorAll('input, textarea, select');

      originalFields.forEach((field, index) => {
        const mirror = copyFields[index];
        if (!mirror) return;

        if (field.type === 'checkbox' || field.type === 'radio') {
          mirror.checked = field.checked;
        } else if (field.tagName === 'TEXTAREA' || field.tagName === 'INPUT' || field.tagName === 'SELECT') {
          mirror.value = field.value;
        }
      });

      const originalDots = originalForm.querySelectorAll('.dot');
      const copyDots = copyForm.querySelectorAll('.dot');
      originalDots.forEach((dot, index) => {
        const mirror = copyDots[index];
        if (mirror) {
          mirror.classList.toggle('active', dot.classList.contains('active'));
          mirror.classList.toggle('is-start', dot.classList.contains('is-start'));
          mirror.classList.toggle('is-end', dot.classList.contains('is-end'));
          const srcLabel = dot.querySelector('span');
          const dstLabel = mirror.querySelector('span');
          if (srcLabel && dstLabel) dstLabel.textContent = srcLabel.textContent;
        }
      });

      const originalSeq = originalForm.querySelector('[data-remito-field="pattern-seq"]');
      const copySeq = copyForm.querySelector('[data-remito-field="pattern-seq"]');
      if (originalSeq && copySeq) copySeq.value = originalSeq.value;

      originalForm.querySelectorAll('[data-pattern-seq]').forEach((el, index) => {
        const mirror = copyForm.querySelectorAll('[data-pattern-seq]')[index];
        if (mirror) mirror.textContent = el.textContent;
      });
    }

    function setRemitoSize(size) {
      const preset = sizeStyles[size] || sizeStyles.a4;
      const styleEl = document.getElementById('size-style');
      styleEl.textContent = '@page{size:' + preset.page + ';margin:' + preset.margin + ';}';
      document.documentElement.style.setProperty('--remito-page-width', preset.width);
      document.documentElement.style.setProperty('--remito-scale', preset.scale);
      document.querySelectorAll('.remito-toolbar button[data-size]').forEach(btn => {
        btn.classList.toggle('is-active', btn.dataset.size === size);
      });
    }

    window.setRemitoSize = setRemitoSize;
    window.__syncRemitoCopy = syncRemitoCopy;
    window.__persistRemitoData = persistRemitoData;
    window.__onRemitoPatternDot = onRemitoPatternDot;
    window.__clearRemitoPattern = clearRemitoPattern;
    window.addEventListener('load', () => setRemitoSize('a4'));
    window.addEventListener('load', () => {
      updateRemitoPatternUI('ORIGINAL');
      syncRemitoCopy();
      const originalForm = document.querySelector('.remito-form[data-remito-copy="ORIGINAL"]');
      if (originalForm) {
        originalForm.addEventListener('input', syncRemitoCopy);
        originalForm.addEventListener('change', syncRemitoCopy);
      }
    });
  </script>

  </head>

  <body>

  <style id="size-style"></style>

  <div class="remito-toolbar no-print">
      <button type="button" onclick="persistRemitoData(true)">💾 Guardar</button>
      <details class="remito-print-menu">
        <summary>🖨️ Imprimir</summary>
        <div class="remito-print-options">
          <div class="remito-print-options-label">Tamaño de hoja</div>
          <button type="button" data-size="a4" class="is-active" onclick="setRemitoSize('a4')">A4</button>
          <button type="button" data-size="a5" onclick="setRemitoSize('a5')">A5</button>
          <button type="button" data-size="ticket" onclick="setRemitoSize('ticket')">Ticket</button>
          <button type="button" onclick="this.closest('details').open=false;window.opener && window.opener.printVoletas(REMITO_REPAIR_ID)">📋 Voletas</button>
          <button type="button" onclick="this.closest('details').open=false;printPhoneLabel()">🏷️ Etiqueta celu</button>
          <button type="button" onclick="this.closest('details').open=false;window.print()">Imprimir remito</button>
        </div>
      </details>
  </div>

  <div class="remito-stage">
      <div class="remito-page">
          ${content}
      </div>
  </div>

  </body>
  </html>
  `);

  win.document.close();
}

// ===== VOLETAS (Cliente + Taller + Etiqueta) =====
function getWhatsAppNumber(phone) {
  const rawPhone = String(phone || '').trim();
  let digits = rawPhone.replace(/\D/g, '');
  if (rawPhone.startsWith('+')) return digits.length >= 8 && digits.length <= 15 ? digits : '';

  if (digits.startsWith('54')) {
    const nationalNumber = digits.slice(2).replace(/^0/, '');
    const whatsappNationalNumber = nationalNumber.startsWith('9') ? nationalNumber : `9${nationalNumber}`;
    return whatsappNationalNumber.length >= 10 && whatsappNationalNumber.length <= 13
      ? `54${whatsappNationalNumber}`
      : '';
  }

  digits = digits.replace(/^0/, '');
  if (digits.startsWith('11') && digits.length === 12 && digits.slice(2, 4) === '15') {
    digits = `${digits.slice(0, 2)}${digits.slice(4)}`;
  }
  return digits.length === 10 ? `549${digits}` : '';
}

function getRepairWhatsAppMessage(repair, template = 'status') {
  const client = getClient(repair.clientId);
  const clientName = client?.name || repair.client;
  const businessName = getBusinessName();
  const status = STATUS[repair.status]?.label || repair.status;
  const deposit = parseMoneyAmount(repair.deposit ?? repair.remitoDeposit ?? 0);
  const balance = Math.max(0, Number(repair.price || 0) - deposit);

  const messages = {
    status: `Hola ${clientName}, te contactamos de ${businessName} por tu reparación. Ticket: ${getRepairTicketDisplayId(repair)}. Equipo: ${repair.device}. Estado actual: ${status}.`,
    received: `Hola ${clientName}, recibimos tu equipo ${repair.device} en ${businessName}. Ticket: ${getRepairTicketDisplayId(repair)}. Te avisaremos las novedades de la reparación.`,
    diagnosis: `Hola ${clientName}, tenemos novedades sobre el diagnóstico de tu equipo ${repair.device}. ${repair.diagnosis || 'Estamos revisando el equipo.'} Presupuesto: ${formatMoney(repair.price || 0)}. Ticket: ${getRepairTicketDisplayId(repair)}.`,
    ready: `Hola ${clientName}, tu equipo ${repair.device} ya está listo para retirar en ${businessName}. Saldo pendiente: ${formatMoney(balance)}. Ticket: ${getRepairTicketDisplayId(repair)}.`,
    delivered: `Hola ${clientName}, registramos la entrega de tu equipo ${repair.device}. Gracias por confiar en ${businessName}. Ticket: ${getRepairTicketDisplayId(repair)}.`,
  };

  return messages[template] || messages.status;
}

function getRepairWhatsAppUrl(repair, template = 'status') {
  const client = getClient(repair.clientId);
  const number = getWhatsAppNumber(client?.phone);
  if (!number) return '';
  return `https://wa.me/${number}?text=${encodeURIComponent(getRepairWhatsAppMessage(repair, template))}`;
}

function updateRepairWhatsAppLink(repairId) {
  const repair = DB.repairs.find(item => item.id === repairId);
  const template = document.getElementById(`repair-whatsapp-template-${repairId}`)?.value;
  const link = document.getElementById(`repair-whatsapp-phone-${repairId}`);
  if (repair && template && link) link.href = getRepairWhatsAppUrl(repair, template);
}

function printVoletas(id) {
  const r = DB.repairs.find(x => x.id === id);
  if (!r) return;
  const ticketDisplayId = getRepairTicketDisplayId(r);
  const isNotebook = isNotebookRepair(r);
  const isSpeaker = isSpeakerRepair(r);
  const isConsole = isConsoleRepair(r);
  const businessNameMarkup = getBusinessNameMarkup();
  const businessNameText = escapeHTML(getBusinessName());
  const businessContactMarkup = getBusinessContactMarkup();
  const client = getClient(r.clientId);
  const phone = client?.phone && client.phone !== '—' ? client.phone : '';
  const whatsappNumber = getWhatsAppNumber(phone);
  const phoneMarkup = whatsappNumber
    ? `<a class="whatsapp-link" href="${escapeHTML(getRepairWhatsAppUrl(r))}" target="_blank" rel="noopener noreferrer">${escapeHTML(phone)}</a>`
    : escapeHTML(phone);
  const dni = client?.dni || r.clientDni || '';
  const patternHTML = r.devicePattern?.length ? patternGridPrintHTML(r.devicePattern) : '';
  const pinHTML = r.deviceKey
    ? `<div class="voleta-row"><span class="k">PIN / Clave</span><span class="v">${r.deviceKey}</span></div>`
    : '';
  const securityTaller = patternHTML || pinHTML
    ? `<div class="voleta-block voleta-security"><div class="voleta-block-title">🔐 Seguridad (solo taller)</div>${pinHTML}${patternHTML}</div>`
    : '';
  const consoleAccessories = [
    ['joystick1', 'Joystick 1'],
    ['joystick2', 'Joystick 2'],
    ['hdmi', 'Cable HDMI'],
    ['power', 'Cable de poder'],
  ];
  const accessoriesLine = isConsole
    ? `<div class="voleta-row"><span class="k">Accesorios entregados</span><span class="v">${consoleAccessories.map(([key, label]) => `${label}: ${escapeHTML(r.consoleAccessories?.[key] || 'No')}`).join('<br>')}</span></div>`
    : !isSpeaker && r.accessories?.length
    ? `<div class="voleta-row"><span class="k">Accesorios</span><span class="v">${r.accessories.join(', ')}</span></div>`
    : '';
  const priceLine = r.price > 0
    ? `<div class="voleta-row"><span class="k">Presupuesto</span><span class="v price">${formatMoney(r.price)}</span></div>`
    : '';
  const deposit = parseMoneyAmount(r.deposit ?? r.remitoDeposit ?? 0);
  const depositLine = deposit > 0
    ? `<div class="voleta-row"><span class="k">Anticipo / Seña</span><span class="v">${formatMoney(deposit)}</span></div>`
    : '';
  const balanceLine = r.price > 0
    ? `<div class="voleta-row"><span class="k">Total pendiente</span><span class="v price">${formatMoney(Math.max(0, Number(r.price) - deposit))}</span></div>`
    : '';
  const physicalStateGroups = isSpeaker ? [
    ['general', 'Estado general'],
    ['scratches', 'Rayones'],
    ['impacts', 'Golpes visibles'],
    ['light', 'Prende luz'],
  ] : isNotebook || isConsole ? [
    ['general', 'Estado general'],
    ['scratches', 'Rayones'],
    ['impacts', 'Golpes visibles'],
  ] : [
    ['general', 'Estado general'],
    ['impacts', 'Golpes visibles'],
    ['scratches', 'Rayones'],
    ['screen', 'Pantalla'],
    ['back', 'Tapa trasera'],
    ['frame', 'Marco / Bisel'],
    ['port', 'Puerto de carga'],
    ['previous', 'Reparación anterior'],
    ['corrosion', 'Corrosión / Óxido'],
  ];
  const functionalStateGroups = isConsole ? CONSOLE_FUNCTIONAL_GROUPS : isNotebook ? NOTEBOOK_FUNCTIONAL_GROUPS : [
    ['charge', 'Carga'],
    ['touch', 'Touch / Táctil'],
    ['sound', 'Sonido'],
    ['microphone', 'Micrófono'],
    ['wifi', 'WiFi'],
    ['buttons', 'Botones'],
    ['biometric', 'Huella/FaceID'],
    ['power', 'Enciende'],
  ];
  const renderStateSummary = (title, groups, state = {}) => {
    const values = groups
      .filter(([key]) => state[key])
      .map(([key, label]) => `${escapeHTML(label)}: <strong>${escapeHTML(state[key])}</strong>`);
    return values.length
      ? `<div class="voleta-state-summary"><strong>${escapeHTML(title)}:</strong> ${values.join(', ')}</div>`
      : '';
  };
  const checkInStates = renderStateSummary(isConsole ? 'CHECK IN · Estado funcional' : 'Estado Funcional', functionalStateGroups, r.functionalState)
    + renderStateSummary(isSpeaker || isConsole ? 'CHECK IN · Estado físico' : 'Estado Físico', physicalStateGroups, r.physicalState);
  const workshopStates = checkInStates
    + (isNotebook
      ? renderStateSummary('CHECK OUT · Estado físico', physicalStateGroups, r.checkoutPhysicalState)
        + renderStateSummary('CHECK OUT · Estado funcional', functionalStateGroups, r.checkoutFunctionalState)
      : '')
    + (isSpeaker
      ? renderStateSummary('CHECK OUT · Estado físico', physicalStateGroups, r.checkoutPhysicalState)
      : '');
  const consoleWorkshopStates = isConsole
    ? renderStateSummary('CHECK OUT · Estado físico', physicalStateGroups, r.checkoutPhysicalState)
      + renderStateSummary('CHECK OUT · Estado funcional', functionalStateGroups, r.checkoutFunctionalState)
    : '';
  const speakerLabelStates = isSpeaker
    ? renderStateSummary('CHECK IN · Estado físico', physicalStateGroups, r.physicalState)
      + renderStateSummary('CHECK OUT · Estado físico', physicalStateGroups, r.checkoutPhysicalState)
    : '';
  const consoleLabelStates = isConsole
    ? renderStateSummary('CHECK IN · Estado físico', physicalStateGroups, r.physicalState)
      + renderStateSummary('CHECK IN · Estado funcional', functionalStateGroups, r.functionalState)
      + renderStateSummary('CHECK OUT · Estado físico', physicalStateGroups, r.checkoutPhysicalState)
      + renderStateSummary('CHECK OUT · Estado funcional', functionalStateGroups, r.checkoutFunctionalState)
      + `<div class="meta">${consoleAccessories.map(([key, label]) => `${label}: ${escapeHTML(r.consoleAccessories?.[key] || 'No')}`).join(' · ')}</div>`
    : '';

  const win = window.open('', '_blank');
  win.document.write(`
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Voletas ${ticketDisplayId}</title>
<style>
  *{box-sizing:border-box}
  body{font-family:Arial,sans-serif;background:#f2f2f2;color:#1A1A2E;margin:0;padding:12px}
  .toolbar{position:sticky;top:0;z-index:10;display:flex;flex-wrap:wrap;gap:8px;justify-content:center;padding:10px;background:#f2f2f2;border-bottom:1px solid #ddd;margin:-12px -12px 12px}
  .toolbar button{background:#0072BB;color:#fff;border:none;padding:8px 14px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer}
  .print-menu{position:relative}
  .print-menu summary{list-style:none;background:#0072BB;color:#fff;padding:8px 14px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer}
  .print-menu summary::-webkit-details-marker{display:none}
  .print-menu summary::after{content:' ▾'}
  .print-menu-options{position:absolute;top:calc(100% + 5px);left:0;z-index:20;display:flex;flex-direction:column;gap:4px;min-width:190px;padding:6px;background:#fff;border:1px solid #d5dce2;border-radius:6px;box-shadow:0 4px 12px #0002}
  .toolbar .print-menu-options button{width:100%;text-align:left;border-radius:4px}
  .page{max-width:720px;margin:0 auto;display:flex;flex-direction:column;gap:4px}
  .doc{background:#fff;border:2px solid #0072BB;border-radius:10px;overflow:hidden;page-break-inside:avoid}
  .cut-line{height:0;border-top:1px dashed #777;position:relative;margin:0 4px}
  .cut-line::after{content:'✂ CORTAR';position:absolute;right:12px;top:-7px;background:#f2f2f2;padding:0 6px;font-size:9px;font-weight:700;color:#555}
  .doc-label{background:#0072BB;color:#fff;text-align:center;font-size:12px;font-weight:800;padding:6px;letter-spacing:0.5px;text-transform:uppercase}
  .doc-body{padding:14px}
  .voleta-state-summary{font-size:11px;line-height:1.4;margin:4px 0;overflow-wrap:anywhere}
  .brand{text-align:center;margin-bottom:10px}
  .brand-main{font-size:22px;font-weight:900}
  .brand-main span{color:#0072BB}
  .brand-sub{font-size:10px;color:#666;text-transform:uppercase;letter-spacing:1px}
  .business-contact{font-size:8px;line-height:1.2;overflow-wrap:anywhere}
  .ticket-num{text-align:center;font-size:26px;font-weight:900;margin:-2px 0 12px}
  .voleta-block{margin-bottom:10px}
  .voleta-block-title{font-size:10px;font-weight:800;color:#0072BB;text-transform:uppercase;letter-spacing:0.4px;margin-bottom:6px;border-bottom:1px solid #e9ecef;padding-bottom:4px}
  .voleta-row{display:flex;justify-content:space-between;gap:10px;padding:5px 0;border-bottom:1px dashed #eee;font-size:12px}
  .voleta-row:last-child{border-bottom:none}
  .voleta-row .k{color:#666;font-weight:600;flex-shrink:0}
  .voleta-row .v{font-weight:700;text-align:right}
  #voleta-cliente .voleta-compact,#voleta-taller .voleta-compact{margin-bottom:5px}
  #voleta-cliente .voleta-compact .voleta-block-title,#voleta-taller .voleta-compact .voleta-block-title{margin-bottom:2px;padding-bottom:2px}
  #voleta-cliente .voleta-compact .voleta-row,#voleta-taller .voleta-compact .voleta-row{justify-content:flex-start;gap:5px;padding:1px 0;border-bottom:0;font-size:11px}
  #voleta-cliente .voleta-compact .voleta-row .v,#voleta-taller .voleta-compact .voleta-row .v{text-align:left;min-width:0;overflow-wrap:anywhere}
  .whatsapp-link{color:#128c7e;text-decoration:none}
  .whatsapp-link:hover{text-decoration:underline}
  .voleta-row .v.price{color:#0072BB;font-size:14px}
  .problem-box{background:#e8f4fd;border:1.5px solid #0072BB;border-radius:8px;padding:10px;margin:8px 0}
  .problem-box .label{font-size:10px;font-weight:800;color:#0072BB;text-transform:uppercase;margin-bottom:4px}
  .problem-box .text{font-size:13px;font-weight:700;line-height:1.4}
  .legal{font-size:8px;color:#666;line-height:1.35;text-align:justify;margin-top:10px;border-top:1px solid #eee;padding-top:8px}
  .sig-row{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:16px}
  .sig-line{border-top:1px solid #000;padding-top:4px;font-size:10px;font-weight:700;text-align:center}
  .pattern-print-wrap{display:flex;flex-direction:column;align-items:center;gap:4px;margin-top:6px}
  .pattern-print-wrap.compact svg{max-width:90px}
  .pattern-print-seq{font-size:10px;font-weight:700;color:#0072BB}
  .etiqueta-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .etiqueta{background:#fff;border:2px solid #0072BB;border-radius:10px;padding:10px;min-height:130px}
  .etiqueta .brand{font-size:11px;font-weight:900;color:#0072BB;text-align:left;margin:0}
  .etiqueta .ticket{font-size:20px;font-weight:900;margin:2px 0 6px}
  .etiqueta .device{font-size:11px;font-weight:700;margin-bottom:6px}
  .etiqueta .problem{font-size:12px;font-weight:800;color:#0072BB;line-height:1.3;border-top:1px dashed #0072BB;padding-top:6px;margin-top:4px}
  .etiqueta .meta{font-size:9px;color:#555;margin-top:6px;line-height:1.5}
  .etiqueta .voleta-state-summary{font-size:8px;margin:3px 0}
  @media print{
    body.thermal-print .page{width:74mm;max-width:none;margin:0;gap:0}
    body.thermal-print #voleta-cliente,
    body.thermal-print #voleta-taller{width:74mm;border:0;border-radius:0}
    body.thermal-print #voleta-cliente .doc-label,
    body.thermal-print #voleta-taller .doc-label{background:#fff;color:#000;font-size:6px;line-height:1;padding:0}
    body.thermal-print #voleta-cliente .brand,
    body.thermal-print #voleta-taller .brand{margin:0;line-height:1}
    body.thermal-print #voleta-cliente .brand-main,
    body.thermal-print #voleta-taller .brand-main{font-size:8px;line-height:1}
    body.thermal-print #voleta-cliente .brand-sub,
    body.thermal-print #voleta-taller .brand-sub{font-size:5px;line-height:1;letter-spacing:0}
    body.thermal-print #voleta-cliente .business-contact,
    body.thermal-print #voleta-taller .business-contact{font-size:5px;line-height:1.1}
    body.thermal-print #voleta-cliente .ticket-num,
    body.thermal-print #voleta-taller .ticket-num{font-size:7px;line-height:1;margin:0}
    body.thermal-print #voleta-cliente .doc-body,
    body.thermal-print #voleta-taller .doc-body{padding:1.5mm}
    body.thermal-print #voleta-cliente .voleta-block,
    body.thermal-print #voleta-taller .voleta-block{margin-bottom:2px}
    body.thermal-print #voleta-cliente .voleta-block-title,
    body.thermal-print #voleta-taller .voleta-block-title{font-size:7px;line-height:1;margin-bottom:1px;padding-bottom:1px}
    body.thermal-print #voleta-cliente .voleta-row,
    body.thermal-print #voleta-taller .voleta-row{font-size:8px;line-height:1.1;gap:3px;padding:0}
    body.thermal-print #voleta-cliente .voleta-compact .voleta-row,
    body.thermal-print #voleta-taller .voleta-compact .voleta-row{font-size:8px}
    body.thermal-print #voleta-cliente .voleta-state-summary,
    body.thermal-print #voleta-taller .voleta-state-summary{font-size:7px;line-height:1.1;margin:1px 0}
    body.thermal-print #voleta-cliente .problem-box,
    body.thermal-print #voleta-taller .problem-box{padding:2px;margin:2px 0;border-width:1px}
    body.thermal-print #voleta-cliente .problem-box .label,
    body.thermal-print #voleta-taller .problem-box .label{font-size:7px;margin-bottom:1px}
    body.thermal-print #voleta-cliente .problem-box .text,
    body.thermal-print #voleta-taller .problem-box .text{font-size:8px;line-height:1.1}
    body.thermal-print #voleta-cliente .legal{font-size:5px;line-height:1.1;margin-top:2px;padding-top:2px}
    body.thermal-print #voleta-cliente .sig-row,
    body.thermal-print #voleta-taller .sig-row{gap:4px;margin-top:4px}
    body.thermal-print #voleta-cliente .sig-line,
    body.thermal-print #voleta-taller .sig-line{font-size:6px;padding-top:2px}
    body.thermal-print #voleta-cliente .brand-main span,
    body.thermal-print #voleta-cliente .voleta-block-title,
    body.thermal-print #voleta-cliente .voleta-row .v.price,
    body.thermal-print #voleta-cliente .problem-box .label,
    body.thermal-print #voleta-taller .brand-main span,
    body.thermal-print #voleta-taller .voleta-block-title,
    body.thermal-print #voleta-taller .voleta-row .v.price,
    body.thermal-print #voleta-taller .problem-box .label{color:#000}
    body.thermal-print #voleta-cliente .problem-box,
    body.thermal-print #voleta-taller .problem-box{background:#fff;border-color:#000}
    body.thermal-print .cut-line{display:block;border-top-color:#000;margin:1mm 0}
    body.thermal-print .cut-line::after{content:'CORTAR';top:-4px;right:2px;padding:0 2px;font-size:5px;color:#000}
    body.thermal-print #etiqueta-equipo{width:74mm;border:0;border-radius:0}
    body.thermal-print #etiqueta-equipo .doc-label{background:#fff;color:#000;font-size:6px;line-height:1;padding:0}
    body.thermal-print #etiqueta-equipo .doc-body{padding:1.5mm}
    body.thermal-print .etiqueta-grid{grid-template-columns:1fr;gap:0}
    body.thermal-print .etiqueta{width:100%;min-height:0;padding:1.5mm;border:1px dashed #000;border-radius:0}
    body.thermal-print .etiqueta .brand{font-size:8px;line-height:1;margin:0 0 1px}
    body.thermal-print .etiqueta .business-contact{font-size:6px;line-height:1.1;overflow-wrap:anywhere}
    body.thermal-print .etiqueta .ticket{font-size:10px;line-height:1;margin:0 0 1px}
    body.thermal-print .etiqueta .device{font-size:8px;line-height:1.1;margin:0}
    body.thermal-print .etiqueta .problem{font-size:8px;line-height:1.1;padding-top:1px;margin-top:1px}
    body.thermal-print .etiqueta .meta,
    body.thermal-print .etiqueta .voleta-state-summary{font-size:6px;line-height:1.1;margin:1px 0}
    body.thermal-print .etiqueta .brand,
    body.thermal-print .etiqueta .business-contact,
    body.thermal-print .etiqueta .ticket,
    body.thermal-print .etiqueta .device,
    body.thermal-print .etiqueta .problem,
    body.thermal-print .etiqueta .meta,
    body.thermal-print .etiqueta .voleta-state-summary{color:#000}
  }
  @media print{
    body{background:#fff;padding:0}
    .toolbar{display:none!important}
    .page{max-width:none;gap:2px}
    .cut-line{display:none}
    body.print-all .cut-line{display:block}
    body.thermal-print .cut-line{display:block}
    .cut-line::after{background:#fff}
    .doc.etiquetas-doc{border:none}
    .etiqueta-grid{grid-template-columns:1fr 1fr}
  }
</style>
</head>
<body>
<div class="toolbar no-print">
  <details class="print-menu">
    <summary>🖨️ Imprimir</summary>
    <div class="print-menu-options">
      <button type="button" onclick="this.closest('details').open=false;printAll()">🖨️ Imprimir todo</button>
      <button type="button" onclick="this.closest('details').open=false;printSection('voleta-cliente')">👤 Voleta cliente</button>
      <button type="button" onclick="this.closest('details').open=false;printSection('voleta-cliente', true)">🧾 Térmico 80mm</button>
      <button type="button" onclick="this.closest('details').open=false;printSection('voleta-taller')">🛠️ Voleta taller</button>
      <button type="button" onclick="this.closest('details').open=false;printSection('etiqueta-equipo')">🏷️ Etiqueta equipo</button>
    </div>
  </details>
</div>
<div class="page">
  <section class="doc" id="voleta-cliente">
    <div class="doc-label">Voleta Cliente</div>
    <div class="doc-body">
      <div class="brand">
        <div class="brand-main">${businessNameMarkup}</div>
        <div class="brand-sub">servicio técnico<br>comprobante de ingreso</div>
        ${businessContactMarkup}
      </div>
      <div class="ticket-num">${ticketDisplayId}</div>
      <div class="voleta-block voleta-compact">
        <div class="voleta-block-title">Cliente</div>
        <div class="voleta-row"><span class="k">Nombre</span><span class="v">${r.client}</span></div>
        ${phone ? `<div class="voleta-row"><span class="k">Teléfono</span><span class="v">${phoneMarkup}</span></div>` : ''}
        ${dni ? `<div class="voleta-row"><span class="k">DNI</span><span class="v">${dni}</span></div>` : ''}
      </div>
      <div class="voleta-block voleta-compact">
        <div class="voleta-block-title">Equipo</div>
        <div class="voleta-row"><span class="k">Dispositivo</span><span class="v">${r.device}</span></div>
        ${(isNotebook || isSpeaker) && r.brand ? `<div class="voleta-row"><span class="k">Marca</span><span class="v">${r.brand}</span></div>` : ''}
        ${(isNotebook || isSpeaker || isConsole) && r.model ? `<div class="voleta-row"><span class="k">Modelo</span><span class="v">${r.model}</span></div>` : ''}
        ${(isSpeaker || isConsole) && r.color ? `<div class="voleta-row"><span class="k">Color</span><span class="v">${r.color}</span></div>` : ''}
        ${r.imei1 ? `<div class="voleta-row"><span class="k">${isNotebook || isSpeaker ? 'IMEI / N° Serie' : 'IMEI'}</span><span class="v">${r.imei1}</span></div>` : ''}
        ${accessoriesLine}
      </div>
      ${checkInStates}
      <div class="problem-box">
        <div class="label">Falla reportada</div>
        <div class="text">${r.problem}</div>
      </div>
      <div class="voleta-row"><span class="k">Fecha ingreso</span><span class="v">${formatDate(r.dateIn)}</span></div>
      ${r.dateEst ? `<div class="voleta-row"><span class="k">Entrega estimada</span><span class="v">${formatDate(r.dateEst)}</span></div>` : ''}
      ${priceLine}
      ${depositLine}
      ${balanceLine}
      <div class="legal">${escapeHTML(getStoredTerms(RECEIPT_TERMS_KEY, DEFAULT_RECEIPT_TERMS))}</div>
      <div class="sig-row">
        <div class="sig-line">Firma cliente</div>
        <div class="sig-line">${businessNameText}</div>
      </div>
    </div>
  </section>

  <div class="cut-line" aria-hidden="true"></div>

  <section class="doc" id="voleta-taller">
    <div class="doc-label">Voleta Taller · Uso interno</div>
    <div class="doc-body">
      <div class="brand">
        <div class="brand-main">${businessNameMarkup}</div>
        <div class="brand-sub">orden de trabajo interna</div>
        ${businessContactMarkup}
      </div>
      <div class="ticket-num">${ticketDisplayId}</div>
      <div class="voleta-block voleta-compact">
        <div class="voleta-row"><span class="k">Cliente</span><span class="v">${r.client}</span></div>
        <div class="voleta-row"><span class="k">Equipo</span><span class="v">${r.device}</span></div>
        <div class="voleta-row"><span class="k">Prioridad</span><span class="v">${PRIORITY[r.priority]?.label || r.priority}</span></div>
        <div class="voleta-row"><span class="k">Ingreso</span><span class="v">${formatDate(r.dateIn)}</span></div>
        ${(isNotebook || isSpeaker) && r.brand ? `<div class="voleta-row"><span class="k">Marca</span><span class="v">${r.brand}</span></div>` : ''}
        ${(isNotebook || isSpeaker || isConsole) && r.model ? `<div class="voleta-row"><span class="k">Modelo</span><span class="v">${r.model}</span></div>` : ''}
        ${(isSpeaker || isConsole) && r.color ? `<div class="voleta-row"><span class="k">Color</span><span class="v">${r.color}</span></div>` : ''}
        ${r.imei1 ? `<div class="voleta-row"><span class="k">${isNotebook || isSpeaker ? 'IMEI / N° Serie' : 'IMEI'}</span><span class="v">${r.imei1}</span></div>` : ''}
        ${r.serial ? `<div class="voleta-row"><span class="k">Serie</span><span class="v">${r.serial}</span></div>` : ''}
        ${accessoriesLine}
      </div>
      ${workshopStates}${consoleWorkshopStates}
      <div class="problem-box">
        <div class="label">Falla / trabajo</div>
        <div class="text">${r.problem}</div>
      </div>
      ${r.notes ? `<div class="voleta-block"><div class="voleta-block-title">Notas</div><div style="font-size:12px;line-height:1.4">${r.notes}</div></div>` : ''}
      ${securityTaller}
      <div class="sig-row">
        <div class="sig-line">Técnico responsable</div>
        <div class="sig-line">Control calidad</div>
      </div>
    </div>
  </section>

  <div class="cut-line" aria-hidden="true"></div>

  <section class="doc etiquetas-doc" id="etiqueta-equipo">
    <div class="doc-label">${isNotebook ? 'Etiqueta Notebook' : 'Etiqueta Equipo'} · Pegar en el dispositivo</div>
    <div class="doc-body">
      <div class="etiqueta-grid">
        ${[1].map(() => `
          <div class="etiqueta">
            <div class="brand">${businessNameText}</div>
            ${businessContactMarkup}
            <div class="ticket">${ticketDisplayId}</div>
            <div class="device">${r.deviceIcon || '📱'} ${r.device}</div>
            ${isSpeaker && (r.brand || r.model) ? `<div class="meta">${[r.brand, r.model].filter(Boolean).join(' · ')}</div>` : ''}
            ${isSpeaker && r.color ? `<div class="meta">Color: ${r.color}</div>` : ''}
            ${isSpeaker && r.imei1 ? `<div class="meta">IMEI / Serie: ${r.imei1}</div>` : ''}
            ${speakerLabelStates}
            ${isConsole && (r.model || r.color) ? `<div class="meta">${[r.model, r.color].filter(Boolean).join(' · ')}</div>` : ''}
            ${consoleLabelStates}
            ${isNotebook && (r.brand || r.model) ? `<div class="meta">${[r.brand, r.model].filter(Boolean).join(' · ')}</div>` : ''}
            <div class="problem">🔧 ${r.problem}</div>
            <div class="meta">
              👤 ${r.client}<br>
              ${isNotebook && (r.imei1 || r.serial) ? `N° Serie: ${r.imei1 || r.serial}<br>` : ''}
              📅 ${formatDate(r.dateIn)}<br>
              ${r.dateEst ? `⏱ Entrega: ${formatDate(r.dateEst)}` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
</div>
<script>
  function printAll() {
    document.body.classList.add('print-all');
    window.print();
    document.body.classList.remove('print-all');
  }

  function printSection(id, thermal = false) {
    const el = document.getElementById(id);
    if (!el) return;
    let thermalPageStyle;
    document.querySelectorAll('.doc').forEach(d => d.style.display = 'none');
    if (thermal) {
      document.body.classList.add('thermal-print');
      document.getElementById('voleta-cliente').style.display = 'block';
      document.getElementById('voleta-taller').style.display = 'block';
      document.getElementById('etiqueta-equipo').style.display = 'block';
      thermalPageStyle = document.createElement('style');
      thermalPageStyle.textContent = '@page{size:80mm auto;margin:3mm}';
      document.head.appendChild(thermalPageStyle);
    } else {
      el.style.display = 'block';
    }
    window.print();
    document.body.classList.remove('thermal-print');
    thermalPageStyle?.remove();
    document.querySelectorAll('.doc').forEach(d => d.style.display = '');
  }
</script>
</body>
</html>
  `);
  win.document.close();
}

// ===== STICKER PRINT =====
function printSticker(id) {
  const r = DB.repairs.find(x => x.id === id);
  if (!r) return;
  const isNotebook = isNotebookRepair(r);
  const isConsole = isConsoleRepair(r);
  const isSpeaker = isSpeakerRepair(r);
  const ticketDisplayId = getRepairTicketDisplayId(r);
  const businessNameMarkup = getBusinessNameMarkup();
  const businessContactMarkup = getBusinessContactMarkup();
  const consoleStickerStates = isConsole
    ? [
      ['CHECK IN · Estado general', r.physicalState?.general],
      ['CHECK IN · Rayones', r.physicalState?.scratches],
      ['CHECK IN · Golpes visibles', r.physicalState?.impacts],
      ...CONSOLE_FUNCTIONAL_GROUPS.map(([key, label]) => [`CHECK IN · ${label}`, r.functionalState?.[key]]),
      ['CHECK OUT · Estado general', r.checkoutPhysicalState?.general],
      ['CHECK OUT · Rayones', r.checkoutPhysicalState?.scratches],
      ['CHECK OUT · Golpes visibles', r.checkoutPhysicalState?.impacts],
      ...CONSOLE_FUNCTIONAL_GROUPS.map(([key, label]) => [`CHECK OUT · ${label}`, r.checkoutFunctionalState?.[key]]),
    ].filter(([, value]) => value).map(([label, value]) => `${label}: ${escapeHTML(value)}`).join('<br>')
    : '';
  const consoleStickerAccessories = isConsole
    ? [['joystick1', 'Joystick 1'], ['joystick2', 'Joystick 2'], ['hdmi', 'Cable HDMI'], ['power', 'Cable de poder']]
      .map(([key, label]) => `${label}: ${escapeHTML(r.consoleAccessories?.[key] || 'No')}`).join('<br>')
    : '';
  const speakerPhysicalState = isSpeaker
    ? [['Estado general', r.physicalState?.general], ['Rayones', r.physicalState?.scratches], ['Golpes visibles', r.physicalState?.impacts], ['Prende luz', r.physicalState?.light]]
      .filter(([, value]) => value)
      .map(([label, value]) => `${label}: ${escapeHTML(value)}`)
      .join('<br>')
    : '';
  const speakerCheckoutState = isSpeaker
    ? [['Estado general', r.checkoutPhysicalState?.general], ['Rayones', r.checkoutPhysicalState?.scratches], ['Golpes visibles', r.checkoutPhysicalState?.impacts], ['Prende luz', r.checkoutPhysicalState?.light]]
      .filter(([, value]) => value)
      .map(([label, value]) => `${label}: ${escapeHTML(value)}`)
      .join('<br>')
    : '';
  const win = window.open('', '_blank', 'width=400,height=400');
  win.document.write(`
    <html><head><title>Etiqueta ${ticketDisplayId}</title>
    <style>
      body{font-family:sans-serif;padding:20px;background:#f5f5f5}
      .sticker{background:white;border:2px solid #0072BB;border-radius:10px;padding:12px;width:200px;display:inline-block;margin:8px;font-size:11px}
      .brand{font-size:13px;font-weight:900;color:#0072BB;margin-bottom:2px}
      .business-contact{font-size:8px;line-height:1.2;overflow-wrap:anywhere}
      .ticket-num{font-size:22px;font-weight:900;color:#1A1A2E;margin-bottom:4px}
      .info{color:#333;line-height:1.6}
      @media print{.no-print{display:none}body{background:white}}
    </style></head><body>
    <div class="no-print" style="margin-bottom:16px">
      <button onclick="window.print()" style="padding:8px 16px;background:#0072BB;color:white;border:none;border-radius:6px;cursor:pointer;font-size:14px">🖨️ Imprimir Etiqueta</button>
    </div>
    <div class="sticker">
      <div class="brand">${businessNameMarkup}</div>
      ${businessContactMarkup}
      <div class="ticket-num">${ticketDisplayId}</div>
      <div class="info">
        <b>${r.device}</b><br>
        ${(isNotebook || isSpeaker || isConsole) && (r.brand || r.model) ? `${[r.brand, r.model].filter(Boolean).join(' · ')}<br>` : ''}
        ${(isSpeaker || isConsole) && r.color ? `Color: ${r.color}<br>` : ''}
        ${(isNotebook || isSpeaker) && (r.imei1 || r.serial) ? `IMEI / Serie: ${r.imei1 || r.serial}<br>` : ''}
        👤 ${r.client}<br>
        📅 ${formatDate(r.dateIn)}<br>
        ${speakerPhysicalState ? `CHECK IN · ${speakerPhysicalState}<br>` : ''}
        ${speakerCheckoutState ? `CHECK OUT · ${speakerCheckoutState}<br>` : ''}
        ${consoleStickerAccessories ? `${consoleStickerAccessories}<br>` : ''}
        ${consoleStickerStates ? `${consoleStickerStates}<br>` : ''}
        <span style="color:#0072BB;font-weight:800">🔧 ${r.problem.slice(0, 60)}${r.problem.length > 60 ? '...' : ''}</span>
      </div>
    </div>
    </body></html>
  `);
  win.document.close();
}

// ===== MODALS =====
function openModal(id) {
  document.getElementById(id).classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

function resetNewRepairDeviceStep() {
  document.getElementById('nr-device-type').value = '';
  configureNewRepairFormForDevice('');
  document.getElementById('nr-device-step').hidden = false;
  document.getElementById('nr-repair-details').hidden = true;
  document.getElementById('nr-device-continue').disabled = true;
  document.querySelectorAll('.repair-device-option').forEach(option => {
    option.classList.remove('selected');
    option.setAttribute('aria-pressed', 'false');
  });
}

function selectRepairDevice(type, icon, button) {
  document.getElementById('nr-device-type').value = type;
  document.querySelectorAll('.repair-device-option').forEach(option => {
    const selected = option === button;
    option.classList.toggle('selected', selected);
    option.setAttribute('aria-pressed', String(selected));
  });
  document.getElementById('nr-device-continue').disabled = false;
}

function continueNewRepair() {
  const type = document.getElementById('nr-device-type').value;
  if (!type) return;

  const icon = REPAIR_DEVICE_ICONS[type] || '🧰';
  configureNewRepairFormForDevice(type);
  document.getElementById('nr-selected-device-summary').innerHTML = `
    <span>${icon}</span><strong>${type}</strong>
    <button class="btn btn-outline" type="button" onclick="changeRepairDevice()">Cambiar equipo</button>
  `;
  if (type === 'Notebook' || type === 'Parlante' || type === 'Consola / joystick') {
    document.getElementById('nr-brand-notebook').value = '';
    document.getElementById('nr-model-notebook').value = '';
  } else {
    document.getElementById('nr-brand').value = 'Otro';
    updateRepairModelOptions('Otro');
  }
  document.getElementById('nr-device-step').hidden = true;
  document.getElementById('nr-repair-details').hidden = false;
}

function configureNewRepairFormForDevice(type) {
  const isNotebook = type === 'Notebook';
  const isSpeaker = type === 'Parlante';
  const isConsole = type === 'Consola / joystick';
  const usesFreeText = isNotebook || isSpeaker || isConsole;
  document.getElementById('nr-brand-group').hidden = isConsole;
  document.getElementById('nr-imei-group').hidden = isConsole;
  document.getElementById('nr-brand-select-wrap').hidden = usesFreeText;
  document.getElementById('nr-brand-notebook-wrap').hidden = !usesFreeText;
  document.getElementById('nr-model-select-wrap').hidden = usesFreeText;
  document.getElementById('nr-model-notebook-wrap').hidden = !usesFreeText;
  document.getElementById('nr-capacity-group').hidden = isNotebook || isSpeaker || isConsole;
  document.getElementById('nr-imei-label').textContent = usesFreeText ? 'IMEI / N° Serie' : 'IMEI';
  document.getElementById('nr-imei1').placeholder = usesFreeText ? 'IMEI o número de serie' : 'IMEI';
  document.getElementById('nr-brand-notebook').placeholder = isSpeaker ? 'Marca del parlante' : 'Marca de notebook';
  document.getElementById('nr-model-notebook').placeholder = isSpeaker ? 'Modelo del parlante' : isConsole ? 'Modelo de consola o joystick' : 'Modelo de notebook';
  document.getElementById('nr-accessories-default').hidden = isNotebook || isConsole;
  document.getElementById('nr-accessories-notebook').hidden = !isNotebook;
  document.getElementById('nr-accessories-console').hidden = !isConsole;
  document.getElementById('nr-accessories-section').hidden = isSpeaker;
  document.getElementById('nr-physical-default').hidden = isNotebook || isSpeaker || isConsole;
  document.getElementById('nr-physical-notebook').hidden = !isNotebook;
  document.getElementById('nr-physical-speaker').hidden = !isSpeaker;
  document.getElementById('nr-physical-console').hidden = !isConsole;
  document.getElementById('nr-functional-section').hidden = isSpeaker;
  document.getElementById('nr-functional-default').hidden = isNotebook || isConsole;
  document.getElementById('nr-functional-notebook').hidden = !isNotebook;
  document.getElementById('nr-functional-console').hidden = !isConsole;
  const brandLabel = document.querySelector('label[for="nr-brand"], label[for="nr-brand-notebook"]');
  brandLabel.textContent = isNotebook ? 'Marca de notebook' : 'Marca';
  brandLabel.htmlFor = usesFreeText ? 'nr-brand-notebook' : 'nr-brand';
  const modelLabel = document.querySelector('label[for="nr-model"], label[for="nr-model-notebook"]');
  modelLabel.textContent = isNotebook ? 'Modelo de notebook' : 'Modelo';
  modelLabel.htmlFor = usesFreeText ? 'nr-model-notebook' : 'nr-model';
}

function changeRepairDevice() {
  document.getElementById('nr-device-step').hidden = false;
  document.getElementById('nr-repair-details').hidden = true;
}

function openNewRepair() {
  if (!userHasPermission('new_repair')) {
    showToast('No tenés permisos para registrar reparaciones.', 'info');
    return;
  }
  document.getElementById('new-repair-form').reset();
  resetNewRepairDeviceStep();
  renderNewRepairParts();
  updateRepairModelOptions();
  document.getElementById('nr-date-in').value = new Date().toISOString().split('T')[0];
  updateNewRepairBalance();
  document.getElementById('nr-client-id').value = '';
  nrPatternLock = null;
  switchSecurityTab('pin');
  updatePatternPreview([]);
  openModal('modal-new-repair');
}

function openNewRepairForClient(clientId) {
  closeDetail('client-detail');
  document.getElementById('new-repair-form').reset();
  resetNewRepairDeviceStep();
  renderNewRepairParts();
  updateRepairModelOptions();
  document.getElementById('nr-date-in').value = new Date().toISOString().split('T')[0];
  updateNewRepairBalance();
  nrPatternLock = null;
  switchSecurityTab('pin');
  updatePatternPreview([]);
  const c = DB.clients.find(x => x.id === clientId);
  if (c) {
    document.getElementById('nr-client-name').value = c.name;
    document.getElementById('nr-client-phone').value = c.phone !== '—' ? c.phone : '';
    document.getElementById('nr-client-email').value = c.email || '';
    document.getElementById('nr-client-address').value = c.address || '';
    document.getElementById('nr-client-dni').value = c.dni || '';
    document.getElementById('nr-client-id').value = c.id;
  }
  openModal('modal-new-repair');
}

function renderNewRepairParts() {
  const container = document.getElementById('nr-parts-list');
  if (!container) return;

  const parts = DB.products.filter(product => product.category === 'Repuesto');
  if (!parts.length) {
    container.innerHTML = '<span class="repair-parts-empty">No hay repuestos cargados.</span>';
    return;
  }

  container.innerHTML = parts.map(part => `
    <label>
      <input type="checkbox" name="nr-parts" value="${escapeHTML(part.id)}">
      <span>${escapeHTML(part.name)}<small class="repair-parts-stock">Stock: ${Number(part.stock) || 0}</small></span>
    </label>
  `).join('');
}

function renderEditCheckoutState(repair) {
  const container = document.getElementById('edit-checkout-state');
  if (!container) return;
  const isNotebook = isNotebookRepair(repair);
  const isSpeaker = isSpeakerRepair(repair);
  const isConsole = isConsoleRepair(repair);

  const sections = [
    {
      key: 'physical',
      title: 'CHECK OUT · Estado físico',
      state: repair.checkoutPhysicalState || {},
      groups: isSpeaker ? [
        ['general', 'Estado general', ['OK', 'Regular', 'Malo']],
        ['scratches', 'Rayones', ['No', 'Leves', 'Severos']],
        ['impacts', 'Golpes visibles', ['No', 'Leves', 'Severos']],
        ['light', 'Prende luz', ['Sí', 'No']],
      ] : isNotebook || isConsole ? [
        ['general', 'Estado general', ['OK', 'Regular', 'Malo']],
        ['scratches', 'Rayones', ['No', 'Leves', 'Severos']],
        ['impacts', 'Golpes visibles', ['No', 'Leves', 'Severos']],
      ] : [
        ['screen', 'Pantalla', ['OK', 'Rayada', 'Rota']],
        ['back', 'Tapa trasera', ['OK', 'Despegada', 'Rayada', 'Rota']],
        ['frame', 'Marco / Bisel', ['OK', 'Doblado', 'Dañado']],
        ['corrosion', 'Corrosión / Óxido', ['No', 'Leve', 'Severa']],
        ['port', 'Puerto de carga', ['OK', 'Sucio', 'Dañado']],
        ['previous', 'Reparación anterior', ['No', 'Sí']],
        ['general', 'Estado general', ['OK', 'Regular', 'Malo']],
        ['scratches', 'Rayones', ['No', 'Leves', 'Severos']],
        ['impacts', 'Golpes visibles', ['No', 'Leves', 'Severos']],
      ],
    },
    ...(!isSpeaker ? [{
      key: 'functional',
      title: 'CHECK OUT · Estado funcional',
      state: repair.checkoutFunctionalState || {},
      groups: isConsole ? CONSOLE_FUNCTIONAL_GROUPS : isNotebook ? NOTEBOOK_FUNCTIONAL_GROUPS : [
        ['power', 'Enciende', ['OK', 'No', 'No probado']],
        ['touch', 'Touch / Táctil', ['OK', 'Falla', 'No probado']],
        ['charge', 'Carga', ['OK', 'No', 'No probado']],
        ['sound', 'Sonido', ['OK', 'Falla', 'No probado']],
        ['microphone', 'Micrófono', ['OK', 'Falla', 'No probado']],
        ['wifi', 'WiFi', ['OK', 'Falla', 'No probado']],
        ['buttons', 'Botones', ['OK', 'Falla', 'No probado']],
        ['biometric', 'Huella / FaceID', ['OK', 'Falla', 'No tiene']],
      ],
    }] : []),
  ];

  container.innerHTML = sections.map(section => `
    <div class="form-section-title">${section.title}</div>
    ${section.groups.map(([key, label, options]) => `
      <div class="form-group">
        <div class="form-label">${label}</div>
        <div class="check-grid">
          ${options.map(option => `<label><input type="radio" name="edit-checkout-${section.key}-${key}" value="${option}" ${section.state[key] === option ? 'checked' : ''}> ${option}</label>`).join('')}
        </div>
      </div>
    `).join('')}
  `).join('');
}

function getEditCheckoutState(section, keys) {
  return keys.reduce((state, key) => {
    state[key] = document.querySelector(`input[name="edit-checkout-${section}-${key}"]:checked`)?.value || '';
    return state;
  }, {});
}

function syncEditProgressWithStatus() {
  const progressByStatus = {
    recibido: 0,
    diagnostico: 25,
    espera_repuesto: 40,
    en_progreso: 65,
    listo: 100,
    entregado: 100,
  };
  const progress = progressByStatus[document.getElementById('edit-status').value];
  if (progress === undefined) return;

  document.getElementById('edit-progress').value = progress;
  document.getElementById('edit-progress-val').textContent = `${progress}%`;
}

function openEditRepair(id) {
  const r = DB.repairs.find(x => x.id === id);
  if (!r) return;
  const client = DB.clients.find(item => item.id === r.clientId);
  document.getElementById('edit-repair-id').value = r.id;
  document.getElementById('edit-status').value = r.status;
  document.getElementById('edit-progress').value = r.progress;
  document.getElementById('edit-progress-val').textContent = r.progress + '%';
  document.getElementById('edit-notes').value = r.notes;
  document.getElementById('edit-client-name').value = client?.name || r.client || '';
  document.getElementById('edit-client-phone').value = client?.phone === '—' ? '' : client?.phone || '';
  document.getElementById('edit-client-email').value = client?.email || '';
  document.getElementById('edit-client-address').value = client?.address || '';
  document.getElementById('edit-client-dni').value = client?.dni || r.clientDni || '';
  document.getElementById('edit-price').value = Number(r.price || 0);
  document.getElementById('edit-deposit').value = parseMoneyAmount(r.deposit ?? r.remitoDeposit ?? 0);
  updateEditRepairBalance();
  renderEditCheckoutState(r);
  openModal('modal-edit-repair');
}

function updateEditRepairBalance() {
  const price = parseFloat(document.getElementById('edit-price')?.value) || 0;
  const deposit = parseFloat(document.getElementById('edit-deposit')?.value) || 0;
  const total = document.getElementById('edit-total');
  if (total) total.value = formatMoney(Math.max(0, price - deposit));
}

function saveNewRepair() {
  const deviceType = document.getElementById('nr-device-type').value;
  const isNotebook = deviceType === 'Notebook';
  const isSpeaker = deviceType === 'Parlante';
  const isConsole = deviceType === 'Consola / joystick';
  const brand = isConsole ? '' : document.getElementById(isNotebook || isSpeaker ? 'nr-brand-notebook' : 'nr-brand').value.trim();
  const model = document.getElementById(isNotebook || isSpeaker || isConsole ? 'nr-model-notebook' : 'nr-model').value.trim();
  const device = `${deviceType} · ${buildDeviceLabel(brand, model)}`;
  const clientName = document.getElementById('nr-client-name').value.trim();
  const clientPhone = document.getElementById('nr-client-phone').value.trim();
  const clientDni = document.getElementById('nr-client-dni').value.trim();
  const clientEmail = document.getElementById('nr-client-email').value.trim();
  const clientAddress = document.getElementById('nr-client-address').value.trim();
  const problem = document.getElementById('nr-problem').value.trim();
  const priority = document.getElementById('nr-priority').value;
  const dateIn = document.getElementById('nr-date-in').value;
  const dateEst = document.getElementById('nr-date-est').value;
  const price = parseFloat(document.getElementById('nr-price').value) || 0;
  const deposit = parseFloat(document.getElementById('nr-deposit').value) || 0;
  const notes = document.getElementById('nr-notes').value.trim();
  const accessories = getCheckedAccessories();
  const parts = Array.from(document.querySelectorAll('#nr-parts-list input[name="nr-parts"]:checked'))
    .map(input => DB.products.find(product => product.id === input.value)?.name)
    .filter(Boolean);
  const existingClientId = document.getElementById('nr-client-id').value;

  if (!deviceType || !model || !clientName || !problem) {
    alert('Por favor elegí el tipo de equipo y completá modelo, cliente y falla reportada.');
    return;
  }

  let client = existingClientId
    ? DB.clients.find(c => c.id === existingClientId)
    : DB.clients.find(c => c.name.toLowerCase() === clientName.toLowerCase());

  if (!client) {
    client = {
      id: 'C' + String(DB.nextClientId++).padStart(3, '0'),
      name: clientName,
      phone: clientPhone || '—',
      email: clientEmail,
      address: clientAddress,
      dni: clientDni,
      dateAdded: new Date().toISOString().split('T')[0],
      repairs: []
    };
    DB.clients.push(client);
  } else {
    client.name = clientName;
    if (clientPhone) client.phone = clientPhone;
    if (clientEmail) client.email = clientEmail;
    if (clientAddress) client.address = clientAddress;
    if (clientDni) client.dni = clientDni;
  }

  const accessoryNote = accessories.length ? `Accesorios: ${accessories.join(', ')}` : '';
  const combinedNotes = [notes, accessoryNote].filter(Boolean).join('\n');
  const security = getNewRepairSecurity();

  const newId = 'R-' + DB.nextRepairId++;
  const repair = {
    id: newId,
    device,
    deviceType,
    deviceIcon: REPAIR_DEVICE_ICONS[deviceType] || getDeviceIcon(brand, model),
    brand,
    model,
    color: document.getElementById('nr-color').value.trim(),
    capacity: isNotebook || isSpeaker || isConsole ? '' : document.getElementById('nr-capacity').value,
    imei1: document.getElementById('nr-imei1').value.trim(),
    deviceKey: security.pin,
    devicePattern: security.pattern,
    accessories,
    ...(isConsole ? { consoleAccessories: getNewRepairConsoleAccessories() } : {}),
    physicalState: isSpeaker
      ? getNewRepairSpeakerPhysicalState()
      : isConsole
        ? getNewRepairConsolePhysicalState()
      : isNotebook
      ? Object.fromEntries(['general', 'scratches', 'impacts'].map(key => [
        key,
        document.querySelector(`input[name="nr-physical-notebook-${key}"]:checked`)?.value || '',
      ]))
      : getNewRepairPhysicalState(),
    functionalState: isConsole
      ? getNewRepairConsoleFunctionalState()
      : isNotebook ? getNewRepairNotebookFunctionalState() : isSpeaker ? {} : getNewRepairFunctionalState(),
    client: clientName,
    clientId: client.id,
    clientDni: clientDni,
    problem,
    diagnosis: 'Pendiente de diagnóstico',
    status: 'recibido',
    priority,
    progress: 0,
    dateIn: dateIn || new Date().toISOString().split('T')[0],
    dateEst: dateEst || '',
    price,
    deposit,
    notes: combinedNotes,
    parts,
    history: [{ date: new Date().toISOString().split('T')[0], action: 'Ingreso del equipo', user: 'Técnico' }]
  };

  DB.repairs.unshift(repair);
  if (!Array.isArray(client.repairs)) client.repairs = [];
  client.repairs.push(newId);
  persistAppState();

  closeModal('modal-new-repair');
  renderRepairs();
  renderHome();
  renderClients();
  renderReports();
  navigate('repairs');
  showToast('Reparación guardada', 'success');
  setTimeout(() => printVoletas(newId), 300);
}

function saveEditRepair() {
  const id = document.getElementById('edit-repair-id').value;
  const r = DB.repairs.find(x => x.id === id);
  if (!r) return;

  const newStatus = document.getElementById('edit-status').value;
  const newProgress = parseInt(document.getElementById('edit-progress').value);
  const newNotes = document.getElementById('edit-notes').value.trim();
  const parsedPrice = parseFloat(document.getElementById('edit-price').value);
  const parsedDeposit = parseFloat(document.getElementById('edit-deposit').value);
  const newPrice = Number.isFinite(parsedPrice) && parsedPrice >= 0 ? parsedPrice : Number(r.price || 0);
  const newDeposit = Number.isFinite(parsedDeposit) && parsedDeposit >= 0 ? parsedDeposit : parseMoneyAmount(r.deposit ?? r.remitoDeposit ?? 0);
  const clientName = document.getElementById('edit-client-name').value.trim();
  const clientPhone = document.getElementById('edit-client-phone').value.trim();
  const clientEmail = document.getElementById('edit-client-email').value.trim();
  const clientAddress = document.getElementById('edit-client-address').value.trim();
  const clientDni = document.getElementById('edit-client-dni').value.trim();
  const isNotebook = isNotebookRepair(r);
  const isSpeaker = isSpeakerRepair(r);
  const isConsole = isConsoleRepair(r);
  const physicalKeys = isSpeaker
    ? ['general', 'scratches', 'impacts', 'light']
    : isNotebook || isConsole
      ? ['general', 'scratches', 'impacts']
      : ['screen', 'back', 'frame', 'corrosion', 'port', 'previous', 'general', 'scratches', 'impacts'];
  const functionalKeys = ['power', 'touch', 'charge', 'sound', 'microphone', 'wifi', 'buttons', 'biometric'];
  const notebookFunctionalKeys = NOTEBOOK_FUNCTIONAL_GROUPS.map(([key]) => key);
  const consoleFunctionalKeys = CONSOLE_FUNCTIONAL_GROUPS.map(([key]) => key);
  r.checkoutFunctionalState = isSpeaker ? {} : isConsole
    ? getEditCheckoutState('functional', consoleFunctionalKeys)
    : isNotebook
      ? getEditCheckoutState('functional', notebookFunctionalKeys)
      : getEditCheckoutState('functional', functionalKeys);

  if (!clientName) {
    alert('El nombre del cliente es obligatorio.');
    return;
  }

  let client = DB.clients.find(item => item.id === r.clientId);
  if (!client) {
    client = DB.clients.find(item => item.name.toLowerCase() === String(r.client || '').toLowerCase());
  }
  if (!client) {
    client = {
      id: 'C' + String(DB.nextClientId++).padStart(3, '0'),
      name: clientName,
      phone: clientPhone || '—',
      email: clientEmail,
      address: clientAddress,
      dni: clientDni,
      dateAdded: new Date().toISOString().split('T')[0],
      repairs: [r.id],
    };
    DB.clients.push(client);
    r.clientId = client.id;
  } else {
    client.name = clientName;
    client.phone = clientPhone || '—';
    client.email = clientEmail;
    client.address = clientAddress;
    client.dni = clientDni;
  }
  DB.repairs.forEach(repair => {
    if (repair.clientId === client.id) {
      repair.client = clientName;
      repair.clientDni = clientDni;
    }
  });

  if (newStatus !== r.status) {
    r.history.push({ date: new Date().toISOString().split('T')[0], action: `Estado cambiado a: ${STATUS[newStatus]?.label || newStatus}`, user: 'Técnico' });
  }

  r.status = newStatus;
  r.progress = clampProgress(newProgress);
  r.notes = newNotes;
  r.price = newPrice;
  r.deposit = newDeposit;
  r.remitoDeposit = newDeposit;
  r.checkoutPhysicalState = getEditCheckoutState('physical', physicalKeys);
  r.checkoutFunctionalState = isSpeaker ? {} : isConsole
    ? getEditCheckoutState('functional', consoleFunctionalKeys)
    : isNotebook
      ? getEditCheckoutState('functional', notebookFunctionalKeys)
      : getEditCheckoutState('functional', functionalKeys);
  persistAppState();

  closeModal('modal-edit-repair');
  closeDetail('repair-detail');
  renderRepairs();
  renderHome();
  renderReports();
  showToast('Cambios guardados', 'success');
  openRepairDetail(id);
}

function openNewClient() {
  if (!userHasPermission('new_client')) {
    showToast('No tenés permisos para crear clientes.', 'info');
    return;
  }
  document.getElementById('new-client-form').reset();
  openModal('modal-new-client');
}

function saveNewClient() {
  const name = document.getElementById('nc-name').value.trim();
  const phone = document.getElementById('nc-phone').value.trim();
  const email = document.getElementById('nc-email').value.trim();
  const address = document.getElementById('nc-address').value.trim();

  if (!name || !phone) {
    alert('Por favor completá nombre y teléfono.');
    return;
  }

  const client = {
    id: 'C' + String(DB.nextClientId++).padStart(3, '0'),
    name, phone, email, address,
    dateAdded: new Date().toISOString().split('T')[0],
    repairs: []
  };
  DB.clients.push(client);
  persistAppState();
  closeModal('modal-new-client');
  renderClients();
  renderHome();
  renderReports();
  showToast('Cliente guardado', 'success');
}

function deleteClient(id) {
  if (!userHasPermission('delete_records')) {
    showToast('Solo un administrador puede eliminar clientes.', 'info');
    return;
  }
  const client = DB.clients.find(item => item.id === id);
  if (!client) return;

  const linkedRepairs = DB.repairs.filter(repair =>
    repair.clientId === id || client.repairs?.includes(repair.id)
  );
  const repairMessage = linkedRepairs.length
    ? ` Sus ${linkedRepairs.length} reparación${linkedRepairs.length === 1 ? '' : 'es'} se conservarán sin cliente asociado.`
    : '';

  if (!confirm(`¿Eliminar al cliente ${client.name}?${repairMessage}`)) return;

  DB.clients = DB.clients.filter(item => item.id !== id);
  linkedRepairs.forEach(repair => {
    if (repair.clientId === id) repair.clientId = '';
  });
  persistAppState();
  closeDetail('client-detail');
  renderClients();
  renderHome();
  renderRepairs();
  renderReports();
  showToast('Cliente eliminado', 'info');
}

const PRODUCT_SUBCATEGORIES = {
  Repuesto: {
    'Pantallas y módulos': ['Módulo de pantalla', 'Pantalla LCD', 'Pantalla OLED', 'Touch / digitalizador', 'Vidrio de pantalla'],
    'Baterías': ['Batería', 'Flex de batería', 'Adhesivo de batería'],
    'Carga': ['Pin de carga', 'Módulo de carga', 'Flex de carga', 'Puerto USB-C', 'Puerto Lightning'],
    'Flex y botones': ['Flex de encendido', 'Flex de volumen', 'Flex de botones', 'Flex de sensores'],
    'Cámaras': ['Cámara frontal', 'Cámara trasera', 'Lente de cámara'],
    'Audio': ['Parlante auricular', 'Altavoz', 'Micrófono', 'Flex de audio'],
    'Carcasa y SIM': ['Tapa trasera', 'Marco / carcasa', 'Bandeja SIM'],
    'Otros repuestos': [],
  },
  Accesorio: {
    'Fundas': ['Funda transparente', 'Funda de silicona', 'Funda antigolpes'],
    'Protectores': ['Vidrio templado', 'Hidrogel', 'Protector de cámara'],
    'Cargadores y cables': ['Cargador', 'Cable USB-C', 'Cable Lightning', 'Cargador inalámbrico'],
    'Audio': ['Auriculares', 'Auriculares Bluetooth', 'Adaptador de audio'],
    'Soportes': ['Soporte para celular', 'Soporte para auto', 'Aro de soporte'],
    'Almacenamiento': ['Tarjeta microSD', 'Pendrive OTG'],
    'Otros accesorios': [],
  },
};

function updateNewProductOptions() {
  const category = document.getElementById('np-category').value;
  const subcategory = document.getElementById('np-subcategory');
  const options = Object.keys(PRODUCT_SUBCATEGORIES[category] || {});
  subcategory.replaceChildren(...options.map(option => new Option(option, option)));
  updateNewProductSuggestions();
}

function updateNewProductSuggestions() {
  const category = document.getElementById('np-category').value;
  const subcategory = document.getElementById('np-subcategory').value;
  const suggestions = new Set(PRODUCT_SUBCATEGORIES[category]?.[subcategory] || []);
  DB.products.filter(product => product.category === category).forEach(product => suggestions.add(product.name));
  document.getElementById('np-product-suggestions').replaceChildren(
    ...[...suggestions].map(name => new Option(name, name))
  );
}

function openNewProduct() {
  if (!userHasPermission('new_product')) {
    showToast('Solo un administrador puede agregar productos.', 'info');
    return;
  }
  document.getElementById('new-product-form').reset();
  updateNewProductOptions();
  openModal('modal-new-product');
}

function saveNewProduct() {
  const name = document.getElementById('np-name').value.trim();
  const category = document.getElementById('np-category').value;
  const subcategory = document.getElementById('np-subcategory').value;
  const stock = parseInt(document.getElementById('np-stock').value) || 0;
  const minStock = parseInt(document.getElementById('np-min-stock').value) || 1;
  const price = parseFloat(document.getElementById('np-price').value) || 0;
  const cost = parseFloat(document.getElementById('np-cost').value) || 0;

  if (!name) { alert('Ingresá el nombre del producto.'); return; }

  const icons = { Repuesto: '🔩', Accesorio: '📦' };
  DB.products.push({
    id: 'P' + String(DB.products.length + 1).padStart(3, '0'),
    name, category, subcategory, icon: icons[category] || '📦',
    stock, minStock, price, cost
  });
  persistAppState();
  closeModal('modal-new-product');
  renderInventory();
  renderReports();
  updateStockAlertBadge();
  showToast('Producto agregado', 'success');
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  updateBusinessNameDisplay();

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.bottom-nav')) closeMoreMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMoreMenu();
  });

  const session = getStoredSession();
  updateUserBadge(session);
  syncActionPermissions();
  if (!session) {
    openModal('modal-login');
  } else {
    closeModal('modal-login');
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const username = document.getElementById('login-user').value.trim();
      const password = document.getElementById('login-password').value.trim();
      const user = loginUser(username, password);
      if (!user) {
        showToast('Credenciales inválidas', 'info');
        return;
      }
      syncActionPermissions();
      closeModal('modal-login');
      navigate(currentPage);
      showToast(`Bienvenido ${user.name}`, 'success');
    });
  }

  const newAccessForm = document.getElementById('new-access-form');
  if (newAccessForm) {
    newAccessForm.addEventListener('submit', (event) => {
      event.preventDefault();
      saveNewAccess();
    });
  }

  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      applyTheme(document.body.dataset.theme === 'dark' ? 'light' : 'dark');
    });
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logoutUser);
  }

  initPwa();
  renderHome();
  renderRepairs();
  renderClients();
  renderInventory();
  renderAgenda();
  renderSuppliers();
  renderSales();
  renderReports();
  updateStockAlertBadge();
});
