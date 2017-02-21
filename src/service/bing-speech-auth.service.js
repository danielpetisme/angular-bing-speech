// Copyright (c) 2017 Daniel Petisme
// Licensed under the MIT license

(function() {
    'use strict';
    angular
        .module('bing-speech.auth', [])
        .constant('ISSUE_TOKEN_URL', 'https://api.cognitive.microsoft.com/sts/v1.0/issueToken')
        .provider('BingSpeechAuth', BingSpeechAuthProvider);

    BingSpeechAuthProvider.$inject = [];

    function BingSpeechAuthProvider() {
        this.$get = BingSpeechAuth;

        var $subscriptionKey;

        this.useSubscriptionKey = function(subscriptionKey) {
            $subscriptionKey = subscriptionKey;
        };

        BingSpeechAuth.$inject = ['$http', '$q', 'ISSUE_TOKEN_URL'];

        function BingSpeechAuth($http, $q, ISSUE_TOKEN_URL) {
            var service = {
                login: login                
            };                       

            function login() {                                
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
            

            return service;
        }
    }
})();
