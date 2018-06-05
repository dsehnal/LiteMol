/// <reference types="react" />
declare namespace LiteMol.Viewer {
    var VERSION: {
        number: string;
        date: string;
    };
}
declare namespace LiteMol.Viewer.DataSources {
    import Bootstrap = LiteMol.Bootstrap;
    import Entity = Bootstrap.Entity;
    const DownloadMolecule: Bootstrap.Tree.Transformer<Entity.Root, Entity.Action, Entity.Transformer.Molecule.DownloadMoleculeSourceParams>;
    type ObtainDownloadSource = {
        kind: 'CoordinateServer';
        id: string;
        type: 'Cartoon' | 'Full';
        lowPrecisionCoords: boolean;
        serverUrl: string;
    } | {
        kind: 'PDBe Updated mmCIF';
        id: string;
    } | {
        kind: 'URL';
        format: Core.Formats.FormatInfo;
        url: string;
    } | {
        kind: 'File on Disk';
        file?: File;
    };
    const ObtainDownloadSources: ObtainDownloadSource['kind'][];
    interface MoleculeDownloadParams {
        sourceKind: ObtainDownloadSource['kind'];
        sources: {
            [kind: string]: ObtainDownloadSource;
        };
    }
    const ObtainMolecule: Bootstrap.Tree.Transformer<Entity.Root, Entity.Action, MoleculeDownloadParams>;
}
declare namespace LiteMol.Viewer.ValidatorDB {
    import Entity = Bootstrap.Entity;
    interface Report extends Entity<Entity.Behaviour.Props<Interactivity.Behaviour>> {
    }
    const Report: Entity.Type<Entity.Behaviour.Props<Interactivity.Behaviour>>;
    namespace Api {
        type Report = {
            get(authAsymId: string): undefined | {
                get(authSeqNumber: number): undefined | {
                    flags: string[];
                    isRed: boolean;
                    chiralityMismatches: {
                        has(atomName: string): boolean;
                    };
                };
            };
        };
        function createReport(data: any): Report;
    }
    namespace Interactivity {
        class Behaviour implements Bootstrap.Behaviour.Dynamic {
            context: Bootstrap.Context;
            report: Api.Report;
            private provider;
            dispose(): void;
            register(behaviour: any): void;
            private getChainId;
            private processInfo;
            constructor(context: Bootstrap.Context, report: Api.Report);
        }
    }
    const DownloadAndCreate: Bootstrap.Tree.Transformer<Entity.Molecule.Molecule, Entity.Action, {
        reportRef?: string | undefined;
    }>;
    const ApplyTheme: Bootstrap.Tree.Transformer<Report, Entity.Action, {}>;
}
declare namespace LiteMol.Extensions.DensityStreaming {
    type FieldSource = 'X-ray' | 'EM';
    type DataType = 'EM' | '2FO-FC' | 'FO-FC';
    type FieldType = '2Fo-Fc' | 'Fo-Fc(-ve)' | 'Fo-Fc(+ve)' | 'EM';
    const FieldSources: FieldSource[];
    interface SetupParams {
        server: string;
        id: string;
        source: FieldSource;
        initialStreamingParams?: Partial<CreateStreamingParams>;
        streamingEntityRef?: string;
    }
    type CreateStreamingParams = {
        readonly maxRadius: number;
        readonly server: string;
        readonly source: FieldSource;
        readonly id: string;
        readonly header: ServerDataFormat.Header;
        displayType: CreateStreamingParams.DisplayTypeKind;
        detailLevel: number;
        radius: number;
        isoValueType: Bootstrap.Visualization.Density.IsoValueType;
        isoValues: {
            [F in FieldType]?: number;
        };
        showEverythingExtent: number;
        forceBox?: boolean;
    } & {
        [F in FieldType]?: Bootstrap.Visualization.Density.Style;
    };
    namespace CreateStreamingParams {
        type DisplayTypeKind = 'Everything' | 'Around Selection';
    }
    namespace ServerDataFormat {
        type ValueType = 'float32' | 'int8';
        namespace ValueType {
            const Float32: ValueType;
            const Int8: ValueType;
        }
        type ValueArray = Float32Array | Int8Array;
        type DetailLevel = {
            precision: number;
            maxVoxels: number;
        };
        interface Spacegroup {
            number: number;
            size: number[];
            angles: number[];
            /** Determine if the data should be treated as periodic or not. (e.g. X-ray = periodic, EM = not periodic) */
            isPeriodic: boolean;
        }
        interface ValuesInfo {
            mean: number;
            sigma: number;
            min: number;
            max: number;
        }
        interface Sampling {
            byteOffset: number;
            /** How many values along each axis were collapsed into 1 */
            rate: number;
            valuesInfo: ValuesInfo[];
            /** Number of samples along each axis, in axisOrder  */
            sampleCount: number[];
        }
        interface Header {
            /** Format version number  */
            formatVersion: string;
            /** Axis order from the slowest to fastest moving, same as in CCP4 */
            axisOrder: number[];
            /** Origin in fractional coordinates, in axisOrder */
            origin: number[];
            /** Dimensions in fractional coordinates, in axisOrder */
            dimensions: number[];
            spacegroup: Spacegroup;
            channels: string[];
            /** Determines the data type of the values */
            valueType: ValueType;
            /** The value are stored in blockSize^3 cubes */
            blockSize: number;
            sampling: Sampling[];
            /** Precision data the server can show. */
            availablePrecisions: DetailLevel[];
            isAvailable: boolean;
        }
    }
}
declare namespace LiteMol.Extensions.DensityStreaming {
    import Entity = Bootstrap.Entity;
    import Tree = Bootstrap.Tree;
    interface Streaming extends Entity<Entity.Behaviour.Props<Behaviour>> {
    }
    const Streaming: Entity.Type<Entity.Behaviour.Props<Behaviour>>;
    const CreateStreaming: Tree.Transformer<Entity.Molecule.Molecule, Streaming, CreateStreamingParams>;
    const Setup: Tree.Transformer<Entity.Molecule.Molecule, Entity.Action, SetupParams>;
}
declare namespace LiteMol.Extensions.DensityStreaming {
    import Entity = Bootstrap.Entity;
    class Behaviour implements Bootstrap.Behaviour.Dynamic {
        context: Bootstrap.Context;
        params: CreateStreamingParams;
        private obs;
        private server;
        private behaviour;
        private groups;
        private download;
        private selectionBox;
        private modelBoundingBox;
        private channels;
        private cache;
        private performance;
        private wasCached;
        private types;
        private areBoxesSame;
        private getModelBoundingBox;
        private stop;
        private remove;
        private clear;
        private groupDone;
        private checkResult;
        private apply;
        private finish;
        private createXray;
        private createEm;
        private extendSelectionBox;
        private isSameMolecule;
        private static getChannel;
        private noChannels;
        private parseChannels;
        private query;
        private tryUpdateSelectionDataBox;
        private update;
        private toSigma;
        private syncStyles;
        private updateVisual;
        private invalidateStyles;
        invalidateParams(newParams: CreateStreamingParams): Promise<void>;
        dispose(): void;
        register(behaviour: Entity.Behaviour.Any): void;
        constructor(context: Bootstrap.Context, params: CreateStreamingParams);
    }
}
declare namespace LiteMol.Extensions.DensityStreaming {
    class CreateView extends LiteMol.Plugin.Views.Transform.ControllerBase<Bootstrap.Components.Transform.Controller<SetupParams>> {
        protected renderControls(): JSX.Element;
    }
    const IsoInfo: {
        [F in FieldType]: {
            min: number;
            max: number;
            dataKey: DataType;
        };
    };
    class StreamingView extends LiteMol.Plugin.Views.Transform.ControllerBase<Bootstrap.Components.Transform.DensityVisual<CreateStreamingParams, FieldType>> {
        private updateIso;
        private iso;
        private style;
        private details;
        private updateValueType;
        private displayType;
        protected renderControls(): JSX.Element;
    }
}
declare namespace LiteMol.Extensions.ComplexReprensetation.Carbohydrates.Shapes {
    import Geom = LiteMol.Core.Geometry;
    import Model = Core.Structure.Molecule.Model;
    const Sphere: Geom.Surface;
    const Cube: Geom.Surface;
    const Diamond: Geom.Surface;
    const Cone: Geom.Surface;
    const ConeLeft: Geom.Surface;
    const ConeRight: Geom.Surface;
    const Star: Geom.Surface;
    const FlatRectangle: Geom.Surface;
    const FlatDiamond: Geom.Surface;
    const FlatPentagon: Geom.Surface;
    const FlatHexagon: Geom.Surface;
    function stripe(s: Geom.Surface): Geom.Surface[];
    function split(s: Geom.Surface): Geom.Surface[];
    function makeTransform(model: Model, entry: Entry, radiusFactor: number, type: Params['type']): {
        scale: number[];
        rotation: number[];
        translation: number[];
    };
}
declare namespace LiteMol.Extensions.ComplexReprensetation.Carbohydrates.Mapping {
    interface RepresentationEntry {
        instanceName: string;
        name: string;
        shape: Core.Geometry.Surface[];
        color: Visualization.Color[];
        axisUp: number[];
        axisSide: number[];
    }
    const RingNames: {
        __len: number;
        [n: string]: number;
    }[];
    function isResidueRepresentable(name: string): boolean;
    function getResidueRepresentation(name: string): RepresentationEntry | undefined;
}
declare namespace LiteMol.Extensions.ComplexReprensetation.Carbohydrates {
    import Struct = Core.Structure;
    import Model = Struct.Molecule.Model;
    import LA = Core.Geometry.LinearAlgebra;
    import Entity = Bootstrap.Entity;
    import Tree = Bootstrap.Tree;
    type RepresentationType = 'Icons' | 'Reduced' | 'Hydbrid';
    interface Link {
        type: 'Carbohydrate' | 'Terminal';
        rA: number;
        rB: number;
        atomA: number;
        atomB: number;
        centerA: LA.Vector3;
        centerB: LA.Vector3;
        bondType: Struct.BondType;
    }
    interface Entry {
        representation: Mapping.RepresentationEntry;
        ringCenter: LA.Vector3;
        ringRadius: number;
        ringAtoms: number[];
        links: Link[];
        terminalLinks: Link[];
    }
    interface Info {
        links: Link[];
        map: Core.Utils.FastMap<number, number>;
        entries: Entry[];
        carbohydrateIndices: number[];
        terminalIndices: number[];
        warnings: string[];
    }
    type FullParams = {
        type: 'Full';
        fullSize: 'Small' | 'Medium' | 'Large';
        showTerminalLinks: boolean;
        showTerminalAtoms: boolean;
        linkColor: Visualization.Color;
    };
    type IconsParams = {
        type: 'Icons';
        iconScale: number;
    };
    type Params = FullParams | IconsParams;
    const Types: Params['type'][];
    const FullSizes: FullParams['fullSize'][];
    const DefaultIconsParams: Params;
    const DefaultFullParams: Params;
    type Tags = {
        type: 'CarbohydrateRepresentation';
        colors: Core.Utils.FastMap<number, Visualization.Color>;
    };
    type Tag = {
        type: 'Link';
        link: Link;
    } | {
        type: 'Residue';
        instanceName: string;
        residueIndex: number;
        model: Model;
    } | {
        type: 'Terminal';
        residueIndex: number;
        model: Model;
    };
    function isRepresentable(model: Model, residueIndices: number[]): boolean;
    namespace Transforms {
        interface CarbohydratesInfo extends Entity<{
            info: Info;
        }> {
        }
        const CarbohydratesInfo: Entity.Type<{
            info: Info;
        }>;
        const CreateInfo: Tree.Transformer<Entity.Molecule.Model, CarbohydratesInfo, {
            info: Info;
        }>;
        const CreateVisual: Tree.Transformer<CarbohydratesInfo, Entity.Molecule.Visual, Params>;
    }
    function EmptyInfo(warnings: string[]): Info;
    function getInfo(params: {
        model: Model;
        fragment: Struct.Query.Fragment;
        atomMask: Core.Utils.Mask;
        bonds: Struct.BondTable;
    }): Info;
    function getRepresentation(model: Model, info: Info, params: Params): {
        surface: Core.Computation<Core.Geometry.Surface>;
        mapper: (pickId: number) => number[] | undefined;
        tags: Tags;
        theme: Visualization.Theme;
    };
}
declare namespace LiteMol.Extensions.ComplexReprensetation.Carbohydrates {
    function formatResidueName(model: Core.Structure.Molecule.Model, r: number): string;
    function HighlightCustomElementsBehaviour(context: Bootstrap.Context): void;
}
declare namespace LiteMol.Extensions.ComplexReprensetation {
    import Model = Core.Structure.Molecule.Model;
    import S = Core.Structure;
    import Q = S.Query;
    interface Info {
        sequence: {
            all: number[];
            interacting: number[];
            modified: number[];
        };
        het: {
            carbohydrates: Carbohydrates.Info;
            other: number[];
        };
        freeWaterAtoms: number[];
    }
    function createComplexRepresentation(computation: Core.Computation.Context, model: Model, queryCtx: Q.Context): Promise<Info>;
}
declare namespace LiteMol.Extensions.ComplexReprensetation.Transforms {
    import Entity = Bootstrap.Entity;
    import Tree = Bootstrap.Tree;
    interface ComplexInfo extends Entity<{
        info: Info;
    }> {
    }
    const ComplexInfo: Entity.Type<{
        info: Info;
    }>;
    const CreateComplexInfo: Tree.Transformer<Bootstrap.Visualization.Molecule.Source, ComplexInfo, {}>;
    const CreateVisual: Tree.Transformer<ComplexInfo, Entity.Action, {}>;
    let SuppressCreateVisualWhenModelIsAdded: boolean;
    function CreateRepresentationWhenModelIsAddedBehaviour(context: Bootstrap.Context): void;
}
declare namespace LiteMol.Extensions.ComplexReprensetation.Carbohydrates.UI {
    class CreateVisual extends LiteMol.Plugin.Views.Transform.ControllerBase<Bootstrap.Components.Transform.Controller<Params>> {
        private updateVisual;
        renderControls(): JSX.Element;
    }
}
declare namespace LiteMol.Extensions.ParticleColoring {
    import Tree = Bootstrap.Tree;
    import Entity = Bootstrap.Entity;
    interface Params {
        min: number;
        max: number;
        steps: number;
        opacity: number;
    }
    interface DistanceInfo {
        min: number;
        max: number;
        distances: Float32Array;
    }
    interface Coloring extends Entity<{
        info: DistanceInfo;
    }> {
    }
    const Coloring: Entity.Type<{
        info: DistanceInfo;
    }>;
    const Apply: Tree.Transformer<Entity.Molecule.Visual, Coloring, Params>;
    function makeRainbow(steps: number): Visualization.Color[];
}
declare namespace LiteMol.Extensions.ParticleColoring.UI {
    class Apply extends LiteMol.Plugin.Views.Transform.ControllerBase<Bootstrap.Components.Transform.Controller<Params>> {
        private rainbow;
        renderControls(): JSX.Element;
    }
}
declare namespace LiteMol.Extensions.RNALoops {
    class CreateLoopAnnotationView extends LiteMol.Plugin.Views.Transform.ControllerBase<Bootstrap.Components.Transform.Controller<DownloadAndCreateProps>> {
        protected renderControls(): JSX.Element;
    }
}
declare namespace LiteMol.Extensions.RNALoops {
    import Entity = Bootstrap.Entity;
    interface LoopAnnotation extends Entity<Entity.Behaviour.Props<Interactivity.Behaviour>> {
    }
    const LoopAnnotation: Entity.Type<Entity.Behaviour.Props<Interactivity.Behaviour>>;
    namespace Api {
        interface ResidueRef {
            modelId: string;
            authAsymId: string;
            authSeqNumber: number;
            insCode: string;
        }
        interface Entry {
            id: string;
            type: 'IL' | 'HL' | 'J3';
            residues: ResidueRef[];
        }
        interface Annotation {
            [modelId: string]: {
                [chainId: string]: {
                    [resSeqNumber: number]: {
                        [insCode: string]: Entry[];
                    };
                };
            };
        }
        function parseCSV(data: string): Entry[];
        function create(entries: Entry[]): Annotation;
        function getEntries(annotation: Annotation, modelId: string, asymId: string, seqNumber: number, insCode: string): Entry[] | undefined;
    }
    namespace Interactivity {
        class Behaviour implements Bootstrap.Behaviour.Dynamic {
            context: Bootstrap.Context;
            annotation: Api.Annotation;
            private provider;
            dispose(): void;
            register(behaviour: any): void;
            private processInfo;
            constructor(context: Bootstrap.Context, annotation: Api.Annotation);
        }
    }
    interface DownloadAndCreateProps {
        server: string;
        reportRef?: string;
    }
    const DownloadAndCreate: Bootstrap.Tree.Transformer<Entity.Molecule.Molecule, Entity.Action, DownloadAndCreateProps>;
    const ApplyTheme: Bootstrap.Tree.Transformer<LoopAnnotation, Entity.Action, {}>;
}
declare namespace LiteMol.Viewer.PDBe.Data {
    import Bootstrap = LiteMol.Bootstrap;
    import Entity = Bootstrap.Entity;
    import Transformer = Bootstrap.Entity.Transformer;
    const DownloadMolecule: Bootstrap.Tree.Transformer<Entity.Root, Entity.Action, Transformer.Molecule.DownloadMoleculeSourceParams>;
    interface DownloadBinaryCIFFromCoordinateServerParams {
        id?: string;
        type?: 'Cartoon' | 'Full';
        lowPrecisionCoords?: boolean;
        serverUrl?: string;
    }
    const DownloadBinaryCIFFromCoordinateServer: Bootstrap.Tree.Transformer<Entity.Root, Entity.Action, DownloadBinaryCIFFromCoordinateServerParams>;
}
declare namespace LiteMol.Viewer.PDBe.Data {
    import Bootstrap = LiteMol.Bootstrap;
    import Entity = Bootstrap.Entity;
    import Tree = Bootstrap.Tree;
    const DensitySourceLabels: {
        'electron-density': string;
        'emdb-pdbid': string;
        'emdb-id': string;
    };
    const DensitySources: (keyof typeof DensitySourceLabels)[];
    interface DownloadDensityParams {
        /**
         * Default source is 'electron-density'
         */
        sourceId?: keyof typeof DensitySourceLabels;
        id?: string | {
            [sourceId: string]: string;
        };
    }
    interface DensityActionContext {
        id: string;
        refs: string[];
        groupRef?: string;
    }
    const DownloadDensity: Tree.Transformer<Entity.Root, Entity.Action, DownloadDensityParams>;
}
declare namespace LiteMol.Viewer.PDBe.Validation {
    import Entity = Bootstrap.Entity;
    interface Report extends Entity<Entity.Behaviour.Props<Interactivity.Behaviour>> {
    }
    const Report: Entity.Type<Entity.Behaviour.Props<Interactivity.Behaviour>>;
    namespace Api {
        function getResidueId(seqNumber: number, insCode: string | null): string;
        function getEntry(report: any, modelId: string, entity: string, asymId: string, residueId: string): any;
        function createReport(data: any): any;
    }
    namespace Interactivity {
        class Behaviour implements Bootstrap.Behaviour.Dynamic {
            context: Bootstrap.Context;
            report: any;
            private provider;
            dispose(): void;
            register(behaviour: any): void;
            private processInfo;
            constructor(context: Bootstrap.Context, report: any);
        }
    }
    const DownloadAndCreate: Bootstrap.Tree.Transformer<Entity.Molecule.Molecule, Entity.Action, {
        reportRef?: string | undefined;
    }>;
    const ApplyTheme: Bootstrap.Tree.Transformer<Report, Entity.Action, {}>;
}
declare namespace LiteMol.Viewer.PDBe.SequenceAnnotation {
    import Entity = Bootstrap.Entity;
    import Query = LiteMol.Core.Structure.Query;
    interface Annotations extends Entity<{
        data: any;
    }> {
    }
    const Annotations: Entity.Type<{
        data: any;
    }>;
    interface Annotation extends Entity<{
        query: Query.Source;
        color: Visualization.Color;
    }> {
    }
    const Annotation: Entity.Type<{
        query: Query.Source;
        color: Visualization.Color;
    }>;
    interface Behaviour extends Entity<Entity.Behaviour.Props<Interactivity.Behaviour>> {
    }
    const Behaviour: Entity.Type<Entity.Behaviour.Props<Interactivity.Behaviour>>;
    namespace Interactivity {
        class Behaviour implements Bootstrap.Behaviour.Dynamic {
            context: Bootstrap.Context;
            private node;
            private current;
            private subs;
            private toHighlight;
            private isHighlightOn;
            dispose(): void;
            register(behaviour: Entity.Behaviour.Any): void;
            private __highlight;
            readonly molecule: Entity.Molecule.Molecule | undefined;
            private resetTheme;
            private getCached;
            private setCached;
            private highlight;
            private focus;
            private apply;
            private update;
            constructor(context: Bootstrap.Context);
        }
    }
    interface CreateSingleProps {
        id?: string;
        data?: any;
        color?: Visualization.Color;
    }
    const CreateSingle: Bootstrap.Tree.Transformer<Entity.Group, Annotation, CreateSingleProps>;
    const DownloadAndCreate: Bootstrap.Tree.Transformer<Entity.Molecule.Molecule, Entity.Action, {}>;
}
declare namespace LiteMol.Viewer.PDBe.Views {
    class CreateSequenceAnnotationView extends LiteMol.Plugin.Views.Transform.ControllerBase<Bootstrap.Components.Transform.Controller<SequenceAnnotation.CreateSingleProps>> {
        protected renderControls(): JSX.Element;
    }
    class DownloadBinaryCIFFromCoordinateServerView extends LiteMol.Plugin.Views.Transform.ControllerBase<Bootstrap.Components.Transform.Controller<Data.DownloadBinaryCIFFromCoordinateServerParams>> {
        protected renderControls(): JSX.Element;
    }
    class DownloadDensityView extends LiteMol.Plugin.Views.Transform.ControllerBase<Bootstrap.Components.Transform.Controller<Data.DownloadDensityParams>> {
        private getId;
        private updateId;
        protected renderControls(): JSX.Element;
    }
}
declare namespace LiteMol.Viewer.Views {
    class LoadExample extends LiteMol.Plugin.Views.Transform.ControllerBase<Bootstrap.Components.Transform.Controller<Viewer.Examples.LoadExampleParams>> {
        protected renderControls(): JSX.Element;
    }
    class ObtainDownload extends LiteMol.Plugin.Views.Transform.ControllerBase<Bootstrap.Components.Transform.Controller<DataSources.MoleculeDownloadParams>> {
        private updateSourceParams;
        private coordServer;
        private PDBe;
        private url;
        private file;
        protected renderControls(): JSX.Element;
    }
}
declare namespace LiteMol.Viewer.Examples {
    const ExampleMap: {
        [name: string]: {
            name: string;
            provider: (plugin: Plugin.Controller) => void;
        };
    };
    const ExampleIds: string[];
    interface LoadExampleParams {
        exampleId: string;
    }
    const LoadExample: Bootstrap.Tree.Transformer<Bootstrap.Entity.Root, Bootstrap.Entity.Action, LoadExampleParams>;
}
declare namespace LiteMol.Viewer {
    const PluginSpec: Plugin.Specification;
}
declare namespace LiteMol.Viewer {
    function createInstance(target: HTMLElement, layoutState: Bootstrap.Components.LayoutState, ignoreUrlParams?: boolean): Plugin.Controller | undefined;
}
