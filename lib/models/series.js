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
        number: { type: Number, required: true },
        webCode: { type: String, required: true },
        episodes: [{
            _id: false,
            number: { type: Number, required: true },
            webCode: { type: String, required: true },
            title: { type: String },
            airedAt: { type: Date },
            released: { type: Boolean, default: false },
            discovered: { type: Boolean, default: false },
            link: {
                SD: { type: String },
                HD: { type: String },
                fullHD: { type: String }
            }
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

    this.seasons = this.seasons.sort(function (a, b) { return a.number - b.number });

    next();
});

var series = mongoose.model('series', seriesSchema);

module.exports = series;