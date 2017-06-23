/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Comparison.Base {
    "use strict";

    import LA = Core.Geometry.LinearAlgebra;
    import Structure = Core.Structure;

    export interface RmsdTransformResult {
        bTransform: number[], 
        rmsd: number
    }

    export interface RmsdTransformInput {
        a: Structure.PositionTable;
        b: Structure.PositionTable;

        centerA?: LA.Vector3;
        centerB?: LA.Vector3;
    }

    export class RmsdTransformState {
        a: Structure.PositionTable;
        b: Structure.PositionTable;

        centerA: LA.Vector3;
        centerB: LA.Vector3;

        evdCache: Evd.EvdCache = Evd.EvdCache.create(4);

        translateB = LA.Matrix4.identity();
        rotateB = LA.Matrix4.identity();
        tempMatrix = LA.Matrix4.identity();

        result: RmsdTransformResult;

        constructor(data: RmsdTransformInput, into: RmsdTransformResult) {
            this.a = data.a;
            this.b = data.b;

            if (data.centerA) this.centerA = data.centerA;
            else this.centerA = PositionTable.getCentroid(data.a);

            if (data.centerB) this.centerB = data.centerB;
            else this.centerB = PositionTable.getCentroid(data.b);
            
            this.result = into;
        }
    }

    export function findMinimalRmsdTransform(data: RmsdTransformInput, into?: RmsdTransformResult) {
        if (typeof into === "undefined") into = { bTransform: LA.Matrix4.zero(), rmsd: 0.0 };
        findMinimalRmsdTransformImpl(new RmsdTransformState(data, into));
        return into;
    }

    function computeN(state: RmsdTransformState) {

        let N = state.evdCache.matrix;

        Evd.ColumnMajorMatrix.reset(N);

        let xsA = state.a.x, ysA = state.a.y, zsA = state.a.z;
        let xsB = state.b.x, ysB = state.b.y, zsB = state.b.z;
        let cA = state.centerA;
        let cB = state.centerB;

        let sizeSq = 0.0;

        for (let i = 0, _l = state.a.count; i < _l; i++)
        {
            let aX = xsA[i] - cA[0], aY = ysA[i] - cA[1], aZ = zsA[i] - cA[2];
            let bX = xsB[i] - cB[0], bY = ysB[i] - cB[1], bZ = zsB[i] - cB[2];

            sizeSq += aX * aX + aY * aY + aZ * aZ + bX * bX + bY * bY + bZ * bZ;
            
            Evd.ColumnMajorMatrix.add(N, 0, 0, aX * bX + aY * bY + aZ * bZ);
            Evd.ColumnMajorMatrix.add(N, 0, 1, -(aZ * bY) + aY * bZ);
            Evd.ColumnMajorMatrix.add(N, 0, 2, aZ * bX - aX * bZ);
            Evd.ColumnMajorMatrix.add(N, 0, 3, -(aY * bX) + aX * bY);
            Evd.ColumnMajorMatrix.add(N, 1, 0, -(aZ * bY) + aY * bZ);
            Evd.ColumnMajorMatrix.add(N, 1, 1, aX * bX - aY * bY - aZ * bZ);
            Evd.ColumnMajorMatrix.add(N, 1, 2, aY * bX + aX * bY);
            Evd.ColumnMajorMatrix.add(N, 1, 3, aZ * bX + aX * bZ);
            Evd.ColumnMajorMatrix.add(N, 2, 0, aZ * bX - aX * bZ);
            Evd.ColumnMajorMatrix.add(N, 2, 1, aY * bX + aX * bY);
            Evd.ColumnMajorMatrix.add(N, 2, 2, -(aX * bX) + aY * bY - aZ * bZ);
            Evd.ColumnMajorMatrix.add(N, 2, 3, aZ * bY + aY * bZ);
            Evd.ColumnMajorMatrix.add(N, 3, 0, -(aY * bX) + aX * bY);
            Evd.ColumnMajorMatrix.add(N, 3, 1, aZ * bX + aX * bZ);
            Evd.ColumnMajorMatrix.add(N, 3, 2, aZ * bY + aY * bZ);
            Evd.ColumnMajorMatrix.add(N, 3, 3, -(aX * bX) - aY * bY + aZ * bZ);

            // conjugate instead of transpose.
            //var l = new Quaternion(-a.X, -a.Y, -a.Z, 0).RightMultiplicationToMatrix();
            //l.Transpose();
            //var r = new Quaternion(b.X, b.Y, b.Z, 0).LeftMultiplicationToMatrix();
            //N += l * r;
        }

        return sizeSq;

    }

    function makeTransformMatrix(state: RmsdTransformState) {
        let ev = state.evdCache.matrix;
        
        let qX = Evd.ColumnMajorMatrix.get(ev, 1, 3); 
        let qY = Evd.ColumnMajorMatrix.get(ev, 2, 3); 
        let qZ = Evd.ColumnMajorMatrix.get(ev, 3, 3); 
        let qW = Evd.ColumnMajorMatrix.get(ev, 0, 3);
                                
        let n1 = 2 * qY * qY;
        let n2 = 2 * qZ * qZ;
        let n3 = 2 * qX * qX;
        let n4 = 2 * qX * qY;
        let n5 = 2 * qW * qZ;
        let n6 = 2 * qX * qZ;
        let n7 = 2 * qW * qY;
        let n8 = 2 * qY * qZ;
        let n9 = 2 * qW * qX;

        let m = state.translateB;
        // translation to center
        LA.Matrix4.setValue(m, 0, 3, -state.centerB[0]);
        LA.Matrix4.setValue(m, 1, 3, -state.centerB[1]);
        LA.Matrix4.setValue(m, 2, 3, -state.centerB[2]);
        
        m = state.rotateB;
        // rotation
        LA.Matrix4.setValue(m, 0, 0, 1 - n1 - n2);
        LA.Matrix4.setValue(m, 0, 1, n4 + n5);
        LA.Matrix4.setValue(m, 0, 2, n6 - n7);
        LA.Matrix4.setValue(m, 1, 0, n4 - n5);
        LA.Matrix4.setValue(m, 1, 1, 1 - n3 - n2);
        LA.Matrix4.setValue(m, 1, 2, n8 + n9);
        LA.Matrix4.setValue(m, 2, 0, n6 + n7);
        LA.Matrix4.setValue(m, 2, 1, n8 - n9);
        LA.Matrix4.setValue(m, 2, 2, 1 - n3 - n1);
        LA.Matrix4.setValue(m, 3, 3, 1);
        
        LA.Matrix4.mul(state.tempMatrix, state.rotateB, state.translateB); 

        m = state.translateB;
        // translation to center
        LA.Matrix4.setValue(m, 0, 3, state.centerA[0]);
        LA.Matrix4.setValue(m, 1, 3, state.centerA[1]);
        LA.Matrix4.setValue(m, 2, 3, state.centerA[2]);
        
        LA.Matrix4.mul(state.result.bTransform, state.translateB, state.tempMatrix); 
    }

    function findMinimalRmsdTransformImpl(state: RmsdTransformState): void {

        let sizeSq = computeN(state);
        
        Evd.compute(state.evdCache);
        let rmsd = sizeSq - 2.0 * state.evdCache.eigenValues[3];
        rmsd = rmsd < 0.0 ? 0.0 : Math.sqrt(rmsd / state.a.count);        
        makeTransformMatrix(state);
        state.result.rmsd = rmsd;
    }
    
 }