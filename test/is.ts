import vm from 'node:vm';
import test from 'ava';
import {
	isObject,
	isNonArrayObject,
	isNonNegativeNumber,
	isError,
	isRequest,
	isResponse,
} from '../source/utils/is.js';

const runInOtherRealm = (code: string): unknown => vm.runInNewContext(code);

test('isObject: accepts objects and arrays', t => {
	t.true(isObject({}));
	t.true(isObject([]));
	t.true(isObject(new Date()));
	t.true(isObject(Object.create(null)));
	t.true(isObject(runInOtherRealm('({})')));
});

test('isObject: rejects null and primitives', t => {
	t.false(isObject(null));
	t.false(isObject(undefined));
	t.false(isObject('string'));
	t.false(isObject(1));
	t.false(isObject(true));
	t.false(isObject(Symbol('symbol')));
	t.false(isObject(1n));
	t.false(isObject(() => {}));
});

test('isNonArrayObject: accepts non-array objects', t => {
	t.true(isNonArrayObject({}));
	t.true(isNonArrayObject(new Map()));
	t.true(isNonArrayObject(Object.create(null)));
	t.true(isNonArrayObject(runInOtherRealm('({})')));
});

test('isNonArrayObject: rejects arrays, null, and primitives', t => {
	t.false(isNonArrayObject([]));
	t.false(isNonArrayObject([1, 2, 3]));
	t.false(isNonArrayObject(runInOtherRealm('[]')));
	t.false(isNonArrayObject(null));
	t.false(isNonArrayObject(undefined));
	t.false(isNonArrayObject('string'));
	t.false(isNonArrayObject(1));
});

test('isNonNegativeNumber: accepts zero and positive numbers', t => {
	t.true(isNonNegativeNumber(0));
	t.true(isNonNegativeNumber(-0));
	t.true(isNonNegativeNumber(1));
	t.true(isNonNegativeNumber(1.5));
	t.true(isNonNegativeNumber(Number.POSITIVE_INFINITY));
});

test('isNonNegativeNumber: rejects NaN, negatives, and non-numbers', t => {
	t.false(isNonNegativeNumber(Number.NaN));
	t.false(isNonNegativeNumber(-1));
	t.false(isNonNegativeNumber(Number.NEGATIVE_INFINITY));
	t.false(isNonNegativeNumber('1'));
	t.false(isNonNegativeNumber(null));
	t.false(isNonNegativeNumber(undefined));
	t.false(isNonNegativeNumber(1n));
	t.false(isNonNegativeNumber({}));
});

test('isError: accepts errors and subclasses', t => {
	t.true(isError(new Error('x')));
	t.true(isError(new TypeError('x')));
	t.true(isError(new (class CustomError extends Error {})('x')));
});

test('isError: accepts errors from another realm', t => {
	const error = runInOtherRealm('new Error("x")');
	t.false(error instanceof Error);
	t.true(isError(error));
	t.true(isError(runInOtherRealm('new TypeError("x")')));
});

test('isError: accepts DOMException', t => {
	const exception = new DOMException('aborted', 'AbortError');
	t.is(Object.prototype.toString.call(exception), '[object DOMException]');
	t.true(isError(exception));

	const signal = AbortSignal.abort();
	t.true(isError(signal.reason));
});

test('isError: rejects non-errors', t => {
	t.false(isError(null));
	t.false(isError(undefined));
	t.false(isError('error'));
	t.false(isError({}));
	t.false(isError({message: 'x', name: 'Error'}));
	t.false(isError([]));
});

test('isRequest: accepts requests', t => {
	t.true(isRequest(new Request('https://example.com')));
});

test('isRequest: accepts requests from another realm via brand', t => {
	const foreign = runInOtherRealm('({[Symbol.toStringTag]: "Request"})');
	t.false(foreign instanceof Request);
	t.true(isRequest(foreign));
});

test('isRequest: rejects non-requests', t => {
	t.false(isRequest(null));
	t.false(isRequest(undefined));
	t.false(isRequest('https://example.com'));
	t.false(isRequest({}));
	t.false(isRequest(new Response()));
	t.false(isRequest(new URL('https://example.com')));
});

test('isResponse: accepts responses', t => {
	t.true(isResponse(new Response()));
	t.true(isResponse(new Response('body', {status: 404})));
	t.true(isResponse(Response.error()));
});

test('isResponse: accepts responses from another realm via brand', t => {
	const foreign = runInOtherRealm('({[Symbol.toStringTag]: "Response"})');
	t.false(foreign instanceof Response);
	t.true(isResponse(foreign));
});

test('isResponse: rejects non-responses', t => {
	t.false(isResponse(null));
	t.false(isResponse(undefined));
	t.false(isResponse('response'));
	t.false(isResponse({}));
	t.false(isResponse({ok: true, status: 200}));
	t.false(isResponse(new Request('https://example.com')));
});
