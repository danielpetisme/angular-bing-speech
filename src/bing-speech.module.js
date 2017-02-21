// Copyright (c) 2017 Daniel Petisme
// Licensed under the MIT license

(function () {
    'use strict';
    angular
        .module('bing-speech', ['bing-speech.auth', 'bing-speech.service'])
        .config(httpConfig);
        
        httpConfig.$inject = ['$httpProvider', 'jwtOptionsProvider'];

        function httpConfig($httpProvider, jwtOptionsProvider) {            
            jwtOptionsProvider.config({
                tokenGetter: ['BingSpeechAuth', function (BingSpeechAuth) {
                    return BingSpeechAuth.login();
                }]
            });

            $httpProvider.interceptors.push('jwtInterceptor');
        });
})();