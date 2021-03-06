const gulp = require('gulp');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const uglifySaveLicense = require('uglify-save-license');
const karma = require('karma');
const path = require('path');
const clean = require('gulp-clean');

const conf = require('./conf/gulp.conf');

gulp.task('clean-dist', cleanDist);
gulp.task('test', karmaSingleRun);
gulp.task('test:auto', karmaAutoRun);
gulp.task('assembly', assembly);
//gulp.task('compress', compress);
gulp.task('build', gulp.series('clean-dist', 'test', 'assembly'));
gulp.task('default', gulp.series('build'));


function karmaSingleRun(done) {
    var configFile = path.join(process.cwd(), 'conf', 'karma.conf.js');
    new karma.Server({
            configFile: configFile
        }, karmaFinishHandler(done))
        .start();
}

function karmaAutoRun(done) {
    var configFile = path.join(process.cwd(), 'conf', 'karma-auto.conf.js');
    new karma.Server({
            configFile: configFile
        }, karmaFinishHandler(done))
        .start();
}

function karmaFinishHandler(done) {
    return function(failCount) {
        done(failCount ? new Error("Failed " + failCount + " tests.") : null);
    };
}

function cleanDist() {
    return gulp.src(conf.path.dist('*'))
        .pipe(clean());
}

function assembly() {
    return gulp.src(conf.path.src('**/*.js'))
        .pipe(concat('bing-speech.js'))
        .pipe(gulp.dest(conf.path.dist()));
}

// function compress() {
//     return gulp.src(conf.path.dist('bing-speech.js'))
//         .pipe(uglify({
//             preserveComments: uglifySaveLicense
//         })).on('error', conf.errorHandler('Uglify'))
//         .pipe(gulp.dest(conf.path.dist('bing-speech.min.js')));
// }
