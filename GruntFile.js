/*global module:false*/
module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({
        pkg: '<json:package.json>',
        meta: {
            banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
                '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
                ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
        },
        recess: {
            dev: {
                src: ['public/less/base.less'],
                dest: 'public/dist/style.css',
                options: {
                    compile: true
                }
            },
            prod: {
                src: ['public/less/base.less'],
                dest: 'public/dist/style.css',
                options: {
                    compile: true,
                    compress: true
                }
            }
        },
        requirejs: {
            compile: {
                options: {
                    baseUrl: 'public/js',
                    name: 'main',
                    mainConfigFile: 'public/vendor/require.config.js',
                    out: 'public/dist/main.built.js'
                }
            }
        },
        simplemocha: {
            acceptance: {
                src: 'test/acceptance/**/*.js',
                options: {
                    globals: ['should'],
                    timeout: 3000,
                    ignoreLeaks: false,
                    ui: 'exports',
                    reporter: 'spec'
                }
            },
            integration: {
                src: 'test/integration/**/*.js',
                options: {
                    timeout: 5000,
                    ignoreLeaks: false,
                    ui: 'exports',
                    reporter: 'spec'
                }
            },
            unit: {
                src: 'test/unit-server/**/*.js',
                options: {
                    timeout: 5000,
                    ignoreLeaks: false,
                    ui: 'exports',
                    reporter: 'spec'
                }
            }
        },
        watch: {
            less: {
                files: ['public/less/**/*.less'],
                tasks: 'less'
            },
            lint: {
                files: ['<config:lint.client>', '<config:lint.server>', '<config:lint.grunt>'],
                tasks: 'lint'
            },
            requirejs: {
                files: ['<config:lint.client>', 'public/dist/'],
                tasks: 'requirejs'
            },
            test: {
                files: ['public/dist/',
                    '<config:simplemocha.integration.src>',
                    '<config:simplemocha.acceptance.src>'],
                tasks: ['simplemocha']
            },
            unit: {
                files: ['app/**/*', '<config:simplemocha.unit.src>' ],
                tasks: ['simplemocha:unit']
            }
        },
        jshint: {
            // Defaults
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                strict: true,
                es5: true,
                trailing: true,
                maxlen: 120,
                laxcomma: true
            },
            globals: {
                define: true,
                require: true,
                describe: true,
                it: true,
                expect: true,
                afterEach: true,
                beforeEach: true,
                sinon: true,
                console: true
            },
            server: {
                options: {
                    node: true,
                    es5: true,
                    strict: true
                },
                globals: {}
            },
            client: {
                options: {
                    browser: true
                },
                globals: {}
            }
        },
        uglify: {},
        exec: {
            dev: {
                command: 'export NODE_ENV=development && npm start',
                stdout: true
            },
            prod: {
                command: 'export NODE_ENV=production && npm start',
                stdout: true
            },
            test: {
                command: 'export NODE_ENV=test && npm start',
                stdout: true
            }
        },
        karma: {
            options: {
                runnerPort: 9999,
                singleRun: false,
                autoWatch: false,
                browsers: ['Chrome']
            },

            unit: {
                configFile: 'configs/test-unit.conf.js'
            },
            e2e: {
                configFile: 'configs/test-e2e.conf.js'
            }
        }
    });

    // Load up npm task plugins
    grunt.loadNpmTasks('grunt-recess'); // TODO: refactor out for grunt-contrib-less
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-simple-mocha');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-karma');

    // Does a basic build.
    grunt.registerTask('default', ['compile']);

    grunt.registerTask('less', 'recess:dev');
    grunt.registerTask('compile', ['requirejs', 'less']);

    // Does a full production-ready build and compresses and minifies everything.
    grunt.registerTask('prod', ['compile', 'recess:prod', 'exec:prod']);
    grunt.registerTask('server', [ 'compile', 'exec:dev']);

    grunt.registerTask('test', ['unit', 'integration', 'acceptance']);
    grunt.registerTask('integration', ['simplemocha:integration']);

    grunt.registerTask('acceptance', ['simplemocha:acceptance', 'karma:e2e']);  // TODO: spin up test on unique port
    grunt.registerTask('unit', ['simplemocha:unit', 'karma:unit']);
};
