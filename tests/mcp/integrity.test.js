import test from 'node:test';
import assert from 'node:assert';
import { spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverPath = path.join(__dirname, '../../dist/index.js');
const HOOKS_DIR = path.join(os.homedir(), ".omni", "hooks");
const HOOKS_SHA_FILE = path.join(os.homedir(), ".omni", "hooks.sha256");

test('MCP Server - Hook Integrity Check', async (t) => {
    // Backup existing hooks if any (unlikely in test env but safe)
    const backupDir = HOOKS_DIR + ".bak";
    const backupFile = HOOKS_SHA_FILE + ".bak";
    if (fs.existsSync(HOOKS_DIR)) fs.renameSync(HOOKS_DIR, backupDir);
    if (fs.existsSync(HOOKS_SHA_FILE)) fs.renameSync(HOOKS_SHA_FILE, backupFile);

    try {
        await t.test('Passes with no hooks', () => {
            const result = spawnSync('node', [serverPath, '--test-integrity']);
            assert.strictEqual(result.status, 0, 'Should pass when no hooks exist');
        });

        await t.test('Detects mismatch', () => {
            if (!fs.existsSync(path.dirname(HOOKS_DIR))) fs.mkdirSync(path.dirname(HOOKS_DIR), { recursive: true });
            fs.mkdirSync(HOOKS_DIR, { recursive: true });
            
            const hookFile = path.join(HOOKS_DIR, 'test.sh');
            fs.writeFileSync(hookFile, 'echo "secure"');
            
            const hashes = { "test.sh": "wrong-hash" };
            fs.writeFileSync(HOOKS_SHA_FILE, JSON.stringify(hashes));

            const result = spawnSync('node', [serverPath, '--test-integrity']);
            assert.strictEqual(result.status, 1, 'Should fail on hash mismatch');
            assert.ok(result.stderr.toString().includes('Security Alert: Hook integrity mismatch'), 'Should log security alert');
        });

        await t.test('Detects untrusted file', () => {
            const hookFile = path.join(HOOKS_DIR, 'test.sh');
            const content = 'echo "secure"';
            fs.writeFileSync(hookFile, content);
            const hash = crypto.createHash('sha256').update(content).digest('hex');
            
            const hashes = { "test.sh": hash };
            fs.writeFileSync(HOOKS_SHA_FILE, JSON.stringify(hashes));

            // Add an untrusted file
            fs.writeFileSync(path.join(HOOKS_DIR, 'untrusted.sh'), 'echo "evil"');

            const result = spawnSync('node', [serverPath, '--test-integrity']);
            assert.strictEqual(result.status, 1, 'Should fail on untrusted file');
            assert.ok(result.stderr.toString().includes('Security Alert: New untrusted hook file detected'), 'Should log untrusted file alert');
        });

    } finally {
        // Cleanup
        if (fs.existsSync(HOOKS_DIR)) fs.rmSync(HOOKS_DIR, { recursive: true, force: true });
        if (fs.existsSync(HOOKS_SHA_FILE)) fs.unlinkSync(HOOKS_SHA_FILE);

        // Restore backups
        if (fs.existsSync(backupDir)) fs.renameSync(backupDir, HOOKS_DIR);
        if (fs.existsSync(backupFile)) fs.renameSync(backupFile, HOOKS_SHA_FILE);
    }
});
