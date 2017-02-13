// Copyright (c) 2017 Daniel Petisme
// Licensed under the MIT license

(function() {
    'use strict';
    angular
        .module('bing-speech.auth', ['ngStorage'])
        .constant('ISSUE_TOKEN_URL', 'https://api.cognitive.microsoft.com/sts/v1.0/issueToken')
        .provider('BingSpeechAuth', BingSpeechAuthProvider);

    BingSpeechAuthProvider.$inject = [];

    function BingSpeechAuthProvider() {
        this.$get = BingSpeechAuth;

        var $subscriptionKey;

        this.useSubscriptionKey = function(subscriptionKey) {
            $subscriptionKey = subscriptionKey;
        };

        BingSpeechAuth.$inject = ['$http', '$localStorage', '$q', 'ISSUE_TOKEN_URL'];

        function BingSpeechAuth($http, $localStorage, $q, ISSUE_TOKEN_URL) {
            var service = {
                login: login
            };

            function issueToken() {
                if (!$subscriptionKey) {
                    return $q.reject('No subscription key defined');
                }
                return $http.post(ISSUE_TOKEN_URL, {}, {
                    headers: {
                        'Ocp-Apim-Subscription-Key': $subscriptionKey
                    }
                }).then(function(response) {
                    return response.data;
                });
            }

            function login() {
                var token = $localStorage.authenticationToken;
                var tokenExpirationDate = $localStorage.tokenExpirationDate;
                if (token && tokenExpirationDate > Date.now()) {
                    return $q.resolve(token);
                }
                return issueToken().then(function(issuedToken) {
                    $localStorage.authenticationToken = issuedToken;
                    $localStorage.tokenExpirationDate = Date.now() + 9 * 60 * 1000;
                    return issuedToken;
                }).catch(function(error) {
                    return $q.reject(error);
                });
            }

            return service;
        }
    }
})();
