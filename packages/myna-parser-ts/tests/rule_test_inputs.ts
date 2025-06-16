import { Myna } from '../src';

export function getRuleTestInputs() {
    const m = Myna;

    return [
        // Myna primitive tests
        {
            rule: m.truePredicate,
            passStrings: ['a', 'b', 'c'],
            failStrings: []
        },
        {
            rule: m.falsePredicate,
            passStrings: [],
            failStrings: ['a', 'b', 'c']
        },
        {
            rule: m.end,
            passStrings: [''],
            failStrings: ['a', 'b', 'c']
        },
        {
            rule: m.all,
            passStrings: ['a', 'b', 'c'],
            failStrings: []
        },
        {
            rule: m.advance,
            passStrings: ['a', 'b', 'c'],
            failStrings: []
        },
        {
            rule: m.letterLower,
            passStrings: ['a', 'b', 'c'],
            failStrings: ['A', 'B', 'C', '1', '2', '3']
        },
        {
            rule: m.letterUpper,
            passStrings: ['A', 'B', 'C'],
            failStrings: ['a', 'b', 'c', '1', '2', '3']
        },
        {
            rule: m.digit,
            passStrings: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
            failStrings: ['a', 'b', 'c', 'A', 'B', 'C']
        },
        {
            rule: m.letter,
            passStrings: ['a', 'b', 'c', 'A', 'B', 'C'],
            failStrings: ['1', '2', '3']
        },
        {
            rule: m.alphaNumeric,
            passStrings: ['a', 'b', 'c', 'A', 'B', 'C', '1', '2', '3'],
            failStrings: ['!', '@', '#']
        },
        {
            rule: m.hexDigit,
            passStrings: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'A', 'B', 'C', 'D', 'E', 'F'],
            failStrings: ['g', 'h', 'i', 'G', 'H', 'I']
        },
        {
            rule: m.space,
            passStrings: [' ', '  ', '\t', '\n', '\r', ' \t\n\r'],
            failStrings: ['a', 'b', 'c']
        },
        {
            rule: m.space,
            passStrings: ['', ' ', '  ', '\t', '\n', '\r', ' \t\n\r'],
            failStrings: ['a', 'b', 'c']
        },
        {
            rule: m.newLine,
            passStrings: ['', '\n', '\r\n'],
            failStrings: ['a', 'b', 'c']
        },
        {
            rule: m.all,
            passStrings: ['a', 'b', 'c', 'A', 'B', 'C', '1', '2', '3', '!', '@', '#'],
            failStrings: []
        }
    ];
}

export default getRuleTestInputs; 