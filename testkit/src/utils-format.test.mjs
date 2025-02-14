
import { describe, it } from 'mocha';
import { expect } from 'chai';
import { PLACEHOLDER_REGEX } from '../../module.format.mjs';

describe("Module utils-format", function () {
    describe("Placeholder regrex", function () {
        describe("Python", function () {
            const validPlaceholders = ["{}", "{}", "{:d}", "{fill:d}", "{0:x}", "{1:o}", "{3:2.3f}"];
            const invalidPlaceholders = ["{", "}", "{:i}", "{:h}", "d", "fill:d", undefined];

            describe("Python placeholder regex", function () {
                validPlaceholders.forEach(tested => {
                    let match;
                    it(`Valid value "${tested}"`, function () {
                        match = expect(PLACEHOLDER_REGEX.Python.exec(tested)).to.not.throw();
                        expect(match).not.null;
                        expect(match.matches).true;
                    });
                });

                invalidPlaceholders.forEach((tested) => {
                    it(`Invalid value "${tested}"`, function () {
                        let match;
                        if (typeof tested === "string") {
                            expect(() => {match = PLACEHOLDER_REGEX.Python.exec(tested)}).to.not.throw();
                            expect(match).null;
                        } else {
                            expect(() => {match = PLACEHOLDER_REGEX.Python.exec(tested)}).to.throw();
                        }
                    });
                });
            });
            describe("Python placeholder segment", function () {
                validPlaceholders.forEach(tested => {
                    let match;
                    it(`Valid value "${tested}"`, function () {
                        match = expect(() => {match = PLACEHOLDER_REGEX.PythonPlaceholderSegment.exec(tested)}).to.not.throw();
                        expect(match).not.null;
                        expect(match.matches).false;
                    });
                });

                invalidPlaceholders.forEach((tested) => {
                    it(`Invalid value "${tested}"`, function () {
                        let match;
                        if (typeof tested === "string") {
                            expect(() => { match = PLACEHOLDER_REGEX.PythonPlaceholderSegment.exec(tested)}).to.not.throw();
                            expect(match).null;
                        } else {
                            expect(() => { match = PLACEHOLDER_REGEX.PythonPlaceholderSegment.exec(tested)}).to.throw();
                        }
                    });
                });
            });
        })
    });
    describe(`Python format`, function () {

    });

    describe(``, function () {

    });
})