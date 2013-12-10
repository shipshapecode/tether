module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')
    coffee:
      compile:
        files:
          'tether.js': 'tether.coffee'
          'drop.js': 'drop.coffee'
          'select.js': 'select.coffee'
          'tooltip.js': 'tooltip.coffee'
          'constraint.js': 'constraint.coffee'
          'abutment.js': 'abutment.coffee'
          'shift.js': 'shift.coffee'
          'docs/welcome/js/welcome.js': 'docs/welcome/coffee/welcome.coffee'

    watch:
      coffee:
        files: ['*.coffee', 'sass/*', 'docs/welcome/coffee/*.coffee', 'docs/welcome/sass/*.sass']
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
      welcomeDocs:
        options:
          sassDir: 'docs/welcome/sass'
          cssDir: 'docs/welcome/css'

  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-compass'

  grunt.registerTask 'default', ['coffee', 'uglify', 'compass']
