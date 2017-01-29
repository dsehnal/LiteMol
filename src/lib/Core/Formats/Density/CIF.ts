/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Formats.Density.CIF {
    
    export function parse(block: Formats.CIF.DataBlock) {
        return Parser.parse(block);
    }

    namespace Parser {

        export function parse(block: Formats.CIF.DataBlock): ParserResult<Data> {

            let info = block.getCategory('_density_info');
            if (!info) return ParserResult.error<Data>('_density_info category is missing.');
            if (!block.getCategory('_density_data')) return ParserResult.error<Data>('_density_data category is missing.');

            function getArray(name: string) {
                let ret:number[] = [];
                for (let i = 0; i < 3; i++) {
                    ret[i] = info!.getColumn(`${name}[${i}]`).getFloat(0);
                }
                return ret;
            }

            function getNum(name: string) { return info!.getColumn(name).getFloat(0); }

            let header = {
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

            let alpha = (Math.PI / 180.0) * header.cellAngles[0],
                beta = (Math.PI / 180.0) * header.cellAngles[1],
                gamma = (Math.PI / 180.0) * header.cellAngles[2];

            let xScale = header.cellSize[0] / header.grid[0],
                yScale = header.cellSize[1] / header.grid[1],
                zScale = header.cellSize[2] / header.grid[2];

            let z1 = Math.cos(beta),
                z2 = (Math.cos(alpha) - Math.cos(beta) * Math.cos(gamma)) / Math.sin(gamma),
                z3 = Math.sqrt(1.0 - z1 * z1 - z2 * z2);

            let xAxis = [xScale, 0.0, 0.0],
                yAxis = [Math.cos(gamma) * yScale, Math.sin(gamma) * yScale, 0.0],
                zAxis = [z1 * zScale, z2 * zScale, z3 * zScale];
            
            let indices = [0, 0, 0];
            indices[header.axisOrder[0]] = 0;
            indices[header.axisOrder[1]] = 1;
            indices[header.axisOrder[2]] = 2;
                        
            let d = [header.origin[indices[0]], header.origin[indices[1]], header.origin[indices[2]]]
            let origin = [
                xAxis[0] * d[0] + yAxis[0] * d[1] + zAxis[0] * d[2],
                                  yAxis[1] * d[1] + zAxis[1] * d[2],
                                                    zAxis[2] * d[2]
            ];
            
            let extent = [header.extent[indices[0]], header.extent[indices[1]], header.extent[indices[2]]];

            let rawData = readRawData1(block.getCategory('_density_data')!.getColumn('values'), extent, header.extent, indices, header.mean);            
            let field = new Field3DZYX(<any>rawData.data, extent);                    
                                     
            let data = Data.create(
                header.cellSize, header.cellAngles, origin,
                false, <any>void 0, field, extent,
                { x: xAxis, y: yAxis, z: zAxis },
                //[header.axisOrder[indices[0]], header.axisOrder[indices[1]], header.axisOrder[indices[2]]],
                { min: rawData.min, max: rawData.max, mean: header.mean, sigma: header.sigma },
                { spacegroupIndex: header.spacegroupNumber - 1, name: header.name });
            
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