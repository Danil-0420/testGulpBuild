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
// sourcemaps - позволяет открытии консоли разработчика видеть где именно написан код в начальном файле, а не в исходном, тоесть в файле less
const sourcemaps = require("gulp-sourcemaps");
// autoprefixer - для разных браузером подставляет префикси для поддержки css свойств 
const autoprefixer = require("gulp-autoprefixer");
// imagemin - сжимает изображения 
const imagemin = require("gulp-imagemin");
// htmlmin - минифицирует файл html 
const htmlmin = require("gulp-htmlmin");
// size - показывает размеры файлов в терминале 
const size = require('gulp-size')
// 
const newer = require('gulp-newer');

const browsersync = require('browser-sync')

const sass = require('gulp-sass')(require('sass'));

// указываем переменную paths которая явщаяеться обьектом с путями от куда будет браться файл
// src и то куда он будет записываться dest
const paths = {
  html: {
    src: "src/*.html",
    dest: "dist",
  },
  styles: {
    src: ["src/styles/**/*.less", "src/styles/**/*.scss", "src/styles/**/*.sass"],
    dest: "dist/css/",
  },
  scripts: {
    src: "src/scripts/**/*.js",
    dest: "dist/js/",
  },
  images: {
    src: "src/img/**",
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
    // .pipe(less())
    .pipe(sass().on('error', sass.logError))
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

// обращаемся к файлу, 
// указываем что он будет исходным в консоли разроботчика
// превращаем современный js код в более старый, для поддержания всех браузеров
// минифицируем код
// обьединяем файлы и присваиваем имя получившемуся файлу
// узнаем размеры файлов и их название 
// записываем получившийся код в нужный путь
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

// обращаемся к файлу 
// минимизируем html 
// размер 
// путь записи файла
function html() {
  return gulp.src(paths.html.src)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(size({
      showFiles: true
    }))
    .pipe(gulp.dest(paths.html.dest));
}

// обращаемся к файлу 
// минимизируем изображения
// размер 
// путь записи файла
function img() {
  return gulp
    .src(paths.images.src)
    .pipe(newer(paths.images.dest))
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
  browsersync.init({
    server: {
        baseDir: "./dist/"
    }
});
  gulp.watch(paths.html.dest).on('change', browsersync.reload)
  gulp.watch(paths.html.src, html)
  gulp.watch(paths.styles.src, styles);
  gulp.watch(paths.scripts.src, scripts);
  gulp.watch(paths.images.src, img);
}

// функция для очищения указаной папки, в нашем случае dist
function clean() {
  return del(["dist/*", "!dist/img"]);
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
