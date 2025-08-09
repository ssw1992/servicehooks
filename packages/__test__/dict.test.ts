import { dictTranslate } from '@packages/dict';
import { expect, test } from 'vitest'

test('dictTranslate', () => {
    const dict = [
        { label: 'Apple', value: 1 },
        { label: 'Banana', value: 2 },
        { label: 'Cherry', value: 3 }
    ];
    expect(dictTranslate(1, dict)).toBe('Apple');
})