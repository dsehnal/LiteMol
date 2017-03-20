declare var angular: any;

angular.module('ligands.density', [])
    .controller('LiteMolDensityController', ['$scope', function ($scope: any) {        
        let plugin = LiteMol.AngularExample.createPlugin(document.getElementById('LiteMol')!);
        $scope.destroy = () => {
            if (!plugin) return;
            plugin.destroy();
            plugin = void 0 as any;
        }
        $scope.load = (modelUrl: string, fofcUrl: string, twofofcUrl: string) => LiteMol.AngularExample.load(plugin, modelUrl, fofcUrl, twofofcUrl);
    }])
    .directive('densityDisplay', function () {
        return {
            template: '<div id="LiteMol" style="width:600px;height:400px;z-index:100000;position:relative; margin-top: 80px; margin-left: 80px">Hi</div>',
            controller: 'LiteMolDensityController',
            controllerAs: 'controller',
            link: ($scope: any, element: any, attrs: any) => {
                $scope.load(attrs.model, attrs.fofc, attrs.twofofc);
                element.on('$destroy', function() {
                    $scope.destroy();
                });
            },
            scope: {
                model: '@',
                fofc: '@',
                twofofc: '@'
            }
        };
    });