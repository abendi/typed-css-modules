import util from 'util';
import chalk from 'chalk';
import { DtsContent } from './dts-content';
import { DtsCreator } from './dts-creator';
import isThere from 'is-there';
import fs from 'fs';

const readFile = util.promisify(fs.readFile);

export const listDifferent = async (files: string[], creator: DtsCreator): Promise<void> => {
  if (!files || !files.length) {
    console.log(chalk.blue('No files found'));
    return;
  }

  await Promise.all(files.map(file => checkFile(file, creator))).then(results => {
    results.includes(false) && process.exit(1);
  });
};

const checkFile = async (file: string, creator: DtsCreator): Promise<boolean> => {
  try {
    const content: DtsContent = await creator.create(file, undefined, false);

    if (!isThere(content.outputFilePath)) {
      console.error(chalk.red(`[ERROR] Type file needs to be generated for '${file}'`));
      return false;
    }

    const finalOutput = content.formatted;
    const fileContent = (await readFile(content.outputFilePath)).toString();

    if (fileContent !== finalOutput) {
      console.error(chalk.red(`[ERROR] Check type definitions for '${file}'`));
      return false;
    }
    return true;
  } catch (error) {
    console.error(chalk.red(`[ERROR] An error occurred checking '${file}':\n${error}`));
    return false;
  }
};
