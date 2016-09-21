/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Formats.CIF.Text {
    "use strict";
    
    /**
     * mmCIF parser.
     * 
     * Trying to be as close to the specification http://www.iucr.org/resources/cif/spec/version1.1/cifsyntax
     * 
     * Differences I'm aware of:
     * - Except keywords (data_, loop_, save_) everything is case sensitive.
     * - The tokens . and ? are treated the same as the values '.' and '?'.
     * - Ignores \ in the multiline values:
     *     ;abc\
     *     efg
     *     ;
     *   should have the value 'abcefg' but will have the value 'abc\\nefg' instead.
     *   Post processing of this is left to the consumer of the data.
     * - Similarly, things like punctuation (\', ..) are left to be processed by the user if needed.
     * 
     */
    
    /**
     * Types of supported mmCIF tokens.
     */
    const enum CifTokenType {
        Data       = 0,
        Save       = 1,
        Loop       = 2,
        Value      = 3,
        ColumnName = 4,
        Comment    = 5,
        End        = 6
    }
    

    interface TokenizerState {
        data: string;

        position: number;
        length: number;
        isEscaped: boolean;

        currentLineNumber: number;
        currentTokenType: CifTokenType;
        currentTokenStart: number;
        currentTokenEnd: number;
    }
        
    /**
     * Eat everything until a whitespace/newline occurs.
     */
    function eatValue(state: TokenizerState) {
        while (state.position < state.length) {                                
            switch (state.data.charCodeAt(state.position)) {
                case 9:  // \t
                case 10: // \n
                case 13: // \r
                case 32: // ' '
                    state.currentTokenEnd = state.position;
                    return;
                default:
                    ++state.position;
                    break;
            }
        }
        state.currentTokenEnd = state.position;
    }

    /**
     * Eats an escaped values. Handles the "degenerate" cases as well.
     * 
     * "Degenerate" cases:
     * - 'xx'x' => xx'x
     * - 'xxxNEWLINE => 'xxx
     * 
     */
    function eatEscaped(state: TokenizerState, esc: number) {
        let next: number, c: number;

        ++state.position;
        while (state.position < state.length) {
            c = state.data.charCodeAt(state.position);

            if (c === esc) {
                next = state.data.charCodeAt(state.position + 1);
                switch (next) {
                    case 9:  // \t
                    case 10: // \n
                    case 13: // \r
                    case 32: // ' '
                        // get rid of the quotes.
                        state.currentTokenStart++;
                        state.currentTokenEnd = state.position;
                        state.isEscaped = true;
                        ++state.position;
                        return;
                    default:
                        if (next === void 0) { // = "end of stream"
                            // get rid of the quotes.
                            state.currentTokenStart++;
                            state.currentTokenEnd = state.position;
                            state.isEscaped = true;
                            ++state.position;
                            return;
                        }
                        ++state.position;
                        break;
                }
            } else {
                // handle 'xxxNEWLINE => 'xxx
                if (c === 10 || c === 13) {
                    state.currentTokenEnd = state.position;
                    return;
                }
                ++state.position;
            }
        }

        state.currentTokenEnd = state.position;
    }

    /**
     * Eats a multiline token of the form NL;....NL;
     */
    function eatMultiline(state: TokenizerState) {
        let prev = 59, pos = state.position + 1, c: number;
        while (pos < state.length) {
            c = state.data.charCodeAt(pos);
            if (c === 59 && (prev === 10 || prev === 13)) { // ;, \n \r
                state.position = pos + 1;
                // get rid of the ;
                state.currentTokenStart++;                    

                // remove trailing newlines
                pos--;
                c = state.data.charCodeAt(pos);
                while (c === 10 || c === 13) {
                    pos--;
                    c = state.data.charCodeAt(pos);
                }
                state.currentTokenEnd = pos + 1;

                state.isEscaped = true;
                return;
            } else {
                // handle line numbers
                if (c === 13) { // \r
                    state.currentLineNumber++;
                } else if (c === 10 && prev !== 13) { // \r\n
                    state.currentLineNumber++;
                }

                prev = c;
                ++pos;
            }                
        }

        state.position = pos;
        return prev;
    }

    /**
     * Skips until \n or \r occurs -- therefore the newlines get handled by the "skipWhitespace" function.
     */
    function skipCommentLine(state: TokenizerState) {
        while (state.position < state.length) {
            let c = state.data.charCodeAt(state.position);
            if (c === 10 || c === 13) {
                return;
            }
            ++state.position;
        }
    }

    /**
     * Skips all the whitespace - space, tab, newline, CR
     * Handles incrementing line count.
     */
    function skipWhitespace(state: TokenizerState): number {  
        let prev = 10;
        while (state.position < state.length) {
            let c = state.data.charCodeAt(state.position);
            switch (c) {
                case 9: // '\t'
                case 32: // ' '
                    prev = c;                        
                    ++state.position;
                    break;
                case 10: // \n
                    // handle \r\n
                    if (prev !== 13) {
                        ++state.currentLineNumber;
                    }
                    prev = c;
                    ++state.position;
                    break;
                case 13: // \r
                    prev = c;
                    ++state.position;
                    ++state.currentLineNumber;
                    break;
                default:
                    return prev;
            }
        }
        return prev;
    }

    function isData(state: TokenizerState): boolean {
        // here we already assume the 5th char is _ and that the length >= 5

        // d/D
        let c = state.data.charCodeAt(state.currentTokenStart);
        if (c !== 68 && c !== 100) return false;
        // a/A
        c = state.data.charCodeAt(state.currentTokenStart + 1);
        if (c !== 65 && c !== 97) return false;
        // t/t
        c = state.data.charCodeAt(state.currentTokenStart + 2);
        if (c !== 84 && c !== 116) return false;
        // a/A
        c = state.data.charCodeAt(state.currentTokenStart + 3);
        if (c !== 65 && c !== 97) return false;

        return true;
    }

    function isSave(state: TokenizerState): boolean {
        // here we already assume the 5th char is _ and that the length >= 5

        // s/S
        let c = state.data.charCodeAt(state.currentTokenStart);
        if (c !== 83 && c !== 115) return false;
        // a/A
        c = state.data.charCodeAt(state.currentTokenStart + 1);
        if (c !== 65 && c !== 97) return false;
        // v/V
        c = state.data.charCodeAt(state.currentTokenStart + 2);
        if (c !== 86 && c !== 118) return false;
        // e/E
        c = state.data.charCodeAt(state.currentTokenStart + 3);
        if (c !== 69 && c !== 101) return false;

        return true;
    }

    function isLoop(state: TokenizerState): boolean {
        // here we already assume the 5th char is _ and that the length >= 5

        if (state.currentTokenEnd - state.currentTokenStart !== 5) return false;

        // l/L
        let c = state.data.charCodeAt(state.currentTokenStart);
        if (c !== 76 && c !== 108) return false;
        // o/O
        c = state.data.charCodeAt(state.currentTokenStart + 1);
        if (c !== 79 && c !== 111) return false;
        // o/O
        c = state.data.charCodeAt(state.currentTokenStart + 2);
        if (c !== 79 && c !== 111) return false;
        // p/P
        c = state.data.charCodeAt(state.currentTokenStart + 3);
        if (c !== 80 && c !== 112) return false;

        return true;
    }

    /**
     * Checks if the current token shares the namespace with string at <start,end).
     */
    function isNamespace(state: TokenizerState, start: number, end: number): boolean {
        let i:number,
            nsLen = end - start,
            offset = state.currentTokenStart - start,
            tokenLen = state.currentTokenEnd - state.currentTokenStart;

        if (tokenLen < nsLen) return false;
        
        for (i = start; i < end; ++i) {
            if (state.data.charCodeAt(i) !== state.data.charCodeAt(i + offset)) return false;
        }

        if (nsLen === tokenLen) return true;
        if (state.data.charCodeAt(i + offset) === 46) { // .
            return true;
        }

        return false;
    }

    /**
     * Returns the index of '.' in the current token. If no '.' is present, returns currentTokenEnd.
     */
    function getNamespaceEnd(state: TokenizerState): number {
        let i: number;
        for (i = state.currentTokenStart; i < state.currentTokenEnd; ++i) {
            if (state.data.charCodeAt(i) === 46) return i;
        }
        return i;
    }

    /**
     * Get the namespace string. endIndex is obtained by the getNamespaceEnd() function.
     */
    function getNamespace(state: TokenizerState, endIndex: number) {
        return state.data.substring(state.currentTokenStart, endIndex);
    }
    
    /**
     * String representation of the current token.
     */
    function getTokenString(state: TokenizerState) {
        return state.data.substring(state.currentTokenStart, state.currentTokenEnd);
    }

    /**
     * Move to the next token.
     */        
    function moveNextInternal(state: TokenizerState) {
        let prev = skipWhitespace(state);
        
        if (state.position >= state.length) {
            state.currentTokenType = CifTokenType.End;
            return;
        }

        state.currentTokenStart = state.position;
        state.currentTokenEnd = state.position;
        state.isEscaped = false;
        let c = state.data.charCodeAt(state.position);
        switch (c) {
            case 35: // #, comment
                skipCommentLine(state);
                state.currentTokenType = CifTokenType.Comment;
                break;
            case 34: // ", escaped value
            case 39: // ', escaped value
                eatEscaped(state, c);
                state.currentTokenType = CifTokenType.Value;
                break;
            case 59: // ;, possible multiline value
                // multiline value must start at the beginning of the line.
                if (prev === 10 || prev === 13) { // /n or /r
                    eatMultiline(state);
                } else {
                    eatValue(state);
                }
                state.currentTokenType = CifTokenType.Value;
                break;
            default:
                eatValue(state);
                // escaped is always Value
                if (state.isEscaped) {
                    state.currentTokenType = CifTokenType.Value;
                // _ always means column name
                } else if (state.data.charCodeAt(state.currentTokenStart) === 95) { // _
                    state.currentTokenType = CifTokenType.ColumnName;
                // 5th char needs to be _ for data_ or loop_
                } else if (state.currentTokenEnd - state.currentTokenStart >= 5 && state.data.charCodeAt(state.currentTokenStart + 4) === 95) {
                    if (isData(state)) state.currentTokenType = CifTokenType.Data;
                    else if (isSave(state)) state.currentTokenType = CifTokenType.Save;
                    else if (isLoop(state)) state.currentTokenType = CifTokenType.Loop;
                    else state.currentTokenType = CifTokenType.Value;
                // all other tests failed, we are at Value token.
                } else {
                    state.currentTokenType = CifTokenType.Value;
                }
                break;
        }            
    }

    /**
     * Moves to the next non-comment token.
     */
    function moveNext(state: TokenizerState) {
        moveNextInternal(state);
        while (state.currentTokenType === CifTokenType.Comment) moveNextInternal(state);            
    }

    function createTokenizer(data: string): TokenizerState {
        return {
            data,
            length: data.length,
            position: 0,
            currentTokenStart: 0,
            currentTokenEnd: 0,
            currentTokenType: CifTokenType.End,
            currentLineNumber: 1,
            isEscaped: false
        };
    }
    
    /**
     * Helper shape of the category result.
     */
    interface CifCategoryResult {
        hasError: boolean;
        errorLine: number;
        errorMessage: string;
    }
    
    /**
     * Reads a category containing a single row.
     */
    function handleSingle(tokenizer: TokenizerState, block: DataBlock): CifCategoryResult {
        let nsStart = tokenizer.currentTokenStart, nsEnd = getNamespaceEnd(tokenizer),
            name = getNamespace(tokenizer, nsEnd),

            column: string,
            columns:string[] = [],
            tokens = TokenIndexBuilder.create(512),
            tokenCount = 0;
        
        while (tokenizer.currentTokenType === CifTokenType.ColumnName && isNamespace(tokenizer, nsStart, nsEnd)) {
            column = getTokenString(tokenizer);
            moveNext(tokenizer);
            if (tokenizer.currentTokenType !== CifTokenType.Value) {
                return {
                    hasError: true,
                    errorLine: tokenizer.currentLineNumber,
                    errorMessage: "Expected value."
                }
            }
            columns[columns.length] = column;
            TokenIndexBuilder.addToken(tokens, tokenizer.currentTokenStart, tokenizer.currentTokenEnd);
            tokenCount++;

            moveNext(tokenizer);
        }

        block.addCategory(new Category(block.data, name, nsStart, tokenizer.currentTokenStart, columns, <any>tokens.tokens, tokenCount));

        return {
            hasError: false,
            errorLine: 0,
            errorMessage: ""
        };
    }

    /**
     * Reads a loop.
     */
    function handleLoop(tokenizer: TokenizerState, block: DataBlock): CifCategoryResult {
        let start = tokenizer.currentTokenStart,
            loopLine = tokenizer.currentLineNumber;

        moveNext(tokenizer);            
        let name = getNamespace(tokenizer, getNamespaceEnd(tokenizer)),
            columns: string[] = [],
            tokens = TokenIndexBuilder.create(name === "_atom_site" ? (block.data.length / 1.85) | 0 : 1024),
            tokenCount = 0;
                    
        while (tokenizer.currentTokenType === CifTokenType.ColumnName) {
            columns[columns.length] = getTokenString(tokenizer);
            moveNext(tokenizer);
        }

        while (tokenizer.currentTokenType === CifTokenType.Value) {
            TokenIndexBuilder.addToken(tokens, tokenizer.currentTokenStart, tokenizer.currentTokenEnd);
            tokenCount++;
            moveNext(tokenizer);
        }

        if (tokenCount % columns.length !== 0) {
            return {
                hasError: true,
                errorLine: tokenizer.currentLineNumber,
                errorMessage: "The number of values for loop starting at line " + loopLine + " is not a multiple of the number of columns."
            };
        }

        block.addCategory(new Category(block.data, name, start, tokenizer.currentTokenStart, columns, <any>tokens.tokens, tokenCount));

        return {
            hasError: false,
            errorLine: 0,
            errorMessage: ""
        };
    }

    /**
     * Creates an error result.
     */
    function error(line: number, message: string) {
        return ParserResult.error(message, line);
    }

    /**
     * Creates a data result.
     */
    function result(data: File) {
        return ParserResult.success(data);
    }

    /**
     * Parses an mmCIF file.
     * 
     * @returns CifParserResult wrapper of the result.
     */
    function parseInternal(data: string): ParserResult<CIF.File> {
        let tokenizer = createTokenizer(data), cat: CifCategoryResult, id:string,
            file = new File(data),
            block = new DataBlock(data, "default"),
            saveFrame = new DataBlock(data, "empty"),
            inSaveFrame = false,
            blockSaveFrames: any; 
                                
        moveNext(tokenizer);
        while (tokenizer.currentTokenType !== CifTokenType.End) {
            let token = tokenizer.currentTokenType;
            
            // Data block
            if (token === CifTokenType.Data) {
                if (inSaveFrame) {
                    return error(tokenizer.currentLineNumber, "Unexpected data block inside a save frame.");
                }
                if (block.categories.length > 0) {
                    file.dataBlocks.push(block);
                }
                block = new DataBlock(data, data.substring(tokenizer.currentTokenStart + 5, tokenizer.currentTokenEnd));
                moveNext(tokenizer);
            // Save frame
            } else if (token === CifTokenType.Save) {
                id = data.substring(tokenizer.currentTokenStart + 5, tokenizer.currentTokenEnd);
                
                if (id.length === 0) {
                    if (saveFrame.categories.length > 0) {
                        blockSaveFrames = block.additionalData["saveFrames"];
                        if (!blockSaveFrames) {
                            blockSaveFrames = [];
                            block.additionalData["saveFrames"] = blockSaveFrames;
                        }
                        blockSaveFrames[blockSaveFrames.length] = saveFrame;
                    }
                    inSaveFrame = false;
                } else {
                    if (inSaveFrame) {
                        return error(tokenizer.currentLineNumber, "Save frames cannot be nested.");
                    }
                    inSaveFrame = true;
                    saveFrame = new DataBlock(data, id);
                }
                moveNext(tokenizer);
            // Loop
            } else if (token === CifTokenType.Loop) {
                cat = handleLoop(tokenizer, inSaveFrame ? saveFrame : block);
                if (cat.hasError) {
                    return error(cat.errorLine, cat.errorMessage);
                }
            // Single row
            } else if (token === CifTokenType.ColumnName) {
                cat = handleSingle(tokenizer, inSaveFrame ? saveFrame : block);
                if (cat.hasError) {
                    return error(cat.errorLine, cat.errorMessage);
                }
            // Out of options
            } else {
                return error(tokenizer.currentLineNumber, "Unexpected token. Expected data_, loop_, or data name.");
            }                
        }

        // Check if the latest save frame was closed.
        if (inSaveFrame) {
            return error(tokenizer.currentLineNumber, "Unfinished save frame (`" + saveFrame.header + "`).");
        }

        if (block.categories.length > 0) {
            file.dataBlocks.push(block);
        }

        return result(file);
    } 

    export function parse(data: string) {
        return parseInternal(data);
    }
} 