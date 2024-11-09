const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const rename = require('gulp-rename');
const cleanCss = require('gulp-clean-css');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const sourceMap = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const htmlmin = require('gulp-htmlmin');
const size = require('gulp-size');
const webp = require('gulp-webp');
const postcss = require('gulp-postcss');
const autoprefixer2 = require('autoprefixer');
const purgecss = require('gulp-purgecss');
const svgmin = require('gulp-svgmin');

const paths = {
	html: {
		src: 'src/*.html',
		dest: 'dist/',
	},
	css: {
		src: 'src/scss/*.scss',
		dest: 'dist/css/',
	},
	js: {
		src: 'src/js/*.js',
		dest: 'dist/js/',
	},
	images: {
		src: 'src/images/*.{png,jpg,jpeg}',
		dest: 'dist/images/',
	},
};

// HTML minification (commented out for now)
function html() {
	return gulp.src(paths.html.src)
		.pipe(htmlmin({
			collapseWhitespace: true,
		}))
		.pipe(size({
			showFiles: true,
		}))
		.pipe(gulp.dest(paths.html.dest));
}

// Build styles
function css() {
	return gulp.src(paths.css.src)
		.pipe(sourceMap.init())
		.pipe(sass().on('error', sass.logError)) // Error handling added
		.pipe(autoprefixer({
			cascade: false,
		}))
		.pipe(cleanCss()) // CSS minification commented out
		.pipe(postcss([autoprefixer2()])) // PostCSS added
		.pipe(rename((path) => {
			path.basename = path.basename
		}))
		.pipe(sourceMap.write('.'))
		.pipe(size({
			showFiles: true,
		}))
		.pipe(gulp.dest(paths.css.dest));
}

// Build scripts
function js() {
	return gulp.src(paths.js.src)
		.pipe(sourceMap.init())
		.pipe(babel({
			presets: ['@babel/env'],
		}))
		// .pipe(uglify()) // JavaScript minification commented out
		.pipe(concat('main.js'))
		.pipe(sourceMap.write('.'))
		.pipe(size({
			showFiles: true,
		}))
		.pipe(gulp.dest(paths.js.dest));
}

// Purge unused CSS
gulp.task('purge', () => {
	return gulp.src('dist/css/*.min.css')
		.pipe(purgecss({
			content: [paths.html.src],
		}))
		.pipe(gulp.dest(paths.css.dest));
});

function svgMin() {
	return gulp.src('src/images/*.svg') // Ensure only SVGs are processed
		.pipe(svgmin())
		.pipe(gulp.dest('dist/images'));
}

// Optimize images and convert to WebP format
function images() {
	return gulp.src(paths.images.src)
		// .pipe(svgmin())
		.pipe(webp())
		.pipe(gulp.dest(paths.images.dest));
}

// Watch task to monitor file changes
function watch() {
	gulp.watch(paths.css.src, css);
	gulp.watch(paths.html.src, html);
	gulp.watch(paths.js.src, js);
	gulp.watch(paths.images.src, images);
	gulp.watch('src/images/*.svg', svgMin);
}

// Define default and build tasks
const build = gulp.series(gulp.parallel(css, js, html, images, svgMin), watch);

exports.css = css;
exports.js = js;
exports.html = html;
exports.images = images;
exports.svgMin = svgMin;
exports.build = build;

exports.default = build;