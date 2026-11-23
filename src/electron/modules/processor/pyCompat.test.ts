import { describe, expect, it } from 'vitest';

import {
    pyFormatMoney,
    pyStr,
    pyFloat,
    pySum,
    pyCompareStr,
    pyParseDeductDate,
    pyStrftimeMDY,
    pyTruthy,
    secureFilename
} from './pyCompat.js';
import { extractCompanyName } from './buildReport.js';
import { parseArDate } from '../../lib/batch/util.js';
import { getReportMonthKey } from '../formatter/utils.js';

// Every expected value below was produced by CPython, not written by hand.
// tools/parity/primitives/run.sh checks ~29,000 more cases against a live interpreter.

describe('pyFormatMoney – f"{x:,.2f}"', () => {
    it.each([
        [12.125, '12.12'],
        [100.625, '100.62'],
        [0.375, '0.38'],
        [2.675, '2.67'],
        [1234567.891, '1,234,567.89'],
        [-0.004, '-0.00'],
        [0, '0.00'],
        [1e21, '1,000,000,000,000,000,000,000.00'],
        [-1234.5, '-1,234.50'],
        [999.995, '1,000.00']
    ])('%d -> %s', (value, expected) => {
        expect(pyFormatMoney(value)).toBe(expected);
    });
});

describe('pyStr – str(value)', () => {
    it('formats numbers like Python', () => {
        expect(pyStr(1.5e-7)).toBe('1.5e-07');
        expect(pyStr(0.1 + 0.2)).toBe('0.30000000000000004');
        expect(pyStr(1e22)).toBe('1e+22');
        expect(pyStr(12.5)).toBe('12.5');
        expect(pyStr(100)).toBe('100'); // read back from the workbook as an int
    });

    it('formats the other cell types like Python', () => {
        expect(pyStr(null)).toBe('None');
        expect(pyStr(true)).toBe('True');
        expect(pyStr(new Date(Date.UTC(2026, 4, 5)))).toBe('2026-05-05 00:00:00');
    });
});

describe('pyFloat – float(text)', () => {
    it.each([
        [' 300 ', 300],
        ['1_000', 1000],
        ['1e3', 1000],
        ['１２３', 123]
    ])('accepts %j', (text, expected) => {
        expect(pyFloat(text)).toBe(expected);
    });

    it.each(['250 CR', 'N/A', '(100)', '', '1,000'])('rejects %j', text => {
        expect(() => pyFloat(text)).toThrow();
    });
});

describe('other Python built-ins', () => {
    it('sum() compensates like CPython 3.12+', () => {
        expect(pySum([0.1, 0.2, 0.3])).toBe(0.6);
        expect(pySum([1e16, 1.0, -1e16])).toBe(1);
    });

    it('sorts strings by code point, not by locale', () => {
        const names = ['abc auto', 'Zeta Cars', 'ABC Auto', 'Ábaco Autos', '10 Mile Auto', '_Underscore'];
        expect([...names].sort(pyCompareStr)).toEqual(
            ['10 Mile Auto', 'ABC Auto', 'Zeta Cars', '_Underscore', 'abc auto', 'Ábaco Autos']
        );
    });

    it('truthiness', () => {
        expect(pyTruthy(0)).toBe(false);
        expect(pyTruthy('')).toBe(false);
        expect(pyTruthy(null)).toBe(false);
        expect(pyTruthy('0')).toBe(true);
        expect(pyTruthy(new Date(0))).toBe(true);
    });

    it('parses DEDUCTED dates with strptime rules', () => {
        expect(pyStrftimeMDY(pyParseDeductDate('5/1/26')!)).toBe('05/01/2026');
        expect(pyStrftimeMDY(pyParseDeductDate('08/15/2026')!)).toBe('08/15/2026');
        expect(pyStrftimeMDY(pyParseDeductDate('5/1/69')!)).toBe('05/01/1969');
        expect(pyParseDeductDate('5/1/26 PAID BACK 6/5/26')).toBeNull();
        expect(pyParseDeductDate('2/30/26')).toBeNull();
        expect(pyParseDeductDate('5-1-26')).toBeNull();
        expect(pyParseDeductDate('')).toBeNull();
    });
});

describe('report title', () => {
    it('reproduces werkzeug.secure_filename', () => {
        expect(secureFilename('FIRST CHOICE ar to 07.31.26.xlsx')).toBe('FIRST_CHOICE_ar_to_07.31.26.xlsx');
        expect(secureFilename("O'BRIEN & SONS ar to 07.31.26.xlsx")).toBe('OBRIEN__SONS_ar_to_07.31.26.xlsx');
        expect(secureFilename('ÉLAN ar to 07.31.26.xlsx')).toBe('ELAN_ar_to_07.31.26.xlsx');
    });

    it('uses the first part of the stored file name as the company', () => {
        expect(extractCompanyName('/exports/FIRST CHOICE ar to 07.31.26.xlsx')).toBe('FIRST');
        expect(extractCompanyName("/exports/O'BRIEN & SONS ar to 07.31.26.xlsx")).toBe('OBRIEN');
    });
});

describe('dates', () => {
    it('parses the A/R date as a calendar date (midnight UTC)', () => {
        expect(parseArDate('07/31/2026').toISOString()).toBe('2026-07-31T00:00:00.000Z');
        expect(parseArDate('7/1/2026').toISOString()).toBe('2026-07-01T00:00:00.000Z');
        expect(() => parseArDate('2026-07-31')).toThrow();
        expect(() => parseArDate('02/30/2026')).toThrow();
    });

    it('calendar-correct month keys ignore the PC time zone', () => {
        const firstOfApril = new Date(Date.UTC(2026, 3, 1));
        expect(getReportMonthKey(firstOfApril, false)).toBe('4/2026');
    });
});
