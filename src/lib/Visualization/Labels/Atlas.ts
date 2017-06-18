/*
 * Copyright (c) 2017 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Visualization.Labels {
    'use strict';

    /**
     * Adapted from https://github.com/arose/ngl
     * MIT License Copyright (C) 2014+ Alexander Rose
     */

    export interface TextAtlasParams {
        font: string[],
        size: number,
        style: string,
        variant: string,
        weight: string,
        outline: number,
        width: number,
        height: number
    }

    export const DefaultTextAtlasParams: TextAtlasParams = {
        font: ['sans-serif'],
        size: 36,
        style: 'normal',
        variant: 'normal',
        weight: 'normal',
        outline: 0,
        width: 2048,
        height: 2048
    }

    const TextAtlasCache = Core.Utils.FastMap.create<string, TextAtlas>();

    export function getTextAtlas(params: Partial<TextAtlasParams>) {
        const hash = JSON.stringify(params);
        if (TextAtlasCache.has(hash)) return TextAtlasCache.get(hash)!;
        const atlas = new TextAtlas(params);
        TextAtlasCache.set(hash, atlas);
        return atlas;
    }

    export interface MappedMetrics { x: number, y: number, w: number, h: number }

    export class TextAtlas {
        params: TextAtlasParams;
        private gamma = 1;
        private mapped = Core.Utils.FastMap.create<string, MappedMetrics>();
        private state = { scratchW: 0, scratchH: 0, currentX: 0, currentY: 0 };
        private placeholder: MappedMetrics;
        lineHeight = 0;
        private canvas: {
            canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D,
            canvas2: HTMLCanvasElement, ctx2: CanvasRenderingContext2D,
            maxWidth: number,
            colors: string[],
            scratch: Uint8Array
            data: Uint8Array
        };
        texture: THREE.Texture;

        constructor(params: Partial<TextAtlasParams>) {
            this.params = Core.Utils.extend({}, params, DefaultTextAtlasParams);

            if (typeof navigator !== 'undefined') {
                const ua = navigator.userAgent;
                if (ua.match(/Chrome/) && ua.match(/OS X/)) {
                    this.gamma = 0.5;
                }
            }

            this.build();
            this.populate();

            this.texture = new THREE.Texture(this.canvas.canvas2);
            this.texture.flipY = false;
            this.texture.needsUpdate = true;
            // no need to hold the reference.
            this.canvas = void 0 as any;
        }

        private build() {

            const params = this.params;

            // Prepare line-height with room for outline and descenders/ascenders
            const lineHeight = params.size + 2 * params.outline + Math.round(params.size / 4);
            const maxWidth = params.width / 4;

            // Prepare scratch canvas
            const canvas = document.createElement("canvas");
            canvas.width = maxWidth;
            canvas.height = lineHeight;

            const ctx = canvas.getContext("2d")!;
            ctx.font = params.style + " " + params.variant + " " + params.weight + " " + params.size + "px " + params.font;
            ctx.fillStyle = "#FF0000";
            ctx.textAlign = "left";
            ctx.textBaseline = "bottom";
            ctx.lineJoin = "round";

            const colors = [];
            const dilate = params.outline * 3;
            for (let i = 0; i < dilate; ++i) {
                // 8 rgb levels = 1 step = .5 pixel increase
                const val = Math.max(0, -i * 8 + 128 - (+(!i)) * 8);
                const hex = ("00" + val.toString(16)).slice(-2);
                colors.push("#" + hex + hex + hex);
            }
            const scratch = new Uint8Array(maxWidth * lineHeight * 2);

            const data = new Uint8Array(params.width * params.height * 4);

            const canvas2 = document.createElement('canvas');
            canvas2.width = params.width;
            canvas2.height = params.height;
            const ctx2 = canvas2.getContext('2d')!;

            this.canvas = {
                canvas, ctx,
                canvas2, ctx2,
                maxWidth,
                colors,
                scratch,
                data
            };

            this.lineHeight = lineHeight;
        }

        private map(text: string) {
            if (this.mapped.has(text)) return this.mapped.get(text)!;

            this.draw(text);

            const state = this.state;
            if (state.currentX + state.scratchW > this.params.width) {
                state.currentX = 0;
                state.currentY += state.scratchH;
            }
            if (state.currentY + state.scratchH > this.params.height) {
                console.warn("TextAtlas canvas to small");
            }

            const metrics = {
                x: state.currentX,
                y: state.currentY,
                w: state.scratchW,
                h: state.scratchH
            };

            this.mapped.set(text, metrics);

            this.canvas.ctx2.drawImage(
                this.canvas.canvas,
                0, 0,
                state.scratchW, state.scratchH,
                state.currentX, state.currentY,
                state.scratchW, state.scratchH
            );

            state.currentX += state.scratchW;
            return metrics;
        }

        getTextMetrics(text: string) {
            return this.mapped.has(text) ? this.mapped.get(text)! : this.placeholder;
        }

        private draw(text: string) {
            const { params, canvas } = this;
            const h = this.lineHeight;
            const o = params.outline;
            const ctx = canvas.ctx;
            const dst = canvas.scratch;
            const max = canvas.maxWidth;
            const colors = canvas.colors;

            // Bottom aligned, take outline into account
            const x = o;
            const y = h - params.outline;

            // Measure text
            const m = ctx.measureText(text);
            const w = Math.min(max, Math.ceil(m.width + 2 * x + 1));

            // Clear scratch area
            ctx.clearRect(0, 0, w, h);

            let i, il, j, imageData, data;

            if (params.outline === 0) {
                ctx.fillText(text, x, y);
                imageData = ctx.getImageData(0, 0, w, h);
                data = imageData.data;

                j = 3;  // Skip to alpha channel
                for (i = 0, il = data.length / 4; i < il; ++i) {
                    dst[i] = data[j];
                    j += 4;
                }
            } else {
                ctx.globalCompositeOperation = "source-over";
                // Draw strokes of decreasing width to create
                // nested outlines (absolute distance)
                for (i = o + 1; i > 0; --i) {
                    // Eliminate odd strokes once past > 1px,
                    // don't need the detail
                    j = i > 1 ? i * 2 - 2 : i;
                    ctx.strokeStyle = colors[j - 1];
                    ctx.lineWidth = j;
                    ctx.strokeText(text, x, y);
                }
                ctx.globalCompositeOperation = "multiply";
                ctx.fillStyle = "#FF00FF";
                ctx.fillText(text, x, y);
                imageData = ctx.getImageData(0, 0, w, h);
                data = imageData.data;

                j = 0;
                const gamma = this.gamma;
                for (i = 0, il = data.length / 4; i < il; ++i) {
                    // Get value + mask
                    const a = data[j];
                    let mask = a ? data[j + 1] / a : 1;
                    if (gamma === 0.5) {
                        mask = Math.sqrt(mask);
                    }
                    mask = Math.min(1, Math.max(0, mask));

                    // Blend between positive/outside and negative/inside
                    const b = 256 - a;
                    const c = b + (a - b) * mask;

                    // Clamp (slight expansion to hide errors around the transition)
                    dst[i] = Math.max(0, Math.min(255, c + 2));
                    data[j + 3] = dst[i];
                    j += 4;
                }

            }

            ctx.putImageData(imageData, 0, 0);
            this.state.scratchW = w;
            this.state.scratchH = h;
        }

        private populate() {
            // Replacement Character
            this.placeholder = this.map(String.fromCharCode(0xFFFD));

            // Basic Latin
            for (let i = 0x0000; i < 0x007F; ++i) {
                this.map(String.fromCharCode(i));
            }

            // Latin-1 Supplement
            for (let i = 0x0080; i < 0x00FF; ++i) {
                this.map(String.fromCharCode(i));
            }

            // Greek and Coptic
            for (let i = 0x0370; i < 0x03FF; ++i) {
                this.map(String.fromCharCode(i));
            }

            // Cyrillic
            for (let i = 0x0400; i < 0x04FF; ++i) {
                this.map(String.fromCharCode(i));
            }

            // Angstrom Sign
            this.map(String.fromCharCode(0x212B));
        }
    }

}