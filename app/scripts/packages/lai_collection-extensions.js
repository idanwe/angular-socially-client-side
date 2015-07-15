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
var Mongo = Package.mongo.Mongo;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var LocalCollection = Package.minimongo.LocalCollection;
var Minimongo = Package.minimongo.Minimongo;

/* Package-scope variables */
var CollectionExtensions;

(function () {

///////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                           //
// packages/lai:collection-extensions/collection-extensions.js                               //
//                                                                                           //
///////////////////////////////////////////////////////////////////////////////////////////////
                                                                                             //
// The collection extensions namespace                                                       // 1
CollectionExtensions = {};                                                                   // 2
                                                                                             // 3
// Stores all the collection extensions                                                      // 4
CollectionExtensions._extensions = [];                                                       // 5
                                                                                             // 6
// This is where you would add custom functionality to                                       // 7
// Mongo.Collection/Meteor.Collection                                                        // 8
Meteor.addCollectionExtension = function (customFunction) {                                  // 9
  if (typeof customFunction !== 'function') {                                                // 10
    throw new Meteor.Error(                                                                  // 11
      'collection-extension-wrong-argument',                                                 // 12
      'You must pass a function \
       into Meteor.addCollectionExtension().');                                              // 14
  }                                                                                          // 15
  CollectionExtensions._extensions.push(customFunction);                                     // 16
  // If Meteor.users exists, apply the extension right away                                  // 17
  if (typeof Meteor.users !== 'undefined') {                                                 // 18
    customFunction.apply(Meteor.users, ['users']);                                           // 19
  }                                                                                          // 20
};                                                                                           // 21
                                                                                             // 22
// Utility function to add a prototype function to your                                      // 23
// Meteor/Mongo.Collection object                                                            // 24
Meteor.addCollectionPrototype = function (name, customFunction) {                            // 25
  if (typeof name !== 'string') {                                                            // 26
    throw new Meteor.Error(                                                                  // 27
      'collection-extension-wrong-argument',                                                 // 28
      'You must pass a string as the first argument \
       into Meteor.addCollectionPrototype().');                                              // 30
  }                                                                                          // 31
  if (typeof customFunction !== 'function') {                                                // 32
    throw new Meteor.Error(                                                                  // 33
      'collection-extension-wrong-argument',                                                 // 34
      'You must pass a function as the second argument \
       into Meteor.addCollectionPrototype().');                                              // 36
  }                                                                                          // 37
  (typeof Mongo !== 'undefined' ?                                                            // 38
    Mongo.Collection :                                                                       // 39
    Meteor.Collection).prototype[name] = customFunction;                                     // 40
};                                                                                           // 41
                                                                                             // 42
// This is used to reassign the prototype of unfortunately                                   // 43
// and unstoppably already instantiated Mongo instances                                      // 44
// i.e. Meteor.users                                                                         // 45
CollectionExtensions._reassignCollectionPrototype = function (instance, constr) {            // 46
  var hasSetPrototypeOf = typeof Object.setPrototypeOf === 'function';                       // 47
                                                                                             // 48
  if (!constr) constr = typeof Mongo !== 'undefined' ? Mongo.Collection : Meteor.Collection; // 49
                                                                                             // 50
  // __proto__ is not available in < IE11                                                    // 51
  // Note: Assigning a prototype dynamically has performance implications                    // 52
  if (hasSetPrototypeOf) {                                                                   // 53
    Object.setPrototypeOf(instance, constr.prototype);                                       // 54
  } else if (instance.__proto__) {                                                           // 55
    instance.__proto__ = constr.prototype;                                                   // 56
  }                                                                                          // 57
};                                                                                           // 58
                                                                                             // 59
// This monkey-patches the Collection constructor                                            // 60
// This code is the same monkey-patching code                                                // 61
// that matb33:collection-hooks uses, which works pretty nicely                              // 62
CollectionExtensions._wrapCollection = function (ns, as) {                                   // 63
  // Save the original prototype                                                             // 64
  if (!as._CollectionPrototype) as._CollectionPrototype = new as.Collection(null);           // 65
                                                                                             // 66
  var constructor = as.Collection;                                                           // 67
  var proto = as._CollectionPrototype;                                                       // 68
                                                                                             // 69
  ns.Collection = function () {                                                              // 70
    var ret = constructor.apply(this, arguments);                                            // 71
    // This is where all the collection extensions get processed                             // 72
    CollectionExtensions._processCollectionExtensions(this, arguments);                      // 73
    return ret;                                                                              // 74
  };                                                                                         // 75
                                                                                             // 76
  ns.Collection.prototype = proto;                                                           // 77
                                                                                             // 78
  for (var prop in constructor) {                                                            // 79
    if (constructor.hasOwnProperty(prop)) {                                                  // 80
      ns.Collection[prop] = constructor[prop];                                               // 81
    }                                                                                        // 82
  }                                                                                          // 83
};                                                                                           // 84
                                                                                             // 85
CollectionExtensions._processCollectionExtensions = function (self, args) {                  // 86
  // Using old-school operations for better performance                                      // 87
  // Please don't judge me ;P                                                                // 88
  var args = args ? [].slice.call(args, 0) : undefined;                                      // 89
  var extensions = CollectionExtensions._extensions;                                         // 90
  for (var i = 0, len = extensions.length; i < len; i++) {                                   // 91
    extensions[i].apply(self, args);                                                         // 92
  }                                                                                          // 93
};                                                                                           // 94
                                                                                             // 95
if (typeof Mongo !== 'undefined') {                                                          // 96
  CollectionExtensions._wrapCollection(Meteor, Mongo);                                       // 97
  CollectionExtensions._wrapCollection(Mongo, Mongo);                                        // 98
} else {                                                                                     // 99
  CollectionExtensions._wrapCollection(Meteor, Meteor);                                      // 100
}                                                                                            // 101
                                                                                             // 102
if (typeof Meteor.users !== 'undefined') {                                                   // 103
  // Ensures that Meteor.users instanceof Mongo.Collection                                   // 104
  CollectionExtensions._reassignCollectionPrototype(Meteor.users);                           // 105
}                                                                                            // 106
///////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['lai:collection-extensions'] = {};

})();
