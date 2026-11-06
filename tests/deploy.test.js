import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { config, tlsOptions, listUploads, deploy, withRetries } from '../scripts/deploy-hostido.mjs';

beforeAll(() => { execSync('npx eleventy --quiet', { stdio: 'inherit' }); }, 60_000);

const env = { HOSTIDO_FTP_HOST: 'host1.hostido.net.pl', HOSTIDO_FTP_USERNAME: 'u', HOSTIDO_FTP_PASSWORD: 'p' };

function fakeClient(topLevel = ['index.html']) {
  const calls = { uploads: [], dirs: [], closed: false };
  return {
    calls,
    ftp: {},
    access: async (cfg) => { calls.cfg = cfg; },
    cd: async () => {},
    list: async () => topLevel.map((name) => ({ name })),
    ensureDir: async (d) => calls.dirs.push(d),
    uploadFrom: async (_l, r) => calls.uploads.push(r),
    close: () => { calls.closed = true; },
  };
}

describe('deploy na Hostido', () => {
  it('wymaga wszystkich sekretów', () => {
    expect(() => config({})).toThrow(/HOSTIDO_FTP_HOST/);
    expect(() => config({ ...env, HOSTIDO_FTP_PASSWORD: '' })).toThrow();
  });

  it('łańcuch certyfikatów Hostido jest ważny i FTPS weryfikuje certyfikat', () => {
    const t = tlsOptions('host1.hostido.net.pl');
    expect(t.rejectUnauthorized).toBe(true);
    expect(t.servername).toBe('host1.hostido.net.pl');
    expect(config(env).secure).toBe(true);
  });

  it('wgrywa wszystko, strona główna na końcu', async () => {
    const list = await listUploads('_site');
    const names = list.map((u) => u.remote);
    expect(names).toContain('.htaccess');
    expect(names).toContain('assets/video/hds.mp4');
    expect(names.at(-1)).toBe('index.html');
    expect(names.findIndex((n) => n.endsWith('.html'))).toBeGreaterThan(names.findIndex((n) => n.endsWith('.css')));
  });

  it('wysyła pliki i zamyka połączenie', async () => {
    const c = fakeClient();
    await deploy({ env, client: c });
    expect(c.calls.uploads.length).toBeGreaterThan(50);
    expect(c.calls.dirs).toContain('/oferta/wiezba-dachowa-cnc');
    expect(c.calls.closed).toBe(true);
  });

  it('odmawia, gdy konto FTP widzi cały hosting zamiast public_html', async () => {
    const c = fakeClient(['domains', 'public_html']);
    await expect(deploy({ env, client: c })).rejects.toMatchObject({ code: 'HOSTIDO_DIRECTORY' });
    expect(c.calls.uploads).toHaveLength(0);
    expect(c.calls.closed).toBe(true);
  });

  it('ponawia tylko błąd 425', async () => {
    let n = 0;
    await withRetries(async () => { if (++n < 2) throw Object.assign(new Error('x'), { code: 425 }); }, async () => {});
    expect(n).toBe(2);
    await expect(withRetries(async () => { throw Object.assign(new Error('y'), { code: 530 }); }, async () => {})).rejects.toThrow('y');
  });

  it('.htaccess wymusza HTTPS i domenę bez www', () => {
    const h = readFileSync('_site/.htaccess', 'utf8');
    expect(h).toMatch(/RewriteCond %\{HTTPS\} !=on/);
    expect(h).toMatch(/\^www\\\.drewitar\\\.pl\$/);
    expect(h).toContain('ErrorDocument 404 /404.html');
  });
});
