// Copyright (c) 2017 Daniel Petisme
// Licensed under the MIT license

(function() {
    'use strict';
    angular
        .module('bing-speech.auth', [])
        .factory('BingSpeechAuthInterceptor', BingSpeechAuthInterceptor);

    BingSpeechAuthInterceptor.$inject = ['$http', 'BingSpeechAuth'];

    function BingSpeechAuthInterceptor($http, BingSpeechAuth) {
        var service = {
            request: request
        };

        function request(config) {
            var deferred = $q.defer();
            BingSpeechAuth.login().then(function(token) {
                config.headers = config.headers || {};
                config.headers.Authorization = 'Bearer ' + token;
                deferred.resolve(config);
            }).catch(function(error) {
                deferred.reject(error);
            });
            return deferred.promise;
        }

        return service;
    }
})();
