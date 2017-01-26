/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Formats.Density.DSN6 {

    export function parse(buffer: ArrayBuffer) {
        return Parser.parse(buffer);
    }

    function remove(arrOriginal: string[], elementToRemove: string) {
        return arrOriginal.filter(el => el !== elementToRemove);
    }

    /**
     * Parses DSN6 files.
     */
    namespace Parser {

        /**
         * Parse DNS6 file.
         */
        export function parse(buffer: ArrayBuffer): ParserResult<Data> {
            let headerSize = 512,
                endian = false,
                //headerView = new DataView(buffer, 0, headerSize),
                headerView = new Uint8Array(buffer, 0, headerSize),
                //sheaderView = String.fromCharCode.apply(null, new Uint8Array(headerView)),
                sheaderView = String.fromCharCode.apply(null, headerView),
                n1 = sheaderView.search('origin'),
                n2 = sheaderView.search('extent'),
                n3 = sheaderView.search('grid'),
                n4 = sheaderView.search('cell'),
                n5 = sheaderView.search('prod'),
                n6 = sheaderView.search('plus'),
                n7 = sheaderView.search('sigma'),
                sn1 = sheaderView.substring(n1 + 'origin'.length, n2).replace(' ', '').split(' '),
                sn1xx = remove(sn1, ''),
                sn2 = sheaderView.substring(n2 + 'extent'.length, n3).split(' '),
                sn2xx = remove(sn2, ''),
                sn3 = sheaderView.substring(n3 + 'grid'.length, n4).split(' '),
                sn3xx = remove(sn3, ''),
                sn4 = sheaderView.substring(n4 + 'cell'.length, n5).split(' '),
                sn4xx = remove(sn4, ''),
                sn5 = sheaderView.substring(n5 + 'prod'.length, n6).split(' '),
                sn5xx = remove(sn5, ''),
                sn6 = sheaderView.substring(n6 + 'plus'.length, n7).split(' '),
                sn6xx = remove(sn6, ''),
                warnings: string[] = [];

            let mode = 0;
            let header = {
                extent: sn2xx.map(v => parseInt(v)),
                mode: mode,
                nxyzStart: [0, 0, 0], 
                grid: sn3xx.map(v => parseInt(v)),
                cellDimensions: sn4xx.slice(0, 3).map(v => parseFloat(v)),
                cellAngles: sn4xx.slice(3, 6).map(v => parseFloat(v)),
                crs2xyz: [1, 2, 3],
                min: 0.0, 
                max: 0.0,
                mean: 0.0,
                symBytes: 0,
                skewFlag: 0,
                skewMatrix: 0,
                skewTranslation: 0,
                origin2k: sn1xx.map(v => parseFloat(v)),
                prod: sn5xx.map(v => parseFloat(v))[0],
                plus: sn6xx.map(v => parseFloat(v))[0]
            };

            let dataOffset = 512;

            if (dataOffset !== headerSize + header.symBytes) {
                if (dataOffset === headerSize) {
                    warnings.push("File contains bogus symmetry record.");
                } else if (dataOffset < headerSize) {
                    return ParserResult.error<Data>("File appears truncated and doesn't match header.");
                } else if ((dataOffset > headerSize) && (dataOffset < (1024 * 1024))) {
                    // Fix for loading SPIDER files which are larger than usual
                    // In this specific case, we must absolutely trust the symBytes record
                    dataOffset = headerSize + header.symBytes;
                    warnings.push("File is larger than expected and doesn't match header. Continuing file load, good luck!");
                } else {
                    return ParserResult.error<Data>("File is MUCH larger than expected and doesn't match header.");
                }
            }

            // pretend we've checked the MAP string at offset 52
            // pretend we've read the symmetry data

            if (header.grid[0] === 0 && header.extent[0] > 0) {
                header.grid[0] = header.extent[0] - 1;
                warnings.push("Fixed X interval count.");
            }
            if (header.grid[1] === 0 && header.extent[1] > 0) {
                header.grid[1] = header.extent[1] - 1;
                warnings.push("Fixed Y interval count.");
            }
            if (header.grid[2] === 0 && header.extent[2] > 0) {
                header.grid[2] = header.extent[2] - 1;
                warnings.push("Fixed Z interval count.");
            }

            if (header.crs2xyz[0] === 0 && header.crs2xyz[1] === 0 && header.crs2xyz[2] === 0) {
                warnings.push("All crs2xyz records are zero. Setting crs2xyz to 1, 2, 3.");
                header.crs2xyz = [1, 2, 3];
            }

            if (header.cellDimensions[0] === 0.0 &&
                header.cellDimensions[1] === 0.0 &&
                header.cellDimensions[2] === 0.0) {
                warnings.push("Cell dimensions are all zero. Setting to 1.0, 1.0, 1.0. Map file will not align with other structures.");
                header.cellDimensions[0] = 1.0;
                header.cellDimensions[1] = 1.0;
                header.cellDimensions[2] = 1.0;
            }

            let alpha = (Math.PI / 180.0) * header.cellAngles[0],
                beta = (Math.PI / 180.0) * header.cellAngles[1],
                gamma = (Math.PI / 180.0) * header.cellAngles[2];

            let xScale = header.cellDimensions[0] / header.grid[0],
                yScale = header.cellDimensions[1] / header.grid[1],
                zScale = header.cellDimensions[2] / header.grid[2];

            let z1 = Math.cos(beta),
                z2 = (Math.cos(alpha) - Math.cos(beta) * Math.cos(gamma)) / Math.sin(gamma),
                z3 = Math.sqrt(1.0 - z1 * z1 - z2 * z2);

            let xAxis = [xScale, 0.0, 0.0],
                yAxis = [Math.cos(gamma) * yScale, Math.sin(gamma) * yScale, 0.0],
                zAxis = [z1 * zScale, z2 * zScale, z3 * zScale];

            let indices = [0, 0, 0];
            indices[header.crs2xyz[0] - 1] = 0;
            indices[header.crs2xyz[1] - 1] = 1;
            indices[header.crs2xyz[2] - 1] = 2;

            let origin: number[];
            if (header.origin2k[0] === 0.0 && header.origin2k[1] === 0.0 && header.origin2k[2] === 0.0) {
                origin = [
                    xAxis[0] * header.nxyzStart[indices[0]] + yAxis[0] * header.nxyzStart[indices[1]] + zAxis[0] * header.nxyzStart[indices[2]],
                    yAxis[1] * header.nxyzStart[indices[1]] + zAxis[1] * header.nxyzStart[indices[2]],
                    zAxis[2] * header.nxyzStart[indices[2]]
                ];
            } else {
                // Use ORIGIN records rather than old n[xyz]start records
                //   http://www2.mrc-lmb.cam.ac.uk/image2000.html
                // XXX the ORIGIN field is only used by the EM community, and
                //     has undefined meaning for non-orthogonal maps and/or
                //     non-cubic voxels, etc.
                origin = [header.origin2k[indices[0]], header.origin2k[indices[1]], header.origin2k[indices[2]]]
            }

            let extent = [header.extent[indices[0]], header.extent[indices[1]], header.extent[indices[2]]];

            let skewMatrix = new Float32Array(16), i: number, j: number;
            for (i = 0; i < 3; i++) {
                for (j = 0; j < 3; j++) {
                    skewMatrix[4 * j + i] = 0.0; //header.skewMatrix[3 * i + j];
                }
                skewMatrix[12 + i] = 0.0; //header.skewTranslation[i];
            }

            let nativeEndian = new Uint16Array(new Uint8Array([0x12, 0x34]).buffer)[0] === 0x3412;

            endian = nativeEndian
            let rawData = readRawData(new Uint8Array(buffer, headerSize + header.symBytes), endian, extent, header.extent, indices, header.mean, header.prod, header.plus);

            let field = new Field3DZYX(<any>rawData.data, extent);

            let data = Data.create(
                header.cellDimensions, header.cellAngles, origin,
                header.skewFlag !== 0, <any>skewMatrix, field, extent,
                { x: xAxis, y: yAxis, z: zAxis },
                //[header.nxyzStart[indices[0]], header.nxyzStart[indices[1]], header.nxyzStart[indices[2]]],
                { min: rawData.minj, max: rawData.maxj, mean: rawData.meanj, sigma: rawData.sigma },
                { prod: header.prod, plus: header.plus }); //! added attributes property to store additional information

            return ParserResult.success(data, warnings);
        }

        //////////////////////////////////////////////////////////////////////////////////////////
        function readRawData(bytes: Uint8Array, endian: boolean, extent: number[], headerExtent: number[], indices: number[], mean: number, prod: number, plus: number): { data: Float32Array, sigma: number, minj: number, maxj: number, meanj: number } {            
            //! DataView is generally a LOT slower than Uint8Array. For performance reasons I think it would be better to use that.
            //! Endian has no effect on individual bytes anyway to my knowledge.
            
            let mX: number, mY: number, mZ: number,
                cX: number, cY: number, cZ: number,
                xSize: number, xySize: number,
                offset = 0, v = 0.1, sigma = 0.0, t = 0.1,
                mi: number,
                mj: number,
                mk: number,
                x: number,
                y: number,
                z: number,
                minj = 0, maxj = 0, meanj = 0,
                block_size = 8,
                block_sizez = 8,
                block_sizey = 8,
                block_sizex = 8,
                bsize3 = block_size * block_size * block_size;

            //! I think this will need some fixing, because the values are non-integer
            //! A small perf trick: use 'value | 0' to tell the runtime the value is an integer.
            mX = headerExtent[0] / 8;  
            mY = headerExtent[1] / 8;
            mZ = headerExtent[2] / 8;
            
            //In case of extra cubes
            /*
            if (headerExtent[0]%8>0) mX++;
            if (headerExtent[1]%8>0) mY++;
            if (headerExtent[2]%8>0) mZ++;
            xxtra=(headerExtent[0]%8);
            yxtra=(headerExtent[1]%8);
            zxtra=(headerExtent[2]%8);
            */

            let data = new Float32Array(8 * mX * 8 * mY * 8 * mZ);
            xSize = 8 * mX;
            xySize = 8 * 8 * mX * mY;//extent[0] * extent[1];

            minj = 0.0;
            maxj = 0.0;
            meanj = 0.0;
            //////////////////////////////////////////////////////////////
            for (mi = 0; mi < (bsize3 * mX * mY * mZ); mi++) {
                v = (bytes[mi] - plus) / prod;
                meanj += v;
                if (v < minj) minj = v;
                if (v > maxj) maxj = v;
            }
            //meanj/=(mX*mY*mZ*bsize3);
            meanj /= (bsize3 * mX * mY * mZ);

            for (cZ = 0; cZ < mZ; cZ++) {
                for (cY = 0; cY < mY; cY++) {
                    for (cX = 0; cX < mX; cX++) {
                        //! cX is suppoed to change the fastest because of the memory layout of the 1D array 

                        //if(xxtra>0 && mZ-cZ<=1.0) block_sizez=zxtra;
                        //if(xxtra>0 && mY-cY<=1.0) block_sizey=yxtra;
                        //if(xxtra>0 && mX-cX<=1.0) block_sizex=xxtra;

                        //! changed the ordering mi == X coord, was Z; mk == Z coord, was X
                        for (mk = 0; mk < block_sizez; mk++) {
                            for (mj = 0; mj < block_sizey; mj++) {
                                for (mi = 0; mi < block_sizex; mi++) {
                                    v = (bytes[offset + mi + 8 * mj + 8 * 8 * mk] - plus) / prod;
                                    //offset+=1;
                                    x = (block_sizex * cX + mi);
                                    y = (block_sizey * cY + mj);
                                    z = (block_sizez * cZ + mk);
                                    //! swapped x and z here.
                                    data[x + xSize * y + xySize * z] = v;
                                    t = v - meanj;
                                    sigma += t * t;
                                }
                            }
                        }

                        offset += bsize3;
                    }
                }
            }

            sigma /= (bsize3 * mX * mY * mZ);
            sigma = Math.sqrt(sigma);
            //  console.log(sigma);
            //  console.log(minj);
            //  console.log(maxj);
            //  console.log(meanj);
            return {
                data: data,
                sigma: sigma,
                minj: minj,
                maxj: maxj,
                meanj: meanj
            };
        }
    }
}