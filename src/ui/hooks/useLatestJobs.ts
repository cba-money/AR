import { useState, useEffect } from 'react';

import { JSONFilePreset } from 'lowdb/node';

function pathJoin(...parts: any[]) {
  return parts
    .map((part, index) => {
      if (index === 0) {
        return part.trim().replace(/[/]+$/, ''); // Keep leading slash, remove trailing
      }
      return part.trim().replace(/^[/]+|[/]+$/g, ''); // Remove both leading & trailing
    })
    .filter(x => x.length > 0)
    .join('/');
}

export function useLatestJob(){
    const [latestJob, setLatestJob] = useState<any>();
    useEffect(() => {
        async function getLatestJob(){
            const defaultDataLatestJob = { job: {} };
            const latestJobDB = await JSONFilePreset(
                pathJoin(
                    'db',
                    'jobs',
                    'latest-job.json'
                ), defaultDataLatestJob);
            setLatestJob(latestJobDB?.data);
        }
        getLatestJob();
    }, []);

    return { latestJob };
}