var mongoose = require.main.require('mongoose');

var userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    watchList: [{
        seasonId: { type: Number }
    }],
    createdAt: Date,
    updatedAt: Date
});

userSchema.pre('save', function (next) {
    var currentDate = new Date();

    this.updatedAt = currentDate;

    if (!this.createdAt)
        this.createdAt = currentDate;

    next();
});

var user = mongoose.model('user', userSchema);

module.exports = user;