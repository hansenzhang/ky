import {expectTypeOf} from 'expect-type';
import type {Options, SearchParamsOption} from 'ky';

const searchParameters = [['tag', 'one'], ['tag', 'two'], ['page', 2], ['active', true]] as const;
const options: Options = {searchParams: searchParameters};

expectTypeOf(options.searchParams).toMatchTypeOf<SearchParamsOption>();

// Array values in the object form
const tags = ['one', 'two'] as const;
const stringArray: SearchParamsOption = {tag: ['one', 'two']};
const numberArray: SearchParamsOption = {page: [1, 2]};
const booleanArray: SearchParamsOption = {active: [true, false]};
const mixedArray: SearchParamsOption = {tag: [1, true, 'x']};
const readonlyArray: SearchParamsOption = {tag: tags};
const readonlyNumberArray: SearchParamsOption = {page: [1, 2] as const};
const readonlyBooleanArray: SearchParamsOption = {active: [true, false] as const};

expectTypeOf(stringArray).toMatchTypeOf<SearchParamsOption>();
expectTypeOf(numberArray).toMatchTypeOf<SearchParamsOption>();
expectTypeOf(booleanArray).toMatchTypeOf<SearchParamsOption>();
expectTypeOf(mixedArray).toMatchTypeOf<SearchParamsOption>();
expectTypeOf(readonlyArray).toMatchTypeOf<SearchParamsOption>();
expectTypeOf(readonlyNumberArray).toMatchTypeOf<SearchParamsOption>();
expectTypeOf(readonlyBooleanArray).toMatchTypeOf<SearchParamsOption>();

expectTypeOf<{tag: string[]}>().toMatchTypeOf<SearchParamsOption>();
expectTypeOf<{tag: number[]}>().toMatchTypeOf<SearchParamsOption>();
expectTypeOf<{tag: boolean[]}>().toMatchTypeOf<SearchParamsOption>();
expectTypeOf<{tag: readonly string[]}>().toMatchTypeOf<SearchParamsOption>();
expectTypeOf<{tag: readonly number[]}>().toMatchTypeOf<SearchParamsOption>();
expectTypeOf<{tag: readonly boolean[]}>().toMatchTypeOf<SearchParamsOption>();
expectTypeOf<{tag: string[]; page: number; other: undefined}>().toMatchTypeOf<SearchParamsOption>();

expectTypeOf<{tag: Array<Record<string, string>>}>().not.toMatchTypeOf<SearchParamsOption>();
expectTypeOf<{tag: Array<string | null>}>().not.toMatchTypeOf<SearchParamsOption>();
expectTypeOf<{tag: string[][]}>().not.toMatchTypeOf<SearchParamsOption>();

const optionsWithArrays: Options = {searchParams: {tag: ['one', 'two'], page: [1, 2], active: [true]}};
expectTypeOf(optionsWithArrays.searchParams).toMatchTypeOf<SearchParamsOption>();

// `searchParamsArrayFormat`
expectTypeOf<Options['searchParamsArrayFormat']>().toEqualTypeOf<'repeat' | 'comma' | 'brackets' | undefined>();

const repeatOptions: Options = {searchParamsArrayFormat: 'repeat'};
const commaOptions: Options = {searchParamsArrayFormat: 'comma'};
const bracketsOptions: Options = {searchParamsArrayFormat: 'brackets'};
const undefinedOptions: Options = {searchParamsArrayFormat: undefined};

expectTypeOf(repeatOptions.searchParamsArrayFormat).toEqualTypeOf<Options['searchParamsArrayFormat']>();
expectTypeOf(commaOptions.searchParamsArrayFormat).toEqualTypeOf<Options['searchParamsArrayFormat']>();
expectTypeOf(bracketsOptions.searchParamsArrayFormat).toEqualTypeOf<Options['searchParamsArrayFormat']>();
expectTypeOf(undefinedOptions.searchParamsArrayFormat).toEqualTypeOf<Options['searchParamsArrayFormat']>();

// @ts-expect-error
const unknownFormat: Options = {searchParamsArrayFormat: 'foo'};
// @ts-expect-error
const nullFormat: Options = {searchParamsArrayFormat: null};
// @ts-expect-error
const numberFormat: Options = {searchParamsArrayFormat: 1};

expectTypeOf('foo').not.toMatchTypeOf<NonNullable<Options['searchParamsArrayFormat']>>();
expectTypeOf(unknownFormat).toMatchTypeOf<Options>();
expectTypeOf(nullFormat).toMatchTypeOf<Options>();
expectTypeOf(numberFormat).toMatchTypeOf<Options>();
