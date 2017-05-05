/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Formats.Molecule.PDB {
    "use strict";


    class Tokenizer {


        private length: number;
        trimmedToken = { start: 0, end: 0 };

        line: number = 0;
        position: number = 0;

        moveToNextLine() {
            while (this.position < this.length && this.data.charCodeAt(this.position) !== 10) {
                this.position++;
            }
            this.position++;
            this.line++;
            return this.position;
        }

        moveToEndOfLine() {
            while (this.position < this.length) {
                let c = this.data.charCodeAt(this.position);
                if (c === 10 || c === 13) { //  /n | /r
                    return this.position;
                }
                this.position++;
            }
            return this.position;
        }
    
        startsWith(start: number, value: string) {
            for (let i = value.length - 1; i >= 0; i--) {
                if (this.data.charCodeAt(i + start) !== value.charCodeAt(i)) {
                    return false;
                }
            }

            return true;
        }

        trim(start: number, end: number) {
            while (start < end && this.data.charCodeAt(start) === 32) start++;
            while (end > start && this.data.charCodeAt(end - 1) === 32) end--;
            this.trimmedToken.start = start;
            this.trimmedToken.end = end;  
        }

        tokenizeAtomRecord(tokens: TokenIndexBuilder): boolean {

            let startPos = this.position;
            let start = this.position;
            let end = this.moveToEndOfLine();
            let length = end - start;

            // invalid atom record
            if (length < 60) return false;

            //COLUMNS        DATA TYPE       CONTENTS                            
            //--------------------------------------------------------------------------------
            // 1 -  6        Record name     "ATOM  "                                            

            this.trim(start, start + 6);
            TokenIndexBuilder.addToken(tokens, this.trimmedToken.start, this.trimmedToken.end);

            // 7 - 11        Integer         Atom serial number.                   

            start = startPos + 6;
            this.trim(start, start + 5);
            TokenIndexBuilder.addToken(tokens, this.trimmedToken.start, this.trimmedToken.end);

            //13 - 16        Atom            Atom name.          

            start = startPos + 12;
            this.trim(start, start + 4);
            TokenIndexBuilder.addToken(tokens, this.trimmedToken.start, this.trimmedToken.end);

            //17             Character       Alternate location indicator. 

            if (this.data.charCodeAt(startPos + 16) === 32) { // ' '
                TokenIndexBuilder.addToken(tokens, 0, 0);
            } else {
                TokenIndexBuilder.addToken(tokens, startPos + 16, startPos + 17);
            }

            //18 - 20        Residue name    Residue name.       

            start = startPos + 17;
            this.trim(start, start + 3);
            TokenIndexBuilder.addToken(tokens, this.trimmedToken.start, this.trimmedToken.end);

            //22             Character       Chain identifier.         

            TokenIndexBuilder.addToken(tokens, startPos + 21, startPos + 22);

            //23 - 26        Integer         Residue sequence number.              

            start = startPos + 22;
            this.trim(start, start + 4);
            TokenIndexBuilder.addToken(tokens, this.trimmedToken.start, this.trimmedToken.end);

            //27             AChar           Code for insertion of residues.      

            if (this.data.charCodeAt(startPos + 26) === 32) { // ' '
                TokenIndexBuilder.addToken(tokens, 0, 0);
            } else {
                TokenIndexBuilder.addToken(tokens, startPos + 26, startPos + 27);
            }

            //31 - 38        Real(8.3)       Orthogonal coordinates for X in Angstroms.   

            start = startPos + 30;
            this.trim(start, start + 8);
            TokenIndexBuilder.addToken(tokens, this.trimmedToken.start, this.trimmedToken.end);


            //39 - 46        Real(8.3)       Orthogonal coordinates for Y in Angstroms.                            

            start = startPos + 38;
            this.trim(start, start + 8);
            TokenIndexBuilder.addToken(tokens, this.trimmedToken.start, this.trimmedToken.end);

            //47 - 54        Real(8.3)       Orthogonal coordinates for Z in Angstroms.        

            start = startPos + 46;
            this.trim(start, start + 8);
            TokenIndexBuilder.addToken(tokens, this.trimmedToken.start, this.trimmedToken.end);

            //55 - 60        Real(6.2)       Occupancy.       

            start = startPos + 54;
            this.trim(start, start + 6);
            TokenIndexBuilder.addToken(tokens, this.trimmedToken.start, this.trimmedToken.end);

            //61 - 66        Real(6.2)       Temperature factor (Default = 0.0).                   

            if (length >= 66) {
                start = startPos + 60;
                this.trim(start, start + 6);
                TokenIndexBuilder.addToken(tokens, this.trimmedToken.start, this.trimmedToken.end);
            } else {
                TokenIndexBuilder.addToken(tokens, 0, 0);
            }

            //73 - 76        LString(4)      Segment identifier, left-justified.   

            // ignored

            //77 - 78        LString(2)      Element symbol, right-justified.   

            if (length >= 78) {
                start = startPos + 76;
                this.trim(start, start + 2);

                if (this.trimmedToken.start < this.trimmedToken.end) {
                    TokenIndexBuilder.addToken(tokens, this.trimmedToken.start, this.trimmedToken.end);
                } else {
                    TokenIndexBuilder.addToken(tokens, startPos + 12, startPos + 13);
                }
            } else {
                TokenIndexBuilder.addToken(tokens, startPos + 12, startPos + 13);
            }

            //79 - 80        LString(2)      Charge on the atom.      

            // ignored
            
            return true;
        }

        constructor(private data: string) {
            this.length = data.length;
        }

    }

    export class Parser {

        private static tokenizeAtom(tokens: TokenIndexBuilder, tokenizer: Tokenizer): ParserError | undefined {
            if (tokenizer.tokenizeAtomRecord(tokens)) {
                return void 0;
            }

            return new ParserError("Invalid ATOM/HETATM record.", tokenizer.line);
        }

        private static tokenize(id: string, data: string): PDB.MoleculeData | ParserError {

            const tokenizer = new Tokenizer(data);
            const length = data.length;

            let modelAtomTokens: TokenIndexBuilder | null = TokenIndexBuilder.create(4096); //2 * 14 * this.data.length / 78);
            let atomCount = 0;
            let models: PDB.ModelData[] = [];
            let cryst: PDB.CrystStructureInfo | undefined = void 0;
            let modelIdToken = { start: 0, end: 0 };

            while (tokenizer.position < length) {

                let cont = true;

                switch (data.charCodeAt(tokenizer.position)) {

                    case 65: // A 
                        if (tokenizer.startsWith(tokenizer.position, "ATOM")) {
                            if (!modelAtomTokens) {
                                modelAtomTokens = TokenIndexBuilder.create(4096);
                            }
                            let err = Parser.tokenizeAtom(modelAtomTokens, tokenizer);
                            atomCount++;
                            if (err) return err;
                        }
                        break;

                    case 67: // C
                        if (tokenizer.startsWith(tokenizer.position, "CRYST1")) {
                            let start = tokenizer.position;
                            let end = tokenizer.moveToEndOfLine();
                            cryst = new CrystStructureInfo(data.substring(start, end));
                        }
                        break;

                    case 69: // E 
                        if (tokenizer.startsWith(tokenizer.position, "ENDMDL") && atomCount > 0) {

                            if (models.length === 0) {
                                modelIdToken = { start: data.length + 3, end: data.length + 4 };
                            }

                            if (modelAtomTokens) {
                                models.push(new ModelData(modelIdToken, <any>modelAtomTokens.tokens, atomCount));
                            }

                            atomCount = 0;
                            modelAtomTokens = null;

                        } else if (tokenizer.startsWith(tokenizer.position, "END")) {
                            let start = tokenizer.position;
                            let end = tokenizer.moveToEndOfLine();
                            tokenizer.trim(start, end);
                            if (tokenizer.trimmedToken.end - tokenizer.trimmedToken.start === 3) {
                                cont = false;
                            }
                        }
                        break;

                    case 72: // H 
                        if (tokenizer.startsWith(tokenizer.position, "HETATM")) {
                            if (!modelAtomTokens) {
                                modelAtomTokens = TokenIndexBuilder.create(4096);
                            }
                            let err = Parser.tokenizeAtom(modelAtomTokens, tokenizer);
                            atomCount++;
                            if (err) return err;
                        }
                        break;

                    case 77: //M

                        if (tokenizer.startsWith(tokenizer.position, "MODEL")) {

                            if (atomCount > 0) {
                                if (models.length === 0) {
                                    modelIdToken = { start: data.length + 3, end: data.length + 4 };
                                }   

                                if (modelAtomTokens) {
                                    models.push(new ModelData(modelIdToken, <any>modelAtomTokens.tokens, atomCount));
                                }
                            }

                            let start = tokenizer.position + 6;
                            let end = tokenizer.moveToEndOfLine();

                            tokenizer.trim(start, end);
                            
                            modelIdToken = { start: tokenizer.trimmedToken.start, end: tokenizer.trimmedToken.end };
                            if (atomCount > 0 || !modelAtomTokens) {
                                modelAtomTokens = TokenIndexBuilder.create(4096);
                            }
                            atomCount = 0;

                            
                        }
                        
                        break;
                }

                tokenizer.moveToNextLine();

                if (!cont) break;
            }

            let fakeCifData = data + ".?0123";

            if (atomCount > 0) {

                if (models.length === 0) {
                    modelIdToken = { start: data.length + 3, end: data.length + 4 };
                }

                if (modelAtomTokens) {
                    models.push(new ModelData(modelIdToken, <any>modelAtomTokens.tokens, atomCount));
                }
            }
            
            return new MoleculeData(
                new Header(id),
                cryst,
                new ModelsData(models),
                fakeCifData
            );
        }

        static getDotRange(length: number): TokenRange {
            return { start: length - 6, end: length - 5 };
        }

        static getNumberRanges(length: number): Utils.FastMap<number, TokenRange> {
            let ret = Utils.FastMap.create<number, TokenRange>();
            for (let i = 0; i < 4; i++) {
                ret.set(i, { start: length - 4 + i, end: length - 3 + i });
            }
            return ret;
        }

        static getQuestionmarkRange(length: number): TokenRange {
            return { start: length - 5, end: length - 4 };
        }

        static parse(id: string, data: string): ParserResult<CIF.File> {
            let ret = Parser.tokenize(id, data);

            if (ret instanceof ParserError) {
                return ParserResult.error<CIF.File>(ret.message, ret.line);
            } else {
                return ParserResult.success(ret.toCifFile());
            }
        }
    }

    export function toCifFile(id:string, data: string) {
        return Parser.parse(id, data);
    }
}