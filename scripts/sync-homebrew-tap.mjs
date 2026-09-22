#!/usr/bin/env node
/**
 * Copy packaging/homebrew/innsegall.rb into tap layout for SP-Q26/homebrew-innsegall.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "packaging", "homebrew", "innsegall.rb");
const tapRoot = join(root, "packaging", "homebrew-tap");
const formulaDir = join(tapRoot, "Formula");
const formulaPath = join(formulaDir, "innsegall.rb");

mkdirSync(formulaDir, { recursive: true });
const body = readFileSync(src, "utf8");
writeFileSync(formulaPath, body, "utf8");

const readme = `# homebrew-innsegall

Official tap for [Innsegall](https://innsegall.com) · post-scare Macintosh triage.

\`\`\`bash
brew tap SP-Q26/innsegall
brew install innsegall
innsegall runes
\`\`\`

Formula source of truth: \`SP-Q26/innsegall\` → \`packaging/homebrew/innsegall.rb\`  
Refresh this repo: \`node scripts/sync-homebrew-tap.mjs\` from the innsegall repo, then commit.

Alpha install without Homebrew: \`curl -fsSL https://innsegall.com/scripts/innsegall-alpha-install.sh | bash\`
`;

writeFileSync(join(tapRoot, "README.md"), readme, "utf8");
console.log(`sync-homebrew-tap · wrote ${formulaPath}`);
