Number.prototype.between = function(a, b) {
    var min = Math.min(a, b),
        max = Math.max(a, b);

    return this >= min && this < max;
};
