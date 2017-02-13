(function() {
  'use strict';
  angular
    .module('bing-speech', ['ngStorage'])
    .constant('BING_SPEECH_API_URL', 'https://speech.platform.bing.com')
    .constant('ISSUE_TOKEN_URL', 'https://api.cognitive.microsoft.com/sts/v1.0/issueToken')
    .constant('SMML_TEMPLATE', '<speak version=\"1.0\" xml:lang=\"%LOCALE%\"> <voice name=\"%FONT%\" xml:lang=\"%LOCALE%\" xml:gender=\"%GENDER%\">%TEXT%</voice></speak>')
    .constant('VOICES', {
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
    })
    .provider('BingSpeech', BingSpeechProvider);

  BingSpeechProvider.$inject = [];

  function BingSpeechProvider() {
    //Inspired by https://github.com/palmerabollo/bingspeech-api-client
    this.$get = BingSpeech;

    var $subscriptionKey;

    this.useSubscriptionKey = function(subscriptionKey) {
      $subscriptionKey = subscriptionKey;
    };

    BingSpeech.$inject = ['$http', '$localStorage', '$q',
     'BING_SPEECH_API_URL', 'ISSUE_TOKEN_URL', 'SMML_TEMPLATE', 'VOICES'];

    function BingSpeech($http, $localStorage, $q, BING_SPEECH_API_URL, ISSUE_TOKEN_URL, SMML_TEMPLATE, VOICES) {
      var service = {
        recognize: recognize,
        synthesize: synthesize,
      };

      function recognize(audio, locale) {
        if (!$subscriptionKey) {
          return $q.reject('You must set the subscriptionKey first');
        }
        return getToken($subscriptionKey).then(function(token) {
            return $http.post(BING_SPEECH_API_URL + '/recognize', audio, {
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
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'audio/wav; samplerate=44100'
              }
            });
          });
      }

      function synthesize(text, locale, gender) {
        if (!$subscriptionKey) {
          return $q.reject('You must set the subscriptionKey first');
        }
        var font = VOICES[locale + " " + gender];
        var ssml = SMML_TEMPLATE
          .replace(/%LOCALE%/gi, locale)
          .replace(/%GENDER%/gi, gender)
          .replace(/%FONT%/gi, font)
          .replace(/%TEXT%/gi, text);
        return getToken($subscriptionKey).then(function(token) {
          return $http.post(BING_SPEECH_API_URL + '/synthesize', ssml, {
            responseType: 'arraybuffer',
            headers: {
              'Accept': 'audio/basic',
              'Authorization': 'Bearer ' + token,
              'Content-Type': 'application/ssml+xml',
              'X-Microsoft-OutputFormat': 'riff-8khz-8bit-mono-mulaw',
              'X-Search-AppId': '07D3234E49CE426DAA29772419F436CA',
              'X-Search-ClientID': '1ECFAE91408841A480F00935DC390960'
            }
          });
        });
      }

      function getToken(subscriptionKey) {
        var deferred = $q.defer();
        var token = $localStorage.authenticationToken;
        var tokenExpirationDate = $localStorage.tokenExpirationDate;

        if (token && tokenExpirationDate > Date.now()) {
          deferred.resolve(token);
        } else {
          $http.post(ISSUE_TOKEN_URL, {}, {
            headers: {
              'Ocp-Apim-Subscription-Key': subscriptionKey
            }
          }).then(function(response) {
            token = response.data;
            storeToken(token);
            deferred.resolve(token);
          }).catch(function(error) {
            deferred.reject(error);
          });
        }
        return deferred.promise;
      }

      function storeToken(token) {
        $localStorage.authenticationToken = token;
        // Refresh access token every 9 minutes
        $localStorage.tokenExpirationDate = Date.now() + 9 * 60 * 1000;
      }

      function uuid4() {
        // https://gist.github.com/kaizhu256/2853704
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(cc) {
          var rr = Math.random() * 16 | 0; return (cc === 'x' ? rr : (rr & 0x3 | 0x8)).toString(16);
        });
      }

      return service;
    }
  }
})();
