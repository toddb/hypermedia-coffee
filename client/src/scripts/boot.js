/**
 * Support for loading the main application from the data-main attribute
 * of the application html.
 */
require(['app', 'angularAMD'], function(app, angularAMD){
    angularAMD.bootstrap(app);
});
