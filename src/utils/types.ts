export type AnyArray = Array<SafeAny>;

export type InferArrayType<TData> = TData extends (infer UData)[] ? UData : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SafeAny = any;
