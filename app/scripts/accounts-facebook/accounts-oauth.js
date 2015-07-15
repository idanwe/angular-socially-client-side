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
var _ = Package.underscore._;
var Random = Package.random.Random;
var check = Package.check.check;
var Match = Package.check.Match;
var Accounts = Package['accounts-base'].Accounts;
var OAuth = Package.oauth.OAuth;
var Oauth = Package.oauth.Oauth;

(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                              //
// packages/accounts-oauth/oauth_common.js                                                      //
//                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                //
Accounts.oauth = {};                                                                            // 1
                                                                                                // 2
var services = {};                                                                              // 3
                                                                                                // 4
// Helper for registering OAuth based accounts packages.                                        // 5
// On the server, adds an index to the user collection.                                         // 6
Accounts.oauth.registerService = function (name) {                                              // 7
  if (_.has(services, name))                                                                    // 8
    throw new Error("Duplicate service: " + name);                                              // 9
  services[name] = true;                                                                        // 10
                                                                                                // 11
  if (Meteor.server) {                                                                          // 12
    // Accounts.updateOrCreateUserFromExternalService does a lookup by this id,                 // 13
    // so this should be a unique index. You might want to add indexes for other                // 14
    // fields returned by your service (eg services.github.login) but you can do                // 15
    // that in your app.                                                                        // 16
    Meteor.users._ensureIndex('services.' + name + '.id',                                       // 17
                              {unique: 1, sparse: 1});                                          // 18
  }                                                                                             // 19
};                                                                                              // 20
                                                                                                // 21
Accounts.oauth.serviceNames = function () {                                                     // 22
  return _.keys(services);                                                                      // 23
};                                                                                              // 24
                                                                                                // 25
//////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                              //
// packages/accounts-oauth/oauth_client.js                                                      //
//                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                //
// Documentation for Meteor.loginWithExternalService                                            // 1
                                                                                                // 2
/**                                                                                             // 3
 * @name loginWith<ExternalService>                                                             // 4
 * @memberOf Meteor                                                                             // 5
 * @function                                                                                    // 6
 * @summary Log the user in using an external service.                                          // 7
 * @locus Client                                                                                // 8
 * @param {Object} [options]                                                                    // 9
 * @param {String[]} options.requestPermissions A list of permissions to request from the user. // 10
 * @param {Boolean} options.requestOfflineToken If true, asks the user for permission to act on their behalf when offline. This stores an additional offline token in the `services` field of the user document. Currently only supported with Google.
 * @param {Boolean} options.forceApprovalPrompt If true, forces the user to approve the app's permissions, even if previously approved. Currently only supported with Google.
 * @param {String} options.userEmail An email address that the external service will use to pre-fill the login prompt. Currently only supported with Meteor developer accounts.
 * @param {String} options.loginStyle Login style ("popup" or "redirect", defaults to the login service configuration).  The "popup" style opens the login page in a separate popup window, which is generally preferred because the Meteor application doesn't need to be reloaded.  The "redirect" style redirects the Meteor application's window to the login page, and the login service provider redirects back to the Meteor application which is then reloaded.  The "redirect" style can be used in situations where a popup window can't be opened, such as in a mobile UIWebView.  The "redirect" style however relies on session storage which isn't available in Safari private mode, so the "popup" style will be forced if session storage can't be used.
 * @param {Function} [callback] Optional callback. Called with no arguments on success, or with a single `Error` argument on failure. The callback cannot be called if you are using the "redirect" `loginStyle`, because the app will have reloaded in the meantime; try using [client-side login hooks](#accounts_onlogin) instead.
 */                                                                                             // 16
                                                                                                // 17
// Allow server to specify a specify subclass of errors. We should come                         // 18
// up with a more generic way to do this!                                                       // 19
var convertError = function (err) {                                                             // 20
  if (err && err instanceof Meteor.Error &&                                                     // 21
      err.error === Accounts.LoginCancelledError.numericError)                                  // 22
    return new Accounts.LoginCancelledError(err.reason);                                        // 23
  else                                                                                          // 24
    return err;                                                                                 // 25
};                                                                                              // 26
                                                                                                // 27
                                                                                                // 28
// For the redirect login flow, the final step is that we're                                    // 29
// redirected back to the application.  The credentialToken for this                            // 30
// login attempt is stored in the reload migration data, and the                                // 31
// credentialSecret for a successful login is stored in session                                 // 32
// storage.                                                                                     // 33
                                                                                                // 34
Meteor.startup(function () {                                                                    // 35
  var oauth = OAuth.getDataAfterRedirect();                                                     // 36
  if (! oauth)                                                                                  // 37
    return;                                                                                     // 38
                                                                                                // 39
  // We'll only have the credentialSecret if the login completed                                // 40
  // successfully.  However we still call the login method anyway to                            // 41
  // retrieve the error if the login was unsuccessful.                                          // 42
                                                                                                // 43
  var methodName = 'login';                                                                     // 44
  var methodArguments = [{oauth: _.pick(oauth, 'credentialToken', 'credentialSecret')}];        // 45
                                                                                                // 46
  Accounts.callLoginMethod({                                                                    // 47
    methodArguments: methodArguments,                                                           // 48
    userCallback: function (err) {                                                              // 49
      // The redirect login flow is complete.  Construct an                                     // 50
      // `attemptInfo` object with the login result, and report back                            // 51
      // to the code which initiated the login attempt                                          // 52
      // (e.g. accounts-ui, when that package is being used).                                   // 53
      err = convertError(err);                                                                  // 54
      Accounts._pageLoadLogin({                                                                 // 55
        type: oauth.loginService,                                                               // 56
        allowed: !err,                                                                          // 57
        error: err,                                                                             // 58
        methodName: methodName,                                                                 // 59
        methodArguments: methodArguments                                                        // 60
      });                                                                                       // 61
    }                                                                                           // 62
  });                                                                                           // 63
});                                                                                             // 64
                                                                                                // 65
                                                                                                // 66
// Send an OAuth login method to the server. If the user authorized                             // 67
// access in the popup this should log the user in, otherwise                                   // 68
// nothing should happen.                                                                       // 69
Accounts.oauth.tryLoginAfterPopupClosed = function(credentialToken, callback) {                 // 70
  var credentialSecret = OAuth._retrieveCredentialSecret(credentialToken) || null;              // 71
  Accounts.callLoginMethod({                                                                    // 72
    methodArguments: [{oauth: {                                                                 // 73
      credentialToken: credentialToken,                                                         // 74
      credentialSecret: credentialSecret                                                        // 75
    }}],                                                                                        // 76
    userCallback: callback && function (err) {                                                  // 77
      callback(convertError(err));                                                              // 78
    }});                                                                                        // 79
};                                                                                              // 80
                                                                                                // 81
Accounts.oauth.credentialRequestCompleteHandler = function(callback) {                          // 82
  return function (credentialTokenOrError) {                                                    // 83
    if(credentialTokenOrError && credentialTokenOrError instanceof Error) {                     // 84
      callback && callback(credentialTokenOrError);                                             // 85
    } else {                                                                                    // 86
      Accounts.oauth.tryLoginAfterPopupClosed(credentialTokenOrError, callback);                // 87
    }                                                                                           // 88
  };                                                                                            // 89
};                                                                                              // 90
                                                                                                // 91
//////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['accounts-oauth'] = {};

})();
