/*
 * Copyright (c) 2017 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Visualization.Labels.Geometry {
    'use strict';

    /**
     * Adapted from https://github.com/arose/ngl
     * MIT License Copyright (C) 2014+ Alexander Rose
     */

    export function create(params: LabelsParams) {
        const state = initState(params);
        calcVertices(state);
        makeMapping(state);
        const idx = makeIndexBuffer(state);
        const geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position', new THREE.BufferAttribute(state.vertices, 3));
        geometry.addAttribute('index', new THREE.BufferAttribute(idx, 1));
        geometry.addAttribute('color', new THREE.BufferAttribute(new Float32Array(state.quadCount * 4 * 3), 3));
        geometry.addAttribute('mapping', new THREE.BufferAttribute(state.mapping, 2));
        geometry.addAttribute('inputTexCoord', new THREE.BufferAttribute(state.texCoords, 2));
        geometry.addAttribute('inputSize', new THREE.BufferAttribute(state.size, 1));

        return { geometry, texture: state.textAtlas.texture, options: state.options };
    }

    interface State {
        positions: Core.Structure.PositionTable,
        inputSizes: number[],
        labels: string[],
        options: LabelsOptions,
        textAtlas: TextAtlas,
        charCount: number,
        quadCount: number,
        vertices: Float32Array,
        size: Float32Array,
        texCoords: Float32Array,
        mapping: Float32Array
    }

    function initState(params: LabelsParams): State {
        const options: LabelsOptions = Core.Utils.extend({}, params.options, DefaultLabelsOptions);

        let charCount = 0;
        for (const t of params.labels) charCount += t.length;
        
        const textAtlas = getTextAtlas({
            font: [options.fontFamily],
            style: options.fontStyle,
            weight: options.fontWeight,
            size: options.fontSize,
            outline: options.useSDF ? 5 : 0
        });

        const quadCount = charCount + params.labels.length /* bg */;

        return {
            positions: params.positions,
            inputSizes: params.sizes,
            labels: params.labels,
            options,
            textAtlas,
            charCount,
            quadCount,
            vertices: new Float32Array(quadCount * 4 * 3),
            size: new Float32Array(quadCount * 4),
            texCoords: new Float32Array(quadCount * 4 * 2),
            mapping: new Float32Array(quadCount * 4 * 2)
        }
    }

    function calcVertices(state: State) {
        const text = state.labels;
        const { x, y, z } = state.positions;
        const { vertices, size, inputSizes } = state;

        let iCharAll = 0;

        for (let v = 0; v < text.length; ++v) {
            const txt = text[v];
            let nChar = txt.length + 1 /* bg */;

            for (let iChar = 0; iChar < nChar; ++iChar, ++iCharAll) {
                for (let m = 0; m < 4; m++) {
                    const j = iCharAll * 4 * 3 + (3 * m);
                    vertices[j] = x[v];
                    vertices[j + 1] = y[v];
                    vertices[j + 2] = z[v];
                    size[iCharAll * 4 + m] = inputSizes[v];
                }
            }
        }
    }

    function makeMapping(state: State) {
        const ta = state.textAtlas;
        const text = state.labels;
        const attachment = state.options.attachment as string;
        const outline = ta.params.outline, lineHeight = ta.lineHeight;
        const margin = (ta.lineHeight * state.options.backgroundMargin * 0.1) - 10;

        const inputTexCoord = state.texCoords;
        const inputMapping = state.mapping;

        let iCharAll = 0;
        let c, i, txt, xadvance, iChar, nChar, xShift, yShift;

        for (let v = 0; v < text.length; ++v) {
            txt = text[v];
            xadvance = 0;
            nChar = txt.length;

            // calculate width
            for (iChar = 0; iChar < nChar; ++iChar) {
                c = ta.getTextMetrics(txt[iChar]);
                xadvance += c.w - 2 * outline;
            }

            // attachment
            if (attachment.indexOf("top") === 0) {
                yShift = ta.lineHeight / 1.25;
            } else if (attachment.indexOf("middle") === 0) {
                yShift = ta.lineHeight / 2.5;
            } else {
                yShift = 0;  // "bottom"
            }
            if (attachment.indexOf("right") > 0) {
                xShift = xadvance;
            } else if (attachment.indexOf("center") > 0) {
                xShift = xadvance / 2;
            } else {
                xShift = 0;  // "left"
            }
            xShift += outline;
            yShift += outline;

            // background            
            i = iCharAll * 2 * 4;
            inputMapping[i + 0] = -lineHeight / 6 - xShift - margin;  // top left
            inputMapping[i + 1] = lineHeight - yShift + margin;
            inputMapping[i + 2] = -lineHeight / 6 - xShift - margin;  // bottom left
            inputMapping[i + 3] = 0 - 1.2 * yShift - margin;
            inputMapping[i + 4] = xadvance + lineHeight / 6 - xShift + 2 * outline + margin;  // top right
            inputMapping[i + 5] = lineHeight - yShift + margin;
            inputMapping[i + 6] = xadvance + lineHeight / 6 - xShift + 2 * outline + margin;  // bottom right
            inputMapping[i + 7] = 0 - 1.2 * yShift - margin;
            inputTexCoord[i + 0] = 10;
            inputTexCoord[i + 2] = 10;
            inputTexCoord[i + 4] = 10;
            inputTexCoord[i + 6] = 10;
            iCharAll += 1;

            xadvance = 0;

            for (iChar = 0; iChar < nChar; ++iChar, ++iCharAll) {
                c = ta.getTextMetrics(txt[iChar]);
                i = iCharAll * 2 * 4;

                inputMapping[i + 0] = xadvance - xShift;  // top left
                inputMapping[i + 1] = c.h - yShift;
                inputMapping[i + 2] = xadvance - xShift;  // bottom left
                inputMapping[i + 3] = 0 - yShift;
                inputMapping[i + 4] = xadvance + c.w - xShift;  // top right
                inputMapping[i + 5] = c.h - yShift;
                inputMapping[i + 6] = xadvance + c.w - xShift;  // bottom right
                inputMapping[i + 7] = 0 - yShift;

                const texWidth = ta.params.width;
                const texHeight = ta.params.height;
                inputTexCoord[i + 0] = c.x / texWidth; // top left
                inputTexCoord[i + 1] = c.y / texHeight;
                inputTexCoord[i + 2] = c.x / texWidth; // bottom left
                inputTexCoord[i + 3] = (c.y + c.h) / texHeight;
                inputTexCoord[i + 4] = (c.x + c.w) / texWidth; // top right
                inputTexCoord[i + 5] = c.y / texHeight;
                inputTexCoord[i + 6] = (c.x + c.w) / texWidth; // bottom right
                inputTexCoord[i + 7] = (c.y + c.h) / texHeight;

                xadvance += c.w - 2 * outline;

            }
        }
    }

    function makeIndexBuffer(state: State) {
        const buffer = new Uint32Array(state.quadCount * 2 * 3);
        let o = 0;

        for (let i = 0; i < state.quadCount; i++) {
            buffer[o++] = 4 * i;
            buffer[o++] = 4 * i + 1;
            buffer[o++] = 4 * i + 2;
            buffer[o++] = 4 * i + 1;
            buffer[o++] = 4 * i + 3;
            buffer[o++] = 4 * i + 2;
        }

        return buffer;
    }
}