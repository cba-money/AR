import ExcelJS from 'exceljs';

/*
    Python / openpyxl compatibility layer
    -------------------------------------
    The legacy A/R processor (ar-app/app.py) is Python + openpyxl. To make the desktop
    suite produce byte-identical report HTML, every cell is first converted to the value
    openpyxl would have returned, and every Python built-in the legacy script relies on
    (str(), truthiness, float(), strptime(), sum(), f"{x:,.2f}", str comparison,
    secure_filename()) is reproduced here with the same edge-case behaviour.

    Keep this file free of business rules: it only answers "what would Python do?".
*/

// --- Value model -----------------------------------------------------------------

/** openpyxl returns datetime.time (not datetime) for date-formatted serials in [0, 1). */
export class PyTime {
    constructor(public readonly msOfDay: number) {}
}

/**
 * What openpyxl hands to app.py for a cell:
 * None | int/float | str | bool | datetime (naive, stored here as a UTC Date) | time
 */
export type PyValue = null | number | string | boolean | Date | PyTime;

const MS_PER_DAY = 86400000;
const EXCEL_EPOCH_SERIAL = 25569; // 1970-01-01 as an Excel serial

/**
 * openpyxl.styles.numbers.is_date_format, applied to the number format ExcelJS reports.
 * (ExcelJS drops backslash escapes when it reads a format, so a format that only looks
 * like a date because of an escaped literal such as "0.0\l\b\s" cannot be told apart.)
 */
export function openpyxlIsDateFormat(numFmt: string | undefined | null): boolean {
    if (!numFmt) return false;
    let fmt = numFmt.split(';')[0];
    fmt = fmt.replace(/"[^"]*"|\[[^\]]*\]/g, '');
    return /(?<![_\\])[dmhysDMHYS]/.test(fmt);
}

function richTextToString(value: { richText: { text: string }[] }): string {
    return value.richText.map(part => part.text ?? '').join('');
}

function serialToPyDate(serial: number): Date | PyTime {
    // openpyxl.utils.datetime.from_excel
    const day = Math.floor(serial);
    const ms = Math.round((serial - day) * MS_PER_DAY);
    if (serial >= 0 && serial < 1 && ms < MS_PER_DAY) {
        return new PyTime(ms);
    }
    return new Date((day - EXCEL_EPOCH_SERIAL) * MS_PER_DAY + ms);
}

/** Converts an ExcelJS cell into the value openpyxl's `cell.value` would return. */
export function toPyValue(cell: ExcelJS.Cell | undefined | null): PyValue {
    if (!cell) return null;

    const value = cell.value as any;
    if (value === null || value === undefined) return null;

    if (typeof value === 'string' || typeof value === 'boolean') return value;

    if (typeof value === 'number') {
        // ExcelJS and openpyxl do not agree on every number format; openpyxl wins.
        return openpyxlIsDateFormat(cell.numFmt) ? serialToPyDate(value) : value;
    }

    if (value instanceof Date) {
        const serial = value.getTime() / MS_PER_DAY + EXCEL_EPOCH_SERIAL;
        if (!openpyxlIsDateFormat(cell.numFmt)) {
            return Number.isInteger(serial) ? serial : Number(serial.toPrecision(15));
        }
        if (serial >= 0 && serial < 1) return new PyTime(Math.round(serial * MS_PER_DAY));
        return value;
    }

    if (typeof value === 'object') {
        if (Array.isArray(value.richText)) return richTextToString(value);
        if ('hyperlink' in value) {
            const text = value.text;
            if (text && typeof text === 'object' && Array.isArray(text.richText)) return richTextToString(text);
            return text === undefined || text === null ? null : String(text);
        }
        if ('error' in value) return String(value.error);
        // openpyxl is opened without data_only, so a formula cell yields its formula text.
        // The formatter flattens every formula, so this is never reached for suite output.
        if ('formula' in value || 'sharedFormula' in value) return `=${value.formula ?? ''}`;
    }

    return String(value);
}

// --- Python built-ins ------------------------------------------------------------

/** Python truthiness: None, '', 0, 0.0 and False are falsy; everything else is truthy. */
export function pyTruthy(value: PyValue): boolean {
    if (value === null) return false;
    if (typeof value === 'string') return value.length > 0;
    if (typeof value === 'number') return value !== 0; // nan is truthy
    if (typeof value === 'boolean') return value;
    return true;
}

/** isinstance(value, (int, float)) – note that bool is an int in Python. */
export function pyIsNumber(value: PyValue): value is number | boolean {
    return typeof value === 'number' || typeof value === 'boolean';
}

const pad = (n: number, width: number) => String(n).padStart(width, '0');

/** repr(float): shortest round-trip digits, exponent form below 1e-4 and from 1e16. */
function pyFloatRepr(value: number): string {
    if (Number.isNaN(value)) return 'nan';
    if (!Number.isFinite(value)) return value > 0 ? 'inf' : '-inf';
    if (value === 0) return Object.is(value, -0) ? '-0.0' : '0.0';

    const [mantissa, expText] = Math.abs(value).toExponential().split('e');
    const digits = mantissa.replace('.', '');
    const exp = parseInt(expText, 10);
    const sign = value < 0 ? '-' : '';

    if (exp < -4 || exp >= 16) {
        const frac = digits.length > 1 ? `.${digits.slice(1)}` : '';
        return `${sign}${digits[0]}${frac}e${exp < 0 ? '-' : '+'}${pad(Math.abs(exp), 2)}`;
    }
    if (exp < 0) return `${sign}0.${'0'.repeat(-exp - 1)}${digits}`;
    if (digits.length <= exp + 1) return `${sign}${digits}${'0'.repeat(exp + 1 - digits.length)}.0`;
    return `${sign}${digits.slice(0, exp + 1)}.${digits.slice(exp + 1)}`;
}

/** Python str(value) for anything openpyxl can return. */
export function pyStr(value: PyValue): string {
    if (value === null) return 'None';
    if (typeof value === 'string') return value;
    if (typeof value === 'boolean') return value ? 'True' : 'False';
    if (typeof value === 'number') {
        // openpyxl decides int vs float from the text in the file: no ".", "e" or "E" means
        // int. The file it reads was written by the formatter (ExcelJS), which writes numbers
        // with String(n): whole numbers below 1e21 are plain digits, hence a Python int.
        if (Number.isInteger(value) && Math.abs(value) < 1e21) return value === 0 ? '0' : String(value);
        return pyFloatRepr(value);
    }
    if (value instanceof PyTime) {
        const ms = value.msOfDay;
        const base = `${pad(Math.floor(ms / 3600000), 2)}:${pad(Math.floor(ms / 60000) % 60, 2)}:${pad(Math.floor(ms / 1000) % 60, 2)}`;
        return ms % 1000 ? `${base}.${pad((ms % 1000) * 1000, 6)}` : base;
    }
    // datetime -> "YYYY-MM-DD HH:MM:SS[.ffffff]"
    const base = `${pad(value.getUTCFullYear(), 4)}-${pad(value.getUTCMonth() + 1, 2)}-${pad(value.getUTCDate(), 2)} ` +
        `${pad(value.getUTCHours(), 2)}:${pad(value.getUTCMinutes(), 2)}:${pad(value.getUTCSeconds(), 2)}`;
    const ms = value.getUTCMilliseconds();
    return ms ? `${base}.${pad(ms * 1000, 6)}` : base;
}

const PY_WHITESPACE = '\\t\\n\\x0b\\x0c\\r\\x1c-\\x1f \\x85\\xa0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000';
const PY_STRIP_RE = new RegExp(`^[${PY_WHITESPACE}]+|[${PY_WHITESPACE}]+$`, 'g');

/** str.strip() */
export function pyStrip(text: string): string {
    return text.replace(PY_STRIP_RE, '');
}

/** Python compares str by code point; `<` on JS strings compares UTF-16 units. */
export function pyCompareStr(a: string, b: string): number {
    const ai = a[Symbol.iterator]();
    const bi = b[Symbol.iterator]();
    for (;;) {
        const x = ai.next();
        const y = bi.next();
        if (x.done || y.done) return x.done ? (y.done ? 0 : -1) : 1;
        const cx = x.value.codePointAt(0)!;
        const cy = y.value.codePointAt(0)!;
        if (cx !== cy) return cx < cy ? -1 : 1;
    }
}

/**
 * Python's float(), int() and the regex class \d accept any Unicode decimal digit
 * (full-width "１２３", Arabic-Indic "١٢٣", ...), not just 0-9. Every such digit set is a run
 * of ten consecutive code points starting at its zero.
 */
const UNICODE_DIGIT_RE = /\p{Nd}/u;
const UNICODE_DIGITS_RE = /\p{Nd}/gu;

function digitValue(char: string): string {
    const codePoint = char.codePointAt(0)!;
    if (codePoint < 0x80) return char;
    let start = codePoint;
    while (UNICODE_DIGIT_RE.test(String.fromCodePoint(start - 1))) start--;
    return String((codePoint - start) % 10);
}

function toAsciiDigits(text: string): string {
    return text.replace(UNICODE_DIGITS_RE, digitValue);
}

// float() ignores the same surrounding whitespace as str.strip(), except \x1c-\x1f.
const PY_FLOAT_SPACE = '\\t\\n\\x0b\\x0c\\r \\x85\\xa0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000';
const PY_FLOAT_STRIP_RE = new RegExp(`^[${PY_FLOAT_SPACE}]+|[${PY_FLOAT_SPACE}]+$`, 'g');

const PY_FLOAT_RE = /^[+-]?(?:(?:\d+(?:_\d+)*\.?(?:\d+(?:_\d+)*)?|\.\d+(?:_\d+)*)(?:[eE][+-]?\d+(?:_\d+)*)?|inf|infinity|nan)$/i;

/** float(text). Throws where Python raises ValueError (e.g. "N/A", "250 CR", "(100)"). */
export function pyFloat(text: string): number {
    const trimmed = toAsciiDigits(text.replace(PY_FLOAT_STRIP_RE, ''));
    if (!PY_FLOAT_RE.test(trimmed)) {
        throw new Error(`could not convert string to float: '${text}'`);
    }
    const lower = trimmed.toLowerCase().replace(/^[+-]/, '');
    const negative = trimmed.startsWith('-');
    if (lower === 'nan') return NaN;
    if (lower === 'inf' || lower === 'infinity') return negative ? -Infinity : Infinity;
    return Number(trimmed.replace(/_/g, ''));
}

/**
 * sum() over floats. CPython 3.12+ uses Neumaier compensated summation, which can differ
 * from a plain left-to-right loop in the last bit.
 */
export function pySum(values: Iterable<number>): number {
    let total = 0;
    let compensation = 0;
    for (const x of values) {
        const t = total + x;
        compensation += Math.abs(total) >= Math.abs(x) ? (total - t) + x : (x - t) + total;
        total = t;
    }
    if (compensation && Number.isFinite(compensation)) total += compensation;
    return total;
}

/**
 * f"{value:,.2f}". Python rounds the exact binary value half-to-even, whereas
 * Number.toFixed / toLocaleString round an exact tie (x.125, x.375, x.625, x.875) up.
 */
export function pyFormatMoney(value: number): string {
    if (Number.isNaN(value)) return 'nan';
    if (!Number.isFinite(value)) return value > 0 ? 'inf' : '-inf';

    const negative = value < 0 || Object.is(value, -0);
    const abs = Math.abs(value);
    const eighths = abs * 8; // exact: a tie at two decimals is an odd multiple of 1/8

    let fixed: string;
    if (abs >= 2 ** 53) {
        // Always a whole number; toFixed() switches to exponent form from 1e21.
        fixed = `${BigInt(abs)}.00`;
    } else if (Number.isInteger(eighths) && eighths % 2 === 1) {
        let cents = (BigInt(eighths) * 100n) / 8n; // rounds the half down
        if (cents % 2n === 1n) cents += 1n; // half-to-even
        fixed = `${cents / 100n}.${pad(Number(cents % 100n), 2)}`;
    } else {
        fixed = abs.toFixed(2);
    }

    const [whole, fraction] = fixed.split('.');
    const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${negative ? '-' : ''}${grouped}.${fraction}`;
}

/** datetime.strftime('%m/%d/%Y') */
export function pyStrftimeMDY(value: Date): string {
    return `${pad(value.getUTCMonth() + 1, 2)}/${pad(value.getUTCDate(), 2)}/${pad(value.getUTCFullYear(), 4)}`;
}

// Same patterns CPython's _strptime builds for %m, %d, %y and %Y (\d = any Unicode digit).
const STRPTIME_M = '(1[0-2]|0[1-9]|[1-9])';
const STRPTIME_D = '(3[0-1]|[1-2]\\p{Nd}|0[1-9]|[1-9]| [1-9])';
const STRPTIME_SHORT = new RegExp(`^${STRPTIME_M}/${STRPTIME_D}/(\\p{Nd}\\p{Nd})`, 'u');
const STRPTIME_LONG = new RegExp(`^${STRPTIME_M}/${STRPTIME_D}/(\\p{Nd}\\p{Nd}\\p{Nd}\\p{Nd})`, 'u');

function strptime(text: string, re: RegExp, fourDigitYear: boolean): Date | null {
    const match = re.exec(text);
    if (!match || match[0].length !== text.length) return null; // "unconverted data remains"

    const month = parseInt(match[1], 10);
    const day = parseInt(toAsciiDigits(match[2]), 10);
    let year = parseInt(toAsciiDigits(match[3]), 10);
    if (!fourDigitYear) year += year <= 68 ? 2000 : 1900;
    if (year < 1) return null;

    const date = new Date(Date.UTC(2000, month - 1, day));
    date.setUTCFullYear(year);
    if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null; // e.g. 2/30
    return date;
}

/**
 * The legacy loop: try datetime.strptime(text, '%m/%d/%y'), then '%m/%d/%Y'.
 * Returns null where both raise ValueError.
 */
export function pyParseDeductDate(text: string): Date | null {
    return strptime(text, STRPTIME_SHORT, false) ?? strptime(text, STRPTIME_LONG, true);
}

/** werkzeug.utils.secure_filename – applied by the legacy Flask upload handler. */
export function secureFilename(fileName: string): string {
    const ascii = fileName.normalize('NFKD').replace(/[^\x00-\x7f]/g, '');
    const joined = ascii
        .replace(/\//g, ' ')
        .split(/[\t\n\x0b\x0c\r\x1c-\x1f ]+/)
        .filter(Boolean)
        .join('_');
    return joined.replace(/[^A-Za-z0-9_.-]/g, '').replace(/^[._]+|[._]+$/g, '');
}
