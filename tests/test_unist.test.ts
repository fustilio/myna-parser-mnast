import { describe, test, expect } from 'vitest';
import { toUnist, fromUnist, UnistNode } from '../src/unist';

describe.skip('Unist Conversion', () => {
    // Sample Myna AST node
    const mynaNode = {
        rule: { name: 'field', type: 'field' },
        input: 'a,1,"hello"\nb,2,"goodbye"',
        start: 0,
        end: 1,
        children: null,
        allText: 'a',
        fullName: 'csv.field'
    };

    // Sample Unist node (with indent)
    const unistNode: UnistNode = {
        type: 'field',
        position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 1, column: 2, offset: 1 },
            indent: []
        },
        data: {
            rule: { name: 'field', type: 'field' },
            fullName: 'csv.field',
            isAST: true
        }
    };

    test('converts Myna node to Unist node', () => {
        const result = toUnist(mynaNode);
        expect(result).toEqual(unistNode);
    });

    test('converts Unist node back to Myna node', () => {
        const expectedMynaNode = {
            rule: { name: 'field', type: 'field' },
            input: '0', // matches the fromUnist logic
            start: 0,
            end: 1,
            children: null,
            allText: 'a',
            fullName: 'csv.field',
            isAST: true
        };
        const result = fromUnist({ ...unistNode, value: 'a' });
        expect(result).toEqual(expectedMynaNode);
    });

    test('handles nodes with children', () => {
        const mynaParent = {
            ...mynaNode,
            children: [mynaNode],
            allText: undefined
        };

        const result = toUnist(mynaParent);
        expect(result.children).toHaveLength(1);
        expect(result.children![0]).toEqual(unistNode);
    });

    test('respects conversion options', () => {
        const result = toUnist(mynaNode, {
            includePosition: false,
            includeMynaData: false
        });

        expect(result.position).toBeUndefined();
        expect(result.data).toBeUndefined();
        expect(result.type).toBe('field');
    });

    test('handles custom type mapping', () => {
        const result = toUnist(mynaNode, {
            typeMapper: (node) => `custom_${node.rule.name}`
        });

        expect(result.type).toBe('custom_field');
    });

    test('handles Windows line endings', () => {
        const windowsNode = {
            ...mynaNode,
            input: 'a,1,"hello"\r\nb,2,"goodbye"'
        };

        const result = toUnist(windowsNode);
        expect(result.position?.start.line).toBe(1);
        expect(result.position?.start.column).toBe(1);
    });

    // New tests for CST compatibility
    test('handles CST nodes with original text', () => {
        const cstNode = {
            ...mynaNode,
            isCST: true
        };

        const result = toUnist(cstNode, { isCST: true });
        expect(result.data?.isCST).toBe(true);
        expect(result.data?.isAST).toBe(false);
        expect(result.data?.originalText).toBe('a');
    });

    test('preserves CST node structure', () => {
        const cstNode = {
            ...mynaNode,
            isCST: true,
            children: [{
                ...mynaNode,
                isCST: true
            }]
        };

        const result = toUnist(cstNode, { isCST: true });
        expect(result.data?.isCST).toBe(true);
        expect(result.children?.[0].data?.isCST).toBe(true);
    });

    test('converts CST node back to Myna format', () => {
        const cstUnistNode = {
            ...unistNode,
            data: {
                ...unistNode.data,
                isCST: true,
                originalText: 'a'
            }
        };

        const result = fromUnist(cstUnistNode);
        expect(result.isCST).toBe(true);
        expect(result.allText).toBe('a');
    });

    test('handles mixed AST/CST nodes', () => {
        const mixedNode = {
            ...mynaNode,
            children: [{
                ...mynaNode,
                isCST: true
            }]
        };

        const result = toUnist(mixedNode);
        expect(result.data?.isAST).toBe(true);
        expect(result.children?.[0].data?.isCST).toBe(true);
    });
}); 