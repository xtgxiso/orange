/**
 * This factory handles basic CRUD requests to the backend API.
 */
angular.module('orange')
    .factory('Orange', ['$http', '$q', '$cookies', 'Alert', function ($http, $q, $cookies, Alert) {
        var config = {
            url: $cookies.getObject('config.url')
        };

        var factory = {
            config: config,
            get: function (endpoint) {
                var deferred = $q.defer();
                $http.get(factory.config.url + endpoint).then(function (response) {
                    deferred.resolve(response.data);
                }, function (response) {
                    factory.handleError(response, deferred, endpoint);
                });
                return deferred.promise;
            },
            put: function (endpoint, data) {
                var deferred = $q.defer();
                $http({
                    method: 'PUT',
                    url: factory.config.url + endpoint,
                    data: data,
                }).then(function (response) {
                    deferred.resolve(response.data);
                }, function (response) {
                    factory.handleError(response, deferred, endpoint);
                });
                return deferred.promise;
            },
            patch: function (endpoint, data) {
                var deferred = $q.defer();
                $http.patch(factory.config.url + endpoint, data).then(function (response) {
                    deferred.resolve(response.data);
                }, function (response) {
                    factory.handleError(response, deferred, endpoint);
                });
                return deferred.promise;
            },
            delete: function (endpoint) {
                var deferred = $q.defer();
                $http.delete(factory.config.url + endpoint).then(function (response) {
                    deferred.resolve(response);
                }, function (response) {
                    factory.handleError(response, deferred, endpoint);
                });
                return deferred.promise;
            },
            post: function (endpoint, data) {
                var deferred = $q.defer();
                $http.post(factory.config.url + endpoint, data).then(function (response) {
                    deferred.resolve(response.data);
                }, function (response) {
                    factory.handleError(response, deferred, endpoint);
                });
                return deferred.promise;
            },
            handleError: function (response, deferred, endpoint) {
                if (response.data && response.status !== 500) {
                    if (response.data.msg) {
                        Alert.error(response.data.msg);
                    }
                    deferred.reject(response);
                } else {
                    Alert.error("Oops, something wrong happened. Please refresh the page.");
                    response.data = {};
                    deferred.reject(response);
                }
            },
            checkConfig: function (config) {
                var url = config.url;
                var deferred = $q.defer();
                if (!url) {
                    deferred.reject('Not reachable');
                } else {
                    $http({
                        url: url,
                        method: 'GET',
                        timeout: 5000,
                    }).then(function (response) {
                        if (response.data.message && angular.isString(response.data.message) && response.data.message.toLowerCase() === "welcome to orange") {
                            deferred.resolve();
                        } else {
                            deferred.reject('Not Orange');
                        }
                    }, function (response) {
                        if (response.status === 403) {
                            deferred.reject('Forbidden');
                        } else {
                            deferred.reject('Not reachable');
                        }
                    });
                }
                return deferred.promise;
            },
            setConfig: function (config) {
                var deferred = $q.defer();
                factory.checkConfig(config).then(function () {
                    factory.config = config;
                    $cookies.putObject('config.url', factory.config.url, {
                        expires: new Date(new Date().getTime() + 1000 * 24 * 3600 * 60) // remember 60 days
                    });
                    deferred.resolve();
                }, function (response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            }
        };
        return factory;
    }]);
