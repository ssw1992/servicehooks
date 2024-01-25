import { expect, test } from 'vitest'
import { sum } from '@packages/basic'

test('1 + 1 = 2', () => {
  expect(sum(1, 1)).toBe(2);
  expect(sum(2, 1)).toBe(3);
})