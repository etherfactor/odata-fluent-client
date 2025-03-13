export type InferArrayType<TData> = TData extends (infer UData)[] ? UData : never;
