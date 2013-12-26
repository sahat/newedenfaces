module.exports = function(grunt) {
  "use strict";

  grunt.initConfig({
    requirejs: {
      release: {
        options: {
          mainConfigFile: 'app/config.js',
          include: ['main'],
          out: 'app/source.min.js',
          optimize: 'uglify2',
          findNestedDependencies: true,
          name: 'almond',
          wrap: true,
          preserveLicenseComments: false
        }
      }
    },
    watch: {
      scripts: {
        files: ['public/js/*.js'],
        tasks: ['requirejs'],
        options: {
          spawn: false
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['requirejs']);
};
