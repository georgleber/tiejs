module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            all: ['Gruntfile.js', 'src/*.js'],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        uglify: {
            options: {
                banner: '/*!\n TieJS - https://georghenkel.github.io/tiejs/\n Licensed under the MIT license\n Copyright (c) 2023 Georg Leber <g.leber@cg-solutions.de>, Christoph Huppertz <c.huppertz@cg-solutions.de>\n */\n'
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
