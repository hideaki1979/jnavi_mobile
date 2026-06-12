/**
 * tar v7 CJS interop シム(postinstallで毎回適用)
 *
 * セキュリティ対応で overrides により tar を v6 → v7 に強制した結果、
 * tar v7 の CJS ビルドは __esModule: true かつ default エクスポート無しのため、
 * @expo/cli (SDK 52 系は tar ^6.2.1 固定で対応版が存在しない) の
 * `_interopRequireDefault(require("tar")).default.extract(...)` が undefined となり
 * prebuild のテンプレート展開等が TypeError で失敗する。
 * tar の CJS エントリ末尾に `default = module.exports` を追記して互換を回復する。
 */
const fs = require('fs');
const path = require('path');

const MARKER = '/* tar-cjs-interop-shim (scripts/patch-tar-cjs-interop.cjs) */';
const SHIM = `\n${MARKER}\nif (module.exports && module.exports.__esModule && typeof module.exports.default === 'undefined') { module.exports.default = module.exports; }\n`;

let entry;
try {
  entry = require.resolve('tar', { paths: [path.join(__dirname, '..')] });
} catch {
  process.exit(0); // tar 未インストールなら何もしない
}

const targets = new Set([entry, entry.replace(/index\.min\.js$/, 'index.js')]);
for (const file of targets) {
  try {
    if (!fs.existsSync(file)) continue;
    const src = fs.readFileSync(file, 'utf8');
    if (src.includes(MARKER)) continue;
    fs.appendFileSync(file, SHIM);
    console.log(`[patch-tar-cjs-interop] applied: ${path.relative(path.join(__dirname, '..'), file)}`);
  } catch (error) {
    // シム適用失敗で npm install 全体を落とさない(影響は prebuild 時のテンプレート展開のみ)
    console.warn(
      `[patch-tar-cjs-interop] WARNING: シム適用に失敗しました: ${file}\n` +
      `  prebuild / テンプレート展開が TypeError で失敗する可能性があります: ${error.message}`
    );
  }
}
