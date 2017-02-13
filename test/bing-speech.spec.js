// Copyright (c) 2017 Daniel Petisme
// Licensed under the MIT license

describe('bing-speech.service', function() {
    beforeEach(module('bing-speech.service'));

    var $httpBackend,
        BingSpeech,
        BING_SPEECH;

    beforeEach(inject([
        '$httpBackend',
        'BingSpeech',
        'BING_SPEECH',
        function(_$httpBackend_, _BingSpeech_, _BING_SPEECH_) {
            $httpBackend = _$httpBackend_;
            BingSpeech = _BingSpeech_;
            BING_SPEECH = _BING_SPEECH_;
        }
    ]));

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('Recognize', function() {

        it('should reject when an argument is not defined', function() {
            BingSpeech.recognize(undefined, "foo")
                .then(function() {
                    fail('Should reject');
                }).catch(function(error) {
                    expect(error).toBe('An audio stream must be defined');
                });
            BingSpeech.recognize({}, undefined)
                .then(function() {
                    fail('Should reject');
                }).catch(function(error) {
                    expect(error).toBe('A locale must be defined');
                });
        });

        it('should use proper uuid4 ids', function() {
            var uuid4RegExp = '[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}';
            var requestIdRegexp = 'requestid=' + uuid4RegExp;
            var instanceIdRegexp = 'instanceid=' + uuid4RegExp;
            $httpBackend.expect(
                'POST',
                new RegExp(BING_SPEECH.RECOGNIZE_URL + '?.*' +  instanceIdRegexp + '&.*' + requestIdRegexp, 'i')
            ).respond(200);

            BingSpeech.recognize("foo", "bar");
            $httpBackend.flush();
        });

    });

    describe('Recognize', function() {

        it('should reject when an argument is not defined', function() {
            BingSpeech.synthesize(undefined, "bar", "baz")
                .then(function() {
                    fail('Should reject');
                }).catch(function(error) {
                    expect(error).toBe('A text must be defined');
                });
            BingSpeech.synthesize("foo", undefined, "baz")
                .then(function() {
                    fail('Should reject');
                }).catch(function(error) {
                    expect(error).toBe('A locale must be defined');
                });
            BingSpeech.synthesize("foo", "bar", undefined)
                .then(function() {
                    fail('Should reject');
                }).catch(function(error) {
                    expect(error).toBe('A gender must be defined');
                });
        });

        it('should reject when font not found', function() {
            BingSpeech.synthesize("foo", "bar", "baz")
                .then(function() {
                    fail('Should reject');
                }).catch(function(error) {
                    expect(error).toBe('No font found for locale: bar and gender: baz');
                });
        });

        it('should build a correct ssml', function() {
            var text = 'DUMMY_TEXT';
            var locale = 'fr-FR';
            var gender = 'male';
            var font = BING_SPEECH.FONTS[locale + " " + gender];
            var ssml = BING_SPEECH.SMML_TEMPLATE
                .replace(/%LOCALE%/gi, locale)
                .replace(/%GENDER%/gi, gender)
                .replace(/%FONT%/gi, font)
                .replace(/%TEXT%/gi, text);

            $httpBackend.expect(
                    'POST',
                    BING_SPEECH.SYNTHESIZE_URL,
                    ssml)
                .respond(200);
            BingSpeech.synthesize(text, locale, gender);
            $httpBackend.flush();
        });
    });
});
