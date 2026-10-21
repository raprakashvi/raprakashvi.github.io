// An interface gate only. Every static asset remains publicly accessible.
export async function unlock() {
  const box = document.createElement('section'); box.className = 'gate';
  box.innerHTML = `<div class="gate-card"><p class="eyebrow">Research collection</p><h1>Tool Atlas</h1><p>Sign in to browse the collection.</p><form id="gate-form"><label>Username<input id="gate-user" autocomplete="username" required></label><label>Password<input id="gate-pass" type="password" autocomplete="current-password" required></label><button>Enter collection</button></form><p id="gate-status" role="status" aria-live="polite">Loading access configuration…</p><small>This is a basic interface gate. The static files are public. Please use a password unique to this collection.</small></div>`;
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
