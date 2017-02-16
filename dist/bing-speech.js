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

// Copyright (c) 2017 Daniel Petisme
// Licensed under the MIT license

(function() {
    'use strict';
    angular
        .module('bing-speech', ['bing-speech.auth', 'bing-speech.service'])
        .run(['$httpProvider', function($httpProvider) {
            $httpProvider.interceptors.push('BingSpeechAuth');
        }]);
})();

// Copyright (c) 2017 Daniel Petisme
// Licensed under the MIT license

(function() {
    'use strict';
    angular
        .module('bing-speech.service', [])
        .constant('BING_SPEECH', {
            'RECOGNIZE_URL': 'https://speech.platform.bing.com/recognize',
            'SYNTHESIZE_URL': 'https://speech.platform.bing.com/synthesize',
            'SMML_TEMPLATE': '<speak version=\"1.0\" xml:lang=\"%LOCALE%\"> <voice name=\"%FONT%\" xml:lang=\"%LOCALE%\" xml:gender=\"%GENDER%\">%TEXT%</voice></speak>',
            'FONTS': {
                'ar-EG female': 'Microsoft Server Speech Text to Speech Voice (ar-EG, Hoda)',
                'de-DE female': 'Microsoft Server Speech Text to Speech Voice (de-DE, Hedda)',
                'de-DE male': 'Microsoft Server Speech Text to Speech Voice (de-DE, Stefan, Apollo)',
                'en-AU female': 'Microsoft Server Speech Text to Speech Voice (en-AU, Catherine)',
                'en-CA female': 'Microsoft Server Speech Text to Speech Voice (en-CA, Linda)',
                'en-GB female': 'Microsoft Server Speech Text to Speech Voice (en-GB, Susan, Apollo)',
                'en-GB male': 'Microsoft Server Speech Text to Speech Voice (en-GB, George, Apollo)',
                'en-IN male': 'Microsoft Server Speech Text to Speech Voice (en-IN, Ravi, Apollo)',
                'en-US female': 'Microsoft Server Speech Text to Speech Voice (en-US, ZiraRUS)',
                'en-US male': 'Microsoft Server Speech Text to Speech Voice (en-US, BenjaminRUS)',
                'es-ES female': 'Microsoft Server Speech Text to Speech Voice (es-ES, Laura, Apollo)',
                'es-ES male': 'Microsoft Server Speech Text to Speech Voice (es-ES, Pablo, Apollo)',
                'es-MX male': 'Microsoft Server Speech Text to Speech Voice (es-MX, Raul, Apollo)',
                'fr-CA female': 'Microsoft Server Speech Text to Speech Voice (fr-CA, Caroline)',
                'fr-FR female': 'Microsoft Server Speech Text to Speech Voice (fr-FR, Julie, Apollo)',
                'fr-FR male': 'Microsoft Server Speech Text to Speech Voice (fr-FR, Paul, Apollo)',
                'it-IT male': 'Microsoft Server Speech Text to Speech Voice (it-IT, Cosimo, Apollo)',
                'ja-JP female': 'Microsoft Server Speech Text to Speech Voice (ja-JP, Ayumi, Apollo)',
                'ja-JP male': 'Microsoft Server Speech Text to Speech Voice (ja-JP, Ichiro, Apollo)',
                'pt-BR male': 'Microsoft Server Speech Text to Speech Voice (pt-BR, Daniel, Apollo)',
                'ru-RU female': 'Microsoft Server Speech Text to Speech Voice (ru-RU, Irina, Apollo)',
                'ru-RU male': 'Microsoft Server Speech Text to Speech Voice (ru-RU, Pavel, Apollo)',
                'zh-CN female': 'Microsoft Server Speech Text to Speech Voice (zh-CN, Yaoyao, Apollo)',
                'zh-CN male': 'Microsoft Server Speech Text to Speech Voice (zh-CN, Kangkang, Apollo)',
                'zh-HK female': 'Microsoft Server Speech Text to Speech Voice (zh-HK, Tracy, Apollo)',
                'zh-HK male': 'Microsoft Server Speech Text to Speech Voice (zh-HK, Danny, Apollo)',
                'zh-TW female': 'Microsoft Server Speech Text to Speech Voice (zh-TW, Yating, Apollo)',
                'zh-TW male': 'Microsoft Server Speech Text to Speech Voice (zh-TW, Zhiwei, Apollo)'
            }
        })
        .factory('BingSpeech', BingSpeech);

    BingSpeech.$inject = ['$http', '$q', 'BING_SPEECH'];

    function BingSpeech($http, $q, BING_SPEECH) {
        var service = {
            recognize: recognize,
            synthesize: synthesize,
        };

        function recognize(audio, locale) {
            if (!audio) {
                return $q.reject('An audio stream must be defined');
            }
            if (!locale || locale.length === 0) {
                return $q.reject('A locale must be defined');
            }
            return $http.post(BING_SPEECH.RECOGNIZE_URL, audio, {
                params: {
                    'version': '3.0',
                    'requestid': uuid4(),
                    'appID': 'D4D52672-91D7-4C74-8AD8-42B1D98141A5', // magic value as per MS docs,
                    'format': 'json',
                    'locale': locale,
                    'device.os': '0_0',
                    'scenarios': 'ulm',
                    'instanceid': uuid4()
                },
                headers: {
                    'Content-Type': 'audio/wav; samplerate=44100'
                }
            });
        }

        function synthesize(text, locale, gender) {
            if (!text || text.length === 0) {
                return $q.reject('A text must be defined');
            }
            if (!locale || locale.length === 0) {
                return $q.reject('A locale must be defined');
            }
            if (!gender || gender.length === 0) {
                return $q.reject('A gender must be defined');
            }
            var font = BING_SPEECH.FONTS[locale + " " + gender];
            if (!font) {
                return $q.reject('No font found for locale: ' + locale + ' and gender: ' + gender);
            }
            var ssml = BING_SPEECH.SMML_TEMPLATE
                .replace(/%LOCALE%/gi, locale)
                .replace(/%GENDER%/gi, gender)
                .replace(/%FONT%/gi, font)
                .replace(/%TEXT%/gi, text);
            return $http.post(BING_SPEECH.SYNTHESIZE_URL, ssml, {
                responseType: 'arraybuffer',
                headers: {
                    'Accept': 'audio/basic',
                    'Content-Type': 'application/ssml+xml',
                    'X-Microsoft-OutputFormat': 'riff-8khz-8bit-mono-mulaw',
                    'X-Search-AppId': '07D3234E49CE426DAA29772419F436CA',
                    'X-Search-ClientID': '1ECFAE91408841A480F00935DC390960'
                }
            });
        }

        function uuid4() {
            // https://gist.github.com/kaizhu256/2853704
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(cc) {
                var rr = Math.random() * 16 | 0;
                return (cc === 'x' ? rr : (rr & 0x3 | 0x8)).toString(16);
            });
        }

        return service;
    }
})();
