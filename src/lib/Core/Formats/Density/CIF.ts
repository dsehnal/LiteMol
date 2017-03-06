/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Formats.Density.CIF {
    
    export function parse(block: Formats.CIF.DataBlock) {
        if (block.getCategory('_density_info')) return Parser.parseLegacy(block);
        else if (block.getCategory('_volume_data_3d_info')) return Parser.parse(block);
        return ParserResult.error<Data>('Invalid data format.');
    }

    namespace Parser {
        export function parse(block: Formats.CIF.DataBlock): ParserResult<Data> {
            console.log('parsing new', block);
            const info = block.getCategory('_volume_data_3d_info');
            if (!info) return ParserResult.error<Data>('_volume_data_3d_info category is missing.');
            if (!block.getCategory('_volume_data_3d')) return ParserResult.error<Data>('_volume_data_3d category is missing.');

            function getVector3(name: string) {
                const ret:number[] = [];
                for (let i = 0; i < 3; i++) {
                    ret[i] = info!.getColumn(`${name}[${i}]`).getFloat(0);
                }
                return ret;
            }

            function getNum(name: string) { return info!.getColumn(name).getFloat(0); }

            const header = {
                name: info.getColumn('name').getString(0),
                axisOrder: getVector3('axis_order'),

                origin: getVector3('origin'),
                dimensions: getVector3('dimensions'),
                
                sampleCount: getVector3('sample_count'),

                spacegroupNumber: getNum('spacegroup_number') | 0,
                cellSize: getVector3('spacegroup_cell_size'),
                cellAngles: getVector3('spacegroup_cell_angles'),

                mean: getNum('global_mean'),
                sigma: getNum('global_sigma'),
            };
            
            const indices = [0, 0, 0];
            indices[header.axisOrder[0]] = 0;
            indices[header.axisOrder[1]] = 1;
            indices[header.axisOrder[2]] = 2;

            function normalizeOrder(xs: number[]) {
                return [xs[indices[0]], xs[indices[1]], xs[indices[2]]];
            }
                        
            const sampleCount = normalizeOrder(header.sampleCount);

            const rawData = readRawData1(block.getCategory('_volume_data_3d')!.getColumn('values'), sampleCount, header.sampleCount, indices, header.mean);            
            const field = new Field3DZYX(<any>rawData.data, sampleCount);                    
                                     
            const data: Data = {
                spacegroup: createSpacegroup(header.spacegroupNumber, header.cellSize, header.cellAngles),
                box: {
                    origin: normalizeOrder(header.origin),
                    dimensions: normalizeOrder(header.dimensions),
                    sampleCount
                },
                data: field,
                valuesInfo: { min: rawData.min, max: rawData.max, mean: header.mean, sigma: header.sigma },
                attributes: { }
            };

            console.log(data);
            
            return ParserResult.success(data);
        }

        export function parseLegacy(block: Formats.CIF.DataBlock): ParserResult<Data> {
            const info = block.getCategory('_density_info');
            if (!info) return ParserResult.error<Data>('_density_info category is missing.');
            if (!block.getCategory('_density_data')) return ParserResult.error<Data>('_density_data category is missing.');

            function getArray(name: string) {
                const ret:number[] = [];
                for (let i = 0; i < 3; i++) {
                    ret[i] = info!.getColumn(`${name}[${i}]`).getFloat(0);
                }
                return ret;
            }

            function getNum(name: string) { return info!.getColumn(name).getFloat(0); }

            const header = {
                name: info.getColumn('name').getString(0),
                grid: getArray('grid'),
                axisOrder: getArray('axis_order'),
                extent: getArray('extent'),
                origin: getArray('origin'),
                cellSize: getArray('cell_size'),
                cellAngles: getArray('cell_angles'),
                mean: getNum('mean'),
                sigma: getNum('sigma'),
                spacegroupNumber: getNum('spacegroup_number') | 0,
            };
            
            const indices = [0, 0, 0];
            indices[header.axisOrder[0]] = 0;
            indices[header.axisOrder[1]] = 1;
            indices[header.axisOrder[2]] = 2;
                        
            const originGrid = [header.origin[indices[0]], header.origin[indices[1]], header.origin[indices[2]]]            
            const extent = [header.extent[indices[0]], header.extent[indices[1]], header.extent[indices[2]]];

            const rawData = readRawData1(block.getCategory('_density_data')!.getColumn('values'), extent, header.extent, indices, header.mean);            
            const field = new Field3DZYX(<any>rawData.data, extent);                    
                                     
            const data: Data = {
                spacegroup: createSpacegroup(header.spacegroupNumber, header.cellSize, header.cellAngles),
                box: {
                    origin: [originGrid[0] / header.grid[0], originGrid[1] / header.grid[1], originGrid[2] / header.grid[2]],
                    dimensions: [extent[0] / header.grid[0], extent[1] / header.grid[1], extent[2] / header.grid[2]],
                    sampleCount: extent
                },
                data: field,
                valuesInfo: { min: rawData.min, max: rawData.max, mean: header.mean, sigma: header.sigma },
                attributes: { }
            };
            
            return ParserResult.success(data);
        }

        function readRawData1(col: Formats.CIF.Column, extent: number[], headerExtent: number[], indices: number[], mean: number) {
            let data = new Float32Array(extent[0] * extent[1] * extent[2]),
                coord = [0, 0, 0],
                mX: number, mY: number, mZ: number,
                cX: number, cY: number, cZ: number,
                xSize: number, xySize: number,
                offset = 0, v = 0.1,
                min = Number.POSITIVE_INFINITY, max = Number.NEGATIVE_INFINITY,
                iX = indices[0], iY = indices[1], iZ = indices[2];

            mX = headerExtent[0];
            mY = headerExtent[1];
            mZ = headerExtent[2];

            xSize = extent[0];
            xySize = extent[0] * extent[1];
            
            for (cZ = 0; cZ < mZ; cZ++) {
                coord[2] = cZ;
                for (cY = 0; cY < mY; cY++) {
                    coord[1] = cY;
                    for (cX = 0; cX < mX; cX++) {
                        coord[0] = cX;
                        v = col.getFloat(offset);
                        if (v < min) min = v;
                        else if (v > max) max = v;
                        data[coord[iX] + coord[iY] * xSize + coord[iZ] * xySize] = v;
                        offset += 1;
                    }
                }
            }

            return { data, min, max };
        }
    }
}