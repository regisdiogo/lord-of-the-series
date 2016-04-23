var mongoose = require('mongoose');
var schema = mongoose.schema;

ObjectId = schema.ObjectId;

var seriesSchema = schema({
    _id: ObjectId,
    name: String,
    overview: String,
    externalId: {
        thetvdb: Number,
        imdb: String
    },
    banner: String
});

series = mongoose.model('series', seriesSchema);

exports.seriesModel = series;