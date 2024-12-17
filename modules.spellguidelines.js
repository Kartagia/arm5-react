

/**
 * Module containing spell guidelines.
 * 
 * @module arm5/spellGuidelines
 */

/**
 * The constant of the general level.
 */
export const GENERAL_LEVEL = "General";

/**
 * The level type of the spells.
 * @typedef {GENERAL_LEVEL|number} LevelType
 */

/**
 * A reference to a book or a page of a book.
 * 
 * @typedef {Object} bookref
 * @property {string} bookRef The reference to the book.
 * @property {number} [pageRef] The page of the book.
 */

/**
 * A guideline objec.t
 * @typedef {Object} SpellGuideline
 * @property {LevelType} level The level of the guideline.
 * @property {string} name The name of the guideline.
 * @property {string} [description] The description of the guideline.
 * @property {string} technique The technique of the guideline.
 * @property {string} form The form of the guideline.
 * @property {bookref} [ref] The reference of the book containing the guideline. 
 */


/**
 * Parse guidelines from the given stream.
 * 
 * @param {ReadableStream<Uint8Array<ArrayBufferLike>>} readStream The source of the guidelines.
 * @returns {Promise<SpellGuideline[]>} The read spell guidelines.
 * @throws {SyntaxError} The stream was corrupted. The error is not thrown, but as rejected
 * promise.
 */
export async function parseGuidelines(readStream) {
    const generalGroup = "general";
    const levelGroup = "level";
    const techGroup = "techinique";
    const formGroup = "form";
    const bookRefGroup = "bookRef";
    const pageRefGroup = "pageRef";
    const nameGroup = "name";
    const descGroup = "description";
    const utf8Decoder = new TextDecoder("utf-8");
    const artDelimiterRe = new RegExp("^\s*$", "u");
    const artStartRe = new RegExp("^\s*(?<" + techGroup + ">\\p{Lu}\\p{Ll}+)\s+(?<" + formGroup + ">\\p{Lu}\\p{Ll}+)\s*$", "u");
    const bookRefRe = new RegExp("^\\[Ref:\\s+(?<" + bookRefGroup + ">)(?:\\s+[Pp]g\\.?(?<" + pageRefGroup + ">\\d+))?\\s*\\]\\s*$");
    const guidelineRef = new RegExp("^(?:(?<" + generalGroup + ">" + GENERAL_LEVEL + ")|(?:Level\\s+(?<" + levelGroup + ">\\d+)):\\s)\\s*(?<" + nameGroup +
        ">[^.]+?\\.)(?:\\s*(?<" + descGroup + ">.*?))?\\s*$", "u");
    let current = { form: undefined, tech: undefined, level: undefined };
    let line = 1;
    let reader = readStream.getReader();
    let result = await reader.read();
    result.chunk = result.chunk ? utf8Decoder.decode(result.chunk, { stream: true }) : undefined;
    /**
     * @type {SpellGuideline[]}
     */
    const guidelines = [];
    let lineNum = 1;
    while (!result.done) {
        const line = result.value ? utf8Decoder.decode(result.value) : undefined;
        if (line == null) {
            continue;
        } else if (artDelimiterRe.test(result.value)) {
            // Delimiter - resetting current values.
            current.tech = undefined;
            current.form = undefined;
            current.level = undefined;
        } else {
            let match;
            if ((match = bookRefRe.exec(line)) != null) {
                if (match.groups(bookRefGroup)) {
                    current.ref = {
                        book: match.groups(bookRefGroup),
                        page: match.groups(pageRefGroup) ? Number(match.groups(pageRefGroup)) : undefined
                    };
                } else {
                    delete (current.ref);
                }
            } else if ((match = artStartRe.exec(line)) != null) {
                current.form = match.groups(formGroup);
                current.tech = match.groups(techGroup);
                current.level = undefined;
            } else if (current.tech != null && current.form != null
                && ((match = guidelineRef.exec(line)) != null)
            ) {
                if (match.groups(levelGroup) != null || current.level != null) {
                    if (match.groups(levelGroup)) {
                        current.level = match.groups(levelGroup);
                    }
                    const guideline = /** @type {Guideline} */ {
                        ...current,
                        name: match.groups(nameGroup),
                        ...(match.groups(descGroup) ? { description: match.groups(descGroup) } : {})
                    }
                    guidelines.push(guideline);
                } else {
                    throw new SyntaxError(`Guideline without level at line ${lineNum}: ${line}.`);
                }
            } else {
                throw new SyntaxError(`Invalid entry at line ${lineNum}:[${line}]`);
            }
        }
        result = await reader.read();
        lineNum++;
    }
    return guidelines;
}

/**
 * Fetch spell guidelines from a JSON source.
 * 
 * @param {URL|string} url The source url of the guidelines.
 * @returns {Promise<SpellGuideline[]>} The list of read spell guidelines.
 * @throws {Error} The fetching of the source failed. The error is returned
 * as reject value instead of throwing.
 */
export async function fetchJsonGuidelines(url) {

    return fetch("./guidelines.json").then(
        (response) => {
            if (response.ok) {
                // Getting the JSON result.
                return response.json();
            } else {
                // The operation failed.
                throw new Error(`Response status: ${response.status}`);
            }
        }
    ).then(
        (guidelines) => {
            // Test wheteher we have tree or list of guidelines.
            if (Array.isArray(guidelines)) {
                // We got list version.
                return guidelines;
            } else {
                // Flattening the tree model.
                return Object.getOwnPropertyNames(guidelines).reduce((result, form) => (Object.getOwnPropertyNames(guidelines[form]).reduce(
                    (list, tech) => {
                        return Object.getOwnPropertyNames(guidelines[form][tech]).reduce((values, level) => {
                            return [...values, ...(guidelines[form][tech][level])]
                        }, list)
                    }, result)), [])
            }
        });
}

/**
 * Parse text guidelines.
 * 
 * @param {URL} url The source url of the parsed guidelines. 
 * @returns {Promise<SpellGuideline[]>} The promise of the read guidelines.
 * @throws {SyntaxError} The stream was corrupted. The error is not thrown, but as rejected
 * promise.
 */
export function fetchGuidelines(url) {
    return new Promise((resolve, reject) => {
        fetch(url).then(
            (result) => {
                if (result.ok) {
                    resolve(parseGuidelines(result.body));
                } else {
                    reject(result.error);
                }
            },
            (error) => {
                reject(error);
            }
        );
    });
}

