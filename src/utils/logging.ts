// src/utils/logging.ts
import fs from 'fs';
import util from 'util';

const isWriteCallback = (
  value: BufferEncoding | ((err?: Error | null) => void) | undefined
): value is (err?: Error | null) => void => typeof value === 'function';

export function setupLogging(logFileName: string): void {
  const logFile = fs.createWriteStream(logFileName, { flags: 'a' });

  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalStdoutWrite = process.stdout.write;
  const originalStderrWrite = process.stderr.write;

  console.log = function (...args): void {
    logFile.write(util.format.apply(null, args) + ' ');
    originalConsoleLog.apply(console, args);
  };

  console.error = function (...args): void {
    logFile.write(util.format.apply(null, args) + ' ');
    originalConsoleError.apply(console, args);
  };

  process.stdout.write = function (
    buffer: Uint8Array | string,
    encoding?: BufferEncoding | ((err?: Error | null) => void),
    cb?: (err?: Error | null) => void
  ): boolean {
    if (typeof buffer === 'string') {
      logFile.write(buffer);
    } else {
      logFile.write(buffer.toString());
    }
    const resolvedEncoding =
      typeof encoding === 'string' ? encoding : undefined;
    const resolvedCallback = isWriteCallback(encoding) ? encoding : cb;
    return originalStdoutWrite.call(
      process.stdout,
      buffer,
      resolvedEncoding,
      resolvedCallback
    );
  };

  process.stderr.write = function (
    buffer: Uint8Array | string,
    encoding?: BufferEncoding | ((err?: Error | null) => void),
    cb?: (err?: Error | null) => void
  ): boolean {
    if (typeof buffer === 'string') {
      logFile.write(buffer);
    } else {
      logFile.write(buffer.toString());
    }
    const resolvedEncoding =
      typeof encoding === 'string' ? encoding : undefined;
    const resolvedCallback = isWriteCallback(encoding) ? encoding : cb;
    return originalStderrWrite.call(
      process.stderr,
      buffer,
      resolvedEncoding,
      resolvedCallback
    );
  };
}
