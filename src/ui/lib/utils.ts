import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function filePickerDialog(){
    let path = await window.electron.pickFile();
    return path;
}

export function openOutputFolder(){
    return window.electron.openFolder("output");
}

export function addLeftEllipsis(str: string, maxLength: number): string {
    if (str.length <= maxLength) {
        return str;
    }
    
    // Calculate how many characters of the original string we need to keep
    const ellipsis = '...';
    const keepLength = maxLength - ellipsis.length;
    
    // Prevent negative substring lengths if maxLength is exceptionally small
    if (keepLength <= 0) {
        return ellipsis;
    }

    return ellipsis + str.slice(-keepLength);
}

export function addRightEllipsis(str: string, maxLength: number): string {
    if (str.length <= maxLength) {
        return str;
    }
    
    // Calculate how many characters of the original string we need to keep
    const ellipsis = '...';
    const keepLength = maxLength - ellipsis.length;
    
    // Prevent negative substring lengths if maxLength is exceptionally small
    if (keepLength <= 0) {
        return ellipsis;
    }

    return str.slice(0, keepLength) + ellipsis;
}

type DateInput = Date | string | number;

export function formatDuration(date1: DateInput, date2: DateInput): string {
  // 1. Parse both inputs into valid Date objects
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  // Fallback if an invalid date string is provided
  if (isNaN(d1.getTime()) || !isNaN(d2.getTime())) {
    // Both are valid, proceed
  }

  // 2. Get the absolute difference in milliseconds
  const diffMs = Math.abs(d2.getTime() - d1.getTime());
  
  // 3. Convert to total seconds
  let totalSeconds = Math.floor(diffMs / 1000);

  // 4. Extract time components
  const days = Math.floor(totalSeconds / (3600 * 24));
  totalSeconds %= (3600 * 24);

  const hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  // 5. Build the human-readable string dynamically
  const parts: string[] = [];
  
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  
  // Always show seconds if they exist, OR if the total duration is less than a minute
  if (seconds > 0 || parts.length === 0) {
    parts.push(`${seconds}s`);
  }

  return parts.join(' ');
}


const getFileName = (path: string): string | undefined => {
  return path.split(/[\\/]/).pop();
};

export { getFileName };