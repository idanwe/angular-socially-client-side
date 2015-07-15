window.Counts = new Mongo.Collection('counts');                                                           // 90
                                                                                                     // 91
Counts.get = function(name) {                                                                      // 92
  var count = this.findOne(name);                                                                  // 93
  return count && count.count || 0;                                                                // 94
};
