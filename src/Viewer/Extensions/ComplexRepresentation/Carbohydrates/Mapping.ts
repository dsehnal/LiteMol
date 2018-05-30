/*
 * Copyright (c) 2017 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Extensions.ComplexReprensetation.Carbohydrates.Mapping {
    export interface RepresentationEntry {
        instanceName: string,
        name: string,
        shape: Core.Geometry.Surface[],
        color: Visualization.Color[],
        axisUp: number[],
        axisSide: number[]
    }

    export const RingNames: { __len: number, [n: string]: number }[] = [
        { __len: 6, 'C1': 0, 'C2': 1, 'C3': 2, 'C4': 3, 'C5': 4, 'O5': 5 },
        { __len: 6, 'C1': 0, 'C2': 1, 'C3': 2, 'C4': 3, 'C5': 4, 'O': 5 },
        { __len: 6, 'C2': 0, 'C3': 1, 'C4': 2, 'C5': 3, 'C6': 4, 'O6': 5 },
        { __len: 5, 'C1': 0, 'C2': 1, 'C3': 2, 'C4': 3, 'O4': 4 },
        { __len: 5, 'C1\'': 0, 'C2\'': 1, 'C3\'': 2, 'C4\'': 3, 'O4\'': 4 },
    ];

    const data = [  
        /* === Filled sphere  === */
        {
            shape: [Shapes.Sphere] /* Filled sphere  */,
            axisUp: [0, 0, 1],
            instances: [{
                name: 'Glc',
                common: { colorA: '#0090bc', names: ['GLC', 'BGC'] },
                charmm: { colorA: '#0090bc', names: ['AGLC', 'BGLC'] },
                glycam: { colorA: '#0090bc', names: ['0GA', '0GB', '1GA', '1GB', '2GA', '2GB', '3GA', '3GB', '4GA', '4GB', '6GA', '6GB', 'ZGA', 'ZGB', 'YGA', 'YGB', 'XGA', 'XGB', 'WGA', 'WGB', 'VGA', 'VGB', 'UGA', 'UGB', 'TGA', 'TGB', 'SGA', 'SGB', 'RGA', 'RGB', 'QGA', 'QGB', 'PGA', 'PGB', '0gA', '0gB', '1gA', '1gB', '2gA', '2gB', '3gA', '3gB', '4gA', '4gB', '6gA', '6gB', 'ZgA', 'ZgB', 'YgA', 'YgB', 'XgA', 'XgB', 'WgA', 'WgB', 'VgA', 'VgB', 'UgA', 'UgB', 'TgA', 'TgB', 'SgA', 'SgB', 'RgA', 'RgB', 'QgA', 'QgB', 'PgA', 'PgB'] },
            }, {
                name: 'Man',
                common: { colorA: '#00a651', names: ['MAN', 'BMA'] },
                charmm: { colorA: '#00a651', names: ['AMAN', 'BMAN'] },
                glycam: { colorA: '#00a651', names: ['0MA', '0MB', '1MA', '1MB', '2MA', '2MB', '3MA', '3MB', '4MA', '4MB', '6MA', '6MB', 'ZMA', 'ZMB', 'YMA', 'YMB', 'XMA', 'XMB', 'WMA', 'WMB', 'VMA', 'VMB', 'UMA', 'UMB', 'TMA', 'TMB', 'SMA', 'SMB', 'RMA', 'RMB', 'QMA', 'QMB', 'PMA', 'PMB', '0mA', '0mB', '1mA', '1mB', '2mA', '2mB', '3mA', '3mB', '4mA', '4mB', '6mA', '6mB', 'ZmA', 'ZmB', 'YmA', 'YmB', 'XmA', 'XmB', 'WmA', 'WmB', 'VmA', 'VmB', 'UmA', 'UmB', 'TmA', 'TmB', 'SmA', 'SmB', 'RmA', 'RmB', 'QmA', 'QmB', 'PmA', 'PmB'] },
            }, {
                name: 'Gal',
                common: { colorA: '#ffd400', names: ['GAL', 'GLA'] },
                charmm: { colorA: '#ffd400', names: ['AGAL', 'BGAL'] },
                glycam: { colorA: '#ffd400', names: ['0LA', '0LB', '1LA', '1LB', '2LA', '2LB', '3LA', '3LB', '4LA', '4LB', '6LA', '6LB', 'ZLA', 'ZLB', 'YLA', 'YLB', 'XLA', 'XLB', 'WLA', 'WLB', 'VLA', 'VLB', 'ULA', 'ULB', 'TLA', 'TLB', 'SLA', 'SLB', 'RLA', 'RLB', 'QLA', 'QLB', 'PLA', 'PLB', '0lA', '0lB', '1lA', '1lB', '2lA', '2lB', '3lA', '3lB', '4lA', '4lB', '6lA', '6lB', 'ZlA', 'ZlB', 'YlA', 'YlB', 'XlA', 'XlB', 'WlA', 'WlB', 'VlA', 'VlB', 'UlA', 'UlB', 'TlA', 'TlB', 'SlA', 'SlB', 'RlA', 'RlB', 'QlA', 'QlB', 'PlA', 'PlB'] },
            }, {
                name: 'Gul',
                common: { colorA: '#f47920', names: ['GUP', 'GL0'] },
                charmm: { colorA: '#f47920', names: ['AGUL', 'BGUL'] },
                glycam: { colorA: '#f47920', names: ['0KA', '0KB', '1KA', '1KB', '2KA', '2KB', '3KA', '3KB', '4KA', '4KB', '6KA', '6KB', 'ZKA', 'ZKB', 'YKA', 'YKB', 'XKA', 'XKB', 'WKA', 'WKB', 'VKA', 'VKB', 'UKA', 'UKB', 'TKA', 'TKB', 'SKA', 'SKB', 'RKA', 'RKB', 'QKA', 'QKB', 'PKA', 'PKB', '0kA', '0kB', '1kA', '1kB', '2kA', '2kB', '3kA', '3kB', '4kA', '4kB', '6kA', '6kB', 'ZkA', 'ZkB', 'YkA', 'YkB', 'XkA', 'XkB', 'WkA', 'WkB', 'VkA', 'VkB', 'UkA', 'UkB', 'TkA', 'TkB', 'SkA', 'SkB', 'RkA', 'RkB', 'QkA', 'QkB', 'PkA', 'PkB'] },
            }, {
                name: 'Alt',
                common: { colorA: '#f69ea1', names: ['ALT'] },
                charmm: { colorA: '#f69ea1', names: ['AALT', 'BALT'] },
                glycam: { colorA: '#f69ea1', names: ['0EA', '0EB', '1EA', '1EB', '2EA', '2EB', '3EA', '3EB', '4EA', '4EB', '6EA', '6EB', 'ZEA', 'ZEB', 'YEA', 'YEB', 'XEA', 'XEB', 'WEA', 'WEB', 'VEA', 'VEB', 'UEA', 'UEB', 'TEA', 'TEB', 'SEA', 'SEB', 'REA', 'REB', 'QEA', 'QEB', 'PEA', 'PEB', '0eA', '0eB', '1eA', '1eB', '2eA', '2eB', '3eA', '3eB', '4eA', '4eB', '6eA', '6eB', 'ZeA', 'ZeB', 'YeA', 'YeB', 'XeA', 'XeB', 'WeA', 'WeB', 'VeA', 'VeB', 'UeA', 'UeB', 'TeA', 'TeB', 'SeA', 'SeB', 'ReA', 'ReB', 'QeA', 'QeB', 'PeA', 'PeB'] },
            }, {
                name: 'All',
                common: { colorA: '#a54399', names: ['ALL', 'AFD'] },
                charmm: { colorA: '#a54399', names: ['AALL', 'BALL'] },
                glycam: { colorA: '#a54399', names: ['0NA', '0NB', '1NA', '1NB', '2NA', '2NB', '3NA', '3NB', '4NA', '4NB', '6NA', '6NB', 'ZNA', 'ZNB', 'YNA', 'YNB', 'XNA', 'XNB', 'WNA', 'WNB', 'VNA', 'VNB', 'UNA', 'UNB', 'TNA', 'TNB', 'SNA', 'SNB', 'RNA', 'RNB', 'QNA', 'QNB', 'PNA', 'PNB', '0nA', '0nB', '1nA', '1nB', '2nA', '2nB', '3nA', '3nB', '4nA', '4nB', '6nA', '6nB', 'ZnA', 'ZnB', 'YnA', 'YnB', 'XnA', 'XnB', 'WnA', 'WnB', 'VnA', 'VnB', 'UnA', 'UnB', 'TnA', 'TnB', 'SnA', 'SnB', 'RnA', 'RnB', 'QnA', 'QnB', 'PnA', 'PnB'] },
            }, {
                name: 'Tal',
                common: { colorA: '#8fcce9', names: ['TAL'] },
                charmm: { colorA: '#8fcce9', names: ['ATAL', 'BTAL'] },
                glycam: { colorA: '#8fcce9', names: ['0TA', '0TB', '1TA', '1TB', '2TA', '2TB', '3TA', '3TB', '4TA', '4TB', '6TA', '6TB', 'ZTA', 'ZTB', 'YTA', 'YTB', 'XTA', 'XTB', 'WTA', 'WTB', 'VTA', 'VTB', 'UTA', 'UTB', 'TTA', 'TTB', 'STA', 'STB', 'RTA', 'RTB', 'QTA', 'QTB', 'PTA', 'PTB', '0tA', '0tB', '1tA', '1tB', '2tA', '2tB', '3tA', '3tB', '4tA', '4tB', '6tA', '6tB', 'ZtA', 'ZtB', 'YtA', 'YtB', 'XtA', 'XtB', 'WtA', 'WtB', 'VtA', 'VtB', 'UtA', 'UtB', 'TtA', 'TtB', 'StA', 'StB', 'RtA', 'RtB', 'QtA', 'QtB', 'PtA', 'PtB'] },
            }, {
                name: 'Ido',
                common: { colorA: '#a17a4d', names: ['4N2'] },
                charmm: { colorA: '#a17a4d', names: ['AIDO', 'BIDO'] },
                glycam: { colorA: '#a17a4d', names: [] },
            }]
        },
        /* === Filled cube  === */
        {
            shape: [Shapes.Cube] /* Filled cube  */,
            axisUp: [0, 0, 1],
            instances: [{
                name: 'GlcNAc',
                common: { colorA: '#0090bc', names: ['NAG', 'NDG'] },
                charmm: { colorA: '#0090bc', names: ['AGLCNA', 'BGLCNA', 'BGLCN0'] },
                glycam: { colorA: '#0090bc', names: ['0YA', '0YB', '1YA', '1YB', '3YA', '3YB', '4YA', '4YB', '6YA', '6YB', 'WYA', 'WYB', 'VYA', 'VYB', 'UYA', 'UYB', 'QYA', 'QYB', '0yA', '0yB', '1yA', '1yB', '3yA', '3yB', '4yA', '4yB', '6yA', '6yB', 'WyA', 'WyB', 'VyA', 'VyB', 'UyA', 'UyB', 'QyA', 'QyB', '0YS', '0Ys', '3YS', '3Ys', '4YS', '4Ys', '6YS', '6Ys', 'QYS', 'QYs', 'UYS', 'UYs', 'VYS', 'VYs', 'WYS', 'WYs', '0yS', '0ys', '3yS', '3ys', '4yS', '4ys'] },
            }, {
                name: 'ManNAc',
                common: { colorA: '#00a651', names: ['BM3'] },
                charmm: { colorA: '#00a651', names: [] },
                glycam: { colorA: '#00a651', names: ['0WA', '0WB', '1WA', '1WB', '3WA', '3WB', '4WA', '4WB', '6WA', '6WB', 'WWA', 'WWB', 'VWA', 'VWB', 'UWA', 'UWB', 'QWA', 'QWB', '0wA', '0wB', '1wA', '1wB', '3wA', '3wB', '4wA', '4wB', '6wA', '6wB', 'WwA', 'WwB', 'VwA', 'VwB', 'UwA', 'UwB', 'QwA', 'QwB'] },
            }, {
                name: 'GalNAc',
                common: { colorA: '#ffd400', names: ['NGA', 'A2G'] },
                charmm: { colorA: '#ffd400', names: ['AGALNA', 'BGALNA'] },
                glycam: { colorA: '#ffd400', names: ['0VA', '0VB', '1VA', '1VB', '3VA', '3VB', '4VA', '4VB', '6VA', '6VB', 'WVA', 'WVB', 'VVA', 'VVB', 'UVA', 'UVB', 'QVA', 'QVB', '0vA', '0vB', '1vA', '1vB', '3vA', '3vB', '4vA', '4vB', '6vA', '6vB', 'WvA', 'WvB', 'VvA', 'VvB', 'UvA', 'UvB', 'QvA', 'QvB'] },
            }, {
                name: 'GulNAc',
                common: { colorA: '#f47920', names: [] },
                charmm: { colorA: '#f47920', names: [] },
                glycam: { colorA: '#f47920', names: [] },
            }, {
                name: 'AltNAc',
                common: { colorA: '#f69ea1', names: [] },
                charmm: { colorA: '#f69ea1', names: [] },
                glycam: { colorA: '#f69ea1', names: [] },
            }, {
                name: 'AllNAc',
                common: { colorA: '#a54399', names: ['NAA'] },
                charmm: { colorA: '#a54399', names: [] },
                glycam: { colorA: '#a54399', names: [] },
            }, {
                name: 'TalNAc',
                common: { colorA: '#8fcce9', names: [] },
                charmm: { colorA: '#8fcce9', names: [] },
                glycam: { colorA: '#8fcce9', names: [] },
            }, {
                name: 'IdoNAc',
                common: { colorA: '#a17a4d', names: ['HSQ'] },
                charmm: { colorA: '#a17a4d', names: [] },
                glycam: { colorA: '#a17a4d', names: [] },
            }]
        },
        /* === Crossed cube  === */
        {
            shape: Shapes.stripe(Shapes.Cube) /* Crossed cube  */,
            axisUp: [0, 0, 1],
            instances: [{
                name: 'GlcN',
                common: { colorA: '#0090bc', colorB: '#f1ece1', names: ['GCS', 'PA1'] },
                charmm: { colorA: '#0090bc', colorB: '#f1ece1', names: [] },
                glycam: { colorA: '#0090bc', colorB: '#f1ece1', names: ['0YN', '3YN', '4YN', '6YN', 'WYN', 'VYN', 'UYN', 'QYN', '3Yn', '4Yn', 'WYn', '0Yn', '0YP', '3YP', '4YP', '6YP', 'WYP', 'VYP', 'UYP', 'QYP', '0Yp', '3Yp', '4Yp', 'WYp'] },
            }, {
                name: 'ManN',
                common: { colorA: '#00a651', colorB: '#f1ece1', names: ['95Z'] },
                charmm: { colorA: '#00a651', colorB: '#f1ece1', names: [] },
                glycam: { colorA: '#00a651', colorB: '#f1ece1', names: [] },
            }, {
                name: 'GalN',
                common: { colorA: '#ffd400', colorB: '#f1ece1', names: ['X6X', '1GN'] },
                charmm: { colorA: '#ffd400', colorB: '#f1ece1', names: [] },
                glycam: { colorA: '#ffd400', colorB: '#f1ece1', names: [] },
            }, {
                name: 'GulN',
                common: { colorA: '#f47920', colorB: '#f1ece1', names: [] },
                charmm: { colorA: '#f47920', colorB: '#f1ece1', names: [] },
                glycam: { colorA: '#f47920', colorB: '#f1ece1', names: [] },
            }, {
                name: 'AltN',
                common: { colorA: '#f69ea1', colorB: '#f1ece1', names: [] },
                charmm: { colorA: '#f69ea1', colorB: '#f1ece1', names: [] },
                glycam: { colorA: '#f69ea1', colorB: '#f1ece1', names: [] },
            }, {
                name: 'AllN',
                common: { colorA: '#a54399', colorB: '#f1ece1', names: [] },
                charmm: { colorA: '#a54399', colorB: '#f1ece1', names: [] },
                glycam: { colorA: '#a54399', colorB: '#f1ece1', names: [] },
            }, {
                name: 'TalN',
                common: { colorA: '#8fcce9', colorB: '#f1ece1', names: [] },
                charmm: { colorA: '#8fcce9', colorB: '#f1ece1', names: [] },
                glycam: { colorA: '#8fcce9', colorB: '#f1ece1', names: [] },
            }, {
                name: 'IdoN',
                common: { colorA: '#a17a4d', colorB: '#f1ece1', names: [] },
                charmm: { colorA: '#a17a4d', colorB: '#f1ece1', names: [] },
                glycam: { colorA: '#a17a4d', colorB: '#f1ece1', names: [] },
            }]
        },
        /* === Divided diamond  === */
        {
            shape: Shapes.split(Shapes.Diamond) /* Divided diamond  */,
            axisUp: [1, 0, 0],
            instances: [{
                name: 'GlcA',
                common: { colorA: '#0090bc', colorB: '#f1ece1', names: ['GCU', 'BDP'] },
                charmm: { colorA: '#0090bc', colorB: '#f1ece1', names: ['AGLCA', 'BGLCA', 'BGLCA0'] },
                glycam: { colorA: '#0090bc', colorB: '#f1ece1', names: ['0ZA', '0ZB', '1ZA', '1ZB', '2ZA', '2ZB', '3ZA', '3ZB', '4ZA', '4ZB', 'ZZA', 'ZZB', 'YZA', 'YZB', 'WZA', 'WZB', 'TZA', 'TZB', '0zA', '0zB', '1zA', '1zB', '2zA', '2zB', '3zA', '3zB', '4zA', '4zB', 'ZzA', 'ZzB', 'YzA', 'YzB', 'WzA', 'WzB', 'TzA', 'TzB', '0ZBP'] },
            }, {
                name: 'ManA',
                common: { colorA: '#00a651', colorB: '#f1ece1', names: ['MAV', 'BEM'] },
                charmm: { colorA: '#00a651', colorB: '#f1ece1', names: [] },
                glycam: { colorA: '#00a651', colorB: '#f1ece1', names: [] },
            }, {
                name: 'GalA',
                common: { colorA: '#ffd400', colorB: '#f1ece1', names: ['ADA', 'GTR'] },
                charmm: { colorA: '#ffd400', colorB: '#f1ece1', names: [] },
                glycam: { colorA: '#ffd400', colorB: '#f1ece1', names: ['0OA', '0OB', '1OA', '1OB', '2OA', '2OB', '3OA', '3OB', '4OA', '4OB', 'ZOA', 'ZOB', 'YOA', 'YOB', 'WOA', 'WOB', 'TOA', 'TOB', '0oA', '0oB', '1oA', '1oB', '2oA', '2oB', '3oA', '3oB', '4oA', '4oB', 'ZoA', 'ZoB', 'YoA', 'YoB', 'WoA', 'WoB', 'ToA', 'ToB'] },
            }, {
                name: 'GulA',
                common: { colorA: '#f47920', colorB: '#f1ece1', names: ['LGU'] },
                charmm: { colorA: '#f47920', colorB: '#f1ece1', names: [] },
                glycam: { colorA: '#f47920', colorB: '#f1ece1', names: [] },
            }, {
                name: 'AltA',
                common: { colorA: '#f1ece1', colorB: '#f69ea1', names: [] },
                charmm: { colorA: '#f1ece1', colorB: '#f69ea1', names: [] },
                glycam: { colorA: '#f1ece1', colorB: '#f69ea1', names: [] },
            }, {
                name: 'AllA',
                common: { colorA: '#a54399', colorB: '#f1ece1', names: [] },
                charmm: { colorA: '#a54399', colorB: '#f1ece1', names: [] },
                glycam: { colorA: '#a54399', colorB: '#f1ece1', names: [] },
            }, {
                name: 'TalA',
                common: { colorA: '#8fcce9', colorB: '#f1ece1', names: ['X0X', 'X1X'] },
                charmm: { colorA: '#8fcce9', colorB: '#f1ece1', names: [] },
                glycam: { colorA: '#8fcce9', colorB: '#f1ece1', names: [] },
            }, {
                name: 'IdoA',
                common: { colorA: '#f1ece1', colorB: '#a17a4d', names: ['IDR'] },
                charmm: { colorA: '#f1ece1', colorB: '#a17a4d', names: ['AIDOA', 'BIDOA'] },
                glycam: { colorA: '#f1ece1', colorB: '#a17a4d', names: ['0UA', '0UB', '1UA', '1UB', '2UA', '2UB', '3UA', '3UB', '4UA', '4UB', 'ZUA', 'ZUB', 'YUA', 'YUB', 'WUA', 'WUB', 'TUA', 'TUB', '0uA', '0uB', '1uA', '1uB', '2uA', '2uB', '3uA', '3uB', '4uA', '4uB', 'ZuA', 'ZuB', 'YuA', 'YuB', 'WuA', 'WuB', 'TuA', 'TuB', 'YuAP'] },
            }]
        },
        /* === Filled cone  === */
        {
            shape: [Shapes.Cone] /* Filled cone  */,
            axisUp: [0, 1, 0],
            instances: [{
                name: 'Qui',
                common: { colorA: '#0090bc', names: ['G6D'] },
                charmm: { colorA: '#0090bc', names: [] },
                glycam: { colorA: '#0090bc', names: ['0QA', '0QB', '1QA', '1QB', '2QA', '2QB', '3QA', '3QB', '4QA', '4QB', 'ZQA', 'ZQB', 'YQA', 'YQB', 'WQA', 'WQB', 'TQA', 'TQB', '0qA', '0qB', '1qA', '1qB', '2qA', '2qB', '3qA', '3qB', '4qA', '4qB', 'ZqA', 'ZqB', 'YqA', 'YqB', 'WqA', 'WqB', 'TqA', 'TqB'] },
            }, {
                name: 'Rha',
                common: { colorA: '#00a651', names: ['RAM', 'RM4'] },
                charmm: { colorA: '#00a651', names: ['ARHM', 'BRHM'] },
                glycam: { colorA: '#00a651', names: ['0HA', '0HB', '1HA', '1HB', '2HA', '2HB', '3HA', '3HB', '4HA', '4HB', 'ZHA', 'ZHB', 'YHA', 'YHB', 'WHA', 'WHB', 'THA', 'THB', '0hA', '0hB', '1hA', '1hB', '2hA', '2hB', '3hA', '3hB', '4hA', '4hB', 'ZhA', 'ZhB', 'YhA', 'YhB', 'WhA', 'WhB', 'ThA', 'ThB'] },
            }, {
                name: 'x6dAlt',
                common: { colorA: '#F88CD2', names: [] },
                charmm: { colorA: '#935D38', names: [] },
                glycam: { colorA: '#57913F', names: [] },
            }, {
                name: 'x6dTal',
                common: { colorA: '#B490DE', names: [] },
                charmm: { colorA: '#64CABE', names: [] },
                glycam: { colorA: '#D9147F', names: [] },
            }, {
                name: 'Fuc',
                common: { colorA: '#ed1c24', names: ['FUC', 'FUL'] },
                charmm: { colorA: '#ed1c24', names: ['AFUC', 'BFUC'] },
                glycam: { colorA: '#ed1c24', names: ['0FA', '0FB', '1FA', '1FB', '2FA', '2FB', '3FA', '3FB', '4FA', '4FB', 'ZFA', 'ZFB', 'YFA', 'YFB', 'WFA', 'WFB', 'TFA', 'TFB', '0fA', '0fB', '1fA', '1fB', '2fA', '2fB', '3fA', '3fB', '4fA', '4fB', 'ZfA', 'ZfB', 'YfA', 'YfB', 'WfA', 'WfB', 'TfA', 'TfB'] },
            }]
        },
        /* === Divided cone  === */
        {
            shape: [Shapes.ConeLeft, Shapes.ConeRight] /* Divided cone */,
            axisUp: [0, 1, 0],
            instances: [{
                name: 'QuiNAc',
                common: { colorA: '#0090bc', colorB: '#f1ece1', names: [] },
                charmm: { colorA: '#0090bc', colorB: '#f1ece1', names: [] },
                glycam: { colorA: '#0090bc', colorB: '#f1ece1', names: [] },
            }, {
                name: 'RhaNAc',
                common: { colorA: '#00a651', colorB: '#f1ece1', names: [] },
                charmm: { colorA: '#00a651', colorB: '#f1ece1', names: [] },
                glycam: { colorA: '#00a651', colorB: '#f1ece1', names: [] },
            }, {
                name: 'FucNAc',
                common: { colorA: '#ed1c24', colorB: '#f1ece1', names: [] },
                charmm: { colorA: '#ed1c24', colorB: '#f1ece1', names: [] },
                glycam: { colorA: '#ed1c24', colorB: '#f1ece1', names: [] },
            }]
        },
        /* === Flat rectangle  === */
        {
            shape: [Shapes.FlatRectangle] /* Flat rectangle  */,
            axisUp: [0, 1, 0],
            instances: [{
                name: 'Oli',
                common: { colorA: '#0090bc', names: ['DDA'] },
                charmm: { colorA: '#0090bc', names: [] },
                glycam: { colorA: '#0090bc', names: [] },
            }, {
                name: 'Tyv',
                common: { colorA: '#00a651', names: ['TYV'] },
                charmm: { colorA: '#00a651', names: [] },
                glycam: { colorA: '#00a651', names: ['0TV', '0Tv', '1TV', '1Tv', '2TV', '2Tv', '4TV', '4Tv', 'YTV', 'YTv', '0tV', '0tv', '1tV', '1tv', '2tV', '2tv', '4tV', '4tv', 'YtV', 'Ytv'] },
            }, {
                name: 'Abe',
                common: { colorA: '#f47920', names: ['ABE'] },
                charmm: { colorA: '#f47920', names: [] },
                glycam: { colorA: '#f47920', names: ['0AE', '2AE', '4AE', 'YGa', '0AF', '2AF', '4AF', 'YAF'] },
            }, {
                name: 'Par',
                common: { colorA: '#f69ea1', names: ['PZU'] },
                charmm: { colorA: '#f69ea1', names: [] },
                glycam: { colorA: '#f69ea1', names: [] },
            }, {
                name: 'Dig',
                common: { colorA: '#a54399', names: [] },
                charmm: { colorA: '#a54399', names: [] },
                glycam: { colorA: '#a54399', names: [] },
            }, {
                name: 'Col',
                common: { colorA: '#8fcce9', names: [] },
                charmm: { colorA: '#8fcce9', names: [] },
                glycam: { colorA: '#8fcce9', names: [] },
            }]
        },
        /* === Filled star  === */
        {
            shape: [Shapes.Star] /* Filled star  */,
            axisUp: [0, 0, 1],
            instances: [{
                name: 'Ara',
                common: { colorA: '#00a651', names: ['ARA', 'ARB'] },
                charmm: { colorA: '#00a651', names: ['AARB', 'BARB'] },
                glycam: { colorA: '#00a651', names: ['0AA', '0AB', '1AA', '1AB', '2AA', '2AB', '3AA', '3AB', '4AA', '4AB', 'ZAA', 'ZAB', 'YAA', 'YAB', 'WAA', 'WAB', 'TAA', 'TAB', '0AD', '0AU', '1AD', '1AU', '2AD', '2AU', '3AD', '3AU', '5AD', '5AU', 'ZAD', 'ZAU', '0aA', '0aB', '1aA', '1aB', '2aA', '2aB', '3aA', '3aB', '4aA', '4aB', 'ZaA', 'ZaB', 'YaA', 'YaB', 'WaA', 'WaB', 'TaA', 'TaB', '0aD', '0aU', '1aD', '1aU', '2aD', '2aU', '3aD', '3aU', '5aD', '5aU', 'ZaD', 'ZaU'] },
            }, {
                name: 'Lyx',
                common: { colorA: '#ffd400', names: ['LDY'] },
                charmm: { colorA: '#ffd400', names: ['ALYF', 'BLYF'] },
                glycam: { colorA: '#ffd400', names: ['0DA', '0DB', '1DA', '1DB', '2DA', '2DB', '3DA', '3DB', '4DA', '4DB', 'ZDA', 'ZDB', 'YDA', 'YDB', 'WDA', 'WDB', 'TDA', 'TDB', '0DD', '0DU', '1DD', '1DU', '2DD', '2DU', '3DD', '3DU', '5DD', '5DU', 'ZDD', 'ZDU', '0dA', '0dB', '1dA', '1dB', '2dA', '2dB', '3dA', '3dB', '4dA', '4dB', 'ZdA', 'ZdB', 'YdA', 'YdB', 'WdA', 'WdB', 'TdA', 'TdB', '0dD', '0dU', '1dD', '1dU', '2dD', '2dU', '3dD', '3dU', '5dD', '5dU', 'ZdD', 'ZdU'] },
            }, {
                name: 'Xyl',
                common: { colorA: '#f47920', names: ['XYS', 'XYP'] },
                charmm: { colorA: '#f47920', names: ['AXYL', 'BXYL', 'AXYF', 'BXYF'] },
                glycam: { colorA: '#f47920', names: ['0XA', '0XB', '1XA', '1XB', '2XA', '2XB', '3XA', '3XB', '4XA', '4XB', 'ZXA', 'ZXB', 'YXA', 'YXB', 'WXA', 'WXB', 'TXA', 'TXB', '0XD', '0XU', '1XD', '1XU', '2XD', '2XU', '3XD', '3XU', '5XD', '5XU', 'ZXD', 'ZXU', '0xA', '0xB', '1xA', '1xB', '2xA', '2xB', '3xA', '3xB', '4xA', '4xB', 'ZxA', 'ZxB', 'YxA', 'YxB', 'WxA', 'WxB', 'TxA', 'TxB', '0xD', '0xU', '1xD', '1xU', '2xD', '2xU', '3xD', '3xU', '5xD', '5xU', 'ZxD', 'ZxU'] },
            }, {
                name: 'Rib',
                common: { colorA: '#f69ea1', names: ['RIP', '0MK'] },
                charmm: { colorA: '#f69ea1', names: ['ARIB', 'BRIB'] },
                glycam: { colorA: '#f69ea1', names: ['0RA', '0RB', '1RA', '1RB', '2RA', '2RB', '3RA', '3RB', '4RA', '4RB', 'ZRA', 'ZRB', 'YRA', 'YRB', 'WRA', 'WRB', 'TRA', 'TRB', '0RD', '0RU', '1RD', '1RU', '2RD', '2RU', '3RD', '3RU', '5RD', '5RU', 'ZRD', 'ZRU', '0rA', '0rB', '1rA', '1rB', '2rA', '2rB', '3rA', '3rB', '4rA', '4rB', 'ZrA', 'ZrB', 'YrA', 'YrB', 'WrA', 'WrB', 'TrA', 'TrB', '0rD', '0rU', '1rD', '1rU', '2rD', '2rU', '3rD', '3rU', '5rD', '5rU', 'ZrD', 'ZrU'] },
            }]
        },
        /* === Filled diamond  === */
        {
            shape: [Shapes.Diamond] /* Filled diamond  */,
            axisUp: [1, 0, 0],
            instances: [{
                name: 'Kdn',
                common: { colorA: '#00a651', names: ['KDN', 'KDM'] },
                charmm: { colorA: '#00a651', names: [] },
                glycam: { colorA: '#00a651', names: [] },
            }, {
                name: 'Neu5Ac',
                common: { colorA: '#a54399', names: ['SIA', 'SLB'] },
                charmm: { colorA: '#a54399', names: ['ANE5AC', 'BNE5AC'] },
                glycam: { colorA: '#a54399', names: ['0SA', '0SB', '4SA', '4SB', '7SA', '7SB', '8SA', '8SB', '9SA', '9SB', 'ASA', 'ASB', 'BSA', 'BSB', 'CSA', 'CSB', 'DSA', 'DSB', 'ESA', 'ESB', 'FSA', 'FSB', 'GSA', 'GSB', 'HSA', 'HSB', 'ISA', 'ISB', 'JSA', 'JSB', 'KSA', 'KSB', '0sA', '0sB', '4sA', '4sB', '7sA', '7sB', '8sA', '8sB', '9sA', '9sB', 'AsA', 'AsB', 'BsA', 'BsB', 'CsA', 'CsB', 'DsA', 'DsB', 'EsA', 'EsB', 'FsA', 'FsB', 'GsA', 'GsB', 'HsA', 'HsB', 'IsA', 'IsB', 'JsA', 'JsB', 'KsA', 'KsB'] },
            }, {
                name: 'Neu5Gc',
                common: { colorA: '#8fcce9', names: ['NGC', 'NGE'] },
                charmm: { colorA: '#8fcce9', names: [] },
                glycam: { colorA: '#8fcce9', names: ['0GL', '4GL', '7GL', '8GL', '9GL', 'CGL', 'DGL', 'EGL', 'FGL', 'GGL', 'HGL', 'IGL', 'JGL', 'KGL', '0gL', '4gL', '7gL', '8gL', '9gL', 'AgL', 'BgL', 'CgL', 'DgL', 'EgL', 'FgL', 'GgL', 'HgL', 'IgL', 'JgL', 'KgL'] },
            }, {
                name: 'Neu',
                common: { colorA: '#a17a4d', names: [] },
                charmm: { colorA: '#a17a4d', names: [] },
                glycam: { colorA: '#a17a4d', names: [] },
            }]
        },
        /* === Flat hexagon  === */
        {
            shape: [Shapes.FlatHexagon]  /* Flat hexagon  */,
            axisUp: [0, 0, 1],
            instances: [{
                name: 'Bac',
                common: { colorA: '#0090bc', names: ['B6D'] },
                charmm: { colorA: '#0090bc', names: [] },
                glycam: { colorA: '#0090bc', names: ['0BC', '3BC', '0bC', '3bC'] },
            }, {
                name: 'LDManHep',
                common: { colorA: '#00a651', names: ['GMH'] },
                charmm: { colorA: '#00a651', names: [] },
                glycam: { colorA: '#00a651', names: [] },
            }, {
                name: 'Kdo',
                common: { colorA: '#ffd400', names: ['KDO'] },
                charmm: { colorA: '#ffd400', names: [] },
                glycam: { colorA: '#ffd400', names: [] },
            }, {
                name: 'Dha',
                common: { colorA: '#f47920', names: [] },
                charmm: { colorA: '#f47920', names: [] },
                glycam: { colorA: '#f47920', names: [] },
            }, {
                name: 'DDManHep',
                common: { colorA: '#f69ea1', names: [] },
                charmm: { colorA: '#f69ea1', names: [] },
                glycam: { colorA: '#f69ea1', names: [] },
            }, {
                name: 'MurNAc',
                common: { colorA: '#a54399', names: ['AMU'] },
                charmm: { colorA: '#a54399', names: [] },
                glycam: { colorA: '#a54399', names: [] },
            }, {
                name: 'MurNGc',
                common: { colorA: '#8fcce9', names: [] },
                charmm: { colorA: '#8fcce9', names: [] },
                glycam: { colorA: '#8fcce9', names: [] },
            }, {
                name: 'Mur',
                common: { colorA: '#a17a4d', names: ['MUR'] },
                charmm: { colorA: '#a17a4d', names: [] },
                glycam: { colorA: '#a17a4d', names: [] },
            }]
        },
        /* === Flat pentagon  === */
        {
            shape: [Shapes.FlatPentagon] /* Flat pentagon  */,
            axisUp: [0, 0, 1],
            instances: [{
                name: 'Api',
                common: { colorA: '#0090bc', names: ['XXM'] },
                charmm: { colorA: '#0090bc', names: [] },
                glycam: { colorA: '#0090bc', names: [] },
            }, {
                name: 'Fruc',
                common: { colorA: '#00a651', names: ['BDF'] },
                charmm: { colorA: '#00a651', names: ['AFRU', 'BFRU'] },
                glycam: { colorA: '#00a651', names: ['0CA', '0CB', '1CA', '1CB', '2CA', '2CB', '3CA', '3CB', '4CA', '4CB', '5CA', '5CB', 'WCA', 'WCB', '0CD', '0CU', '1CD', '1CU', '2CD', '2CU', '3CD', '3CU', '4CD', '4CU', '6CD', '6CU', 'WCD', 'WCU', 'VCD', 'VCU', 'UCD', 'UCU', 'QCD', 'QCU', '0cA', '0cB', '1cA', '1cB', '2cA', '2cB', '3cA', '3cB', '4cA', '4cB', '5cA', '5cB', 'WcA', 'WcB', '0cD', '0cU', '1cD', '1cU', '2cD', '2cU', '3cD', '3cU', '4cD', '4cU', '6cD', '6cU', 'WcD', 'WcU', 'VcD', 'VcU', 'UcD', 'UcU', 'QcD', 'QcU'] },
            }, {
                name: 'Tag',
                common: { colorA: '#ffd400', names: ['T6T'] },
                charmm: { colorA: '#ffd400', names: [] },
                glycam: { colorA: '#ffd400', names: ['0JA', '0JB', '1JA', '1JB', '2JA', '2JB', '3JA', '3JB', '4JA', '4JB', '5JA', '5JB', 'WJA', 'WJB', '0JD', '0JU', '1JD', '1JU', '2JD', '2JU', '3JD', '3JU', '4JD', '4JU', '6JD', '6JU', 'WJD', 'WJU', 'VJD', 'VJU', 'UJD', 'UJU', 'QJD', 'QJU', '0jA', '0jB', '1jA', '1jB', '2jA', '2jB', '3jA', '3jB', '4jA', '4jB', '5jA', '5jB', 'WjA', 'WjB', '0jD', '0jU', '1jD', '1jU', '2jD', '2jU', '3jD', '3jU', '4jD', '4jU', '6jD', '6jU', 'WjD', 'WjU', 'VjD', 'VjU', 'UjD', 'UjU', 'QjD', 'QjU'] },
            }, {
                name: 'Sor',
                common: { colorA: '#f47920', names: ['SOE'] },
                charmm: { colorA: '#f47920', names: [] },
                glycam: { colorA: '#f47920', names: ['0BA', '0BB', '1BA', '1BB', '2BA', '2BB', '3BA', '3BB', '4BA', '4BB', '5BA', '5BB', 'WBA', 'WBB', '0BD', '0BU', '1BD', '1BU', '2BD', '2BU', '3BD', '3BU', '4BD', '4BU', '6BD', '6BU', 'WBD', 'WBU', 'VBD', 'VBU', 'UBD', 'UBU', 'QBD', 'QBU', '0bA', '0bB', '1bA', '1bB', '2bA', '2bB', '3bA', '3bB', '4bA', '4bB', '5bA', '5bB', 'WbA', 'WbB', '0bD', '0bU', '1bD', '1bU', '2bD', '2bU', '3bD', '3bU', '4bD', '4bU', '6bD', '6bU', 'WbD', 'WbU', 'VbD', 'VbU', 'UbD', 'UbU', 'QbD', 'QbU'] },
            }, {
                name: 'Psi',
                common: { colorA: '#f69ea1', names: [] },
                charmm: { colorA: '#f69ea1', names: [] },
                glycam: { colorA: '#f69ea1', names: [] }
            }]
        },
        /* === Flat diamond  === */
        {
            shape: [Shapes.FlatDiamond] /* Flat pentagon  */,
            axisUp: [0, 0, 1],
            instances: [{
                name: 'Pse',
                common: { colorA: '#00a850', names: ['6PZ'] },
                charmm: { colorA: '#00a850', names: [] },
                glycam: { colorA: '#00a850', names: [] }
            }, {
                name: 'Leg',
                common: { colorA: '#f9d10d', names: [] },
                charmm: { colorA: '#f9d10d', names: [] },
                glycam: { colorA: '#f9d10d', names: [] }
            }, {
                name: 'Aci',
                common: { colorA: '#f69e9d', names: [] },
                charmm: { colorA: '#f69e9d', names: [] },
                glycam: { colorA: '#f69e9d', names: [] }
            }, {
                name: '4eLeg',
                common: { colorA: '#89c6e3', names: [] },
                charmm: { colorA: '#89c6e3', names: [] },
                glycam: { colorA: '#89c6e3', names: [] }
            }]
        }];

    const mappedData = (function () {
        const map = Core.Utils.FastMap.create<string, RepresentationEntry>();
        for (const shape of data) {
            for (const instance of shape.instances) {
                const entry = (name: string, elem: any) => map.set(name, { 
                    instanceName: instance.name, 
                    name, 
                    color: elem.colorB ? [Visualization.Color.fromHexString(elem.colorA), Visualization.Color.fromHexString(elem.colorB)] : [Visualization.Color.fromHexString(elem.colorA)], 
                    shape: shape.shape,
                    axisUp: shape.axisUp,
                    axisSide: [1, 0, 0]
                })
                for (const name of instance.common.names) entry(name, instance.common);
                //for (const name of instance.charmm.names) entry(name, instance.charmm);
                //for (const name of instance.glycam.names) entry(name, instance.glycam);
            }
        }
        return map;
    })();

    export function isResidueRepresentable(name: string) {
        return mappedData.has(name);
    }

    export function getResidueRepresentation(name: string) {
        return mappedData.get(name);
    }
}
