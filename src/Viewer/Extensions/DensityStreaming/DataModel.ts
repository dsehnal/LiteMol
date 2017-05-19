/*
 * Copyright (c) 2017 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Extensions.DensityStreaming {
    'use strict';

    export type FieldSource = 'X-ray' | 'EM'
    export type DataType = 'EM' | '2FO-FC' | 'FO-FC'
    export type FieldType = '2Fo-Fc' | 'Fo-Fc(-ve)' | 'Fo-Fc(+ve)' | 'EM'
    export const FieldSources: FieldSource[] = [ 'X-ray', 'EM' ]  

    export interface SetupParams {
        server: string,
        id: string,
        source: FieldSource,
        initialStreamingParams?: Partial<CreateStreamingParams>,
        streamingEntityRef?: string
    }

    export type CreateStreamingParams = {
        readonly maxRadius: number,
        readonly server: string,
        readonly source: FieldSource,
        readonly id: string,
        readonly header: ServerDataFormat.Header,
        displayType: CreateStreamingParams.DisplayTypeKind,
        detailLevel: number,
        radius: number,
        isoValueType: Bootstrap.Visualization.Density.IsoValueType,
        isoValues: { [F in FieldType]?: number },
        showEverythingExtent: number,
        // do not use /cell query on EM
        forceBox?: boolean
    } & { [F in FieldType]?: Bootstrap.Visualization.Density.Style }

    export namespace CreateStreamingParams {
        export type DisplayTypeKind = 'Everything' | 'Around Selection'
    }

    export namespace ServerDataFormat {
        export type ValueType = 'float32' | 'int8'

        export namespace ValueType {
            export const Float32: ValueType = 'float32';
            export const Int8: ValueType = 'int8';
        }

        export type ValueArray = Float32Array | Int8Array

        export type DetailLevel = { precision: number, maxVoxels: number }

        export interface Spacegroup {
            number: number,
            size: number[],
            angles: number[],
            /** Determine if the data should be treated as periodic or not. (e.g. X-ray = periodic, EM = not periodic) */
            isPeriodic: boolean,
        }

        export interface ValuesInfo {
            mean: number,
            sigma: number,
            min: number,
            max: number
        }

        export interface Sampling {
            byteOffset: number,

            /** How many values along each axis were collapsed into 1 */
            rate: number,
            valuesInfo: ValuesInfo[],

            /** Number of samples along each axis, in axisOrder  */
            sampleCount: number[]
        }

        export interface Header {
            /** Format version number  */
            formatVersion: string,

            /** Axis order from the slowest to fastest moving, same as in CCP4 */
            axisOrder: number[],

            /** Origin in fractional coordinates, in axisOrder */
            origin: number[],

            /** Dimensions in fractional coordinates, in axisOrder */
            dimensions: number[],

            spacegroup: Spacegroup,
            channels: string[],

            /** Determines the data type of the values */
            valueType: ValueType,

            /** The value are stored in blockSize^3 cubes */
            blockSize: number,
            sampling: Sampling[],

            /** Precision data the server can show. */
            availablePrecisions: DetailLevel[],

            isAvailable: boolean
        }
    }
}
