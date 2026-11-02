export type SearchParamsArrayFormat = 'repeat' | 'comma' | 'brackets';

export const searchParamsArrayFormats: readonly SearchParamsArrayFormat[] = ['repeat', 'comma', 'brackets'];

// Returns the name under which the items of an array value of `key` are stored, so a deletion or a replacement of `key` can remove them as well. Only the `brackets` format stores them under another name.
export const getArrayParameterKey = (key: string, format: SearchParamsArrayFormat | undefined): string =>
	format === 'brackets' ? `${key}[]` : key;

// Returns the `[key, value]` pairs that an array value adds to the search parameters. An empty array adds nothing, also in the `comma` format. Encoding is left to `URLSearchParams`.
export const getArraySearchParameters = (
	key: string,
	items: readonly unknown[],
	format: SearchParamsArrayFormat | undefined,
): Array<[string, string]> => {
	if (items.length === 0) {
		return [];
	}

	const values = [...items].map(item => String(item));

	if (format === 'comma') {
		return [[key, values.join(',')]];
	}

	const parameterKey = getArrayParameterKey(key, format);
	return values.map(value => [parameterKey, value]);
};
