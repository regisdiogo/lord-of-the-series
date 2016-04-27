var mongoose = require.main.require('mongoose');
var schema = mongoose.schema;

var seriesModel = function(options) {
    var db;

    if (!options.db) {
        throw new Error('Options.db is required');
    }

    db = options.db;

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

    return {
        create: function(done) {
            throw new Error('create not implemented');
        },
        update: function(done) {
            throw new Error('update not implemented');
        }
    }
};

exports.seriesModel = seriesModel;