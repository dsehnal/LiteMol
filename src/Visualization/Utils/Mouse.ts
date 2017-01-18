// /*
//  * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
//  */

// namespace LiteMol.Visualization.Utils {
//     "use strict";
    
//     // from https://gist.github.com/electricg/4435259
    
//     // Which HTML element is the target of the event
//     function mouseTarget(e: any) {
//         let targ: any;
//         if (e.target) targ = e.target;
//         else if (e.srcElement) targ = e.srcElement;
//         if (targ.nodeType == 3) // defeat Safari bug
//             targ = targ.parentNode;
//         return targ;
//     }
    
//     // Mouse position relative to the document
//     // From http://www.quirksmode.org/js/events_properties.html
//     function mousePositionDocument(e: any) {
//         let posx = 0;
//         let posy = 0;
//         if (e.pageX || e.pageY) {
//             posx = e.pageX;
//             posy = e.pageY;
//         }
//         else if (e.clientX || e.clientY) {
//             posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
//             posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
//         }
//         return {
//             x : posx,
//             y : posy
//         };
//     }

//     // Find out where an element is on the page
//     // From http://www.quirksmode.org/js/findpos.html
//     function findPos(obj) {
//         let curleft = 0, curtop = 0;
//         if (obj.offsetParent) {
//             do {
//                 curleft += obj.offsetLeft;
//                 curtop += obj.offsetTop;
//             } while (obj = obj.offsetParent);
//         }
//         return {
//             left : curleft,
//             top : curtop
//         };
//     }
    
//     // Mouse position relative to the element
//     // not working on IE7 and below
//     function mousePositionElement(e: any) {
//         let mousePosDoc = mousePositionDocument(e);
//         let target = mouseTarget(e);
//         let targetPos = findPos(target);
//         let posx = mousePosDoc.x - targetPos.left;
//         let posy = mousePosDoc.y - targetPos.top;
//         return {
//             x : posx,
//             y : posy
//         };
//     }
    
// }