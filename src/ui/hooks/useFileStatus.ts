import { useQuery } from '@tanstack/react-query';

type FileStatus = {
  status: string;
  [key: string]: any;
};

/*
export function useFileStatus() {
  return useQuery<ProcessedInputFile[], Error>({
    queryKey: ['files', 'status'],
    queryFn: async () => {
      const getFileStatus = await window.electron.getFileStatus();
      return getFileStatus;
    },
    // Poll the server every 5 seconds while files are actively processing
    refetchInterval: (data) => {
      const hasProcessingFiles = Array.isArray(data) && data.some(file => file.status === 'Processing' || file.status === 'Not Started');
      return hasProcessingFiles ? 5000 : false;
    },
  });
}
*/
// useFileStatus.ts
//import { useQuery } from '@tanstack/react-query';
//import { ProcessedInputFile } from './types';

export function useFileStatus() {
  return useQuery<ProcessedInputFile[]>({
    queryKey: ['files', 'status'],
    queryFn: async () => {
      // FIX CULPRIT 2: Add a cache-buster timestamp to defeat aggressive browser caching
      //const res = await fetch(`/api/files/status?t=${Date.now()}`);
      const getFileStatus = await window.electron.getFileStatus();
      return getFileStatus;
    },
    refetchInterval: (query) => {
      const data = query.state.data;

      // 1. If data hasn't loaded yet, keep polling active (5000ms)
      if (!data) return 5000;

      // 2. Check if any files are still working
      const hasProcessingFiles = data.some(
        (file) => file.status === 'Processing' || file.status === 'Not Started'
      );

      // 3. Keep polling if files are active; shut down if everything is completed/failed
      return hasProcessingFiles ? 5000 : false;
    },
  });
}