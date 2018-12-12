/* --------------------------------------------------------------------------------
    Modules
-------------------------------------------------------------------------------- */

const args = require('yargs').argv;
const autoprefixer = require('autoprefixer');
const browserSyncSite = require('browser-sync').create('site');
const browserSyncStyleguide = require('browser-sync').create('styleguide');

const browserSyncSiteReload = browserSyncSite.reload;
const browserSyncStyleguideReload = browserSyncStyleguide.reload;
const cssnano = require('cssnano');
const del = require('del');
const gulp = require('gulp');
const gulpif = require('gulp-if');
const imagemin = require('gulp-imagemin');
const lost = require('lost');
const postcss = require('gulp-postcss');
const run = require('gulp-run-command').default;
const sass = require('gulp-dart-sass');
const sourcemaps = require('gulp-sourcemaps');
const svgmin = require('gulp-svgmin');
const svgSymbols = require('gulp-svg-symbols');
const twig = require('gulp-twig');
const webpack = require('webpack-stream');

const isProd = args.env === 'production';
const config = require('./gulpfile.config');
const webpackConfig = require('./webpack.config.js');

/* --------------------------------------------------------------------------------
    CLEAN
-------------------------------------------------------------------------------- */
gulp.task('clean', () => del(
    [
        config.root.public,
        './kss-styleguide/styleguide',
    ],
));

gulp.task('clean-kss', () => del(
    [
        './kss-styleguide/styleguide',
    ],
));

/* --------------------------------------------------------------------------------
    TWIG STYLEGUIDE
-------------------------------------------------------------------------------- */
const twigOptions = {
    verbose: true,
};

// eslint-disable-next-line arrow-body-style
gulp.task('twig-site', () => {
    return gulp
        .src(`${config.twigSite.dev}/pages/*.twig`)
        .pipe(twig(twigOptions))
        .pipe(gulp.dest(config.twigSite.dist));
});

/* --------------------------------------------------------------------------------
    WEBPACK
-------------------------------------------------------------------------------- */
const webpackTask = (watch) => {
    webpackConfig.watch = watch;
    return gulp.src(`${config.scripts.dev}/main.js`)
        .pipe(webpack(webpackConfig))
        .pipe(gulp.dest(config.scripts.dist));
};

gulp.task('webpack', () => webpackTask(false));

gulp.task('webpack-watch', () => webpackTask(true));

/* --------------------------------------------------------------------------------
    SASS
-------------------------------------------------------------------------------- */
const sassOpts = {
    outputStyle: isProd ? 'compressed' : 'expanded',
    includePaths: ['node_modules'],
};
const sassPlugins = [
    lost(),
    autoprefixer({
        browsers: [
            'last 2 versions',
            'ie >= 10',
        ],
    }),
];
if (isProd) {
    sassPlugins.push(cssnano({
        preset: 'default',
    }));
}


gulp.task('sass', () => {
    return gulp.src(`${config.styles.dev}/main.scss`)
        .pipe(gulpif(!isProd, sourcemaps.init()))
        .pipe(sass(sassOpts)).on('error', sass.logError)
        .pipe(postcss(sassPlugins))
        .pipe(gulpif(!isProd, sourcemaps.write()))
        .pipe(gulp.dest(config.styles.dist))
        .pipe(gulpif(config.styleguide, gulp.dest(config.styles.kssDist)))
        .pipe(browserSyncSiteReload({
            stream: true,
        }))
        .pipe(gulpif(config.styleguide, browserSyncStyleguideReload({
            stream: true,
        })));
});

gulp.task('kss-sass', () => {
    return gulp.src(`${config.styles.kssDev}/kss.scss`)
        .pipe(gulpif(!isProd, sourcemaps.init()))
        .pipe(sass(sassOpts)).on('error', sass.logError)
        .pipe(postcss(sassPlugins))
        .pipe(gulpif(!isProd, sourcemaps.write()))
        .pipe(gulp.dest(config.styles.kssDist))
        .pipe(browserSyncStyleguideReload({
            stream: true,
        }));
});

/* --------------------------------------------------------------------------------
    ASSETS
-------------------------------------------------------------------------------- */
gulp.task('images', () => gulp
    .src(`${config.images.dev}/*`)
    .pipe(imagemin())
    .pipe(gulp.dest(config.images.dist)));

gulp.task('svg', () => gulp
    .src(`${config.svg.dev}'/*`)
    .pipe(svgmin({
        plugins: [{
            removeViewBox: false,
        }],
    }))
    .pipe(svgSymbols({
        templates: ['default-svg'],
    }))
    .pipe(gulp.dest(config.svg.dist)));

gulp.task('fonts', () => gulp.src(`${config.fonts.dev}/*`).pipe(gulp.dest(config.fonts.dist)));

gulp.task('json', () => gulp.src(`${config.json.dev}/*`).pipe(gulp.dest(config.json.dist)));

gulp.task('video', () => gulp.src(`${config.video.dev}/*`).pipe(gulp.dest(config.video.dist)));

/* --------------------------------------------------------------------------------
    SERVER
-------------------------------------------------------------------------------- */
gulp.task('browser-sync', (cb) => {
    browserSyncSite.init({
        proxy: false,
        server: {
            baseDir: config.browserSync.baseDir,
        },
        port: 3000,
        ui: {
            port: 3000,
        },
        notify: true,
        files: [
            './templates/**/*.twig',
            `${config.scripts.dist}/**/*.js`,
            `${config.scripts.dist}/**/*.css`,
        ],
        ghostMode: {
            clicks: true,
            links: true,
            forms: true,
            scroll: true,
        },
        reloadDelay: 250,
    });
    cb();
});

gulp.task('browser-sync-sg', (cb) => {
    browserSyncStyleguide.init({
        proxy: false,
        server: {
            baseDir: './kss-styleguide/styleguide',
        },
        port: 4001,
        ui: {
            port: 4001,
        },
        notify: true,
        files: [
            './kss-styleguide/styleguide/*.html',
            './kss-styleguide/styleguide/markup/*.html',
            `${config.styles.dist}/**/*.css`,
        ],
        ghostMode: {
            clicks: true,
            links: true,
            forms: true,
            scroll: true,
        },
        reloadDelay: 2000,
    });
    cb();
});

/* --------------------------------------------------------------------------------
    STYLEGUIDE (KSS)
-------------------------------------------------------------------------------- */

// eslint-disable-next-line arrow-body-style
gulp.task('twig-styleguide', () => {
    return gulp
        .src(`${config.twigStyleGuide.dev}/*.twig`)
        .pipe(twig(twigOptions))
        .pipe(gulp.dest(config.twigStyleGuide.dist));
});

gulp.task('kss-build', run('npm run kss'));

gulp.task('kss', gulp.series(
    'clean-kss',
    'sass',
    'twig-styleguide',
    'kss-build',
    'kss-sass',
));

gulp.task('reload-styleguide', (done) => {
    browserSyncStyleguide.reload();
    done();
});


/* --------------------------------------------------------------------------------
    WATCH-FILES
-------------------------------------------------------------------------------- */
gulp.task('watch-files', (done) => {
    gulp.watch(`${config.images.dev}/**/*`, gulp.series('images'));
    gulp.watch(`${config.svg.dev}/**/*`, gulp.series('svg'));
    gulp.watch(`${config.fonts.dev}/**/*`, gulp.series('fonts'));
    gulp.watch(`${config.json.dev}/**/*`, gulp.series('json'));
    gulp.watch(`${config.video.dev}/**/*`, gulp.series('video'));
    gulp.watch(`${config.twigSite.dev}/**/*.twig`, gulp.series('twig-site'));

    gulp.watch([
        `${config.root.dist}/**/*.css`,
        `${config.root.dist}/**/*.js`,
    ]);

    if (config.styleguide) {
        gulp.watch(`${config.styles.dev}/**/*`, gulp.series('kss', 'reload-styleguide'));
    } else {
        gulp.watch(`${config.styles.dev}/**/*`, gulp.series('sass'));
    }

    if (config.styleguide) {
        gulp.watch(`${config.twigStyleGuide.dev}/**/*.twig`, gulp.series('kss', 'reload-styleguide'));
        gulp.watch(`${config.styles.kssDev}/**/*`, gulp.series('kss-sass'));
    }

    done();
});

/* --------------------------------------------------------------------------------
    BUILD TASKS
-------------------------------------------------------------------------------- */
gulp.task('build-with-sg', gulp.series(
    'clean',
    gulp.parallel(
        'sass',
        'webpack',
        'images',
        'svg',
        'fonts',
        'video',
        'json',
        'twig-site',
    ),
    'kss',
));

gulp.task('build-no-sg', gulp.series(
    'clean',
    gulp.parallel(
        'sass',
        'webpack',
        'images',
        'svg',
        'fonts',
        'video',
        'json',
        'twig-site',
    ),
));

gulp.task('build', config.styleguide ? gulp.task('build-with-sg') : gulp.task('build-no-sg'));

/* --------------------------------------------------------------------------------
    WATCH TASK
-------------------------------------------------------------------------------- */
gulp.task('watch-with-sg', gulp.series(
    'build',
    gulp.parallel(
        'webpack-watch',
        'browser-sync',
        'browser-sync-sg',
        'watch-files',
    ),
));

gulp.task('watch-no-sg', gulp.series(
    'build',
    gulp.parallel(
        'webpack-watch',
        'browser-sync',
        'watch-files',
    ),
));

gulp.task('watch', config.styleguide ? gulp.task('watch-with-sg') : gulp.task('watch-no-sg'));
