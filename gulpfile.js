// ниже подключение необзодимых плагинов
// del - удаление указаных документов
const del = require("del");
// gulp - поддержка галп
const gulp = require("gulp");
// less - поддержка предпроцессора лесс
const less = require("gulp-less");
// babel - преопразование нового кода джава скрипт в старый, для поддержки кода всемя браузерами
const babel = require("gulp-babel");
// concat - обьединение двух файлов в один, если порядок имеет значение то обязательно в записи
// первым должен быть файл код которого должен быть первым
const concat = require("gulp-concat");
// uglify - минифицирует код js
const uglify = require("gulp-uglify");
// cleanCSS минифицирует код css
const cleanCSS = require("gulp-clean-css");
// rename переименование, можно также использовать concat в котором можно обьединять файлы и сразу писать имя исходного файла
const rename = require("gulp-rename");

const sourcemaps = require("gulp-sourcemaps");

const autoprefixer = require("gulp-autoprefixer");

const imagemin = require("gulp-imagemin");

const htmlmin = require("gulp-htmlmin");

const size = require('gulp-size')

// указываем переменную paths которая явщаяеться обьектом с путями от куда будет браться файл
// src и то куда он будет записываться dest
const paths = {
  html: {
    src: "src/*.html",
    dest: "dist",
  },
  styles: {
    src: "src/styles/**/*.less",
    dest: "dist/css/",
  },
  scripts: {
    src: "src/scripts/**/*.js",
    dest: "dist/js/",
  },
  images: {
    src: "src/img/*",
    dest: "dist/img",
  },
};

// функция styles которая сначала принимает всё нами написанное на препроцессоре less
// затем спомощу плагина less вызываем функцию less(), которая преобразует less в css
// далее спомощу cleanCSS() минифицируем код в css
// далее используем rename в этом плагине можем использовать префикс, базовое имя, и суфикс
// после всех манипуляций указываем куда будет записать наш уже полностью обработаный код
function styles() {
  return gulp
    .src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(
      autoprefixer({
        cascade: false,
      })
    )
    .pipe(cleanCSS())
    .pipe(
      rename({
        basename: "main",
        suffix: ".min",
      })
    )
    .pipe(sourcemaps.write("."))
    .pipe(size({
      showFiles: true
    }))
    .pipe(gulp.dest(paths.styles.dest));
}

function scripts() {
  return gulp
    .src(paths.scripts.src)
    .pipe(sourcemaps.init())
    .pipe(
      babel({
        presets: ["@babel/env"],
      })
    )
    .pipe(uglify())
    .pipe(concat("main.min.js"))
    .pipe(sourcemaps.write("."))
    .pipe(size({
      showFiles: true
    }))
    .pipe(gulp.dest(paths.scripts.dest));
}

function html() {
  return gulp.src(paths.html.src)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(size({
      showFiles: true
    }))
    .pipe(gulp.dest(paths.html.dest));
}

function img() {
  return gulp
    .src(paths.images.src)
    .pipe(
      imagemin({
        progressive: true,
      })
    )
    .pipe(size({
      showFiles: true
    }))
    .pipe(gulp.dest(paths.images.dest));
}

// функция watch вызываеться в файле less после чего вызыеться таск styles записаный через кому
// при каждом сохранении код будет вызываться таск styles
// функция watch будет продолжать выполняться пока мы не нажмём ктрл с
function watch() {
  gulp.watch(paths.styles.src, styles);
  gulp.watch(paths.scripts.src, scripts);
}

// функция для очищения указаной папки, в нашем случае dist
function clean() {
  return del(["dist"]);
}

// метод series вызывает таски по той очерёдности по которой они в нём записаны
const build = gulp.series(
  clean,
  html,
  gulp.parallel(styles, scripts, img),
  watch
);
// при необходимости можно использовать метод parallel, в этом случае таски будут выполняться паралельно друг другу
// в частности применяться на два не зависимых друг от друга файла
// const build = gulp.parallel(clean, styles, watch)

exports.html = html;
exports.clean = clean;
exports.styles = styles;
exports.img = img;
exports.watch = watch;
exports.scripts = scripts;
// ниже обычная записать, для её вызова нужно писать gulp build
exports.build = build;
// ниже дефолт, тоесть мы можем написать просто gulp и будет вызвана то что равно дефолту
exports.default = build;
