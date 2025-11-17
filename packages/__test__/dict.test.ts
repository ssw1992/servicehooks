import { dictTranslate, dictTranslateValues } from '@packages/dict';
import { expect, test } from 'vitest'

test('dictTranslate', () => {
    const dict = [
        { label: 'Apple', value: 1 },
        { label: 'Banana', value: 2 },
        { label: 'Cherry', value: 3 }
    ];
    expect(dictTranslate(1, dict)).toBe('Apple');
})

test('dictTranslateValues with string values (single)', () => {
    const dict = [
        { label: 'Apple', value: '1' },
        { label: 'Banana', value: '2' },
        { label: 'Cherry', value: '3' }
    ];
    expect(dictTranslateValues('1', dict)).toBe('Apple');
})

test('dictTranslateValues with string values (multiple)', () => {
    const dict = [
        { label: 'Apple', value: '1' },
        { label: 'Banana', value: '2' },
        { label: 'Cherry', value: '3' }
    ];
    expect(dictTranslateValues('1,2', dict)).toBe('Apple,Banana');
})

test('dictTranslateValues preserves unmapped values and handles null', () => {
    const dict = [
        { label: 'Apple', value: '1' },
        { label: 'Banana', value: '2' }
    ];
    // unmapped '4' should remain as '4'
    expect(dictTranslateValues('4,2', dict)).toBe('4,Banana');
    // null input should return null
    expect(dictTranslateValues(null, dict)).toBeNull();
})