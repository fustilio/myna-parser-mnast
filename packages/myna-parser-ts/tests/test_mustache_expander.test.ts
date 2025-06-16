import { describe, it, expect } from 'vitest';
import { expand } from '../tools/myna_mustache_expander';

// Mustache Expander Test Suite

describe('Mustache Expander', () => {
    // Basic Expansion
    it('should handle basic expansion', () => {
        expect(expand("{{a}}", { a: 42 })).toBe("42");
        expect(expand("{{a}}", null)).toBe("");
        expect(expand("a b c", null)).toBe("a b c");
        expect(expand("a {b} c", { b: 42 })).toBe("a {b} c");
        expect(expand("a {{b}} c", { b: 42 })).toBe("a 42 c");
        expect(expand("{{a}}", {})).toBe("");
        expect(expand("{{a}}", { a: "<>" })).toBe("&lt;&gt;");
        expect(expand("{{{a}}}", { a: "<>" })).toBe("<>");
        expect(expand("{{&a}}", { a: "<>" })).toBe("<>");
        expect(expand("{{a}} {{b}} {{c}} {{d}}", { a: 10, b: "hello", d: true })).toBe("10 hello  true");
        expect(expand("{{a}}{{b}}{{c}},{{#test}}{{a}}{{b}}{{c}}{{/test}}", { a: "A", b: "X", test: { b: "B", c: "C" } })).toBe("AX,ABC");
    });

    // Complex Examples
    it('should handle complex examples', () => {
        const template1 = [
            "Hello {{name}}",
            "You have just won {{value}} dollars!",
            "{{#in_ca}}",
            "Well, {{taxed_value}} dollars, after taxes.",
            "{{/in_ca}}",
        ].join('\n');

        const data1 = {
            name: "Chris",
            value: 10000,
            taxed_value: 10000 - (10000 * 0.4),
            in_ca: true
        };

        expect(expand(template1, data1)).toBe(
            "Hello Chris\n" +
            "You have just won 10000 dollars!\n" +
            "Well, 6000 dollars, after taxes."
        );

        const template2 = [
            "* {{name}}",
            "* {{age}}",
            "* {{company}}",
            "* {{{company}}}",
        ].join('\n');

        const data2 = {
            name: "Chris",
            company: "<b>GitHub</b>"
        };

        expect(expand(template2, data2)).toBe(
            "* Chris\n" +
            "* \n" +
            "* &lt;b&gt;GitHub&lt;/b&gt;\n" +
            "* <b>GitHub</b>"
        );
    });

    // Conditional Sections
    it('should handle conditional sections', () => {
        const template = [
            "Shown.",
            "{{#person}}",
            "Never shown!",
            "{{/person}}",
        ].join('\n');

        const data = {
            person: false
        };

        expect(expand(template, data)).toBe("Shown.");
    });

    // Array Sections
    it('should handle array sections', () => {
        const template = [
            "{{#repo}}",
            "<b>{{name}}</b>",
            "{{/repo}}",
        ].join('\n');

        const data = {
            repo: [
                { name: "resque" },
                { name: "hub" },
                { name: "rip" }
            ]
        };

        expect(expand(template, data)).toBe(
            "<b>resque</b>\n" +
            "<b>hub</b>\n" +
            "<b>rip</b>"
        );
    });

    // Question Mark Sections
    it('should handle question mark sections', () => {
        const template = [
            "{{#person?}}",
            "  Hi {{name}}!",
            "{{/person?}}",
        ].join('\n');

        const data = {
            "person?": { name: "Jon" }
        };

        expect(expand(template, data)).toBe("  Hi Jon!");
    });

    // Inverted Sections
    it('should handle inverted sections', () => {
        const template = [
            "{{#repo}}",
            "<b>{{name}}</b>",
            "{{/repo}}",
            "{{^repo}}",
            "No repos :(",
            "{{/repo}}",
        ].join('\n');

        const data = {
            repo: []
        };

        expect(expand(template, data)).toBe("No repos :(");
    });

    // Comments
    it('should handle comments', () => {
        expect(expand("<h1>Today{{! ignore me }}.</h1>", {})).toBe("<h1>Today.</h1>");
    });

    // Nested Templates
    it('should handle nested templates', () => {
        expect(expand("{{text}}", { today: "Tuesday", text: "Today is {{today}}" })).toBe("Today is Tuesday");
    });
}); 