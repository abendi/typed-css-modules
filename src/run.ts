import * as path from 'path';
import * as util from 'util';
import chalk from 'chalk';
import * as chokidar from 'chokidar';
import _glob from 'glob';
import { DtsCreator } from './dts-creator';
import { DtsContent } from './dts-content';
import { listDifferent } from './list-different';

const glob = util.promisify(_glob);

interface RunOptions {
  pattern?: string;
  outDir?: string;
  watch?: boolean;
  camelCase?: boolean;
  namedExports?: boolean;
  dropExtension?: boolean;
  silent?: boolean;
  listDifferent?: boolean;
}

export async function run(searchDir: string, options: RunOptions = {}): Promise<void> {
  const filesPattern = path.join(searchDir, options.pattern || '**/*.css');

  const creator = new DtsCreator({
    rootDir: process.cwd(),
    searchDir,
    outDir: options.outDir,
    camelCase: options.camelCase,
    namedExports: options.namedExports,
    dropExtension: options.dropExtension,
  });

  const writeFile = async (f: string): Promise<void> => {
    try {
      const content: DtsContent = await creator.create(f, undefined, !!options.watch);
      await content.writeFile();

      if (!options.silent) {
        console.log('Wrote ' + chalk.green(content.outputFilePath));
      }
    } catch (error) {
      console.error(chalk.red('[Error] ' + error));
    }
  };

  const files = await glob(filesPattern);

  if (options.listDifferent) {
    await listDifferent(files, creator);
    return;
  }

  if (!options.watch) {
    await Promise.all(files.map(writeFile));
  } else {
    console.log('Watch ' + filesPattern + '...');

    const watcher = chokidar.watch([filesPattern.replace(/\\/g, '/')]);
    watcher.on('add', writeFile);
    watcher.on('change', writeFile);
    await waitForever();
  }
}

async function waitForever(): Promise<void> {
  return new Promise<void>(() => {});
}
