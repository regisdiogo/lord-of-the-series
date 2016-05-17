var mongoose = require.main.require('mongoose');

var seriesSchema = new mongoose.Schema({
    _id: { type: Number },
    name: { type: String, required: true },
    overview: { type: String, required: true },
    banner: { type: String, required: true },
    seasons: [{
        id: { type: Number },
        code: { type: String },
        episodes: [{
            code: { type: String },
            airedAt: { type: Date }
        }]
    }],
    createdAt: Date,
    updatedAt: Date
});

seriesSchema.pre('save', function (next) {
    var currentDate = new Date();

    this.updatedAt = currentDate;

    if (!this.createdAt)
        this.createdAt = currentDate;

    next();
});

var series = mongoose.model('series', seriesSchema);

module.exports = series;