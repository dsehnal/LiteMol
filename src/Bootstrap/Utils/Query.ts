/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Bootstrap.Utils.Query {
    "use strict";

    const residueIdRegex = /^\s*([1-9][0-9]*)\s+([_.;:""&<>()/\{}'`~!@#$%A-Za-z0-9*|+-]+)(?:\s+i[:]([.]|[a-zA-Z0-9]))?(?:\s+e[:]([.]|[a-zA-Z0-9]+))?/;

    function normalizeId(id: string) {
        if (!id || id === '.' || id === '?') return null;
        return id;
    }

    function getAuthResidueIdParams(id: string): Core.Structure.Query.ResidueIdSchema | undefined {
        let match = id.match(residueIdRegex);
        if (!match) return void 0;

        let authSeqNumber = +match[1] | 0;
        let authAsymId = normalizeId(match[2])!;
        let insCode = normalizeId(match[3]);
        let entityId = normalizeId(match[4])!;

        return { entityId, authSeqNumber, authAsymId, insCode }; 

    }
    
    export function parseAuthResidueId(ids: string, separator = ',') {
        let parts = ids.split(separator).map(p => getAuthResidueIdParams(p)).filter(p => !!p) as Core.Structure.Query.ResidueIdSchema[];

        return Core.Structure.Query.Builder.toQuery(Core.Structure.Query.residues(...parts));        
    }
}