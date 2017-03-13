
/* charts */

function createBinaryCIFChart(target) {
    var rawData = [
        ['CIF Full', 41.78, 'rgba(255, 255, 255, 1.0)'],
        ['BinaryCIF Full', 12.17, 'rgba(255,120, 60, 1.0)'],
        ['CIF Backbone', 6.79, 'rgba(255, 255, 255, 1.0)'],
        ['BinaryCIF Backbone', 0.91, 'rgba(255, 120, 60, 1.0)']
    ];

    var data = {
        labels: rawData.map(x => x[0]),
        datasets: [{
            label: 'Size in MB',
            data: rawData.map(x => x[1]),
            backgroundColor: rawData.map(x => x[2])
        }]
    };

    var chart = new Chart(document.getElementById(target), {
        type: 'bar',
        data: data,
        options: {
            title: {
                display: true,
                text: 'Size of HIV-1 Capsid, 3j3q, 2,440,800 atoms',
                fontSize: 16,
                padding: 24,
                fontColor: '#fff',
                fontStyle: 'bold'
            },
            legend: {
                display: false
            },
            scales: {
                yAxes: [{
                    type: 'linear',
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Size in MB',
                        fontColor: '#fff',
                        fontStyle: 'bold'
                    },
                    position: 'left',
                    id: 'y-axis-1',
                    ticks: {
                        max: 40,
                        min: 0,
                        fontColor: '#fff',
                        fontStyle: 'bold'
                    },
                    gridLines: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }],
                xAxes: [{
                    display: true,
                    gridLines: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        fontColor: '#fff',
                        fontStyle: 'bold'
                    }
                }]
            }
        }
    });
}

function createCoordinateServerChart(target) {
    var rawData = [
        ['Full Structure', 3230, 'rgba(45, 45, 45, 1.0)'],
        ['Backbone', 1089, 'rgba(255,120, 60, 1.0)']
    ];

    var data = {
        labels: rawData.map(x => x[0]),
        datasets: [{
            label: 'Time in ms',
            data: rawData.map(x => x[1]),
            backgroundColor: rawData.map(x => x[2])
        }]
    };

    var chart = new Chart(document.getElementById(target), {
        type: 'bar',
        data: data,
        options: {
            title: {
                display: true,
                text: 'Server Latency, 5iv5, 549,564 atoms',
                fontSize: 16,
                padding: 24,
                fontColor: '#000',
                fontStyle: 'bold'
            },
            legend: {
                display: false
            },
            scales: {
                yAxes: [{
                    type: 'linear',
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Time in ms',
                        fontColor: '#000',
                        fontStyle: 'bold'
                    },
                    position: 'left',
                    id: 'y-axis-1',
                    ticks: {
                        //max: 3250,
                        min: 0,
                        fontColor: '#000',
                        fontStyle: 'bold'
                    },
                    gridLines: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }],
                xAxes: [{
                    display: true,
                    gridLines: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        fontColor: '#000',
                        fontStyle: 'bold'
                    }
                }]
            }
        }
    });
}

$(function () {
    createBinaryCIFChart('BinaryCIF-chart');
    createCoordinateServerChart('CoordinateServer-chart');

    function lmPreviewFeatures() {
        var featurePreviewImg = $('#viewer-feature-preview');
        var featurePreviewMap = {
            'modes': 'lm-modes.png',
            'assemblies': 'lm-assemblies.png',
            'density': 'lm-density.png',
            'annotation': 'lm-annotation.png'
        };
        $('a.lm-feature-preview').click(function (e) {
            if (e.preventDefault) e.preventDefault();
            featurePreviewImg.attr('src', 'assets/img/features/' + featurePreviewMap[$(this).data('preview-feature')]);
        })
    }

    function dsPreviewFeatures() {
        var featurePreviewImg = $('#ds-feature-preview');
        var featurePreviewMap = {
            'slice': 'ds-slice.png',
            'full': 'ds-full.png'
        };
        $('a.ds-feature-preview').click(function (e) {
            if (e.preventDefault) e.preventDefault();
            featurePreviewImg.attr('src', 'assets/img/features/' + featurePreviewMap[$(this).data('preview-feature')]);
        })
    }

    lmPreviewFeatures();
    dsPreviewFeatures();
});