export type AnyArray = Array<SafeAny>;

export type InferArrayType<TValue> = TValue extends (infer UValue)[] ? UValue : never;

export type IsObjectOrArray<TValue> = TValue extends object ? (TValue extends AnyArray ? (TValue[number] extends object ? TValue : never) : TValue): never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SafeAny = any;
