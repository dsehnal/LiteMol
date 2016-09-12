// /*
//  * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
//  */


// namespace LiteMol.Core.Formats.BinaryCif {
//     "use strict";

//     const enum BinaryCifToken {        
//         UnknownPrefix = 0x0,         
//         Dot           = 0x00,         
//         Question      = 0x01,
                
//         StringPrefix = 0x1,         
//         String1      = 0x11,         
//         String2      = 0x12,         
//         String3      = 0x13,         
//         String4      = 0x14,
        
//         StringTablePrefix = 0x2,         
//         StringTable1      = 0x21,         
//         StringTable2      = 0x22,         
//         StringTable3      = 0x23,         
//         StringTable4      = 0x24,
        
//         FloatPrefix = 0x3,         
//         Float32     = 0x31,         
//         Float64     = 0x32,
        
//         IntPrefix = 0x4,         
//         Int1      = 0x41,         
//         Int2      = 0x42,         
//         Int3      = 0x43,         
//         Int4      = 0x44,
        
//         ElementPrefix = 0x9,         
//         Data          = 0x90,         
//         Save          = 0x91,         
//         Namespace     = 0x92
//     }
    

//     /**
//      * A generic parser result.
//      */
//     export class ParserResult {

//         static error(message: string, line = -1) {
//             return new ParserResult(true, message, line, [], void 0);
//         }

//         static success(result: File, warnings: string[] = []) {
//             return new ParserResult(false, "", -1, warnings, result);
//         }

//         constructor(
//             public hasError: boolean,
//             public errorMessage: string,
//             public errorLine: number,
//             public warnings: string[],
//             public result: File) { }
//     }
    
//     class Tokenizer {
//         private data: DataView;
//         private littleEndian = false;

//         stringTable: string[] = [];
//         position: number = 0;

//         skipTo(offset: number) {
//             this.position = offset;
//         }

//         private strArrays: Uint8Array[] = [];
        
//         private readString(n: number) {
            
//             var offset = this.position;            
//             this.position += n;

//             var codes = this.strArrays[n];
//             if (!codes) codes = new Uint8Array(n);
//             for (var i = 0; i < n; i++) {
//                 codes[i] = this.data.getUint8(offset + i);
//             }

//             return String.fromCharCode.apply(null, codes);
//         }

//         readInt(n: number) {

//             var offset = this.position;
//             this.position += n;
//             switch (n) {
//                 case 1: return this.data.getInt8(offset);
//                 case 2: return this.data.getInt16(offset, this.littleEndian);
//                 case 3: return (this.data.getInt8(offset) << 16) | this.data.getInt16(offset, this.littleEndian);
//                 case 4: return this.data.getInt32(offset, this.littleEndian);
//                 default: throw "Integer value too big";
//             }
//         }

//         readUint(n: number) {

//             var offset = this.position;
//             this.position += n;
//             switch (n) {
//                 case 1: return this.data.getUint8(offset);
//                 case 2: return this.data.getUint16(offset, this.littleEndian);
//                 case 3: return (this.data.getUint8(offset) << 16) | this.data.getUint16(offset, this.littleEndian);
//                 case 4: return this.data.getUint32(offset, this.littleEndian);
//                 default: throw "Integer value too big";
//             }
//         }

//         readByte() {
//             return this.data.getUint8(this.position++);
//         }
        
//         readValue(): string {

//             var t = this.data.getInt8(this.position),
//                 u = (t >> 4) & 0xF, l = t & 0xF;
            
//             this.position++;

//             switch (u) {
//                 case BinaryCifToken.UnknownPrefix: return !l ? "." : "?";
//                 case BinaryCifToken.StringPrefix: return this.readString(this.readUint(l));
//                 case BinaryCifToken.StringTablePrefix: return this.stringTable[this.readUint(l)]
//                 case BinaryCifToken.FloatPrefix:
//                     this.position += 4 * l;
//                     return this.readValue();
//                 case BinaryCifToken.IntPrefix:
//                     this.position += l;
//                     return this.readValue();
//                 default:
//                     throw "Invalid BCIF format.";
//             }
//         }
        
//         private _NaN = Number.NaN;

//         fillValue(i: number, str: string[], int: number[], float: number[]): void {

//             var t = this.data.getUint8(this.position),
//                 u = (t >> 4) & 0xF, l = t & 0xF;

//             this.position++;

//             switch (u) {
//                 case BinaryCifToken.UnknownPrefix:
//                     str[i] = !l ? "." : "?";
//                     //int[i] = this._NaN;
//                     //float[i] = this._NaN;
//                     return;

//                 case BinaryCifToken.StringPrefix:
//                     str[i] = this.readString(this.readUint(l));
//                     //int[i] = this._NaN;
//                     //float[i] = this._NaN;
//                     return;

//                 case BinaryCifToken.StringTablePrefix:
//                     //console.log("table", l);
//                     str[i] = this.stringTable[this.readUint(l)];
//                     //int[i] = this._NaN;
//                     //float[i] = this._NaN;
//                     return;

//                 case BinaryCifToken.FloatPrefix:
//                     //console.log("float", l);
//                     //var f = l == 1
//                     //    ? this.data.getFloat32(this.position, this.littleEndian)
//                     //    : this.data.getFloat64(this.position, this.littleEndian);

//                     this.position += 4 * l;
//                     str[i] = this.readValue();
//                     //int[i] = f | 0;
//                     //float[i] = f;
//                     return;

//                 case BinaryCifToken.IntPrefix:

//                     //console.log("int", l);
//                     //var ii = this.readInt(l);
//                     this.position += l;
//                     str[i] = this.readValue();
//                     //int[i] = ii;
//                     //float[i] = ii;
//                     return;
//                 default:
//                     throw "Invalid BCIF format.";
//             }
//         }

//         skipValue(): void {

//             var t = this.data.getInt8(this.position),
//                 u = (t >> 4) & 0xF, l = t & 0xF;

//             this.position++;

//             switch (u) {
//                 case BinaryCifToken.UnknownPrefix: return;
//                 case BinaryCifToken.StringPrefix: this.position += this.readUint(l); return;
//                 case BinaryCifToken.StringTablePrefix: this.position += this.readUint(l); return;
//                 case BinaryCifToken.FloatPrefix:
//                     this.position += 4 * l;
//                     this.skipValue();
//                     return;
//                 case BinaryCifToken.IntPrefix:
//                     this.position += l;
//                     this.skipValue();
//                     return;
//                 default:
//                     throw "Invalid BCIF format.";
//             }
//         }

//         private readStringTable() {

//             var count = this.readUint(4);
            
//             for (var i = 0; i < count; i++) {
//                 this.stringTable[i] = this.readValue();
//             }            
//         }
        
//         constructor(buffer: ArrayBuffer) {         

//             for (var i = 0; i < 100; i++) this.strArrays[i] = new Uint8Array(i);
               
//             this.data = new DataView(buffer, 0, buffer.byteLength);
//             if (this.readValue() !== "BCIF" || this.readValue() !== "v2") throw "Invalid BCIF format.";
//             this.readStringTable();
//         }
//     }

//     export class Parser {

//         private static readElement(tokenizer: Tokenizer): any {

//             tokenizer.readByte(); // skip type;


//             tokenizer.readUint(4); // skip length

//             var category = tokenizer.readValue(),
//                 columnCount = tokenizer.readUint(4),
//                 columns: string[] = [];
                        
//             for (let i = 0; i < columnCount; i++) columns[columns.length] = tokenizer.readValue();

//             var tokenCount = tokenizer.readUint(4),
//                 str: string[] = [],
//                 //str = new Int32Array(tokenCount),
//                 int = new Int32Array(0),
//                 float = new Float64Array(0);

//             for (let i = 0; i < tokenCount; i++) tokenizer.fillValue(i, <any>str, <any>int, <any>float);

//             return { category, columns, str, int, float };

//         }


//         private static readFrame(tokenizer: Tokenizer): any {

//             var frameType = "";

//             switch (tokenizer.readByte()) {
//                 case BinaryCifToken.Data: frameType = "data"; break;
//                 case BinaryCifToken.Save: frameType = "save"; break;
//                 default: throw "Invalid BCIF format.";
//             }
                        
//             tokenizer.readUint(4); // skip length

//             var id = tokenizer.readValue(), count = tokenizer.readUint(4),
//                 elements: any[] = [];
            
//             for (var i = 0; i < count; i++) {
//                 elements[elements.length] = Parser.readElement(tokenizer);
//             }

//             return { id, elements };
//         }

//         static parse(buffer: ArrayBuffer) {            
//             var tokenizer = new Tokenizer(buffer);

//             var frameCount = tokenizer.readUint(4),
//                 frames: any[] = [];

//             for (var i = 0; i < frameCount; i++) {
//                 frames[frames.length] = this.readFrame(tokenizer);
//             }
            
//             return frames;
//         }

//     }

// }