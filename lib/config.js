var config = {};

config.thetvdb = {};
config.thetvdb.api = {};

config.thetvdb.apikey = '119C0D8020E9ECC2';
config.thetvdb.searchByName = 'http://thetvdb.com/api/GetSeries.php?seriesname=%s';

config.thetvdb.api.login = 'https://api.thetvdb.com/login';
config.thetvdb.api.languages = 'https://api.thetvdb.com/languages';
config.thetvdb.api.searchByName = 'https://api.thetvdb.com/search/series?name=%s';
config.thetvdb.api.getSeriesById = 'https://api.thetvdb.com/series/%s';
config.thetvdb.api.getEpisodesSummary = 'https://api.thetvdb.com/series/%s/episodes?page=%s';

config.katUrl = 'https://kat.cr/json.php?field=seeders&order=desc&q=%s';

module.exports = config;