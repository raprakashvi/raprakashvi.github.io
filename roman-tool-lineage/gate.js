// An interface gate only. Every static asset remains publicly accessible.
export async function unlock() {
  const box = document.createElement('section'); box.className = 'gate';
  box.innerHTML = `<aside class="gate-intro"><div class="gate-brand"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 7 16 26 27 7M10 7l6 10 6-10" fill="none" stroke="currentColor" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"/></svg>Vestigium</div><div><h2>Tools across<br>time and place.</h2><p>A research workspace for exploring form, function and the evidence connecting them.</p><div class="gate-grid" aria-hidden="true"><svg viewBox="0 0 420 160" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M40 80h65m0 0 70-48m-70 48 70 48M175 32h70m-70 96h70m0-96 75 48m-75 48 75-48h60" opacity=".5"/><g fill="#121d32"><circle cx="40" cy="80" r="10"/><circle cx="105" cy="80" r="7"/><circle cx="175" cy="32" r="11"/><circle cx="175" cy="128" r="11"/><circle cx="245" cy="32" r="8"/><circle cx="245" cy="128" r="8"/><circle cx="320" cy="80" r="13"/><circle cx="380" cy="80" r="8"/></g></svg></div></div><small>Collection records · comparative morphology · source studies</small></aside><div class="gate-form-panel"><div class="gate-card"><p class="eyebrow">Research workspace</p><h1>Welcome to Vestigium</h1><p>Sign in to explore the collection and research atlas.</p><form id="gate-form"><label>Username<input id="gate-user" autocomplete="username" required></label><label>Password<input id="gate-pass" type="password" autocomplete="current-password" required></label><button>Sign in →</button></form><p id="gate-status" role="status" aria-live="polite">Loading access configuration…</p><small>This is a basic interface gate. The underlying static files are publicly accessible. Use a password unique to this collection.</small></div></div>`;
  document.body.prepend(box);
  const form = box.querySelector('form'), status = box.querySelector('#gate-status');
  form.querySelector('button').disabled = true;
  let config;
  try {
    config = await (await fetch(new URL('gate-config.json', import.meta.url), {cache:'no-store'})).json();
    if (config.algorithm !== 'PBKDF2-SHA256' || !Number.isInteger(config.iterations) || config.iterations < 210000 || !/^[0-9a-f]{32}$/.test(config.salt) || !/^[0-9a-f]{64}$/.test(config.verifier)) throw Error('unconfigured');
  } catch { status.textContent = 'Access is not configured. The collection owner must configure credentials and rebuild.'; return new Promise(()=>{}); }
  const sessionKey = 'tool-atlas-gate:' + config.verifier;
  const stored = Number(sessionStorage.getItem(sessionKey));
  if (stored > Date.now()) { box.remove(); return; }
  status.textContent = ''; form.querySelector('button').disabled = false;
  box.querySelector('input').focus();
  await new Promise(resolve => form.addEventListener('submit', async event => {
    event.preventDefault(); const button = form.querySelector('button'); button.disabled = true;
    try {
      const bytes = new TextEncoder().encode(box.querySelector('#gate-user').value + '\0' + box.querySelector('#gate-pass').value);
      const key = await crypto.subtle.importKey('raw', bytes, 'PBKDF2', false, ['deriveBits']);
      const salt = Uint8Array.from(config.salt.match(/../g), n=>parseInt(n,16));
      const bits = await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt,iterations:config.iterations}, key, 256);
      const actual = Array.from(new Uint8Array(bits), n=>n.toString(16).padStart(2,'0')).join('');
      if (actual !== config.verifier) { status.textContent = 'Username or password was not recognized.'; return; }
      sessionStorage.setItem(sessionKey, String(Date.now()+8*60*60*1000)); box.remove(); resolve();
    } catch { status.textContent = 'Sign-in failed. Use HTTPS or localhost in a modern browser.'; }
    finally { button.disabled = false; box.querySelector('#gate-pass').value = ''; }
  }));
}
export function signOut() {
  for (const key of Object.keys(sessionStorage)) if (key.startsWith('tool-atlas-gate:')) sessionStorage.removeItem(key);
  location.reload();
}
