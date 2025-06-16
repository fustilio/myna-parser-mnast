import { Point, Position } from './types';

/**
 * Calculate line and column numbers from a string offset
 */
export function calculatePosition(input: string, offset: number): Point {
    let line = 1;
    let column = 1;
    let currentOffset = 0;

    for (let i = 0; i < offset; i++) {
        const char = input[i];
        if (char === '\n') {
            line++;
            column = 1;
        } else if (char === '\r') {
            // Handle Windows line endings
            if (input[i + 1] === '\n') {
                i++; // Skip the \n
                line++;
                column = 1;
            } else {
                line++;
                column = 1;
            }
        } else {
            column++;
        }
        currentOffset++;
    }

    return {
        line,
        column,
        offset
    };
}

/**
 * Calculate position information for a Myna node
 */
export function calculateNodePosition(
    input: string,
    start: number,
    end: number
): Position {
    return {
        start: calculatePosition(input, start),
        end: calculatePosition(input, end)
    };
}

/**
 * Calculate indentation levels for a position
 */
export function calculateIndent(input: string, position: Position): number[] {
    const indent: number[] = [];
    let currentIndent = 0;
    let inIndent = true;

    for (let i = 0; i < position.start.offset; i++) {
        const char = input[i];
        if (char === '\n' || char === '\r') {
            if (char === '\r' && input[i + 1] === '\n') {
                i++; // Skip the \n
            }
            currentIndent = 0;
            inIndent = true;
        } else if (inIndent) {
            if (char === ' ' || char === '\t') {
                currentIndent++;
            } else {
                indent.push(currentIndent);
                inIndent = false;
            }
        }
    }

    return indent;
}
