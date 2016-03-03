'use strict';

var gulp = require('gulp'),
    connect = require('gulp-connect'),
    less = require('gulp-less'),
    path = require('path'),
    concat = require('gulp-concat');

gulp.task('connect', function() {
    connect.server({
        root: './',
        livereload: true
    });
});

gulp.task('js', function () {
    gulp.src('./src/*.js')
        .pipe(connect.reload());
});

gulp.task('watch', function () {
    gulp.watch(['./src/*.js'], ['js']);
    gulp.watch(['./src/less/**/*.less'], ['less']);
});

gulp.task('default', ['connect', 'watch', 'less']);

gulp.task('less', function () {
  return gulp.src('./src/less/**/*.less')
    .pipe(less({
        paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(concat('graph.css'))
    .pipe(gulp.dest('./dist/css'))
    .pipe(connect.reload());
});
