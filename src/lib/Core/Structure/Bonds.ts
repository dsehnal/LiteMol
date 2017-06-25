/*
 * Copyright (c) 2017 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Structure {
    'use strict';

    export const enum BondType {
        Unknown = 0,

        Single = 1,
        Double = 2,
        Triple = 3,
        Aromatic = 4,

        Metallic = 5,
        Ion = 6,
        Hydrogen = 7,
        DisulfideBridge = 8
    }

    export interface BondComputationParameters {
        maxHbondLength: number,
        forceCompute: boolean
    }

    // H,D,T are all mapped to H
    const __ElementIndex: { [e: string]: number | undefined } = {'H':0,'h':0,'D':0,'d':0,'T':0,'t':0,'He':2,'HE':2,'he':2,'Li':3,'LI':3,'li':3,'Be':4,'BE':4,'be':4,'B':5,'b':5,'C':6,'c':6,'N':7,'n':7,'O':8,'o':8,'F':9,'f':9,'Ne':10,'NE':10,'ne':10,'Na':11,'NA':11,'na':11,'Mg':12,'MG':12,'mg':12,'Al':13,'AL':13,'al':13,'Si':14,'SI':14,'si':14,'P':15,'p':15,'S':16,'s':16,'Cl':17,'CL':17,'cl':17,'Ar':18,'AR':18,'ar':18,'K':19,'k':19,'Ca':20,'CA':20,'ca':20,'Sc':21,'SC':21,'sc':21,'Ti':22,'TI':22,'ti':22,'V':23,'v':23,'Cr':24,'CR':24,'cr':24,'Mn':25,'MN':25,'mn':25,'Fe':26,'FE':26,'fe':26,'Co':27,'CO':27,'co':27,'Ni':28,'NI':28,'ni':28,'Cu':29,'CU':29,'cu':29,'Zn':30,'ZN':30,'zn':30,'Ga':31,'GA':31,'ga':31,'Ge':32,'GE':32,'ge':32,'As':33,'AS':33,'as':33,'Se':34,'SE':34,'se':34,'Br':35,'BR':35,'br':35,'Kr':36,'KR':36,'kr':36,'Rb':37,'RB':37,'rb':37,'Sr':38,'SR':38,'sr':38,'Y':39,'y':39,'Zr':40,'ZR':40,'zr':40,'Nb':41,'NB':41,'nb':41,'Mo':42,'MO':42,'mo':42,'Tc':43,'TC':43,'tc':43,'Ru':44,'RU':44,'ru':44,'Rh':45,'RH':45,'rh':45,'Pd':46,'PD':46,'pd':46,'Ag':47,'AG':47,'ag':47,'Cd':48,'CD':48,'cd':48,'In':49,'IN':49,'in':49,'Sn':50,'SN':50,'sn':50,'Sb':51,'SB':51,'sb':51,'Te':52,'TE':52,'te':52,'I':53,'i':53,'Xe':54,'XE':54,'xe':54,'Cs':55,'CS':55,'cs':55,'Ba':56,'BA':56,'ba':56,'La':57,'LA':57,'la':57,'Ce':58,'CE':58,'ce':58,'Pr':59,'PR':59,'pr':59,'Nd':60,'ND':60,'nd':60,'Pm':61,'PM':61,'pm':61,'Sm':62,'SM':62,'sm':62,'Eu':63,'EU':63,'eu':63,'Gd':64,'GD':64,'gd':64,'Tb':65,'TB':65,'tb':65,'Dy':66,'DY':66,'dy':66,'Ho':67,'HO':67,'ho':67,'Er':68,'ER':68,'er':68,'Tm':69,'TM':69,'tm':69,'Yb':70,'YB':70,'yb':70,'Lu':71,'LU':71,'lu':71,'Hf':72,'HF':72,'hf':72,'Ta':73,'TA':73,'ta':73,'W':74,'w':74,'Re':75,'RE':75,'re':75,'Os':76,'OS':76,'os':76,'Ir':77,'IR':77,'ir':77,'Pt':78,'PT':78,'pt':78,'Au':79,'AU':79,'au':79,'Hg':80,'HG':80,'hg':80,'Tl':81,'TL':81,'tl':81,'Pb':82,'PB':82,'pb':82,'Bi':83,'BI':83,'bi':83,'Po':84,'PO':84,'po':84,'At':85,'AT':85,'at':85,'Rn':86,'RN':86,'rn':86,'Fr':87,'FR':87,'fr':87,'Ra':88,'RA':88,'ra':88,'Ac':89,'AC':89,'ac':89,'Th':90,'TH':90,'th':90,'Pa':91,'PA':91,'pa':91,'U':92,'u':92,'Np':93,'NP':93,'np':93,'Pu':94,'PU':94,'pu':94,'Am':95,'AM':95,'am':95,'Cm':96,'CM':96,'cm':96,'Bk':97,'BK':97,'bk':97,'Cf':98,'CF':98,'cf':98,'Es':99,'ES':99,'es':99,'Fm':100,'FM':100,'fm':100,'Md':101,'MD':101,'md':101,'No':102,'NO':102,'no':102,'Lr':103,'LR':103,'lr':103,'Rf':104,'RF':104,'rf':104,'Db':105,'DB':105,'db':105,'Sg':106,'SG':106,'sg':106,'Bh':107,'BH':107,'bh':107,'Hs':108,'HS':108,'hs':108,'Mt':109,'MT':109,'mt':109};
    const __ElementBondingRadii: { [e: number]: number | undefined } = {0: 1.42, 1: 1.42, 2: 1.75, 3: 2, 4: 1.76, 5: 2, 6: 1.9, 7: 1.9, 8: 1.9, 9: 1.75, 10: 1.75, 11: 2, 12: 2.4, 13: 2.8, 14: 2.11, 15: 2.3, 16: 2.3, 17: 1.75, 18: 1.75, 19: 1, 20: 2.65, 21: 2.8, 22: 2.8, 23: 2.8, 24: 2.8, 25: 2.81, 26: 2.8, 27: 2.8, 28: 2.8, 29: 2.8, 30: 2.8, 31: 2.8, 32: 1.75, 33: 2.68, 34: 2.34, 35: 2.68, 36: 1.75, 37: 2.8, 38: 2.82, 39: 2.8, 40: 2.8, 41: 2.8, 42: 2.8, 43: 2.8, 44: 2.5, 45: 2.77, 46: 2.8, 47: 2.8, 48: 2.8, 49: 2.8, 50: 2.8, 51: 1.75, 52: 2.2, 53: 2.81, 54: 1.75, 55: 2.8, 56: 2.8, 57: 2.8, 58: 2.8, 59: 2.8, 60: 2.8, 61: 2.8, 62: 2.8, 63: 2.8, 64: 2.8, 65: 2.8, 66: 2.8, 67: 2.8, 68: 2.8, 69: 2.8, 70: 2.8, 71: 2.8, 72: 2.8, 73: 2.8, 74: 2.66, 75: 2.8, 76: 2.8, 77: 2.51, 78: 3.24, 79: 2.8, 80: 3, 81: 2.8, 82: 2.8, 83: 2.8, 84: 1.75, 85: 1.75, 86: 1.75, 87: 2.8, 88: 2.8, 89: 2.8, 90: 2.8, 91: 2.8, 92: 2.8, 93: 2.8, 94: 2.8, 95: 2.8, 96: 2.8, 97: 2.8, 98: 2.8, 99: 2.8, 100: 2.8, 101: 2.8, 102: 2.8, 103: 2.8, 104: 2.8, 105: 2.8, 106: 2.8, 107: 2.8, 108: 2.8, 109: 2.8};
    const __ElementBondThresholds: { [e: number]: number[][] | undefined }  = {0: [[1.42,BondType.Single]], 1: [[1.42,BondType.Single]], 3: [[2.8,BondType.Metallic]], 4: [[2.8,BondType.Metallic]], 6: [[1.75,BondType.Single]], 7: [[1.6,BondType.Single]], 8: [[1.52,BondType.Single]], 11: [[2.8,BondType.Metallic]], 12: [[2.8,BondType.Metallic]], 13: [[2.8,BondType.Metallic]], 14: [[1.9,BondType.Single]], 15: [[1.9,BondType.Single]], 16: [[1.9,BondType.Single]], 17: [[1.8,BondType.Single]], 19: [[2.8,BondType.Metallic]], 20: [[2.8,BondType.Metallic]], 21: [[2.8,BondType.Metallic]], 22: [[2.8,BondType.Metallic]], 23: [[2.8,BondType.Metallic]], 24: [[2.8,BondType.Metallic]], 25: [[2.8,BondType.Metallic]], 26: [[2.8,BondType.Metallic]], 27: [[2.8,BondType.Metallic]], 28: [[2.8,BondType.Metallic]], 29: [[2.8,BondType.Metallic]], 30: [[2.8,BondType.Metallic]], 31: [[2.8,BondType.Metallic]], 33: [[2.68,BondType.Single]], 37: [[2.8,BondType.Metallic]], 38: [[2.8,BondType.Metallic]], 39: [[2.8,BondType.Metallic]], 40: [[2.8,BondType.Metallic]], 41: [[2.8,BondType.Metallic]], 42: [[2.8,BondType.Metallic]], 43: [[2.8,BondType.Metallic]], 44: [[2.8,BondType.Metallic]], 45: [[2.8,BondType.Metallic]], 46: [[2.8,BondType.Metallic]], 47: [[2.8,BondType.Metallic]], 48: [[2.8,BondType.Metallic]], 49: [[2.8,BondType.Metallic]], 50: [[2.8,BondType.Metallic]], 55: [[2.8,BondType.Metallic]], 56: [[2.8,BondType.Metallic]], 57: [[2.8,BondType.Metallic]], 58: [[2.8,BondType.Metallic]], 59: [[2.8,BondType.Metallic]], 60: [[2.8,BondType.Metallic]], 61: [[2.8,BondType.Metallic]], 62: [[2.8,BondType.Metallic]], 63: [[2.8,BondType.Metallic]], 64: [[2.8,BondType.Metallic]], 65: [[2.8,BondType.Metallic]], 66: [[2.8,BondType.Metallic]], 67: [[2.8,BondType.Metallic]], 68: [[2.8,BondType.Metallic]], 69: [[2.8,BondType.Metallic]], 70: [[2.8,BondType.Metallic]], 71: [[2.8,BondType.Metallic]], 72: [[2.8,BondType.Metallic]], 73: [[2.8,BondType.Metallic]], 74: [[2.8,BondType.Metallic]], 75: [[2.8,BondType.Metallic]], 76: [[2.8,BondType.Metallic]], 77: [[2.8,BondType.Metallic]], 78: [[2.8,BondType.Metallic]], 79: [[2.8,BondType.Metallic]], 80: [[2.8,BondType.Metallic]], 81: [[2.8,BondType.Metallic]], 82: [[2.8,BondType.Metallic]], 83: [[2.8,BondType.Metallic]], 87: [[2.8,BondType.Metallic]], 88: [[2.8,BondType.Metallic]], 89: [[2.8,BondType.Metallic]], 90: [[2.8,BondType.Metallic]], 91: [[2.8,BondType.Metallic]], 92: [[2.8,BondType.Metallic]], 93: [[2.8,BondType.Metallic]], 94: [[2.8,BondType.Metallic]], 95: [[2.8,BondType.Metallic]], 96: [[2.8,BondType.Metallic]], 97: [[2.8,BondType.Metallic]], 98: [[2.8,BondType.Metallic]], 99: [[2.8,BondType.Metallic]], 100: [[2.8,BondType.Metallic]], 101: [[2.8,BondType.Metallic]], 102: [[2.8,BondType.Metallic]], 103: [[2.8,BondType.Metallic]], 104: [[2.8,BondType.Metallic]], 105: [[2.8,BondType.Metallic]], 106: [[2.8,BondType.Metallic]], 107: [[2.8,BondType.Metallic]], 108: [[2.8,BondType.Metallic]], 109: [[2.8,BondType.Metallic]]};
    const __ElementPairThresholds: { [e: number]: number[][] | undefined }  = {0: [[0.8,BondType.Single]], 15: [[1.31,BondType.Single]], 21: [[1.3,BondType.Single]], 28: [[1.3,BondType.Single]], 36: [[1.05,BondType.Single]], 45: [[1,BondType.Single]], 60: [[1.84,BondType.Single]], 71: [[1.88,BondType.Single]], 82: [[1.76,BondType.Single]], 83: [[1.56,BondType.Single]], 84: [[1.25,BondType.Triple],[1.4,BondType.Double],[1.75,BondType.Single]], 95: [[1.63,BondType.Single]], 96: [[1.68,BondType.Single]], 97: [[1.27,BondType.Double],[1.6,BondType.Single]], 110: [[1.36,BondType.Single]], 111: [[1.26,BondType.Double],[1.59,BondType.Single]], 112: [[1.55,BondType.Single]], 126: [[1.45,BondType.Single]], 144: [[1.6,BondType.Single]], 153: [[1.4,BondType.Single]], 180: [[1.55,BondType.Single]], 197: [[2.4,BondType.Metallic]], 215: [[1.49,BondType.Double],[1.98,BondType.Single]], 216: [[1.91,BondType.Single]], 218: [[2.24,BondType.Metallic]], 240: [[2.02,BondType.Metallic]], 259: [[2,BondType.Single]], 282: [[1.9,BondType.Single]], 480: [[2.3,BondType.Single]], 511: [[2.3,BondType.Single]], 544: [[2.3,BondType.Single]], 595: [[1.54,BondType.Single]], 612: [[2.1,BondType.Single]], 630: [[1,BondType.Single]], 786: [[2.6,BondType.Single]], 826: [[1.82,BondType.Double],[2.27,BondType.Single]], 867: [[2.1,BondType.Single]], 869: [[1.7,BondType.Single],[1.93,BondType.Single]], 910: [[2.06,BondType.Single]], 911: [[1.8,BondType.Double],[2.05,BondType.Single]], 954: [[1.53,BondType.Double],[1.62,BondType.Single]], 1241: [[2.68,BondType.Single]], 1291: [[2.33,BondType.Single]], 1431: [[1,BondType.Single]], 1717: [[2.14,BondType.Single]], 1776: [[2.48,BondType.Single]], 1838: [[2.1,BondType.Single]], 1899: [[1.68,BondType.Double],[1.72,BondType.Single]], 2380: [[2.34,BondType.Single]], 3356: [[2.44,BondType.Single]], 3662: [[2.11,BondType.Single]], 3747: [[2.36,BondType.Single]], 3749: [[2.6,BondType.Single]], 4672: [[2.75,BondType.Single]], 5724: [[2.73,BondType.Single]], 5921: [[2.63,BondType.Single]], 6476: [[2.84,BondType.Single]], 6705: [[2.87,BondType.Single]], 8964: [[2.81,BondType.Single]]};

    const DefaultBondingRadius = 2.001;
    
    const MetalsSet = (function() {
        const metals = ['LI', 'NA', 'K', 'RB', 'CS', 'FR', 'BE', 'MG', 'CA', 'SR', 'BA', 'RA','AL', 'GA', 'IN', 'SN', 'TL', 'PB', 'BI', 'SC', 'TI', 'V', 'CR', 'MN', 'FE', 'CO', 'NI', 'CU', 'ZN', 'Y', 'ZR', 'NB', 'MO', 'TC', 'RU', 'RH', 'PD', 'AG', 'CD', 'LA', 'HF', 'TA', 'W', 'RE', 'OS', 'IR', 'PT', 'AU', 'HG', 'AC', 'RF', 'DB', 'SG', 'BH', 'HS', 'MT', 'CE', 'PR', 'ND', 'PM', 'SM', 'EU', 'GD', 'TB', 'DY', 'HO', 'ER', 'TM', 'YB', 'LU', 'TH', 'PA', 'U', 'NP', 'PU', 'AM', 'CM', 'BK', 'CF', 'ES', 'FM', 'MD', 'NO', 'LR'];
        const set = Utils.FastSet.create<number>();
        for (const m of metals) {
            set.add(__ElementIndex[m]!);
        }
        return set;
    })();

    function pair(a: number, b: number) {
        if (a < b) return (a + b) * (a + b + 1) / 2 + b;
        else return (a + b) * (a + b + 1) / 2 + a;
    }


    function idx(e: string) {
        const i = __ElementIndex[e];
        if (i === void 0) return -1;
        return i;
    }

    function bondingRadius(i: number) {
        return __ElementBondingRadii[i] || DefaultBondingRadius;
    }

    const __empty: number[][] = [];
    function pairThresholds(i: number, j: number) {
        if (i < 0 || j < 0) return __empty;
        const r = __ElementPairThresholds[pair(i, j)];
        if (r === void 0) return __empty;
        return r;
    }

    const __defaultThresholds: number[][] = [[DefaultBondingRadius, BondType.Single]];
    function thresholds(i: number) {
        if (i < 0) return __defaultThresholds;
        const r = __ElementBondThresholds[i];
        if (r === void 0) return __defaultThresholds;
        return r;
    }

    const H_ID = __ElementIndex['H']!;
    function isHydrogen(i: number) {
        return i === H_ID;
    }

    function isMetal(e: string) {
        const i = __ElementIndex[e];
        if (i === void 0) return false;
        return MetalsSet.has(i);
    }

    function bondsFromInput(model: Molecule.Model, atomIndices: number[]): BondTable {
        const bonds = model.data.bonds.input!;
        if (atomIndices.length === model.data.atoms.count) return bonds;

        const mask = Query.Context.Mask.ofIndices(model, atomIndices);
        const { atomAIndex: a, atomBIndex: b, type: t } = bonds;
        let count = 0;
        for (let i = 0, __i = bonds.count; i < __i; i++) {
            if (!mask.has(a[i]) || !mask.has(b[i])) continue;
            count++;
        }

        const ret = Utils.DataTable.ofDefinition(Tables.Bonds, count);
        const { atomAIndex, atomBIndex, type } = ret;
        const { elementSymbol } = model.data.atoms;
        let offset = 0;
        for (let i = 0, __i = bonds.count; i < __i; i++) {
            const u = a[i], v = b[i];
            if (!mask.has(u) || !mask.has(v)) continue;
            atomAIndex[offset] = u;
            atomBIndex[offset] = v;
            const metal = isMetal(elementSymbol[u]) || isMetal(elementSymbol[v]);
            type[offset] = metal ? BondType.Metallic : t[i];
            offset++;
        }
        return ret;
    }

    type ComputeState = {
        model: Molecule.Model,
        mask: Query.Context.Mask,
        atomA: Utils.ChunkedArray<number>,
        atomB: Utils.ChunkedArray<number>,
        type: Utils.ChunkedArray<BondType>,
    }
    
    const ChunkedAdd = Utils.ChunkedArray.add;

    function addComponentBonds({ model, mask, atomA, atomB, type }: ComputeState, rI: number) {
        const { atomStartIndex, atomEndIndex, name: residueName } = model.data.residues;
        const { name: atomName, altLoc, elementSymbol } = model.data.atoms;
        const map = model.data.bonds.component!.entries.get(residueName[rI])!.map;
        const start = atomStartIndex[rI], end = atomEndIndex[rI];

        for (let i = start; i < end - 1; i++) {
            if (!mask.has(i)) continue;

            const pairs = map.get(atomName[i]);
            if (!pairs) continue;

            const altA = altLoc[i];

            for (let j = i + 1; j < end; j++) {
                if (!mask.has(j)) continue;
                
                const altB = altLoc[j];
                if (altA && altB && altA !== altB) continue;

                const order = pairs.get(atomName[j]);
                if (order === void 0) continue;

                const metal = isMetal(elementSymbol[i]) || isMetal(elementSymbol[j]);
                ChunkedAdd(atomA, i);
                ChunkedAdd(atomB, j);
                ChunkedAdd(type, metal ? BondType.Metallic : order);
            }
        }
    }

    function _computeBonds(model: Molecule.Model, atomIndices: number[], params: BondComputationParameters): BondTable {
        const MAX_RADIUS = 3;

        const { /*structConn,*/ component } = model.data.bonds;
        const { x, y, z } = model.positions;
        const { elementSymbol, residueIndex, altLoc } = model.data.atoms;
        const { name: residueName } = model.data.residues;
        const query3d = model.queryContext.lookup3d(MAX_RADIUS);

        const atomA = Utils.ChunkedArray.create<number>(size => new Int32Array(size), (atomIndices.length * 1.33) | 0, 1);
        const atomB = Utils.ChunkedArray.create<number>(size => new Int32Array(size), (atomIndices.length * 1.33) | 0, 1);
        const type = Utils.ChunkedArray.create<BondType>(size => new Uint8Array(size), (atomIndices.length * 1.33) | 0, 1);

        const mask = Query.Context.Mask.ofIndices(model, atomIndices);
        const state: ComputeState = { model, mask, atomA, atomB, type };

        let lastResidue = -1;
        let hasComponent = false;
        for (const aI of atomIndices) {
            const raI = residueIndex[aI];
            
            if (!params.forceCompute && raI !== lastResidue) {
                hasComponent = !!component && component.entries.has(residueName[raI]);
                if (hasComponent) {
                    addComponentBonds(state, raI);
                }
            }
            lastResidue = raI;

            const aeI = idx(elementSymbol[aI]);

            const bondingRadiusA = bondingRadius(aeI);
            const { elements, count, squaredDistances } = query3d(x[aI], y[aI], z[aI], MAX_RADIUS);
            const isHa = isHydrogen(aeI);
            const thresholdsA = thresholds(aeI);
            const altA = altLoc[aI];

            for (let ni = 0; ni < count; ni++) {
                const bI = elements[ni];
                if (bI <= aI || !mask.has(bI)) continue;

                const altB = altLoc[bI];
                if (altA && altB && altA !== altB) continue;

                const beI = idx(elementSymbol[bI]);
                const rbI = residueIndex[bI];
                if (raI === rbI && hasComponent) continue;

                const isHb = isHydrogen(beI);
                if (isHa && isHb) continue;

                const dist = Math.sqrt(squaredDistances[ni]);    
                if (dist === 0) continue;

                if (isHa || isHb) {
                    if (dist < params.maxHbondLength) {
                        ChunkedAdd(atomA, aI);
                        ChunkedAdd(atomB, bI);
                        ChunkedAdd(type, BondType.Single);
                    }
                    continue;
                }

                const pairedThresholds = pairThresholds(aeI, beI);
                const elemThresholds = pairedThresholds.length > 0
                    ? pairedThresholds
                    : beI < 0 || bondingRadiusA > bondingRadius(beI) ? thresholdsA : thresholds(beI);
                
                for (const t of elemThresholds) {
                    if (t[0] >= dist) {
                        ChunkedAdd(atomA, aI);
                        ChunkedAdd(atomB, bI);
                        ChunkedAdd(type, t[1]);
                        break;
                    }
                }
            }
        }

        const ret = Utils.DataTable.builder<Bond>(atomA.elementCount);
        ret.addRawColumn('atomAIndex', s => new Int32Array(s) as any as number[], Utils.ChunkedArray.compact(atomA));
        ret.addRawColumn('atomBIndex', s => new Int32Array(s) as any as number[], Utils.ChunkedArray.compact(atomB));
        ret.addRawColumn('type', s => new Uint8Array(s) as any as number[], Utils.ChunkedArray.compact(type));
        const dataTable = ret.seal();

        return dataTable;
    }

    export function computeBonds(model: Molecule.Model, atomIndices: number[], params?: Partial<BondComputationParameters>) {        
        if (model.data.bonds.input) return bondsFromInput(model, atomIndices);
        return _computeBonds(model, atomIndices, { 
            maxHbondLength: (params && params.maxHbondLength) || 1.15,
            forceCompute: !!(params && params.forceCompute),
        });
    }
}