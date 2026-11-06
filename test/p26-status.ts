import test from 'ava';
import {isSuccessStatus} from '../source/utils/status.js';

test('returns true for 2xx statuses', t => {
	t.true(isSuccessStatus(200));
	t.true(isSuccessStatus(204));
	t.true(isSuccessStatus(299));
});

test('returns false just outside the 2xx range', t => {
	t.false(isSuccessStatus(199));
	t.false(isSuccessStatus(300));
});

test('returns false for other statuses', t => {
	t.false(isSuccessStatus(100));
	t.false(isSuccessStatus(404));
	t.false(isSuccessStatus(500));
});

test('returns false for zero and negative values', t => {
	t.false(isSuccessStatus(0));
	t.false(isSuccessStatus(-1));
	t.false(isSuccessStatus(-200));
});

test('returns false for NaN', t => {
	t.false(isSuccessStatus(Number.NaN));
});
