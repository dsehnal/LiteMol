/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Formats.CIF {
    "use strict";
    
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
    
    /**
     * Cif tokenizer .. d'oh.
     */
    class CifTokenizer {
        private position: number;
        private length: number;
        private isEscaped: boolean;

        currentLineNumber: number;
        currentTokenType: CifTokenType;
        currentTokenStart: number;
        currentTokenEnd: number;
        
        /**
         * Eat everything until a whitespace/newline occurs.
         */
        private eatValue() {
            while (this.position < this.length) {                                
                switch (this.data.charCodeAt(this.position)) {
                    case 9:  // \t
                    case 10: // \n
                    case 13: // \r
                    case 32: // ' '
                        this.currentTokenEnd = this.position;
                        return;
                    default:
                        ++this.position;
                        break;
                }
            }
            this.currentTokenEnd = this.position;
        }

        /**
         * Eats an escaped values. Handles the "degenerate" cases as well.
         * 
         * "Degenerate" cases:
         * - 'xx'x' => xx'x
         * - 'xxxNEWLINE => 'xxx
         * 
         */
        private eatEscaped(esc: number) {
            let next: number, c: number;

            ++this.position;
            while (this.position < this.length) {
                c = this.data.charCodeAt(this.position);

                if (c === esc) {
                    next = this.data.charCodeAt(this.position + 1);
                    switch (next) {
                        case 9:  // \t
                        case 10: // \n
                        case 13: // \r
                        case 32: // ' '
                            // get rid of the quotes.
                            this.currentTokenStart++;
                            this.currentTokenEnd = this.position;
                            this.isEscaped = true;
                            ++this.position;
                            return;
                        default:
                            if (next === void 0) { // = "end of stream"
                                // get rid of the quotes.
                                this.currentTokenStart++;
                                this.currentTokenEnd = this.position;
                                this.isEscaped = true;
                                ++this.position;
                                return;
                            }
                            ++this.position;
                            break;
                    }
                } else {
                    // handle 'xxxNEWLINE => 'xxx
                    if (c === 10 || c === 13) {
                        this.currentTokenEnd = this.position;
                        return;
                    }
                    ++this.position;
                }
            }

            this.currentTokenEnd = this.position;
        }

        /**
         * Eats a multiline token of the form NL;....NL;
         */
        private eatMultiline() {
            let prev = 59, pos = this.position + 1, c: number;
            while (pos < this.length) {
                c = this.data.charCodeAt(pos);
                if (c === 59 && (prev === 10 || prev === 13)) { // ;, \n \r
                    this.position = pos + 1;
                    // get rid of the ;
                    this.currentTokenStart++;                    

                    // remove trailing newlines
                    pos--;
                    c = this.data.charCodeAt(pos);
                    while (c === 10 || c === 13) {
                        pos--;
                        c = this.data.charCodeAt(pos);
                    }
                    this.currentTokenEnd = pos + 1;

                    this.isEscaped = true;
                    return;
                } else {
                    // handle line numbers
                    if (c === 13) { // \r
                        this.currentLineNumber++;
                    } else if (c === 10 && prev !== 13) { // \r\n
                        this.currentLineNumber++;
                    }

                    prev = c;
                    ++pos;
                }                
            }

            this.position = pos;
            return prev;
        }

        /**
         * Skips until \n or \r occurs -- therefore the newlines get handled by the "skipWhitespace" function.
         */
        private skipCommentLine() {
            while (this.position < this.length) {
                let c = this.data.charCodeAt(this.position);
                if (c === 10 || c === 13) {
                    return;
                }
                ++this.position;
            }
        }

        /**
         * Skips all the whitespace - space, tab, newline, CR
         * Handles incrementing line count.
         */
        private skipWhitespace(): number {  
            let prev = 10;
            while (this.position < this.length) {
                let c = this.data.charCodeAt(this.position);
                switch (c) {
                    case 9: // '\t'
                    case 32: // ' '
                        prev = c;                        
                        ++this.position;
                        break;
                    case 10: // \n
                        // handle \r\n
                        if (prev !== 13) {
                            ++this.currentLineNumber;
                        }
                        prev = c;
                        ++this.position;
                        break;
                    case 13: // \r
                        prev = c;
                        ++this.position;
                        ++this.currentLineNumber;
                        break;
                    default:
                        return prev;
                }
            }
            return prev;
        }

        private isData(): boolean {
            // here we already assume the 5th char is _ and that the length >= 5

            // d/D
            let c = this.data.charCodeAt(this.currentTokenStart);
            if (c !== 68 && c !== 100) return false;
            // a/A
            c = this.data.charCodeAt(this.currentTokenStart + 1);
            if (c !== 65 && c !== 97) return false;
            // t/t
            c = this.data.charCodeAt(this.currentTokenStart + 2);
            if (c !== 84 && c !== 116) return false;
            // a/A
            c = this.data.charCodeAt(this.currentTokenStart + 3);
            if (c !== 65 && c !== 97) return false;

            return true;
        }

        private isSave(): boolean {
            // here we already assume the 5th char is _ and that the length >= 5

            // s/S
            let c = this.data.charCodeAt(this.currentTokenStart);
            if (c !== 83 && c !== 115) return false;
            // a/A
            c = this.data.charCodeAt(this.currentTokenStart + 1);
            if (c !== 65 && c !== 97) return false;
            // v/V
            c = this.data.charCodeAt(this.currentTokenStart + 2);
            if (c !== 86 && c !== 118) return false;
            // e/E
            c = this.data.charCodeAt(this.currentTokenStart + 3);
            if (c !== 69 && c !== 101) return false;

            return true;
        }

        private isLoop(): boolean {
            // here we already assume the 5th char is _ and that the length >= 5

            if (this.currentTokenEnd - this.currentTokenStart !== 5) return false;

            // l/L
            let c = this.data.charCodeAt(this.currentTokenStart);
            if (c !== 76 && c !== 108) return false;
            // o/O
            c = this.data.charCodeAt(this.currentTokenStart + 1);
            if (c !== 79 && c !== 111) return false;
            // o/O
            c = this.data.charCodeAt(this.currentTokenStart + 2);
            if (c !== 79 && c !== 111) return false;
            // p/P
            c = this.data.charCodeAt(this.currentTokenStart + 3);
            if (c !== 80 && c !== 112) return false;

            return true;
        }

        /**
         * Checks if the current token shares the namespace with string at <start,end).
         */
        isNamespace(start: number, end: number): boolean {
            let i:number,
                nsLen = end - start,
                offset = this.currentTokenStart - start,
                tokenLen = this.currentTokenEnd - this.currentTokenStart;

            if (tokenLen < nsLen) return false;
            
            for (i = start; i < end; ++i) {
                if (this.data.charCodeAt(i) !== this.data.charCodeAt(i + offset)) return false;
            }

            if (nsLen === tokenLen) return true;
            if (this.data.charCodeAt(i + offset) === 46) { // .
                return true;
            }

            return false;
        }

        /**
         * Returns the index of '.' in the current token. If no '.' is present, returns currentTokenEnd.
         */
        getNamespaceEnd(): number {
            let i: number;
            for (i = this.currentTokenStart; i < this.currentTokenEnd; ++i) {
                if (this.data.charCodeAt(i) === 46) return i;
            }
            return i;
        }

        /**
         * Get the namespace string. endIndex is obtained by the getNamespaceEnd() function.
         */
        getNamespace(endIndex: number) {
            return this.data.substring(this.currentTokenStart, endIndex);
        }
        
        /**
         * String representation of the current token.
         */
        getTokenString() {
            return this.data.substring(this.currentTokenStart, this.currentTokenEnd);
        }

        /**
         * Move to the next token.
         */        
        private moveNextInternal() {
            let prev = this.skipWhitespace(), c: number;
            
            if (this.position >= this.length) {
                this.currentTokenType = CifTokenType.End;
                return;
            }

            this.currentTokenStart = this.position;
            this.currentTokenEnd = this.position;
            this.isEscaped = false;
            c = this.data.charCodeAt(this.position);
            switch (c) {
                case 35: // #, comment
                    this.skipCommentLine();
                    this.currentTokenType = CifTokenType.Comment;
                    break;
                case 34: // ", escaped value
                case 39: // ', escaped value
                    this.eatEscaped(c);
                    this.currentTokenType = CifTokenType.Value;
                    break;
                case 59: // ;, possible multiline value
                    // multiline value must start at the beginning of the line.
                    if (prev === 10 || prev === 13) { // /n or /r
                        this.eatMultiline();
                    } else {
                        this.eatValue();
                    }
                    this.currentTokenType = CifTokenType.Value;
                    break;
                default:
                    this.eatValue();
                    // escaped is always Value
                    if (this.isEscaped) {
                        this.currentTokenType = CifTokenType.Value;
                    // _ always means column name
                    } else if (this.data.charCodeAt(this.currentTokenStart) === 95) { // _
                        this.currentTokenType = CifTokenType.ColumnName;
                    // 5th char needs to be _ for data_ or loop_
                    } else if (this.currentTokenEnd - this.currentTokenStart >= 5 && this.data.charCodeAt(this.currentTokenStart + 4) === 95) {
                        if (this.isData()) this.currentTokenType = CifTokenType.Data;
                        else if (this.isSave()) this.currentTokenType = CifTokenType.Save;
                        else if (this.isLoop()) this.currentTokenType = CifTokenType.Loop;
                        else this.currentTokenType = CifTokenType.Value;
                    // all other tests failed, we are at Value token.
                    } else {
                        this.currentTokenType = CifTokenType.Value;
                    }
                    break;
            }            
        }

        /**
         * Moves to the next non-comment token.
         */
        moveNext() {
            this.moveNextInternal();
            while (this.currentTokenType === CifTokenType.Comment) this.moveNextInternal();            
        }
                
        constructor(private data: string) {
            this.length = data.length;
            this.position = 0;
            this.currentTokenStart = 0;
            this.currentTokenEnd = 0;
            this.currentTokenType = CifTokenType.End;
            this.currentLineNumber = 1;
            this.isEscaped = false;
        }
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
    class Parser {

        /**
         * Reads a category containing a single row.
         */
        private static handleSingle(tokenizer: CifTokenizer, block: Block): CifCategoryResult {
            let nsStart = tokenizer.currentTokenStart, nsEnd = tokenizer.getNamespaceEnd(),
                name = tokenizer.getNamespace(nsEnd),

                column: string,
                columns:string[] = [],
                tokens = new TokenIndexBuilder(512),
                tokenCount = 0;
            
            while (tokenizer.currentTokenType === CifTokenType.ColumnName && tokenizer.isNamespace(nsStart, nsEnd)) {
                column = tokenizer.getTokenString();
                tokenizer.moveNext();
                if (tokenizer.currentTokenType !== CifTokenType.Value) {
                    return {
                        hasError: true,
                        errorLine: tokenizer.currentLineNumber,
                        errorMessage: "Expected value."
                    }
                }
                columns[columns.length] = column;
                tokens.addToken(tokenizer.currentTokenStart, tokenizer.currentTokenEnd);
                tokenCount++;

                tokenizer.moveNext();
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
        private static handleLoop(tokenizer: CifTokenizer, block: Block): CifCategoryResult {
            let start = tokenizer.currentTokenStart,
                loopLine = tokenizer.currentLineNumber;

            tokenizer.moveNext();            
            let name = tokenizer.getNamespace(tokenizer.getNamespaceEnd()),
                columns: string[] = [],
                tokens = new TokenIndexBuilder(name === "_atom_site" ? (block.data.length / 1.85) | 0 : 1024),
                tokenCount = 0;
                        
            while (tokenizer.currentTokenType === CifTokenType.ColumnName) {
                columns[columns.length] = tokenizer.getTokenString();
                tokenizer.moveNext();
            }

            while (tokenizer.currentTokenType === CifTokenType.Value) {
                tokens.addToken(tokenizer.currentTokenStart, tokenizer.currentTokenEnd);
                tokenCount++;
                tokenizer.moveNext();
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
        private static error(line: number, message: string) {
            return ParserResult.error(message, line);
        }

        /**
         * Creates a data result.
         */
        private static result(data: File) {
            return ParserResult.success(data);
        }

        /**
         * Parses an mmCIF file.
         * 
         * @returns CifParserResult wrapper of the result.
         */
        static parse(data: string): ParserResult<CIF.File> {
            let tokenizer = new CifTokenizer(data), cat: CifCategoryResult, id:string,
                file = new File(data),
                block = new Block(file, "default"),
                saveFrame = new Block(file, "empty"),
                inSaveFrame = false,
                blockSaveFrames: any; 
                                   
            tokenizer.moveNext();
            while (tokenizer.currentTokenType !== CifTokenType.End) {
                let token = tokenizer.currentTokenType;
                
                // Data block
                if (token === CifTokenType.Data) {
                    if (inSaveFrame) {
                        return Parser.error(tokenizer.currentLineNumber, "Unexpected data block inside a save frame.");
                    }
                    if (block.categoryList.length > 0) {
                        file.addBlock(block);
                    }
                    block = new Block(file, data.substring(tokenizer.currentTokenStart + 5, tokenizer.currentTokenEnd));
                    tokenizer.moveNext();
                // Save frame
                } else if (token === CifTokenType.Save) {
                    id = data.substring(tokenizer.currentTokenStart + 5, tokenizer.currentTokenEnd);
                    
                    if (id.length === 0) {
                        if (saveFrame.categoryList.length > 0) {
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
                            return Parser.error(tokenizer.currentLineNumber, "Save frames cannot be nested.");
                        }
                        inSaveFrame = true;
                        saveFrame = new Block(file, id);
                    }
                    tokenizer.moveNext();
                // Loop
                } else if (token === CifTokenType.Loop) {
                    cat = Parser.handleLoop(tokenizer, inSaveFrame ? saveFrame : block);
                    if (cat.hasError) {
                        return Parser.error(cat.errorLine, cat.errorMessage);
                    }
                // Single row
                } else if (token === CifTokenType.ColumnName) {
                    cat = Parser.handleSingle(tokenizer, inSaveFrame ? saveFrame : block);
                    if (cat.hasError) {
                        return Parser.error(cat.errorLine, cat.errorMessage);
                    }
                // Out of options
                } else {
                    return Parser.error(tokenizer.currentLineNumber, "Unexpected token. Expected data_, loop_, or data name.");
                }                
            }

            // Check if the latest save frame was closed.
            if (inSaveFrame) {
                return Parser.error(tokenizer.currentLineNumber, "Unfinished save frame (`" + saveFrame.header + "`).");
            }

            if (block.categoryList.length > 0) {
                file.addBlock(block);
            }

            return Parser.result(file);
        }
    }    

    export function parse(data: string) {
        return Parser.parse(data);
    }
} 