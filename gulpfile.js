'use strict';

var gulp = require('gulp'),
    connect = require('gulp-connect'),
    sourcemaps = require("gulp-sourcemaps"),
    babel = require("gulp-babel");

gulp.task('connect', function() {
    connect.server({
        root: './',
        livereload: true
    });
});

gulp.task('js', ['es6'], function () {
    gulp.src('./src/*.js')
        .pipe(connect.reload());
});

gulp.task('watch', function () {
    gulp.watch(['./src/*.js'], ['js']);
});

gulp.task('default', ['connect', 'watch']);

gulp.task('es6', function () {
  return gulp.src('src/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
});
