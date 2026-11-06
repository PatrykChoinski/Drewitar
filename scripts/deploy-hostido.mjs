// Wgrywa zbudowaną stronę (_site/) na hosting Hostido przez FTPS (szyfrowane FTP).
// Dane logowania tylko z sekretów GitHub Actions – nigdy nie są logowane:
//   HOSTIDO_FTP_HOST      np. host123456.hostido.net.pl (panel Hostido → konto → serwer)
//   HOSTIDO_FTP_USERNAME  konto FTP ograniczone do katalogu public_html domeny drewitar.pl
//   HOSTIDO_FTP_PASSWORD
// Hostido nie wysyła certyfikatu pośredniego Let's Encrypt, więc dołączamy go z
// scripts/certificates/hostido-intermediates.pem i sprawdzamy, że łańczy się z zaufanym rootem.
import { readFileSync } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import { X509Certificate } from 'node:crypto';
import { rootCertificates } from 'node:tls';
import { resolve, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Client } from 'basic-ftp';

const REQUIRED = ['index.html', '404.html', '.htaccess', 'oferta/index.html', 'kontakt/index.html'];

export function tlsOptions(host) {
  const pems = readFileSync(new URL('./certificates/hostido-intermediates.pem', import.meta.url), 'utf8')
    .match(/-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/g);
  const [intermediate, cross] = pems.map((p) => new X509Certificate(p));
  const now = Date.now();
  const valid = (c) => now >= Date.parse(c.validFrom) && now <= Date.parse(c.validTo);
  const chained = rootCertificates.some((p) => cross.verify(new X509Certificate(p).publicKey));
  if (!chained || !intermediate.verify(cross.publicKey) || !valid(intermediate) || !valid(cross)) {
    throw new Error('Łańcuch certyfikatów Hostido wymaga odświeżenia (Let\'s Encrypt).');
  }
  return { rejectUnauthorized: true, minVersion: 'TLSv1.2', servername: host, ca: [...rootCertificates, ...pems] };
}

export function config(env = process.env) {
  const host = env.HOSTIDO_FTP_HOST;
  const user = env.HOSTIDO_FTP_USERNAME;
  const password = env.HOSTIDO_FTP_PASSWORD;
  if (!host || !user || !password) {
    throw new Error('Brak sekretów HOSTIDO_FTP_HOST / HOSTIDO_FTP_USERNAME / HOSTIDO_FTP_PASSWORD w ustawieniach repozytorium.');
  }
  return { host, port: 21, user, password, secure: true, secureOptions: tlsOptions(host) };
}

export async function listUploads(dir = '_site') {
  const root = resolve(dir);
  for (const f of REQUIRED) await stat(resolve(root, f));
  const entries = await readdir(root, { recursive: true, withFileTypes: true });
  if (entries.some((e) => e.isSymbolicLink())) throw new Error('Build nie może zawierać dowiązań symbolicznych.');
  const uploads = entries.filter((e) => e.isFile()).map((e) => {
    const local = resolve(e.parentPath, e.name);
    return { local, remote: relative(root, local).replaceAll('\\', '/') };
  });
  // HTML na końcu (strona główna jako ostatnia), żeby nowe strony nie wskazywały na brakujące pliki.
  const rank = (r) => (r === 'index.html' ? 2 : r.endsWith('.html') ? 1 : 0);
  return uploads.sort((a, b) => rank(a.remote) - rank(b.remote) || a.remote.localeCompare(b.remote));
}

export async function deploy({ dir = '_site', env = process.env, client = new Client(60_000) } = {}) {
  const uploads = await listUploads(dir);
  try {
    client.ftp.verbose = false;
    await client.access(config(env));
    await client.cd('/');
    const top = (await client.list()).map((e) => e.name);
    if (top.some((n) => ['domains', 'public_html', 'Maildir', 'imap', 'public_ftp'].includes(n))) {
      throw Object.assign(new Error('Konto FTP musi być ograniczone do katalogu public_html domeny drewitar.pl.'), { code: 'HOSTIDO_DIRECTORY' });
    }
    const made = new Set();
    for (const f of uploads) {
      const folder = f.remote.split('/').slice(0, -1).join('/');
      if (folder && !made.has(folder)) { await client.ensureDir('/' + folder); await client.cd('/'); made.add(folder); }
      await client.uploadFrom(f.local, f.remote);
    }
    console.log(`Wgrano ${uploads.length} plików na drewitar.pl (FTPS).`);
  } finally {
    client.close();
  }
}

export async function withRetries(op, pause = (ms) => new Promise((r) => setTimeout(r, ms))) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try { return await op(); } catch (err) {
      if (err?.code !== 425 || attempt === 3) throw err;
      console.warn('Ponawiam po chwilowym błędzie kanału danych FTPS (425).');
      await pause(attempt * 3000);
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  withRetries(() => deploy()).catch((err) => {
    const code = String(err?.code || 'UNKNOWN');
    let msg = String(err?.message || '');
    for (const v of [process.env.HOSTIDO_FTP_USERNAME, process.env.HOSTIDO_FTP_PASSWORD]) if (v) msg = msg.split(v).join('[ukryte]');
    console.error(`Deploy na Hostido nie powiódł się (kod: ${/^[0-9A-Z_]{2,60}$/.test(code) ? code : 'UNKNOWN'}): ${msg.replace(/[\r\n]/g, ' ').slice(0, 300)}`);
    process.exitCode = 1;
  });
}
