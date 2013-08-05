// Karma configuration

// base path, that will be used to resolve files and exclude
basePath = '..';

// list of files / patterns to load in the browser
files = [
    JASMINE,
    JASMINE_ADAPTER,
    REQUIRE,
    REQUIRE_ADAPTER,


    // all src and test modules (included: false)
    {pattern: 'public/js/**/*.js', included: false},
    {pattern: 'public/vendor/**/*.js', included: false},
    {pattern: 'public/templates/**/*.html', included: false},
    // libs required for test framework - required under commandline
    {pattern: 'test/support/angular/*.js', included: false},
    {pattern: 'node_modules/chai/chai.js', included: false},
    {pattern: 'test/support/spec_helper.js', included: true},

    // the tests
    {pattern: 'test/unit/**/*.js', included: false},

    // templates
    //  'tpl/*.html',

    // test main require module last
    'configs/test-unit-main.js'
];

// generate js files from html templates
//preprocessors = {
//  'tpl/*.html': 'html2js'
//};

// list of files to exclude
exclude = [];


// test results reporter to use
// possible values: 'dots', 'progress', 'junit'
reporters = ['progress'];


// web server port
port = 9877;


// cli runner port
runnerPort = 9101;


// enable / disable colors in the output (reporters and logs)
colors = true;


// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel = LOG_INFO;


// enable / disable watching file and executing tests whenever any file changes
autoWatch = true;


// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari (only Mac)
// - PhantomJS
// - IE (only Windows)
//browsers = ['PhantomJS', 'Chrome'];
browsers = ['Chrome'];


// If browser does not capture in given timeout [ms], kill it
captureTimeout = 60000;


// Continuous Integration mode
// if true, it capture browsers, run tests and exit
singleRun = false;
