

declare namespace LiteMolZlib {
    class Inflate {
        decompress(): Uint8Array;
        constructor(data: number[] | Uint8Array);
    }

    class Gunzip {
        decompress(): Uint8Array;
        constructor(data: number[] | Uint8Array);
    }
}