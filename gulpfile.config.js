const assetsDev = './assets';
const assetsDist = './public/dist';
const assetsPublic = './public';
const twigDev = './templates';

module.exports = {
    url: 'http://site.test/',
    root: {
        dev: assetsDev,
        dist: assetsDist,
        public: assetsPublic,
    },
    styles: {
        dev: `${assetsDev}/styles`,
        dist: `${assetsDist}/styles`,
        kssDev: './kss-styleguide/custom-template/kss-assets/css',
        kssDist: './kss-styleguide/styleguide/kss-assets/css',
    },
    scripts: {
        dev: `${assetsDev}/scripts`,
        dist: `${assetsDist}/scripts`,
    },
    images: {
        dev: `${assetsDev}/images`,
        dist: `${assetsDist}/images`,
    },
    svg: {
        dev: `${assetsDev}/svg`,
        dist: `${assetsDist}/svg`,
    },
    fonts: {
        dev: `${assetsDev}/fonts`,
        dist: `${assetsDist}/fonts`,
    },
    json: {
        dev: `${assetsDev}/json`,
        dist: `${assetsDist}/json`,
    },
    video: {
        dev: `${assetsDev}/video`,
        dist: `${assetsDist}/video`,
    },
    twigSite: {
        dev: twigDev,
        dist: './public',
    },
    twigStyleGuide: {
        dev: './kss-styleguide/markup',
        dist: './kss-styleguide/styleguide/markup',
    },
    browserSync: {
        baseDir: './public',
    },
    styleguide: false,
};
