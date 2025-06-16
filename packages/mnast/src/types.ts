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

// Base node map type for extension
export type MnastNodeMap = Record<string, unknown>;

// Strict discriminated union for MnastNode (string keys only)
export type MnastNode<T extends MnastNodeMap = {}> = {
  [K in Extract<keyof T, string>]: {
    type: K;
    position?: Position;
    children?: MnastNode<T>[];
    value?: string;
    data?: {
      rule?: any;
      fullName?: string;
      isCST?: boolean;
      isAST?: boolean;
      originalText?: string;
      [key: string]: any;
    };
  } & T[K];
}[Extract<keyof T, string>];

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
