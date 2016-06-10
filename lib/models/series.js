var mongoose = require.main.require('mongoose');

var seriesSchema = new mongoose.Schema({
    _id: { type: Number },
    seriesName: { type: String, required: true },
    overview: { type: String, required: true },
    banner: { type: String, required: true },
    genre: { type: Array },
    status: { type: String },
    siteRating: { type: Number },
    seasons: [{
        _id: false,
        number: { type: Number },
        webCode: { type: String },
        episodes: [{
            _id: false,
            number: { type: Number },
            webCode: { type: String },
            title: { type: String },
            airedAt: { type: Date },
            released: { type: Boolean }
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