var mongoose = require.main.require('mongoose');

var seriesSchema = new mongoose.Schema({
    _id: { type: Number },
    seriesName: { type: String, required: true },
    overview: { type: String, required: true },
    banner: { type: String, required: true },
    genre: { type: Array },
    status: { type: String },
    siteRating: { type: Number },
    episodes: [{
        _id: false,
        seasonNumber: { type: Number, required: true },
        seasonWebCode: { type: String, required: true },
        episodeNumber: { type: Number, required: true },
        episodeWebCode: { type: String, required: true },
        title: { type: String },
        airedAt: { type: Date },
        released: { type: Boolean, default: false },
        discovered: { type: Boolean, default: false },
        link: [{
            _id: false,
            type: { type: String },
            title: { type: String },
            size: { type: Number },
            torrent: { type: String },
            hash: { type: String }
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

    this.episodes = this.episodes.sort(function (a, b) {
        var episodeA = ((a.episodeNumber >= 10) ? '' : '0') + a.episodeNumber;
        var episodeB = ((b.episodeNumber >= 10) ? '' : '0') + b.episodeNumber;
        return parseInt(a.seasonNumber + episodeA) - parseInt(b.seasonNumber + episodeB);
    });

    next();
});

var series = mongoose.model('series', seriesSchema);

module.exports = series;