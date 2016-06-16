var mongoose = require.main.require('mongoose');

var userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    watchList: [{
        _id: false,
        seriesId: { type: Number, required: true },
        seasons: [{
            _id: false,
            number: { type: Number },
            webCode: { type: String, required: true },
            completed: { type: Boolean, default: false },
            episodes: [{
                _id: false,
                number: { type: Number },
                webCode: { type: String, required: true },
                downloaded: { type: Boolean, default: false }
            }]
        }]
    }],
    createdAt: { type: Date },
    updatedAt: { type: Date }
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