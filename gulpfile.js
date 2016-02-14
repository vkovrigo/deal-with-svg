'use strict';

var gulp = require('gulp'),
    connect = require('gulp-connect');

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
});

gulp.task('default', ['connect', 'watch']);
