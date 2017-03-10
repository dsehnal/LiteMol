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
            const info = block.getCategory('_volume_data_3d_info');
            if (!info) return ParserResult.error<Data>('_volume_data_3d_info category is missing.');
            if (!block.getCategory('_volume_data_3d')) return ParserResult.error<Data>('_volume_data_3d category is missing.');

            function getVector3(name: string) {
                const ret:number[] = [0, 0, 0];
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

                mean: getNum('mean_sampled'),
                sigma: getNum('sigma_sampled')
            };
            
            const indices = [0, 0, 0];
            indices[header.axisOrder[0]] = 0;
            indices[header.axisOrder[1]] = 1;
            indices[header.axisOrder[2]] = 2;

            function normalizeOrder(xs: number[]) {
                return [xs[indices[0]], xs[indices[1]], xs[indices[2]]];
            }
                        
            const sampleCount = normalizeOrder(header.sampleCount);

            const rawData = readValues(block.getCategory('_volume_data_3d')!.getColumn('values'), sampleCount, header.sampleCount, indices);            
            const field = new Field3DZYX(<any>rawData.data, sampleCount);                    
                                
            const data: Data = {
                name: header.name!,
                spacegroup: createSpacegroup(header.spacegroupNumber, header.cellSize, header.cellAngles),
                box: {
                    origin: normalizeOrder(header.origin),
                    dimensions: normalizeOrder(header.dimensions),
                    sampleCount
                },
                data: field,
                valuesInfo: { min: rawData.min, max: rawData.max, mean: header.mean, sigma: header.sigma }
            };
            
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
            const xyzSampleCount = [header.extent[indices[0]], header.extent[indices[1]], header.extent[indices[2]]];

            const rawData = readValues(block.getCategory('_density_data')!.getColumn('values'), xyzSampleCount, header.extent, indices);            
            const field = new Field3DZYX(<any>rawData.data, xyzSampleCount);                    
                                     
            const data: Data = {
                name: header.name!,
                spacegroup: createSpacegroup(header.spacegroupNumber, header.cellSize, header.cellAngles),
                box: {
                    origin: [originGrid[0] / header.grid[0], originGrid[1] / header.grid[1], originGrid[2] / header.grid[2]],
                    dimensions: [xyzSampleCount[0] / header.grid[0], xyzSampleCount[1] / header.grid[1], xyzSampleCount[2] / header.grid[2]],
                    sampleCount: xyzSampleCount
                },
                data: field,
                valuesInfo: { min: rawData.min, max: rawData.max, mean: header.mean, sigma: header.sigma }
            };
            
            return ParserResult.success(data);
        }

        function readValues(col: Formats.CIF.Column, xyzSampleCount: number[], sampleCount: number[], axisIndices: number[]) {
            const data = new Float32Array(xyzSampleCount[0] * xyzSampleCount[1] * xyzSampleCount[2]);
            const coord = [0, 0, 0];
            const iX = axisIndices[0], iY = axisIndices[1], iZ = axisIndices[2];
            const mX = sampleCount[0], mY = sampleCount[1], mZ = sampleCount[2];

            const xSize = xyzSampleCount[0];
            const xySize = xyzSampleCount[0] * xyzSampleCount[1];
            
            let offset = 0;
            let min = col.getFloat(0), max = min;

            for (let cZ = 0; cZ < mZ; cZ++) {
                coord[2] = cZ;                                
                for (let cY = 0; cY < mY; cY++) {
                    coord[1] = cY;
                    for (let cX = 0; cX < mX; cX++) {
                        coord[0] = cX;                        
                        const v = col.getFloat(offset);
                        offset += 1;
                        data[coord[iX] + coord[iY] * xSize + coord[iZ] * xySize] = v;
                        if (v < min) min = v;
                        else if (v > max) max = v;
                    }
                }
            }

            return { data, min, max };
        }
    }
}