// github-push.mjs — 自动创建 GitHub 仓库并上传项目文件
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative, basename } from 'path';
import { createReadStream } from 'fs';

const TOKEN = process.argv[2];
const REPO_NAME = process.argv[3] || 'ziwei-doushu';
const PROJECT_DIR = process.argv[4] || '.';

if (!TOKEN) {
  console.error('用法: node github-push.mjs <GITHUB_TOKEN> [repo-name] [project-dir]');
  console.error('获取 Token: https://github.com/settings/tokens → 生成经典令牌，勾选 repo 权限');
  process.exit(1);
}

const BASE = 'https://api.github.com';
const HEADERS = {
  'Authorization': `Bearer ${TOKEN}`,
  'Accept': 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
};

// 要排除的文件/目录
const EXCLUDE = ['.next', 'node_modules', '.git', '.zip', 'package-lock.json'];

function shouldExclude(name) {
  return EXCLUDE.some(e => name === e || name.endsWith(e));
}

function collectFiles(dir) {
  const files = [];
  const items = readdirSync(dir);
  for (const item of items) {
    if (shouldExclude(item)) continue;
    const fullPath = join(dir, item);
    if (statSync(fullPath).isDirectory()) {
      files.push(...collectFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

async function api(path, method = 'GET', body = null) {
  const opts = { method, headers: { ...HEADERS, 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${method} ${path}: ${res.status} ${err}`);
  }
  return res.status === 204 ? null : res.json();
}

async function getUser() {
  const data = await api('/user');
  return data.login;
}

async function createRepo(name) {
  try {
    return await api('/user/repos', 'POST', {
      name,
      description: '紫微斗数开源排盘',
      private: false,
      auto_init: true,
    });
  } catch (e) {
    if (e.message.includes('422')) {
      console.log('仓库已存在，使用现有仓库');
      return { name };
    }
    throw e;
  }
}

async function uploadFile(owner, repo, filePath, content) {
  const apiPath = `/repos/${owner}/${repo}/contents/${filePath.replace(/\\/g, '/')}`;
  const body = {
    message: `Add ${filePath}`,
    content: Buffer.from(content).toString('base64'),
  };
  try {
    await api(apiPath, 'PUT', body);
    console.log(`  ✓ ${filePath}`);
  } catch (e) {
    console.error(`  ✗ ${filePath}: ${e.message}`);
  }
}

async function main() {
  console.log('🚀 开始部署到 GitHub...\n');

  const owner = await getUser();
  console.log(`用户: ${owner}`);

  const repo = await createRepo(REPO_NAME);
  console.log(`仓库: ${owner}/${REPO_NAME}\n`);

  const files = collectFiles(PROJECT_DIR);
  console.log(`共 ${files.length} 个文件，开始上传...\n`);

  let count = 0;
  for (const file of files) {
    const relPath = relative(PROJECT_DIR, file).replace(/\\/g, '/');
    const content = readFileSync(file, 'utf-8');
    await uploadFile(owner, REPO_NAME, relPath, content);
    count++;
    if (count % 10 === 0) console.log(`  进度: ${count}/${files.length}`);
  }

  console.log(`\n✅ 上传完成！`);
  console.log(`仓库地址: https://github.com/${owner}/${REPO_NAME}`);
  console.log(`\n📋 下一步：Cloudflare Pages 部署`);
  console.log(`   1. 打开 https://dash.cloudflare.com/`);
  console.log(`   2. Workers & Pages → 创建 → Pages → 连接到 Git`);
  console.log(`   3. 选择 ${owner}/${REPO_NAME}`);
  console.log(`   4. 构建设置:`);
  console.log(`      构建命令: npx @cloudflare/next-on-pages`);
  console.log(`      输出目录: .vercel/output/static`);
  console.log(`   5. 环境变量: DEEPSEEK_API_KEY=你的Key`);
  console.log(`   6. 点击"保存并部署"`);
  console.log(`   7. 部署完成后访问 https://${REPO_NAME}.pages.dev`);
}

main().catch(e => { console.error('错误:', e.message); process.exit(1); });
