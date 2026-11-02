import test from 'ava';
import ky, {type Options} from '../source/index.js';

const echoUrl = async (request: Request) => new Response(request.url);

const formats = ['repeat', 'comma', 'brackets'] as const;

// Formats

test('`repeat` adds one parameter per item', async t => {
	const url = await ky('https://example.com', {
		searchParams: {tag: ['a', 'b']},
		searchParamsArrayFormat: 'repeat',
		fetch: echoUrl,
	}).text();

	t.is(url, 'https://example.com/?tag=a&tag=b');
});

test('`repeat` is the default format', async t => {
	const url = await ky('https://example.com', {
		searchParams: {tag: ['a', 'b']},
		fetch: echoUrl,
	}).text();

	t.is(url, 'https://example.com/?tag=a&tag=b');

	const undefinedFormatUrl = await ky('https://example.com', {
		searchParams: {tag: ['a', 'b']},
		searchParamsArrayFormat: undefined,
		fetch: echoUrl,
	}).text();

	t.is(undefinedFormatUrl, url);
});

test('`comma` adds a single parameter with the items joined by a comma', async t => {
	const url = await ky('https://example.com', {
		searchParams: {tag: ['a', 'b']},
		searchParamsArrayFormat: 'comma',
		fetch: echoUrl,
	}).text();

	t.is(url, 'https://example.com/?tag=a%2Cb');
	t.deepEqual(new URL(url).searchParams.getAll('tag'), ['a,b']);
});

test('`brackets` appends `[]` to the key of every item', async t => {
	const url = await ky('https://example.com', {
		searchParams: {tag: ['a', 'b']},
		searchParamsArrayFormat: 'brackets',
		fetch: echoUrl,
	}).text();

	t.is(url, 'https://example.com/?tag%5B%5D=a&tag%5B%5D=b');
	t.deepEqual(new URL(url).searchParams.getAll('tag[]'), ['a', 'b']);
});

test('a readonly array is accepted in every format', async t => {
	const tags = ['a', 'b'] as const;
	const expected = {
		repeat: 'https://example.com/?tag=a&tag=b',
		comma: 'https://example.com/?tag=a%2Cb',
		brackets: 'https://example.com/?tag%5B%5D=a&tag%5B%5D=b',
	};

	for (const format of formats) {
		// eslint-disable-next-line no-await-in-loop
		const url = await ky('https://example.com', {
			searchParams: {tag: tags},
			searchParamsArrayFormat: format,
			fetch: echoUrl,
		}).text();

		t.is(url, expected[format], format);
	}
});

test('number and boolean items are converted to strings in every format', async t => {
	const expected = {
		repeat: 'https://example.com/?tag=1&tag=true&tag=x',
		comma: 'https://example.com/?tag=1%2Ctrue%2Cx',
		brackets: 'https://example.com/?tag%5B%5D=1&tag%5B%5D=true&tag%5B%5D=x',
	};

	for (const format of formats) {
		// eslint-disable-next-line no-await-in-loop
		const url = await ky('https://example.com', {
			searchParams: {tag: [1, true, 'x']},
			searchParamsArrayFormat: format,
			fetch: echoUrl,
		}).text();

		t.is(url, expected[format], format);
	}
});

test('an empty array adds nothing in every format', async t => {
	for (const format of formats) {
		// eslint-disable-next-line no-await-in-loop
		const url = await ky('https://example.com', {
			searchParams: {tag: []},
			searchParamsArrayFormat: format,
			fetch: echoUrl,
		}).text();

		t.is(url, 'https://example.com/', format);
		t.false(url.includes('?'), format);

		// eslint-disable-next-line no-await-in-loop
		const otherUrl = await ky('https://example.com', {
			searchParams: {page: 1, tag: []},
			searchParamsArrayFormat: format,
			fetch: echoUrl,
		}).text();

		t.is(otherUrl, 'https://example.com/?page=1', format);
	}
});

// Input URL

test('array values are appended to the parameters of the input URL', async t => {
	const expected = {
		repeat: 'https://example.com/?x=1&tag=a&tag=b',
		comma: 'https://example.com/?x=1&tag=a%2Cb',
		brackets: 'https://example.com/?x=1&tag%5B%5D=a&tag%5B%5D=b',
	};

	for (const format of formats) {
		// eslint-disable-next-line no-await-in-loop
		const url = await ky('https://example.com/?x=1', {
			searchParams: {tag: ['a', 'b']},
			searchParamsArrayFormat: format,
			fetch: echoUrl,
		}).text();

		t.is(url, expected[format], format);
	}
});

test('an `undefined` value still deletes an input URL key next to an array value', async t => {
	for (const format of formats) {
		// eslint-disable-next-line no-await-in-loop
		const url = await ky('https://example.com/?x=1&y=2', {
			searchParams: {x: undefined, tag: ['a']},
			searchParamsArrayFormat: format,
			fetch: echoUrl,
		}).text();

		const {searchParams} = new URL(url);
		t.false(searchParams.has('x'), format);
		t.is(searchParams.get('y'), '2', format);
		t.is(searchParams.get(format === 'brackets' ? 'tag[]' : 'tag'), 'a', format);
	}
});

// Instance defaults

test('`ky.create()` applies `searchParamsArrayFormat` to request arrays', async t => {
	const api = ky.create({searchParamsArrayFormat: 'comma', fetch: echoUrl});

	t.is(await api('https://example.com', {searchParams: {tag: ['a', 'b']}}).text(), 'https://example.com/?tag=a%2Cb');
});

test('`.extend()` applies `searchParamsArrayFormat` to request arrays', async t => {
	const api = ky.create({fetch: echoUrl}).extend({searchParamsArrayFormat: 'brackets'});

	t.is(await api('https://example.com', {searchParams: {tag: ['a', 'b']}}).text(), 'https://example.com/?tag%5B%5D=a&tag%5B%5D=b');
});

test('`.extend()` overrides the format of the parent instance', async t => {
	const api = ky.create({searchParamsArrayFormat: 'comma', fetch: echoUrl}).extend({searchParamsArrayFormat: 'brackets'});

	t.is(await api('https://example.com', {searchParams: {tag: ['a', 'b']}}).text(), 'https://example.com/?tag%5B%5D=a&tag%5B%5D=b');
});

test('a format set at the request overrides the instance', async t => {
	const api = ky.create({searchParamsArrayFormat: 'comma', fetch: echoUrl});

	t.is(
		await api('https://example.com', {searchParams: {tag: ['a', 'b']}, searchParamsArrayFormat: 'brackets'}).text(),
		'https://example.com/?tag%5B%5D=a&tag%5B%5D=b',
	);
	t.is(
		await api('https://example.com', {searchParams: {tag: ['a', 'b']}, searchParamsArrayFormat: undefined}).text(),
		'https://example.com/?tag=a&tag=b',
	);
});

test('arrays of the instance and the request are both formatted correctly', async t => {
	const api = ky.create({searchParams: {tag: ['a']}, fetch: echoUrl});

	t.is(
		await api('https://example.com', {searchParams: {other: ['b', 'c']}, searchParamsArrayFormat: 'brackets'}).text(),
		'https://example.com/?tag%5B%5D=a&other%5B%5D=b&other%5B%5D=c',
	);
	t.is(
		await api('https://example.com', {searchParams: {other: ['b', 'c']}, searchParamsArrayFormat: 'comma'}).text(),
		'https://example.com/?tag=a&other=b%2Cc',
	);
});

test('a format set in a later layer than the arrays still applies', async t => {
	const api = ky.create({searchParams: {tag: ['a', 'b']}, fetch: echoUrl});

	t.is(
		await api('https://example.com', {searchParamsArrayFormat: 'comma'}).text(),
		'https://example.com/?tag=a%2Cb',
	);
	t.is(
		await api.extend({searchParamsArrayFormat: 'brackets'})('https://example.com').text(),
		'https://example.com/?tag%5B%5D=a&tag%5B%5D=b',
	);
});

// Not forwarded

test('`searchParamsArrayFormat` is not forwarded to `fetch()`', async t => {
	let init: Record<string, unknown> | undefined;

	await ky('https://example.com', {
		searchParams: {tag: ['a', 'b']},
		searchParamsArrayFormat: 'comma',
		async fetch(request, fetchInit) {
			init = fetchInit as Record<string, unknown> | undefined;
			return new Response(request.url);
		},
	}).text();

	t.truthy(init);
	t.false('searchParamsArrayFormat' in init!);
});

// Validation

test('an invalid `searchParamsArrayFormat` rejects with a `TypeError`', async t => {
	for (const format of ['foo', null, 1]) {
		// eslint-disable-next-line no-await-in-loop
		await t.throwsAsync(
			ky('https://example.com', {
				searchParams: {tag: ['a']},
				searchParamsArrayFormat: format as any,
				fetch: echoUrl,
			}).text(),
			{instanceOf: TypeError, message: /searchParamsArrayFormat/},
			String(format),
		);
	}
});

test('an invalid `searchParamsArrayFormat` rejects without array values too', async t => {
	await t.throwsAsync(
		ky('https://example.com', {searchParamsArrayFormat: 'foo' as never, fetch: echoUrl}).text(),
		{instanceOf: TypeError, message: /searchParamsArrayFormat/},
	);
});

test('an invalid `searchParamsArrayFormat` from `ky.create()` defaults rejects with a `TypeError`', async t => {
	for (const format of ['foo', null, 1]) {
		// eslint-disable-next-line no-await-in-loop
		await t.throwsAsync(
			async () => ky.create({searchParamsArrayFormat: format as any, fetch: echoUrl})('https://example.com', {searchParams: {tag: ['a']}}).text(),
			{instanceOf: TypeError, message: /searchParamsArrayFormat/},
			String(format),
		);
	}
});

test('an invalid `searchParamsArrayFormat` from `.extend()` defaults rejects with a `TypeError`', async t => {
	for (const format of ['foo', null, 1]) {
		// eslint-disable-next-line no-await-in-loop
		await t.throwsAsync(
			async () => ky.create({fetch: echoUrl}).extend({searchParamsArrayFormat: format as any})('https://example.com', {searchParams: {tag: ['a']}}).text(),
			{instanceOf: TypeError, message: /searchParamsArrayFormat/},
			String(format),
		);
	}
});

test('`searchParamsArrayFormat: undefined` is accepted', async t => {
	const options: Options = {searchParams: {tag: ['a', 'b']}, searchParamsArrayFormat: undefined, fetch: echoUrl};

	t.is(await ky('https://example.com', options).text(), 'https://example.com/?tag=a&tag=b');
	t.is(await ky.create(options)('https://example.com').text(), 'https://example.com/?tag=a&tag=b');
});

// Other forms

test('the format does not affect strings, `URLSearchParams`, and pairs', async t => {
	for (const format of formats) {
		// eslint-disable-next-line no-await-in-loop
		const stringUrl = await ky('https://example.com', {
			searchParams: 'tag=a,b',
			searchParamsArrayFormat: format,
			fetch: echoUrl,
		}).text();

		t.is(stringUrl, 'https://example.com/?tag=a,b', format);

		// eslint-disable-next-line no-await-in-loop
		const urlSearchParametersUrl = await ky('https://example.com', {
			searchParams: new URLSearchParams([['tag', 'a'], ['tag', 'b']]),
			searchParamsArrayFormat: format,
			fetch: echoUrl,
		}).text();

		t.is(urlSearchParametersUrl, 'https://example.com/?tag=a&tag=b', format);

		// eslint-disable-next-line no-await-in-loop
		const pairsUrl = await ky('https://example.com', {
			searchParams: [['tag', 'a'], ['tag', 'b']],
			searchParamsArrayFormat: format,
			fetch: echoUrl,
		}).text();

		t.is(pairsUrl, 'https://example.com/?tag=a&tag=b', format);
		t.deepEqual(new URL(pairsUrl).searchParams.getAll('tag'), ['a', 'b'], format);
	}
});

// Init hook copy

test('an `init` hook mutating an array does not change the options of the caller', async t => {
	const tags = ['a', 'b'];
	const options: Options = {
		searchParams: {tag: tags},
		searchParamsArrayFormat: 'comma',
		fetch: echoUrl,
		hooks: {
			init: [
				options => {
					(options.searchParams as any).tag.push('c');
				},
			],
		},
	};

	const url = await ky('https://example.com', options).text();

	t.is(url, 'https://example.com/?tag=a%2Cb%2Cc');
	t.deepEqual(tags, ['a', 'b']);
	t.deepEqual((options.searchParams as {tag: string[]}).tag, ['a', 'b']);
});

test('an `init` hook mutating an array does not leak into the next request of the instance', async t => {
	const api = ky.create({
		searchParamsArrayFormat: 'comma',
		fetch: echoUrl,
		hooks: {
			init: [
				options => {
					(options.searchParams as any).tag.push('c');
				},
			],
		},
	});
	const options: Options = {searchParams: {tag: ['a', 'b']}};

	t.is(await api('https://example.com', options).text(), 'https://example.com/?tag=a%2Cb%2Cc');
	t.is(await api('https://example.com', options).text(), 'https://example.com/?tag=a%2Cb%2Cc');
	t.deepEqual((options.searchParams as {tag: string[]}).tag, ['a', 'b']);
});

test('an `init` hook mutating an array of the instance defaults does not leak into the next request', async t => {
	const api = ky.create({
		searchParams: {tag: ['a']},
		searchParamsArrayFormat: 'comma',
		fetch: echoUrl,
		hooks: {
			init: [
				options => {
					(options.searchParams as any).tag.push('c');
				},
			],
		},
	});

	t.is(await api('https://example.com').text(), 'https://example.com/?tag=a%2Cc');
	t.is(await api('https://example.com').text(), 'https://example.com/?tag=a%2Cc');
});
