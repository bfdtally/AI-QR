import test from 'node:test';
import assert from 'node:assert/strict';
import { categories, scoreResponses } from '../src/scoring.ts';

test('every one of the 1,024 valid answer combinations has the correct category', () => {
  for (let code = 0; code < 1024; code++) {
    const answers = Array.from({ length: 5 }, (_, i) => ((code >> (2 * i)) & 3) + 1);
    const total = answers.reduce((sum, v) => sum + v, 0);
    const expected = total >= 17 ? categories[0] : total >= 13 ? categories[1] : total >= 9 ? categories[2] : categories[3];
    const actual = scoreResponses(answers);
    assert.equal(actual.total, total); assert.equal(actual.category, expected);
  }
});
test('incomplete and invalid answers cannot be scored', () => {
  for (const answers of [[], [1, 2, 3, 4], [0, 1, 1, 1, 1], [5, 1, 1, 1, 1], [1.5, 1, 1, 1, 1], [NaN, 1, 1, 1, 1]]) assert.throws(() => scoreResponses(answers));
});
