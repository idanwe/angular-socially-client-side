//////////////////////////////////////////////////////////////////////////
//                                                                      //
// This is a generated file. You can view the original                  //
// source in your browser if your browser supports source maps.         //
//                                                                      //
// If you are using Chrome, open the Developer Tools and click the gear //
// icon in its lower right corner. In the General Settings panel, turn  //
// on 'Enable source maps'.                                             //
//                                                                      //
// If you are using Firefox 23, go to `about:config` and set the        //
// `devtools.debugger.source-maps-enabled` preference to true.          //
// (The preference should be on by default in Firefox 24; versions      //
// older than 23 do not support source maps.)                           //
//                                                                      //
//////////////////////////////////////////////////////////////////////////


(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var Accounts = Package['accounts-base'].Accounts;
var Facebook = Package.facebook.Facebook;

(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                     //
// packages/accounts-facebook/facebook.js                                                              //
//                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                       //
Accounts.oauth.registerService('facebook');                                                            // 1
                                                                                                       // 2
if (Meteor.isClient) {                                                                                 // 3
  Meteor.loginWithFacebook = function(options, callback) {                                             // 4
    // support a callback without options                                                              // 5
    if (! callback && typeof options === "function") {                                                 // 6
      callback = options;                                                                              // 7
      options = null;                                                                                  // 8
    }                                                                                                  // 9
                                                                                                       // 10
    var credentialRequestCompleteCallback = Accounts.oauth.credentialRequestCompleteHandler(callback); // 11
    Facebook.requestCredential(options, credentialRequestCompleteCallback);                            // 12
  };                                                                                                   // 13
} else {                                                                                               // 14
  Accounts.addAutopublishFields({                                                                      // 15
    // publish all fields including access token, which can legitimately                               // 16
    // be used from the client (if transmitted over ssl or on                                          // 17
    // localhost). https://developers.facebook.com/docs/concepts/login/access-tokens-and-types/,       // 18
    // "Sharing of Access Tokens"                                                                      // 19
    forLoggedInUser: ['services.facebook'],                                                            // 20
    forOtherUsers: [                                                                                   // 21
      // https://www.facebook.com/help/167709519956542                                                 // 22
      'services.facebook.id', 'services.facebook.username', 'services.facebook.gender'                 // 23
    ]                                                                                                  // 24
  });                                                                                                  // 25
}                                                                                                      // 26
                                                                                                       // 27
/////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['accounts-facebook'] = {};

})();
