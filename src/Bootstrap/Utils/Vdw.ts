/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Bootstrap.Utils {
    "use strict";


    let VDWRadii: Core.Utils.FastMap<string, number> = <any>void 0;
    export function vdwRadiusFromElementSymbol(model: Core.Structure.Molecule.Model) {
        if (!VDWRadii) VDWRadii = createVdwRadii();        
        return function (names: string[], radii: Core.Utils.FastMap<string, number> ) {
            return function (i: number) {
                let r = radii.get(names[i]);
                if (r !== void 0) return r;
                return 1.0;
            }
        } (model.data.atoms.elementSymbol, VDWRadii);
    }

    function createVdwRadii() {
        var vdwRadii: any = {
            "H": 1.1,
            "He": 1.4,
            "Li": 1.81,
            "Be": 1.53,
            "B": 1.92,
            "C": 1.7,
            "N": 1.55,
            "O": 1.52,
            "F": 1.47,
            "Ne": 1.54,
            "Na": 2.27,
            "Mg": 1.73,
            "Al": 1.84,
            "Si": 2.1,
            "P": 1.8,
            "S": 1.8,
            "Cl": 1.75,
            "Ar": 1.88,
            "K": 2.75,
            "Ca": 2.31,
            "Sc": 2.16,
            "Ti": 1.87,
            "V": 1.79,
            "Cr": 1.89,
            "Mn": 1.97,
            "Fe": 1.94,
            "Co": 1.92,
            "Ni": 1.84,
            "Cu": 1.86,
            "Zn": 2.1,
            "Ga": 1.87,
            "Ge": 2.11,
            "As": 1.85,
            "Se": 1.9,
            "Br": 1.83,
            "Kr": 2.02,
            "Rb": 3.03,
            "Sr": 2.49,
            "Y": 2.19,
            "Zr": 1.86,
            "Nb": 2.07,
            "Mo": 2.09,
            "Tc": 2.09,
            "Ru": 2.07,
            "Rh": 1.95,
            "Pd": 2.02,
            "Ag": 2.03,
            "Cd": 2.3,
            "In": 1.93,
            "Sn": 2.17,
            "Sb": 2.06,
            "Te": 2.06,
            "I": 1.98,
            "Xe": 2.16,
            "Cs": 3.43,
            "Ba": 2.68,
            "La": 2.4,
            "Ce": 2.35,
            "Pr": 2.39,
            "Nd": 2.29,
            "Pm": 2.36,
            "Sm": 2.29,
            "Eu": 2.33,
            "Gd": 2.37,
            "Tb": 2.21,
            "Dy": 2.29,
            "Ho": 2.16,
            "Er": 2.35,
            "Tm": 2.27,
            "Yb": 2.42,
            "Lu": 2.21,
            "Hf": 2.12,
            "Ta": 2.17,
            "W": 2.1,
            "Re": 2.17,
            "Os": 2.16,
            "Ir": 2.02,
            "Pt": 2.09,
            "Au": 2.17,
            "Hg": 2.09,
            "Tl": 1.96,
            "Pb": 2.02,
            "Bi": 2.07,
            "Po": 1.97,
            "At": 2.02,
            "Rn": 2.2,
            "Fr": 3.48,
            "Ra": 2.83,
            "Ac": 2.6,
            "Th": 2.37,
            "Pa": 2.43,
            "U": 2.4,
            "Np": 2.21,
            "Pu": 2.43,
            "Am": 2.44,
            "Cm": 2.45,
            "Bk": 2.44,
            "Cf": 2.45,
            "Es": 2.45,
            "Fm": 2.45,
            "Md": 2.46,
            "No": 2.46,
            "Lr": 2.46,
            }

        var ret = Core.Utils.FastMap.create<string, number>();
        for (let e in vdwRadii) {
            ret.set(e, vdwRadii[e]);
            ret.set(e.toUpperCase(), vdwRadii[e]);
            ret.set(e.toLowerCase(), vdwRadii[e]);
        }

        return ret;
    };
}