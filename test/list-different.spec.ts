import { DtsCreator } from '../src/dts-creator';
import { listDifferent } from '../src/list-different';

const mockExit = jest.spyOn(process, 'exit').mockImplementation(exitCode => {
  throw new Error(`process.exit: ${exitCode}`);
});

jest.spyOn(console, 'log').mockImplementation();
jest.spyOn(console, 'error').mockImplementation();

describe('#listDifferent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does nothing if no files provided', async () => {
    await listDifferent([], new DtsCreator());
    expect(mockExit).not.toHaveBeenCalled();
  });

  it('exits with error code if type file is missing', async () => {
    await expect(() => listDifferent(['test/empty.css'], new DtsCreator())).rejects.toThrow('process.exit: 1');
  });

  it('exits with error code if type file is mismatching', async () => {
    await expect(() => listDifferent(['test/different.css'], new DtsCreator())).rejects.toThrow('process.exit: 1');
  });

  it('exits with no error code if type files match', async () => {
    expect(await listDifferent(['test/testStyle.css'], new DtsCreator())).toBe(void 0);
  });
});
