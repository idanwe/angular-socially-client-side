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
var Reload = Package.reload.Reload;
var Base64 = Package.base64.Base64;
var URL = Package.url.URL;

/* Package-scope variables */
var OAuth, Oauth;

(function () {

//////////////////////////////////////////////////////////////////////////////////////////
//                                                                                      //
// packages/oauth/oauth_client.js                                                       //
//                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////
                                                                                        //
// credentialToken -> credentialSecret. You must provide both the                       // 1
// credentialToken and the credentialSecret to retrieve an access token from            // 2
// the _pendingCredentials collection.                                                  // 3
var credentialSecrets = {};                                                             // 4
                                                                                        // 5
OAuth = {};                                                                             // 6
                                                                                        // 7
OAuth.showPopup = function (url, callback, dimensions) {                                // 8
  throw new Error("OAuth.showPopup must be implemented on this arch.");                 // 9
};                                                                                      // 10
                                                                                        // 11
// Determine the login style (popup or redirect) for this login flow.                   // 12
//                                                                                      // 13
//                                                                                      // 14
OAuth._loginStyle = function (service, config, options) {                               // 15
                                                                                        // 16
  if (Meteor.isCordova) {                                                               // 17
    return "popup";                                                                     // 18
  }                                                                                     // 19
                                                                                        // 20
  var loginStyle = (options && options.loginStyle) || config.loginStyle || 'popup';     // 21
                                                                                        // 22
  if (! _.contains(["popup", "redirect"], loginStyle))                                  // 23
    throw new Error("Invalid login style: " + loginStyle);                              // 24
                                                                                        // 25
  // If we don't have session storage (for example, Safari in private                   // 26
  // mode), the redirect login flow won't work, so fallback to the                      // 27
  // popup style.                                                                       // 28
  if (loginStyle === 'redirect') {                                                      // 29
    try {                                                                               // 30
      sessionStorage.setItem('Meteor.oauth.test', 'test');                              // 31
      sessionStorage.removeItem('Meteor.oauth.test');                                   // 32
    } catch (e) {                                                                       // 33
      loginStyle = 'popup';                                                             // 34
    }                                                                                   // 35
  }                                                                                     // 36
                                                                                        // 37
  return loginStyle;                                                                    // 38
};                                                                                      // 39
                                                                                        // 40
OAuth._stateParam = function (loginStyle, credentialToken) {                            // 41
  var state = {                                                                         // 42
    loginStyle: loginStyle,                                                             // 43
    credentialToken: credentialToken,                                                   // 44
    isCordova: Meteor.isCordova                                                         // 45
  };                                                                                    // 46
                                                                                        // 47
  if (loginStyle === 'redirect')                                                        // 48
    state.redirectUrl = '' + window.location;                                           // 49
                                                                                        // 50
  // Encode base64 as not all login services URI-encode the state                       // 51
  // parameter when they pass it back to us.                                            // 52
  // Use the 'base64' package here because 'btoa' isn't supported in IE8/9.             // 53
  return Base64.encode(JSON.stringify(state));                                          // 54
};                                                                                      // 55
                                                                                        // 56
                                                                                        // 57
// At the beginning of the redirect login flow, before we redirect to                   // 58
// the login service, save the credential token for this login attempt                  // 59
// in the reload migration data.                                                        // 60
//                                                                                      // 61
OAuth.saveDataForRedirect = function (loginService, credentialToken) {                  // 62
  Reload._onMigrate('oauth', function () {                                              // 63
    return [true, {loginService: loginService, credentialToken: credentialToken}];      // 64
  });                                                                                   // 65
  Reload._migrate(null, {immediateMigration: true});                                    // 66
};                                                                                      // 67
                                                                                        // 68
// At the end of the redirect login flow, when we've redirected back                    // 69
// to the application, retrieve the credentialToken and (if the login                   // 70
// was successful) the credentialSecret.                                                // 71
//                                                                                      // 72
// Called at application startup.  Returns null if this is normal                       // 73
// application startup and we weren't just redirected at the end of                     // 74
// the login flow.                                                                      // 75
//                                                                                      // 76
OAuth.getDataAfterRedirect = function () {                                              // 77
  var migrationData = Reload._migrationData('oauth');                                   // 78
                                                                                        // 79
  if (! (migrationData && migrationData.credentialToken))                               // 80
    return null;                                                                        // 81
                                                                                        // 82
  var credentialToken = migrationData.credentialToken;                                  // 83
  var key = OAuth._storageTokenPrefix + credentialToken;                                // 84
  var credentialSecret;                                                                 // 85
  try {                                                                                 // 86
    credentialSecret = sessionStorage.getItem(key);                                     // 87
    sessionStorage.removeItem(key);                                                     // 88
  } catch (e) {                                                                         // 89
    Meteor._debug('error retrieving credentialSecret', e);                              // 90
  }                                                                                     // 91
  return {                                                                              // 92
    loginService: migrationData.loginService,                                           // 93
    credentialToken: credentialToken,                                                   // 94
    credentialSecret: credentialSecret                                                  // 95
  };                                                                                    // 96
};                                                                                      // 97
                                                                                        // 98
// Launch an OAuth login flow.  For the popup login style, show the                     // 99
// popup.  For the redirect login style, save the credential token for                  // 100
// this login attempt in the reload migration data, and redirect to                     // 101
// the service for the login.                                                           // 102
//                                                                                      // 103
// options:                                                                             // 104
//  loginService: "facebook", "google", etc.                                            // 105
//  loginStyle: "popup" or "redirect"                                                   // 106
//  loginUrl: The URL at the login service provider to start the OAuth flow.            // 107
//  credentialRequestCompleteCallback: for the popup flow, call when the popup          // 108
//    is closed and we have the credential from the login service.                      // 109
//  credentialToken: our identifier for this login flow.                                // 110
//                                                                                      // 111
OAuth.launchLogin = function (options) {                                                // 112
  if (! options.loginService)                                                           // 113
    throw new Error('loginService required');                                           // 114
  if (options.loginStyle === 'popup') {                                                 // 115
    OAuth.showPopup(                                                                    // 116
      options.loginUrl,                                                                 // 117
      _.bind(options.credentialRequestCompleteCallback, null, options.credentialToken), // 118
      options.popupOptions);                                                            // 119
  } else if (options.loginStyle === 'redirect') {                                       // 120
    OAuth.saveDataForRedirect(options.loginService, options.credentialToken);           // 121
    window.location = options.loginUrl;                                                 // 122
  } else {                                                                              // 123
    throw new Error('invalid login style');                                             // 124
  }                                                                                     // 125
};                                                                                      // 126
                                                                                        // 127
// XXX COMPAT WITH 0.7.0.1                                                              // 128
// Private interface but probably used by many oauth clients in atmosphere.             // 129
OAuth.initiateLogin = function (credentialToken, url, callback, dimensions) {           // 130
  OAuth.showPopup(                                                                      // 131
    url,                                                                                // 132
    _.bind(callback, null, credentialToken),                                            // 133
    dimensions                                                                          // 134
  );                                                                                    // 135
};                                                                                      // 136
                                                                                        // 137
// Called by the popup when the OAuth flow is completed, right before                   // 138
// the popup closes.                                                                    // 139
OAuth._handleCredentialSecret = function (credentialToken, secret) {                    // 140
  check(credentialToken, String);                                                       // 141
  check(secret, String);                                                                // 142
  if (! _.has(credentialSecrets,credentialToken)) {                                     // 143
    credentialSecrets[credentialToken] = secret;                                        // 144
  } else {                                                                              // 145
    throw new Error("Duplicate credential token from OAuth login");                     // 146
  }                                                                                     // 147
};                                                                                      // 148
                                                                                        // 149
// Used by accounts-oauth, which needs both a credentialToken and the                   // 150
// corresponding to credential secret to call the `login` method over DDP.              // 151
OAuth._retrieveCredentialSecret = function (credentialToken) {                          // 152
  // First check the secrets collected by OAuth._handleCredentialSecret,                // 153
  // then check localStorage. This matches what we do in                                // 154
  // end_of_login_response.html.                                                        // 155
  var secret = credentialSecrets[credentialToken];                                      // 156
  if (! secret) {                                                                       // 157
    var localStorageKey = OAuth._storageTokenPrefix + credentialToken;                  // 158
    secret = Meteor._localStorage.getItem(localStorageKey);                             // 159
    Meteor._localStorage.removeItem(localStorageKey);                                   // 160
  } else {                                                                              // 161
    delete credentialSecrets[credentialToken];                                          // 162
  }                                                                                     // 163
  return secret;                                                                        // 164
};                                                                                      // 165
                                                                                        // 166
//////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////
//                                                                                      //
// packages/oauth/oauth_browser.js                                                      //
//                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////
                                                                                        //
// Browser specific code for the OAuth package.                                         // 1
                                                                                        // 2
// Open a popup window, centered on the screen, and call a callback when it             // 3
// closes.                                                                              // 4
//                                                                                      // 5
// @param url {String} url to show                                                      // 6
// @param callback {Function} Callback function to call on completion. Takes no         // 7
//   arguments.                                                                         // 8
// @param dimensions {optional Object(width, height)} The dimensions of                 // 9
//   the popup. If not passed defaults to something sane.                               // 10
OAuth.showPopup = function (url, callback, dimensions) {                                // 11
  // default dimensions that worked well for facebook and google                        // 12
  var popup = openCenteredPopup(                                                        // 13
    url,                                                                                // 14
    (dimensions && dimensions.width) || 650,                                            // 15
    (dimensions && dimensions.height) || 331                                            // 16
  );                                                                                    // 17
                                                                                        // 18
  var checkPopupOpen = setInterval(function() {                                         // 19
    try {                                                                               // 20
      // Fix for #328 - added a second test criteria (popup.closed === undefined)       // 21
      // to humour this Android quirk:                                                  // 22
      // http://code.google.com/p/android/issues/detail?id=21061                        // 23
      var popupClosed = popup.closed || popup.closed === undefined;                     // 24
    } catch (e) {                                                                       // 25
      // For some unknown reason, IE9 (and others?) sometimes (when                     // 26
      // the popup closes too quickly?) throws "SCRIPT16386: No such                    // 27
      // interface supported" when trying to read 'popup.closed'. Try                   // 28
      // again in 100ms.                                                                // 29
      return;                                                                           // 30
    }                                                                                   // 31
                                                                                        // 32
    if (popupClosed) {                                                                  // 33
      clearInterval(checkPopupOpen);                                                    // 34
      callback();                                                                       // 35
    }                                                                                   // 36
  }, 100);                                                                              // 37
};                                                                                      // 38
                                                                                        // 39
var openCenteredPopup = function(url, width, height) {                                  // 40
  var screenX = typeof window.screenX !== 'undefined'                                   // 41
        ? window.screenX : window.screenLeft;                                           // 42
  var screenY = typeof window.screenY !== 'undefined'                                   // 43
        ? window.screenY : window.screenTop;                                            // 44
  var outerWidth = typeof window.outerWidth !== 'undefined'                             // 45
        ? window.outerWidth : document.body.clientWidth;                                // 46
  var outerHeight = typeof window.outerHeight !== 'undefined'                           // 47
        ? window.outerHeight : (document.body.clientHeight - 22);                       // 48
  // XXX what is the 22?                                                                // 49
                                                                                        // 50
  // Use `outerWidth - width` and `outerHeight - height` for help in                    // 51
  // positioning the popup centered relative to the current window                      // 52
  var left = screenX + (outerWidth - width) / 2;                                        // 53
  var top = screenY + (outerHeight - height) / 2;                                       // 54
  var features = ('width=' + width + ',height=' + height +                              // 55
                  ',left=' + left + ',top=' + top + ',scrollbars=yes');                 // 56
                                                                                        // 57
  var newwindow = window.open(url, 'Login', features);                                  // 58
  if (newwindow.focus)                                                                  // 59
    newwindow.focus();                                                                  // 60
  return newwindow;                                                                     // 61
};                                                                                      // 62
//////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////
//                                                                                      //
// packages/oauth/oauth_common.js                                                       //
//                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////
                                                                                        //
OAuth._storageTokenPrefix = "Meteor.oauth.credentialSecret-";                           // 1
                                                                                        // 2
OAuth._redirectUri = function (serviceName, config, params, absoluteUrlOptions) {       // 3
  // XXX COMPAT WITH 0.9.0                                                              // 4
  // The redirect URI used to have a "?close" query argument.  We                       // 5
  // detect whether we need to be backwards compatible by checking for                  // 6
  // the absence of the `loginStyle` field, which wasn't used in the                    // 7
  // code which had the "?close" argument.                                              // 8
  // This logic is duplicated in the tool so that the tool can do OAuth                 // 9
  // flow with <= 0.9.0 servers (tools/auth.js).                                        // 10
  var query = config.loginStyle ? null : "close";                                       // 11
                                                                                        // 12
  // Clone because we're going to mutate 'params'. The 'cordova' and                    // 13
  // 'android' parameters are only used for picking the host of the                     // 14
  // redirect URL, and not actually included in the redirect URL itself.                // 15
  var isCordova = false;                                                                // 16
  var isAndroid = false;                                                                // 17
  if (params) {                                                                         // 18
    params = _.clone(params);                                                           // 19
    isCordova = params.cordova;                                                         // 20
    isAndroid = params.android;                                                         // 21
    delete params.cordova;                                                              // 22
    delete params.android;                                                              // 23
    if (_.isEmpty(params)) {                                                            // 24
      params = undefined;                                                               // 25
    }                                                                                   // 26
  }                                                                                     // 27
                                                                                        // 28
  if (Meteor.isServer && isCordova) {                                                   // 29
    var rootUrl = process.env.MOBILE_ROOT_URL ||                                        // 30
          __meteor_runtime_config__.ROOT_URL;                                           // 31
                                                                                        // 32
    if (isAndroid) {                                                                    // 33
      // Match the replace that we do in cordova boilerplate                            // 34
      // (boilerplate-generator package).                                               // 35
      // XXX Maybe we should put this in a separate package or something                // 36
      // that is used here and by boilerplate-generator? Or maybe                       // 37
      // `Meteor.absoluteUrl` should know how to do this?                               // 38
      var url = Npm.require("url");                                                     // 39
      var parsedRootUrl = url.parse(rootUrl);                                           // 40
      if (parsedRootUrl.hostname === "localhost") {                                     // 41
        parsedRootUrl.hostname = "10.0.2.2";                                            // 42
        delete parsedRootUrl.host;                                                      // 43
      }                                                                                 // 44
      rootUrl = url.format(parsedRootUrl);                                              // 45
    }                                                                                   // 46
                                                                                        // 47
    absoluteUrlOptions = _.extend({}, absoluteUrlOptions, {                             // 48
      // For Cordova clients, redirect to the special Cordova root url                  // 49
      // (likely a local IP in development mode).                                       // 50
      rootUrl: rootUrl                                                                  // 51
    });                                                                                 // 52
  }                                                                                     // 53
                                                                                        // 54
  return URL._constructUrl(                                                             // 55
    Meteor.absoluteUrl('_oauth/' + serviceName, absoluteUrlOptions),                    // 56
    query,                                                                              // 57
    params);                                                                            // 58
};                                                                                      // 59
                                                                                        // 60
//////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////
//                                                                                      //
// packages/oauth/deprecated.js                                                         //
//                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////
                                                                                        //
// XXX COMPAT WITH 0.8.0                                                                // 1
                                                                                        // 2
Oauth = OAuth;                                                                          // 3
                                                                                        // 4
//////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.oauth = {
  OAuth: OAuth,
  Oauth: Oauth
};

})();
