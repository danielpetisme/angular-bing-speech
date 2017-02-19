// Copyright (c) 2017 Daniel Petisme
// Licensed under the MIT license

describe('bing-speech.auth', function() {

    var $httpBackend,
        BingSpeechAuthProvider,
        BingSpeechAuth,
        ISSUE_TOKEN_URL;

    beforeEach(module('bing-speech.auth', function(_BingSpeechAuthProvider_) {
        BingSpeechAuthProvider = _BingSpeechAuthProvider_;
    }));

    beforeEach(inject([
        '$httpBackend',
        '$rootScope',
        'ISSUE_TOKEN_URL',
        function(_$httpBackend_, _$rootScope_, _ISSUE_TOKEN_URL_) {
            $httpBackend = _$httpBackend_;
            $rootScope = _$rootScope_;
            ISSUE_TOKEN_URL = _ISSUE_TOKEN_URL_;
        }
    ]));


    describe('Given Subscription key not set', function() {
        beforeEach(inject(['BingSpeechAuth', function(_BingSpeechAuth_) {
            BingSpeechAuth = _BingSpeechAuth_;
        }]));

        it('should fail when no subscription key set', function() {
            BingSpeechAuth.login().then(function(data) {
                console.log('Success');
                fail('Should reject ' + data);
            }).catch(function(error) {
                expect(error).toBe('No subscription key defined');
            });
            $rootScope.$apply();
        });
    });

    describe('Given Subscription key set', function() {
        beforeEach(function() {
            BingSpeechAuthProvider.useSubscriptionKey('DUMMY_SUBSCRIPTION_KEY');
        });
        beforeEach(inject(['BingSpeechAuth', function(_BingSpeechAuth_) {
            BingSpeechAuth = _BingSpeechAuth_;
        }]));

        it('should issue new token when not subscription key set', function() {
            $httpBackend.expect(
                'POST',
                ISSUE_TOKEN_URL, {},
                function(headers) {
                    expect(headers['Ocp-Apim-Subscription-Key']).toBe('DUMMY_SUBSCRIPTION_KEY');
                    return headers;
                }).respond(200, 'DUMMY_JWT_TOKEN');
            BingSpeechAuth.login().then(function(data) {
                expect(data).toBe('DUMMY_JWT_TOKEN');
            });

            $rootScope.$apply();
            $httpBackend.flush();
        });
    });

});
