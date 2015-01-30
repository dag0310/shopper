// The following values and functions must be global, because they are used
// outside of the scope of AngularJS or really should be applied globally

// Extending localStorage to allow saving of objects
Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
};

// Extending localStorage to allow returning of saved objects
Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
};
