/**
 * mnast compatible node types
 */

export interface Point {
    line: number;
    column: number;
    offset: number;
}

export interface Position {
    start: Point;
    end: Point;
    indent?: number[];
}

export interface MnastNode {
    type: string;
    position?: Position;
    children?: MnastNode[];
    value?: string;
    data?: {
        rule?: any;
        fullName?: string;
        // CST specific fields
        isCST?: boolean;
        isAST?: boolean;
        originalText?: string;
        // Additional metadata
        [key: string]: any;
    };
}

/**
 * Myna to mnast conversion options
 */
export interface MnastConversionOptions {
    /**
     * Whether to include position information
     * @default true
     */
    includePosition?: boolean;

    /**
     * Whether to include original Myna data
     * @default true
     */
    includeMynaData?: boolean;

    /**
     * Custom type mapping function
     */
    typeMapper?: (node: any) => string;

    /**
     * Whether to treat the input as a CST (Concrete Syntax Tree)
     * @default false
     */
    isCST?: boolean;

    /**
     * Whether to preserve original text in CST nodes
     * @default true
     */
    preserveOriginalText?: boolean;
}
