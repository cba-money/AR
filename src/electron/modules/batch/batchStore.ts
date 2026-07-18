import fs from 'fs/promises';
import path from 'path';

import { settingsManager } from './../../settings.js';

async function checkIfFileExists(path: string): Promise<boolean> {
  try {
    // F_OK flag tests for the presence of the file
    await fs.access(path, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function saveJob(job: ProcessingJob): Promise<ProcessingJob | boolean>{
    const tmpPath = settingsManager.get('tmpFolder');
    const jobStoreFile = path.join(
        tmpPath,
        'latest-job.json'
    );
    if (!fs.access(tmpPath)) {
        fs.mkdir(tmpPath, { recursive: true });
    }
    const jobDataString = JSON.stringify(job, null, 2);
    
    try{
        await fs.writeFile(jobStoreFile, jobDataString, 'utf-8');
        return true;
    } catch(error){
        return false;
    }
}

export async function getLatestJob(){
    const tmpPath = settingsManager.get('tmpFolder');
    const jobStoreFile = path.join(
        tmpPath,
        'latest-job.json'
    );
    try{
        const rawData = await fs.readFile(jobStoreFile, 'utf-8');
        const job: ProcessingJob = JSON.parse(rawData);
        return job;
    } catch (error){
        return false;
    }
}


/*
export async function newJob(jobId: string, ){
    const tmpPath = settingsManager.get('tmpFolder');
    const jobStoreFile = path.join(
        tmpPath,
        'jobs.json'
    );
    if (!fs.access(tmpPath)) {
        fs.mkdir(tmpPath, { recursive: true });
    }

    const configExists = await checkIfFileExists(jobStoreFile);

    if(configExists){
        try {
            // Read the raw text data from the file
            const rawData = await fs.readFile(jobStoreFile, 'utf-8');
            
            // Parse text into your strongly-typed User interface
            const currentJobStore: ProcessingJobs = JSON.parse(rawData);
            //return currentJobStore;
            currentJobStore.latestJob = jobId;
            currentJobStore.jobs.push( {
                    jobId,
                    status: "Not Started",
                    processedFiles: [{}]
                } as ProcessingJob);
        } catch (error) {
            console.error('Error loading JSON file:', error);
            return null;
        }
    }

    if(!configExists){
        const jobsList: ProcessingJobs = {
            latestJob: jobId,
            jobs: [
                {
                    jobId,
                    status: "Not Started",
                    processedFiles: [{}]
                } as ProcessingJob
            ]
        };
        try{
            const jsonData = JSON.stringify(jobsList, null, 2);

            await fs.writeFile(jobStoreFile, jsonData)
        } catch (error){
            return;
        } 
        return;
    }
}
    */
