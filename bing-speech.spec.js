describe('bing-speech', function() {
    beforeEach(module('ngStorage'));
    beforeEach(module('bing-speech'));

    var $httpBackend,
        $localStorage;

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('No Subscription Key set', function() {

        var BingSpeechProvider,
            BingSpeech;

        beforeEach(module(['BingSpeechProvider', function(_BingSpeechProvider_) {
            BingSpeechProvider = _BingSpeechProvider_;
            BingSpeechProvider.useSubscriptionKey(undefined);
        }]));

        beforeEach(inject(['$injector', function($injector) {
            $httpBackend = $injector.get('$httpBackend');
            $localStorage = $injector.get('$localStorage');
            BingSpeech = $injector.get('BingSpeech');
        }]));

        it('Recognize should reject the request when not subscription key set', function() {
            BingSpeech.recognize(undefined, undefined).then(function() {
                fail('Should not work when subscription key is not set');
            }).catch(function(error) {
                expect(error).toBe('You must set the subscriptionKey first');
            });
        });

        it('Synthesize should reject the request when not subscription key set', function() {
            BingSpeech.synthesize(undefined, undefined, undefined).then(function() {
                fail('Should not work when subscription key is not set');
            }).catch(function(error) {
                expect(error).toBe('You must set the subscriptionKey first');
            });
        });

    });

    describe('Subscription Key set', function() {

        var BingSpeechProvider, BingSpeech;
        beforeEach(module(['BingSpeechProvider', function(_BingSpeechProvider_) {
            BingSpeechProvider = _BingSpeechProvider_;
            BingSpeechProvider.useSubscriptionKey('DUMMY_SUBSCRIPTION_KEY');
        }]));

        beforeEach(inject(['$injector', function($injector) {
            $httpBackend = $injector.get('$httpBackend');
            $localStorage = $injector.get('$localStorage');
            BingSpeech = $injector.get('BingSpeech');
        }]));

        it('Recognize should reject the request when not subscription key set', function() {
            BingSpeech.recognize(undefined, undefined).then(function() {
                fail('Should not work when subscription key is not set');
            }).catch(function(error) {
                expect(error).toBe('You must set the subscriptionKey first');
            });
        });

    });

});
