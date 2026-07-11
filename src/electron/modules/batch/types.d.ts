// Inputs from the UI

// Aggregation State
interface Totals {
  admins: Record<string, number>;
  arPerMonth: Record<string, number>;
}

// Progress Event payload
interface ProgressState {
  currentFile: string;
  processedCount: number;
  totalFiles: number;
  percentage: number;
}

interface MonthRange {
  start: string;
  end: string;
}

interface BatchConfig {
  files: string[];
  arDate: string;
  monthRange: MonthRange;
}

interface Totals {
  admins: Record<string, number>;
  arPerMonth: Record<string, number>;
}

interface ProgressState {
  currentFile: string;
  processedCount: number;
  totalFiles: number;
  percentage: number;
}

interface FileTotals {
  admin: string;
  amount: number;
  month: string;
}

interface BatchResults {
  totals: Totals;
  logs: string[];
  outputtedFiles: string[];
}