'use strict';

import gulp from 'gulp';
import fs from 'fs';
import zip from 'gulp-zip';
import autoprefixer from 'gulp-autoprefixer';
import group_media from 'gulp-group-css-media-queries';
import plumber from 'gulp-plumber';
import del from 'del';
import rename from 'gulp-rename';
import clean_css from 'gulp-clean-css';
import newer from 'gulp-newer';
import version from 'gulp-version-number';
import imagemin from 'gulp-imagemin';
import webp from 'imagemin-webp';
import webpcss from 'gulp-webpcss';
import webphtml from 'gulp-webp-html-nosvg';
import ttf2woff from 'gulp-ttf2woff';
import ttf2woff2 from 'gulp-ttf2woff2';
import svgSprite from 'gulp-svg-sprite';
import webpack from 'webpack-stream';
import ftp from 'vinyl-ftp';
import gutil from 'gulp-util';
import * as nodePath from 'path';

const projectName = 'dist';
const srcFolder = "src";
const rootFolder = nodePath.basename(nodePath.resolve());
const { src, dest } = gulp;

import webPackConfig from './config/webpack.prod.js';

import { configFTP, pathFTP } from './ftp.js';

const path = {
	build: {
		html: `${projectName}/`,
		js: `${projectName}/js/`,
		css: `${projectName}/css/`,
		images: `${projectName}/img/`,
		fonts: `${projectName}/fonts/`,
	},
	src: {
		html: [`${srcFolder}/**/*.html`, `!${srcFolder}/_*.html`],
		js: [`${srcFolder}/js/app.js`],
		css: `${srcFolder}/scss/style.scss`,
		images: [`${srcFolder}/img/**/*.{jpg,jpeg,png,gif,webp}`, "!**/favicon.*"],
		svg: [`${srcFolder}/img/**/*.svg`, "!**/favicon.*"],
		fonts: `${srcFolder}/fonts/*.ttf`,
	},
	clean: `./${projectName}/`
};

// FTP соединение
configFTP.log = gutil.log;
const ftpConnect = ftp.create(configFTP);

// Функция очистки папки с результатом
function clean() {
	return del(path.clean);
}
// Вспомогательная функция
function cb() { }
// Создание файла .gitignore
function addGitIgnore() {
	if (!fs.existsSync('.gitignore')) {
		fs.writeFile('./.gitignore', '', cb);
		fs.appendFile('./.gitignore', 'package-lock.json\r\n', cb);
		fs.appendFile('./.gitignore', 'startTemplate/\r\n', cb);
		fs.appendFile('./.gitignore', 'node_modules/\r\n', cb);
		fs.appendFile('./.gitignore', '.gitignore\r\n', cb);
		fs.appendFile('./.gitignore', 'dist/\r\n', cb);
		fs.appendFile('./.gitignore', 'Source/\r\n', cb);
		fs.appendFile('./.gitignore', 'version.json\r\n', cb);
		fs.appendFile('./.gitignore', projectName + '\r\n', cb);
		fs.appendFile('./.gitignore', '**/*.zip\r\n', cb);
		fs.appendFile('./.gitignore', '**/*.rar\r\n', cb);
		//if (projectName !== 'flsStart') del('./.git/');
	}
	return src(path.src.html);
}

// Шрифты
// Удаляем папку со шрифтами
function fontsFoldrClean() {
	return del(path.build.fonts);
}
// Конвертируем из .ttf в .woff и .woff2
function fontsConverter() {
	src(path.src.fonts)
		.pipe(plumber())
		.pipe(ttf2woff())
		.pipe(dest(path.build.fonts));
	return src(path.src.fonts)
		.pipe(ttf2woff2())
		.pipe(dest(path.build.fonts));
}
// Заполняем файл src/scss/base/fonts.scss (должен быть пустой)
function fontStyle() {
	let fontsFile = fs.readFileSync(`${srcFolder}/scss/base/fonts.scss`);
	if (fontsFile == '') {
		fs.writeFile(`${srcFolder}/scss/base/fonts.scss`, '', cb);
		fs.readdir(path.build.fonts, function (err, fontsFiles) {
			if (fontsFiles) {
				let newFileOnly;
				for (var i = 0; i < fontsFiles.length; i++) {
					let fontFileName = fontsFiles[i].split('.')[0];
					if (newFileOnly !== fontFileName) {
						let fontName = fontFileName.split('-')[0] ? fontFileName.split('-')[0] : fontFileName;
						let fontWeight = fontFileName.split('-')[1] ? fontFileName.split('-')[1] : fontFileName;
						if (fontWeight.toLowerCase() === 'thin') {
							fontWeight = 100;
						} else if (fontWeight.toLowerCase() === 'extralight') {
							fontWeight = 200;
						} else if (fontWeight.toLowerCase() === 'light') {
							fontWeight = 300;
						} else if (fontWeight.toLowerCase() === 'medium') {
							fontWeight = 500;
						} else if (fontWeight.toLowerCase() === 'semibold') {
							fontWeight = 600;
						} else if (fontWeight.toLowerCase() === 'bold') {
							fontWeight = 700;
						} else if (fontWeight.toLowerCase() === 'extrabold' || fontWeight.toLowerCase() === 'heavy') {
							fontWeight = 800;
						} else if (fontWeight.toLowerCase() === 'black') {
							fontWeight = 900;
						} else {
							fontWeight = 400;
						}
						fs.appendFile(`${srcFolder}/scss/base/fonts.scss`, `@include font("${fontName}", "${fontFileName}", "${fontWeight}", "normal");\r\n`, cb);
						newFileOnly = fontFileName;
					}
				}
			}
		});
	}
	return src(path.src.html);
}

// Сброка вебпаком JS и CSS файлов
function webpackBuild() {
	return src(path.src.js, {})
		.pipe(webpack({
			config: webPackConfig
		}))
		.pipe(dest(path.build.js))
}

// Картинки
function imagesBuild() {
	return src(path.src.images)
		.pipe(newer(path.build.images))
		.pipe(
			imagemin([
				webp({
					quality: 85
				})
			])
		)
		.pipe(
			rename({ extname: ".webp" })
		)
		.pipe(dest(path.build.images))
		.pipe(src(path.src.images))
		.pipe(newer(path.build.images))
		.pipe(
			imagemin({
				progressive: true,
				svgoPlugins: [{ removeViewBox: false }],
				interlaced: true,
				optimizationLevel: 3 // 0 to 7
			})
		)
		.pipe(dest(path.build.images))
		.pipe(src(path.src.svg))
		.pipe(newer(path.build.images))
		.pipe(dest(path.build.images))
}
// Дополнительные действия для CSS файла
function cssBuild() {
	return src(`${projectName}/css/style.css`, {})
		.pipe(plumber())
		.pipe(group_media())
		.pipe(
			autoprefixer({
				grid: true,
				overrideBrowserslist: ["last 5 versions"],
				cascade: true
			})
		)
		.pipe(webpcss(
			{
				webpClass: ".webp",
				noWebpClass: ".no-webp"
			}
		))
		.pipe(dest(path.build.css))
		.pipe(clean_css())
		.pipe(rename({ suffix: ".min" }))
		.pipe(dest(path.build.css));
}
// Сборка галпом HTML файлов
function htmlBuild() {
	return src(`${projectName}/*.html`, {})
		.pipe(webphtml())
		.pipe(version({
			'value': '%DT%',
			'replaces': [
				'#{VERSION_REPlACE}#',
				[/#{VERSION_REPlACE}#/g, '%TS%']
			],
			'append': {
				'key': '_v',
				'cover': 0,
				'to': [
					'css',
					['image', '%TS%'],
					{
						'type': 'js',
						'attr': ['src', 'custom-src'], // String or Array, undefined this will use default. css: "href", js: ...
						'key': '_v',
						'value': '%DT%',
						'cover': 1,
						'files': ['app.min.js'] // Array [{String|Regex}] of explicit files to append to
					}
				]
			},
			'output': {
				'file': 'version.json'
			}
		}))
		.pipe(dest(path.build.html));
}

// Картинки без webp
function imagesNoWebpBuild() {
	return src(path.src.images)
		.pipe(newer(path.build.images))
		.pipe(
			imagemin({
				progressive: true,
				svgoPlugins: [{ removeViewBox: false }],
				interlaced: true,
				optimizationLevel: 3 // 0 to 7
			})
		)
		.pipe(dest(path.build.images))
		.pipe(src(path.src.svg))
		.pipe(newer(path.build.images))
		.pipe(dest(path.build.images))
}
// Дополнительные действия для CSS файла без webp
function cssNoWebpBuild() {
	return src(`${projectName}/css/style.css`, {})
		.pipe(plumber())
		.pipe(group_media())
		.pipe(
			autoprefixer({
				grid: true,
				overrideBrowserslist: ["last 5 versions"],
				cascade: true
			})
		)
		.pipe(dest(path.build.css))
		.pipe(clean_css())
		.pipe(rename({ suffix: ".min" }))
		.pipe(dest(path.build.css));
}
// Сборка галпом HTML файлов без webp
function htmlNoWebpBuild() {
	return src(`${projectName}/*.html`, {})
		.pipe(version({
			'value': '%DT%',
			'replaces': [
				'#{VERSION_REPlACE}#',
				[/#{VERSION_REPlACE}#/g, '%TS%']
			],
			'append': {
				'key': '_v',
				'cover': 0,
				'to': [
					'css',
					['image', '%TS%'],
					{
						'type': 'js',
						'attr': ['src', 'custom-src'], // String or Array, undefined this will use default. css: "href", js: ...
						'key': '_v',
						'value': '%DT%',
						'cover': 1,
						'files': ['app.min.js'] // Array [{String|Regex}] of explicit files to append to
					}
				]
			},
			'output': {
				'file': 'version.json'
			}
		}))
		.pipe(dest(path.build.html));
}

// Отправка файлов по FTP
function deployToFTP() {
	return src(`${projectName}/**/*.*`, {})
		.pipe(ftpConnect.dest(`${pathFTP}/${rootFolder}`));
}
// Создание архива готового проекта
function deployToZIP() {
	del(`${rootFolder}.zip`);
	return src(`${projectName}/**/*.*`, {})
		.pipe(zip(`${rootFolder}.zip`))
		.pipe(dest('./'));
}

let fontsBuild = gulp.series(fontsFoldrClean, fontsConverter, fontStyle);
let dev = gulp.series(clean, gulp.parallel(addGitIgnore, fontsBuild));
let build = gulp.series(clean, gulp.parallel(addGitIgnore, fontsBuild, imagesBuild), webpackBuild, cssBuild, htmlBuild);
let devbuild = gulp.series(clean, gulp.parallel(addGitIgnore, fontsBuild, imagesNoWebpBuild), webpackBuild, cssNoWebpBuild, htmlNoWebpBuild);
let deploy = gulp.series(build, deployToFTP);
let deployZip = gulp.series(build, deployToZIP);

gulp.task('svgSprite', function () {
	return gulp.src([`${srcFolder}/spriteicons/*.svg`])
		.pipe(svgSprite({
			mode: {
				stack: {
					sprite: "../icons/icons.svg",
					// Выводить страницу с перечнем иконок
					example: false
				}
			},
		}
		))
		.pipe(dest(path.build.images));
});
gulp.task('fonts', fontsBuild);
gulp.task('default', dev);
gulp.task('build', build);
gulp.task('devbuild', devbuild);
gulp.task('deploy', deploy);
gulp.task('deployZip', deployZip);







