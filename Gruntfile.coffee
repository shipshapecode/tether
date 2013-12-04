module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')
    coffee:
      compile:
        files:
          'tether.js': 'tether.coffee'
          'drop.js': 'drop.coffee'

    watch:
      coffee:
        files: ['*.coffee', 'sass/*']
        tasks: ['coffee', 'uglify', 'compass']

    uglify:
      tether:
        src: 'tether.js'
        dest: 'tether.min.js'
        options:
          banner: '/*! tether.js <%= pkg.version %> */\n'

    compass:
      dist:
        options:
          sassDir: 'sass'
          cssDir: 'css'

  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-compass'

  grunt.registerTask 'default', ['coffee', 'uglify', 'compass']
