/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.BinaryCIFInspect {

    import CIF = Core.Formats.CIF;

    function fetch(url: string, binary: boolean, status: HTMLElement, done: (data: string | ArrayBuffer) => void) {
        status.innerText = 'Downloading...';
        let xhttp = new XMLHttpRequest();

        xhttp.onerror = e => {
            let error = (<FileReader>e.target).error;
            status.innerText = `Error: ${error ? error : 'unknown.'}`;
        };

        xhttp.onprogress = e => {
            status.innerText = `Downloading... ${(e.loaded / 1024 / 1024).toFixed(2)} MB`;
        }

        xhttp.onload = e => {
            let req = (e.target as XMLHttpRequest);
            if (req.status >= 200 && req.status < 400) {
                status.innerText = `Download done.`;
                setTimeout(() => done(binary ? req.response : req.responseText), 0);
            } else {
                status.innerText = `Error: ${req.statusText}`;
            }
        }

        xhttp.open('get', url, true);
        xhttp.responseType = binary ? "arraybuffer" : "text";
        xhttp.send();
    }

    function process(id: string, binary: boolean, parse: (data: string | ArrayBuffer) => Core.Formats.ParserResult<CIF.File>) {
        let url = (document.querySelector(`#${id} input[type=text]`) as HTMLInputElement).value;
        fetch(url, binary, document.querySelector(`#${id} .status`) as HTMLElement, data => {
            let cif = parse(data);
            let text = document.querySelector(`#${id} textarea`) as HTMLTextAreaElement
            if (cif.isError) {
                text.innerHTML = `Error:\n${cif.toString()}`;
                return;
            }
            text.innerHTML = JSON.stringify(cif.result!.toJSON(), null, 2);
        });
    }

    (document.querySelector('#cif-data button') as HTMLButtonElement).onclick = () => process('cif-data', false, data => CIF.Text.parse(data as string));
    (document.querySelector('#binarycif-data button') as HTMLButtonElement).onclick = () => process('binarycif-data', true, data => CIF.Binary.parse(data as ArrayBuffer));
}