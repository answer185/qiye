#!/usr/bin/env node

/**
 * 部署脚本：将构建后的 dist 目录推送到部署仓库
 * 使用方法: node scripts/deploy-dist.js [部署仓库地址] [版本标签]
 * 例如: node scripts/deploy-dist.js https://gitee.com/user/deploy-repo.git v1.0.0
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../.deploy-config.json');
let deployRepo = process.argv[2];

if (!deployRepo && fs.existsSync(configPath)) {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    deployRepo = config.deployRepo;
  } catch (e) {
    console.warn('⚠️ 无法读取配置文件');
  }
}

const versionTag =
  process.argv[3] ||
  `v${new Date().toISOString().split('T')[0].replace(/-/g, '.')}-${Date.now().toString().slice(-6)}`;

if (!deployRepo) {
  console.error('❌ 错误: 请提供部署仓库地址');
  console.log('使用方法:');
  console.log('  1. 在 .deploy-config.json 中配置 deployRepo');
  console.log('  2. 或使用命令行参数: node scripts/deploy-dist.js <部署仓库地址> [版本标签]');
  console.log('例如: node scripts/deploy-dist.js https://gitee.com/user/deploy-repo.git v1.0.0');
  process.exit(1);
}

const distPath = path.join(__dirname, '../dist');
const tempDir = path.join(__dirname, '../.deploy-temp');
const projectRoot = path.join(__dirname, '..');

console.log('🚀 开始部署流程...');
console.log(`📦 部署仓库: ${deployRepo}`);
console.log(`🏷️  版本标签: ${versionTag}`);

try {
  // 1. 检查 dist 目录是否存在
  if (!fs.existsSync(distPath)) {
    console.log('📦 dist 目录不存在，开始构建...');
    execSync('npm run build', { stdio: 'inherit', cwd: projectRoot });
  } else {
    console.log('✅ dist 目录已存在');
  }

  // 2. 克隆或拉取部署仓库
  const gitDir = path.join(tempDir, '.git');
  let isExistingRepo = fs.existsSync(tempDir) && fs.existsSync(gitDir);

  if (isExistingRepo) {
    console.log('📥 拉取最新代码...');
    try {
      execSync('git fetch origin', { stdio: 'inherit', cwd: tempDir });
      try {
        execSync('git checkout main', { stdio: 'inherit', cwd: tempDir });
        execSync('git pull origin main', { stdio: 'inherit', cwd: tempDir });
      } catch (e) {
        execSync('git checkout master', { stdio: 'inherit', cwd: tempDir });
        execSync('git pull origin master', { stdio: 'inherit', cwd: tempDir });
      }
    } catch (e) {
      console.log('⚠️ 无法拉取代码，将重新克隆...');
      execSync(`rm -rf "${tempDir}"`, { stdio: 'inherit' });
      isExistingRepo = false;
    }
  }

  if (!isExistingRepo) {
    if (fs.existsSync(tempDir)) {
      console.log('🧹 清理临时目录...');
      execSync(`rm -rf "${tempDir}"`, { stdio: 'inherit' });
    }
    console.log('📂 克隆部署仓库...');
    fs.mkdirSync(tempDir, { recursive: true });
    try {
      execSync(`git clone ${deployRepo} .`, { stdio: 'inherit', cwd: tempDir });
    } catch (e) {
      console.log('📂 初始化新的部署仓库...');
      execSync('git init', { stdio: 'inherit', cwd: tempDir });
      execSync(`git remote add origin ${deployRepo}`, { cwd: tempDir });
    }
  }

  // 3. 删除部署仓库中的所有文件（保留 .git）
  console.log('🧹 清理旧文件（保留 .git 历史）...');
  const files = fs.readdirSync(tempDir);
  files.forEach((file) => {
    if (file !== '.git') {
      const filePath = path.join(tempDir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        execSync(`rm -rf "${filePath}"`, { stdio: 'inherit' });
      } else {
        fs.unlinkSync(filePath);
      }
    }
  });

  // 4. 复制 dist 内容
  console.log('📋 复制 dist 目录内容...');
  execSync(`cp -r "${distPath}/"* "${tempDir}/"`, { stdio: 'inherit' });

  // 5. 创建 .gitignore（如需要）
  const gitignorePath = path.join(tempDir, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, '*.log\n.DS_Store\n');
  }

  // 6. 提交
  console.log('💾 提交到部署仓库...');
  execSync('git add .', { stdio: 'inherit', cwd: tempDir });

  let hasChanges = false;
  try {
    const status = execSync('git status --porcelain', {
      encoding: 'utf-8',
      cwd: tempDir,
    }).trim();
    hasChanges = status.length > 0;
  } catch (e) {
    hasChanges = true;
  }

  if (!hasChanges) {
    console.log('ℹ️  没有变更，跳过提交');
  } else {
    let sourceCommit = 'unknown';
    try {
      sourceCommit = execSync('git rev-parse --short HEAD', {
        encoding: 'utf-8',
        cwd: projectRoot,
      }).trim();
    } catch (e) {
      console.warn('⚠️ 无法获取源仓库 commit hash');
    }

    const commitMessage = `Deploy: ${versionTag}\n\nSource commit: ${sourceCommit}\nDeploy time: ${new Date().toISOString()}`;
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit', cwd: tempDir });
  }

  // 7. 创建标签
  if (hasChanges) {
    console.log(`🏷️  创建版本标签: ${versionTag}`);
    try {
      execSync(`git tag -a ${versionTag} -m "Version ${versionTag}"`, {
        stdio: 'inherit',
        cwd: tempDir,
      });
    } catch (e) {
      try {
        execSync(`git tag -d ${versionTag}`, { stdio: 'inherit', cwd: tempDir });
        execSync(`git push origin :refs/tags/${versionTag}`, {
          stdio: 'inherit',
          cwd: tempDir,
        });
      } catch (e2) {
        // 忽略删除失败
      }
      execSync(`git tag -a ${versionTag} -m "Version ${versionTag}"`, {
        stdio: 'inherit',
        cwd: tempDir,
      });
    }
  } else {
    console.log('ℹ️  没有变更，跳过标签创建');
  }

  // 8. 推送
  if (hasChanges) {
    console.log('📤 推送到远程仓库...');
    try {
      execSync('git branch -M main', { stdio: 'inherit', cwd: tempDir });
      execSync('git push -u origin main --tags', { stdio: 'inherit', cwd: tempDir });
    } catch (e) {
      try {
        console.log('尝试推送到 master 分支...');
        execSync('git branch -M master', { stdio: 'inherit', cwd: tempDir });
        execSync('git push -u origin master --tags', { stdio: 'inherit', cwd: tempDir });
      } catch (e2) {
        console.log('尝试强制推送...');
        try {
          execSync('git branch -M main', { stdio: 'inherit', cwd: tempDir });
          execSync('git push -u origin main --tags --force', {
            stdio: 'inherit',
            cwd: tempDir,
          });
        } catch (e3) {
          try {
            execSync('git branch -M master', { stdio: 'inherit', cwd: tempDir });
            execSync('git push -u origin master --tags --force', {
              stdio: 'inherit',
              cwd: tempDir,
            });
          } catch (e4) {
            throw new Error('推送失败，请检查仓库地址和权限');
          }
        }
      }
    }
  } else {
    console.log('ℹ️  没有变更，跳过推送');
  }

  // 9. 清理
  console.log('🧹 清理临时目录...');
  execSync(`rm -rf "${tempDir}"`, { stdio: 'inherit' });

  console.log('✅ 部署完成！');
  console.log(`📦 版本: ${versionTag}`);
  console.log(`🔗 仓库: ${deployRepo}`);
} catch (error) {
  console.error('❌ 部署失败:', error.message);
  if (fs.existsSync(tempDir)) {
    execSync(`rm -rf "${tempDir}"`, { stdio: 'inherit' });
  }
  process.exit(1);
}
