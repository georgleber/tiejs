module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            all: ['Gruntfile.js', 'src/*.js']
        },
        uglify: {
            options: {
                banner: '/*!\n TieJS - http://develman.github.io/tiejs\n Licensed under the MIT license\n Copyright (c) 2017 Georg Henkel <g.henkel@cg-solutions.de>, Christoph Huppertz <c.huppertz@cg-solutions.de>\n */\n'
            },
            build: {
                src: 'src/tie.js',
                dest: 'dist/tie.min.js'
            }
        },
        copy: {
            main: {
                src: 'src/tie.js',
                dest: 'dist/tie.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('default', ['jshint', 'uglify', 'copy']);
};