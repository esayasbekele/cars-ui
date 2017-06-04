angular.module('search-ui', ['ui.bootstrap', 'checklist-model'])
    .constant('facetConfiguration', {
        make: { label: 'Make', sortOrder: 1 },
        model : { label: 'Model', sortOrder: 2 },
        body_style: { label: 'Body Style', sortOrder: 3 },
        condition: { label: 'Condition', sortOrder: 4 }
    })
    .factory('searchService', ['$http',
        function ($http) {
            var getCars = function (searchText,filters, offset, limit) {
                var payLoad = {
                    searchText: searchText,
                    filters: filters,
                    limit: limit,
                    offset: offset
                };
                return $http.post('http://localhost:4002', payLoad);
            };
            return {
                getCars: getCars
            };
        }])
    .controller('searchController', ['searchService', '$scope', 'facetConfiguration', function (searchService, $scope, facetConfiguration) {
        $scope.currentPage = 1;
        $scope.offset = 0;
        $scope.limit = 10;
        $scope.filters = {};
        $scope.searchText = '';
        for (var key in facetConfiguration) {
            $scope.filters[key] = [];
        }
        $scope.remove = function (key, value) {
            $scope.filters[key].splice($scope.filters[key].indexOf(value), 1);
        };
        $scope.transformAggs = function (aggregations, facetConfiguration) {
            var aggs = []; 
            for (var key in aggregations) {
                var agg = aggregations[key][key];
                agg.key = key;
                agg.label = facetConfiguration[key].label;
                agg.sortOrder = facetConfiguration[key].sortOrder;
                aggs.push(agg);
            }
            return aggs;
        };
        $scope.transformHits = function (hits) {
            var cars = [];
            for (var key in hits) {
                cars.push(hits[key]._source);
            }
            return cars;
        };
        $scope.executeSearch = function () {
            searchService.getCars($scope.searchText,$scope.filters, $scope.offset, $scope.limit).then(function (data) {
                $scope.aggregations = $scope.transformAggs(data.data.aggregations, facetConfiguration);
                $scope.cars = $scope.transformHits(data.data.hits.hits);
                $scope.total = data.data.hits.total;
            });
        };
        $scope.filterChanged = function () {
            $scope.currentPage = 1;
            $scope.offset = 0;
            $scope.executeSearch();
        };
        $scope.pageChanged = function () {
            $scope.offset = ($scope.currentPage - 1) * $scope.limit;
            $scope.executeSearch();
        };
        $scope.executeSearch();
    }]);