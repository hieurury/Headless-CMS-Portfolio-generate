export interface ToolJsonSchema {
    type: "object",
    properties: Record<string, any>
    required?: string[];

    [key: string]: unknown
}

export interface ITool<TIput = any, TOutput = any> {
    readonly name: string
    readonly description: string
    readonly inputSchema: ToolJsonSchema
    execute(input: TIput): Promise<TOutput>
}