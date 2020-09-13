/* eslint-disable no-console */
import { publish as uploader } from 'gh-pages';
import archiver from 'archiver';
import path from 'path';
import { exec } from 'child_process';
import { createWriteStream, ensureDirSync } from 'fs-extra';

const branch = 'archives';

const ORPHAN_BRANCH_SETUP_SH = path.resolve(__dirname, './orphan-branch-setup.sh');
const setUpOrphanBranch = () => {
  return new Promise((resolve, reject) => {
    const cp = exec(`sh ${ORPHAN_BRANCH_SETUP_SH} `);
    cp.stderr?.pipe(process.stderr);
    cp.stdout?.pipe(process.stdout);

    cp.on('exit', (code) => {
      if (code === 0) {
        resolve(0);
      } else {
        reject(code || 1);
      }
    });
  });
};

const archive = (name: string, version: string, buildDir: string, zipDir: string) => {
  ensureDirSync(zipDir);
  const filename = `${name}-v${version}.zip`;

  return new Promise((resolve, reject) => {
    const archive = archiver('zip');
    const output = createWriteStream(path.resolve(zipDir, filename));
    archive.directory(buildDir, false);
    archive.pipe(output);
    archive.on('warning', (err) => console.warn(err));
    archive.on('error', (err) => {
      reject(err);
    });

    output.on('close', () => {
      console.log(`emit: '${filename}' (${archive.pointer()} total bytes)`);
      resolve();
    });
    archive.finalize();
  });
};

const upload = (zipDir: string) => {
  return new Promise((resolve, reject) => {
    uploader(zipDir, { branch, add: true }, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log('Published');
        resolve();
      }
    });
  });
};

export const publish = async (name: string, version: string, buildDir: string, zipDir: string) => {
  try {
    await setUpOrphanBranch();
    await archive(name, version, buildDir, zipDir);
    await upload(zipDir);
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
};
