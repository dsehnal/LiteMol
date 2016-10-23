/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var BinaryCIFInspect;
    (function (BinaryCIFInspect) {
        var CIF = LiteMol.Core.Formats.CIF;
        function fetch(url, binary, status, done) {
            status.innerText = 'Downloading...';
            var xhttp = new XMLHttpRequest();
            xhttp.onerror = function (e) {
                var error = e.target.error;
                status.innerText = "Error: " + (error ? error : 'unknown.');
            };
            xhttp.onprogress = function (e) {
                status.innerText = "Downloading... " + (e.loaded / 1024 / 1024).toFixed(2) + " MB";
            };
            xhttp.onload = function (e) {
                var req = e.target;
                if (req.status >= 200 && req.status < 400) {
                    status.innerText = "Download done.";
                    setTimeout(function () { return done(binary ? req.response : req.responseText); }, 0);
                }
                else {
                    status.innerText = "Error: " + req.statusText;
                }
            };
            xhttp.open('get', url, true);
            xhttp.responseType = binary ? "arraybuffer" : "text";
            xhttp.send();
        }
        function process(id, binary, parse) {
            var url = document.querySelector("#" + id + " input[type=text]").value;
            fetch(url, binary, document.querySelector("#" + id + " .status"), function (data) {
                var cif = parse(data);
                var text = document.querySelector("#" + id + " textarea");
                if (cif.isError) {
                    text.innerHTML = "Error:\n" + cif.toString();
                    return;
                }
                text.innerHTML = JSON.stringify(cif.result.toJSON(), null, 2);
            });
        }
        document.querySelector('#cif-data button').onclick = function () { return process('cif-data', false, function (data) { return CIF.Text.parse(data); }); };
        document.querySelector('#binarycif-data button').onclick = function () { return process('binarycif-data', true, function (data) { return CIF.Binary.parse(data); }); };
    })(BinaryCIFInspect = LiteMol.BinaryCIFInspect || (LiteMol.BinaryCIFInspect = {}));
})(LiteMol || (LiteMol = {}));
