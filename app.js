const CONFIG = {
  COMPANY_IDENTIFIER: 'infocloud',
  SUPERADMIN_URL: '/superadmin',
  HRMS_API: '/workplace/api/v1',
  WORKSPACE_API: '/api',
  PARKING_API: '/parking/api',
  BUS_API: '/bus/api',
};

const MODULE_META = {
  hrms: {
    title: 'HRMS & Payroll Portal',
    desc: 'Employee dashboard, leave tracking, payslips, deductions, and tax declarations.',
    accent: '#046aae',
    iconBg: '#e0f2fe',
    tag: 'HR & Self Service',
    icon: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>'
  },
  parking: {
    title: 'Car Parking Management',
    desc: 'Vehicle slot reservations, parking passes, and visitor parking availability.',
    accent: '#f59e0b',
    iconBg: '#fef3c7',
    tag: 'Smart Parking',
    icon: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>'
  },
  vms: {
    title: 'Visitor Management (VMS)',
    desc: 'Front desk check-in, guest passes, host notifications, and badge printing.',
    accent: '#0d9488',
    iconBg: '#ccfbf1',
    tag: 'Front Desk & Security',
    icon: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><line x1="15" y1="8" x2="17" y2="8"/><line x1="15" y1="12" x2="17" y2="12"/><line x1="7" y1="16" x2="17" y2="16"/></svg>'
  },
  hotdesk: {
    title: 'Hot Desk Booking',
    desc: 'Reserve office desks, collaborative workstations, and flexible day seats.',
    accent: '#6366f1',
    iconBg: '#ede9fe',
    tag: 'Workspaces',
    icon: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>'
  },
  conference: {
    title: 'Conference Room Booking',
    desc: 'Schedule meeting spaces, invite team members, and check room amenities.',
    accent: '#0284c7',
    iconBg: '#e0f2fe',
    tag: 'Meeting Rooms',
    icon: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>'
  },
  bus: {
    title: 'Corporate Transport',
    desc: 'Corporate shuttle routes, office transit scheduling, and fleet tracking.',
    accent: '#ea580c',
    iconBg: '#ffedd5',
    tag: 'Employee Transit',
    icon: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="15" rx="3"/><circle cx="7.5" cy="18" r="1.5"/><circle cx="16.5" cy="18" r="1.5"/><path d="M3 11h18M7 7h2M15 7h2"/></svg>'
  },
  assets: {
    title: 'Asset Management',
    desc: 'Hardware inventory, IT asset lifecycle, software licenses, and device tracking.',
    accent: '#4338ca',
    iconBg: '#e0e7ff',
    tag: 'Enterprise IT',
    icon: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>'
  }
};

let state = {
  verificationToken: null,
  email: null,
  company: null,
  orgSessionToken: null,
  resendTimer: null,
  countdownValue: 60
};

// DOM ready listener
document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  initApp();
});

function initEventListeners() {
  const formEmail = document.getElementById('form-email');
  if (formEmail) {
    formEmail.addEventListener('submit', handleSendOtp);
  }

  const formOtp = document.getElementById('form-otp');
  if (formOtp) {
    formOtp.addEventListener('submit', handleVerifyOtp);
  }

  const btnResend = document.getElementById('btn-resend');
  if (btnResend) {
    btnResend.addEventListener('click', handleResendOtp);
  }

  const btnChangeEmail = document.getElementById('btn-change-email');
  if (btnChangeEmail) {
    btnChangeEmail.addEventListener('click', () => switchStep('email'));
  }

  const btnSignout = document.getElementById('btn-signout');
  if (btnSignout) {
    btnSignout.addEventListener('click', handleLogout);
  }

  const btnModalDismiss = document.getElementById('btn-modal-dismiss');
  if (btnModalDismiss) {
    btnModalDismiss.addEventListener('click', hideAccessModal);
  }

  const accessModal = document.getElementById('access-modal');
  if (accessModal) {
    accessModal.addEventListener('click', (e) => {
      if (e.target === accessModal) hideAccessModal();
    });
  }
}

async function initApp() {
  const savedToken = localStorage.getItem('orgSessionToken');
  const savedEmail = localStorage.getItem('orgEmail');
  const savedCompany = localStorage.getItem('companyInfo');

  if (savedToken && savedEmail) {
    state.orgSessionToken = savedToken;
    state.email = savedEmail;
    if (savedCompany) {
      try {
        state.company = JSON.parse(savedCompany);
      } catch (e) {}
    }
    await verifyAndLoadCompany(true);
    return;
  }

  await verifyAndLoadCompany(false);
}

async function verifyAndLoadCompany(hasExistingSession) {
  try {
    const res = await fetch(`${CONFIG.SUPERADMIN_URL}/company/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: CONFIG.COMPANY_IDENTIFIER })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      state.company = data.company;
      state.verificationToken = data.verificationToken;
      localStorage.setItem('companyInfo', JSON.stringify(data.company));
      renderCompanyPill();

      if (hasExistingSession && state.orgSessionToken) {
        renderModulesDashboard();
      }
    } else {
      showError('err-email', data.message || 'Unable to connect to company server.');
    }
  } catch (err) {
    console.error(err);
    showError('err-email', 'Network connection error. Please refresh the page.');
  }
}

function renderCompanyPill() {
  if (!state.company) return;
  const logoUrl = state.company.org_image || 'infocloud-logo.png';

  const showcaseLogo = document.getElementById('showcase-company-logo');
  if (showcaseLogo) showcaseLogo.src = logoUrl;

  const bannerLogo = document.getElementById('company-banner-logo');
  if (bannerLogo) bannerLogo.src = logoUrl;

  const dashLogo = document.getElementById('dash-company-logo');
  if (dashLogo) dashLogo.src = logoUrl;

  const compEl = document.getElementById('user-company-name');
  if (compEl && state.company.org_name) {
    compEl.textContent = state.company.org_name;
  }
}

function switchStep(step) {
  const stepEmail = document.getElementById('step-email');
  const stepOtp = document.getElementById('step-otp');
  const authContainer = document.getElementById('auth-container');
  const dashContainer = document.getElementById('dashboard-container');

  if (stepEmail) stepEmail.style.display = step === 'email' ? 'block' : 'none';
  if (stepOtp) stepOtp.style.display = step === 'otp' ? 'block' : 'none';
  if (authContainer) authContainer.style.display = step === 'dashboard' ? 'none' : 'grid';
  if (dashContainer) dashContainer.style.display = step === 'dashboard' ? 'flex' : 'none';

  clearErrors();
}

function showError(containerId, message) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = message ? `
    <div class="alert-error">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>${message}</span>
    </div>
  ` : '';
}

function clearErrors() {
  ['err-email', 'err-otp'].forEach(id => showError(id, ''));
}

function setBtnLoading(btnId, isLoading, label) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = isLoading;
  btn.innerHTML = isLoading ? `<div class="spinner"></div><span>${label}</span>` : `<span>${label}</span>`;
}

function showAccessModal(moduleTitle, customMsg) {
  const modal = document.getElementById('access-modal');
  const msgEl = document.getElementById('modal-error-message');
  const text = customMsg || `You are not registered for the ${moduleTitle} module. Please contact your administrator.`;
  if (msgEl) msgEl.textContent = text;
  if (modal) modal.style.display = 'flex';
}

function hideAccessModal() {
  const modal = document.getElementById('access-modal');
  if (modal) modal.style.display = 'none';
}

async function handleSendOtp(e) {
  if (e && e.preventDefault) e.preventDefault();
  clearErrors();

  const emailInput = document.getElementById('input-email').value.trim();
  if (!emailInput) {
    showError('err-email', 'Please enter your work email address.');
    return;
  }

  if (!state.verificationToken) {
    await verifyAndLoadCompany(false);
    if (!state.verificationToken) {
      showError('err-email', 'Connecting to authentication service... Please try again in a moment.');
      return;
    }
  }

  setBtnLoading('btn-send-otp', true, 'Sending Code...');

  try {
    const res = await fetch(`${CONFIG.SUPERADMIN_URL}/company/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        verificationToken: state.verificationToken,
        email: emailInput
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      showError('err-email', data.message || 'Failed to dispatch verification code.');
      return;
    }

    state.email = emailInput;
    document.getElementById('display-user-email').textContent = emailInput;
    switchStep('otp');
    startResendTimer();
    const otpInput = document.getElementById('input-otp');
    if (otpInput) {
      otpInput.value = '';
      otpInput.focus();
    }
  } catch (err) {
    console.error(err);
    showError('err-email', 'Server connection failure. Please try again.');
  } finally {
    setBtnLoading('btn-send-otp', false, 'Continue with Email');
  }
}

function startResendTimer() {
  clearInterval(state.resendTimer);
  state.countdownValue = 60;
  const countdownEl = document.getElementById('countdown');
  const timerTextEl = document.getElementById('resend-timer-text');
  const resendBtn = document.getElementById('btn-resend');

  if (countdownEl) countdownEl.textContent = state.countdownValue;
  if (timerTextEl) timerTextEl.style.display = 'inline';
  if (resendBtn) resendBtn.style.display = 'none';

  state.resendTimer = setInterval(() => {
    state.countdownValue -= 1;
    if (countdownEl) countdownEl.textContent = state.countdownValue;
    if (state.countdownValue <= 0) {
      clearInterval(state.resendTimer);
      if (timerTextEl) timerTextEl.style.display = 'none';
      if (resendBtn) {
        resendBtn.style.display = 'inline-flex';
        resendBtn.disabled = false;
        resendBtn.textContent = 'Resend Code';
      }
    }
  }, 1000);
}

async function handleResendOtp() {
  clearErrors();
  const resendBtn = document.getElementById('btn-resend');
  if (resendBtn) {
    resendBtn.disabled = true;
    resendBtn.textContent = 'Sending...';
  }

  try {
    const res = await fetch(`${CONFIG.SUPERADMIN_URL}/company/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        verificationToken: state.verificationToken,
        email: state.email
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      showError('err-otp', data.message || 'Failed to resend code.');
      return;
    }

    startResendTimer();
  } catch (err) {
    console.error(err);
    showError('err-otp', 'Unable to reach the verification server.');
  } finally {
    if (resendBtn) {
      resendBtn.disabled = false;
      resendBtn.textContent = 'Resend Code';
    }
  }
}

async function handleVerifyOtp(e) {
  if (e && e.preventDefault) e.preventDefault();
  clearErrors();

  const code = document.getElementById('input-otp').value.trim();
  if (!code) {
    showError('err-otp', 'Please enter the 6-digit verification code.');
    return;
  }

  setBtnLoading('btn-verify-otp', true, 'Verifying...');

  try {
    const res = await fetch(`${CONFIG.SUPERADMIN_URL}/company/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        verificationToken: state.verificationToken,
        email: state.email,
        code: code
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      showError('err-otp', data.message || 'Invalid or expired verification code.');
      return;
    }

    state.orgSessionToken = data.orgSessionToken;
    localStorage.setItem('orgSessionToken', data.orgSessionToken);
    localStorage.setItem('orgEmail', state.email);

    renderModulesDashboard();
  } catch (err) {
    console.error(err);
    showError('err-otp', 'Verification failed due to a network error.');
  } finally {
    setBtnLoading('btn-verify-otp', false, 'Verify & Continue');
  }
}

function renderModulesDashboard() {
  switchStep('dashboard');

  const email = state.email || '';
  const emailEl = document.getElementById('header-user-email');
  if (emailEl) emailEl.textContent = email;

  // Personalized username from email (e.g. pratham@enterlyze.com -> Pratham)
  const username = email ? email.split('@')[0].replace(/[._-]/g, ' ') : 'Employee';
  const capitalizedName = username.charAt(0).toUpperCase() + username.slice(1);
  const welcomeGreeting = document.getElementById('welcome-user-name');
  if (welcomeGreeting) welcomeGreeting.textContent = capitalizedName;

  const compEl = document.getElementById('user-company-name');
  if (compEl) compEl.textContent = (state.company && state.company.org_name) ? state.company.org_name : 'Infocloud It Services pvt. ltd.';

  const avatarEl = document.getElementById('avatar-initial');
  if (avatarEl) avatarEl.textContent = (email || 'U').charAt(0).toUpperCase();

  renderCompanyPill();

  const grid = document.getElementById('modules-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const modules = (state.company && state.company.enabledModules) ? state.company.enabledModules : [];
  const activeModules = modules.filter(m => m.code !== 'attendance');

  if (activeModules.length === 0) {
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">No modules are currently enabled for this company.</div>';
    return;
  }

  activeModules.forEach(mod => {
    const meta = MODULE_META[mod.code] || {
      title: mod.name,
      desc: 'Access and manage this enterprise service.',
      accent: '#046aae',
      iconBg: '#f0f7fc',
      tag: 'Enterprise App',
      icon: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/></svg>'
    };

    const card = document.createElement('div');
    card.className = 'module-card';
    card.id = `mod-card-${mod.code}`;
    card.style.setProperty('--card-accent', meta.accent);
    card.style.setProperty('--icon-bg', meta.iconBg);
    card.addEventListener('click', () => launchModule(mod.code, meta.title));

    card.innerHTML = `
      <div class="module-card-top">
        <div class="module-icon-wrap">${meta.icon}</div>
        <span class="module-badge">Active</span>
      </div>
      <div class="module-title">${meta.title}</div>
      <div class="module-desc">${meta.desc}</div>
      <div class="module-action">
        <span>Launch Application</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </div>
    `;

    grid.appendChild(card);
  });
}

async function launchModule(code, moduleTitle) {
  const card = document.getElementById(`mod-card-${code}`);
  if (card) {
    card.classList.add('loading');
    const overlay = document.createElement('div');
    overlay.className = 'launch-overlay';
    overlay.id = `overlay-${code}`;
    overlay.innerHTML = '<div class="spinner dark"></div><div class="launch-text">Verifying access...</div>';
    card.appendChild(overlay);
  }

  try {
    // VMS
    if (code === 'vms') {
      try {
        const res = await fetch(`${CONFIG.SUPERADMIN_URL}/admin/verify-admin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orgSessionToken: state.orgSessionToken })
        });
        const data = await res.json();
        removeOverlay(code);

        if (res.ok && data.token) {
          localStorage.setItem('jwtToken', data.token);
          window.open(`/admin/dashboard1?token=${encodeURIComponent(data.token)}`, '_blank');
        } else {
          window.open('/visitor-form', '_blank');
        }
        return;
      } catch (err) {
        removeOverlay(code);
        const email = (state.email || '').toLowerCase().trim();
        const vmsAdmins = ['admin@enterlyze.com', 'pratham@enterlyze.com'];
        const targetUrl = vmsAdmins.includes(email) ? '/admin/dashboard1' : '/visitor-form';
        window.open(targetUrl, '_blank');
        return;
      }
    }

    // HRMS
    if (code === 'hrms') {
      const res = await fetch(`${CONFIG.HRMS_API}/auth/verify-employee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgSessionToken: state.orgSessionToken })
      });
      const data = await res.json();

      removeOverlay(code);

      if (!res.ok) {
        showAccessModal(moduleTitle || 'HRMS', `You are not registered for the HRMS module. Please contact your administrator.`);
        return;
      }

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('payroll-auth', JSON.stringify({
        state: {
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
          profileMode: 'admin'
        },
        version: 0
      }));

      window.open('/workplace', '_blank');
      return;
    }

    // Hot Desk
    if (code === 'hotdesk') {
      const res = await fetch(`${CONFIG.WORKSPACE_API}/employee/verify-employee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgSessionToken: state.orgSessionToken })
      });
      const data = await res.json();

      removeOverlay(code);

      if (!res.ok) {
        showAccessModal(moduleTitle || 'Hot Desk', `You are not registered for the Hot Desk module. Please contact your administrator.`);
        return;
      }

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('employee_name', data.employee.name);
      localStorage.setItem('employee_email', data.employee.email);
      localStorage.setItem('employee_role', data.employee.role || 'employee');
      localStorage.setItem('admin_email', data.employee.email);

      window.open('/workspace/', '_blank');
      return;
    }

    // Conference
    if (code === 'conference') {
      const res = await fetch(`${CONFIG.WORKSPACE_API}/employee/verify-employee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgSessionToken: state.orgSessionToken })
      });
      const data = await res.json();

      removeOverlay(code);

      if (!res.ok) {
        showAccessModal(moduleTitle || 'Conference Room', `You are not registered for the Conference Room module. Please contact your administrator.`);
        return;
      }

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('employee_name', data.employee.name);
      localStorage.setItem('employee_email', data.employee.email);
      localStorage.setItem('employee_role', data.employee.role || 'employee');
      localStorage.setItem('admin_email', data.employee.email);

      window.open('/workspace/meetings', '_blank');
      return;
    }

    // Car Parking
    if (code === 'parking') {
      const res = await fetch(`${CONFIG.PARKING_API}/auth/verify-employee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgSessionToken: state.orgSessionToken })
      });
      const data = await res.json();

      removeOverlay(code);

      if (!res.ok) {
        showAccessModal(moduleTitle || 'Car Parking', `You are not registered for the Car Parking module. Please contact your administrator.`);
        return;
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('parking_token', data.token);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('parking_user', JSON.stringify(data.user));
      }

      window.open('/car/', '_blank');
      return;
    }

    // Corporate Transport (Bus)
    if (code === 'bus') {
      const res = await fetch(`${CONFIG.BUS_API}/auth/verify-employee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgSessionToken: state.orgSessionToken })
      });
      const data = await res.json();

      removeOverlay(code);

      if (!res.ok) {
        showAccessModal(moduleTitle || 'Corporate Transport', `You are not registered for the Corporate Transport module. Please contact your administrator.`);
        return;
      }

      if (data.token) {
        localStorage.setItem('enterlyze:token', data.token);
        localStorage.setItem('token', data.token);
        localStorage.setItem('bus_token', data.token);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('bus_user', JSON.stringify(data.user));
      }

      window.open('/bus/', '_blank');
      return;
    }

    // Asset Management
    if (code === 'assets' || code === 'asset') {
      const res = await fetch('/assets/api/v1/auth/verify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgSessionToken: state.orgSessionToken })
      });
      const data = await res.json();

      removeOverlay(code);

      if (!res.ok) {
        showAccessModal(moduleTitle || 'Asset Management', data.message || `You are not registered as an administrator for the Asset Management module. Only admin accounts have access.`);
        return;
      }

      if (data.data?.accessToken) {
        localStorage.setItem('assets_token', data.data.accessToken);
      }
      if (data.data?.user) {
        localStorage.setItem('assets_user', JSON.stringify(data.data.user));
      }

      window.open('/assets/dashboard', '_blank');
      return;
    }

  } catch (err) {
    console.error(err);
    removeOverlay(code);
    showAccessModal(moduleTitle || 'Module', `Unable to connect to the module server. Please try again.`);
  }
}

function removeOverlay(code) {
  const card = document.getElementById(`mod-card-${code}`);
  if (card) {
    card.classList.remove('loading');
    const overlay = document.getElementById(`overlay-${code}`);
    if (overlay) overlay.remove();
  }
}

function handleLogout() {
  if (confirm('Are you sure you want to sign out from all applications?')) {
    localStorage.removeItem('orgSessionToken');
    localStorage.removeItem('orgEmail');
    state.orgSessionToken = null;
    state.email = null;
    switchStep('email');
    const inputEmail = document.getElementById('input-email');
    if (inputEmail) inputEmail.value = '';
    const inputOtp = document.getElementById('input-otp');
    if (inputOtp) inputOtp.value = '';
  }
}
