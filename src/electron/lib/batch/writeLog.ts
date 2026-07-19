import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

import { generateLogEntry } from './util.js';

/**
 * Formats Node's raw process.uptime() seconds into human-readable hh:mm:ss
 */
function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

/**
 * Generates the text structure for the header
 */
function generateLogHeader(runId: string): string {
  const lines = [
    '='.repeat(80),
    'APPLICATION LOG SESSION INITIALIZED',
    '='.repeat(80),
    `RUN         : ${runId}`,
    `Timestamp   : ${new Date().toISOString()}`,
    `Environment : ${process.env.NODE_ENV || 'development'}`,
    `App Version : ${process.env.npm_package_version || '1.0.0'}`,
    `Node Version: ${process.version}`,
    `Platform    : ${os.platform()} (${os.arch()})`,
    `PID         : ${process.pid}`,
    '='.repeat(80),
    '\n' // Leave a clean trailing newline before the actual log data
  ];

  return lines.join('\n');
}

/**
 * Generates the text structure for the footer
 */
function generateLogFooter(reason: string): string {
  const uptimeSeconds = process.uptime();
  
  return [
    '\n' + '='.repeat(80),
    'APPLICATION LOG SESSION TERMINATED',
    '='.repeat(80),
    `Timestamp   : ${new Date().toISOString()}`,
    `Exit Reason : ${reason}`,
    `Total Uptime: ${formatUptime(uptimeSeconds)}`,
    '='.repeat(80),
    '\n'
  ].join('\n');
}

/*
    Helper function to write logs to a local log file for each run
    File naming ex: ar-log-2026-07-12-b7b9720e-6d8b-4da7-becb-a0598f8800e2.log.txt
*/
export async function writeLogFile(logData: ProcessLogEntry[], runId: string, logDir: string, exitReason: string = 'Completed'){
    // Create log directory if it does not exist
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const today = new Date().toISOString().split('T')[0]; //2026-07-12
    const fileName = `ar-log-${today}-${runId}.log.txt`;
    const fileFullPath = path.join(logDir, fileName);
    const logFileHeader = generateLogHeader(runId);

    /*
    try{
        await fs.promises.access(fileFullPath);
    } catch {
        await fs.promises.writeFile(fileFullPath, logFileHeader, 'utf8');
    }
    */

    await fs.promises.writeFile(fileFullPath, logFileHeader, 'utf8');
    
    try{
        for(let i = 0; i < logData.length; i++){
            const logEntryString: string = '\n' + generateLogEntry(logData[i]);
            await fs.promises.appendFile(fileFullPath, logEntryString, 'utf-8');
        }
        const logFileFooter = generateLogFooter(exitReason ?? `Batch Completed Successfully`);
        await fs.promises.appendFile(fileFullPath, '\n\n' + logFileFooter);
    } catch(err){
        console.log(`Log file creation error: ${err}`)
        return;
    }
}