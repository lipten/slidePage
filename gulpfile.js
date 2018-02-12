var gulp = require('gulp');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-clean-css');
var babel = require('gulp-babel');

gulp.task('css', function() {
    gulp.src('./slidePage.css')
        .pipe(minifyCss({
            compatibility: 'ie8',
            advanced: false,
            keepSpecialComments: '1'
        }))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./dist'));
});

gulp.task('js', function() {
    gulp.src('./slidePage.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest('./dist'));
});

gulp.task('default', ['css', 'js']);