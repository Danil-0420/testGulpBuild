// ниже подключение необзодимых плагинов
// del - удаление указаных документов
const del = require('del')
// gulp - поддержка галп
const gulp = require('gulp')
// less - поддержка предпроцессора лесс
const less = require('gulp-less')
// babel - преопразование нового кода джава скрипт в старый, для поддержки кода всемя браузерами 
const babel = require('gulp-babel')
// concat - обьединение двух файлов в один, если порядок имеет значение то обязательно в записи
// первым должен быть файл код которого должен быть первым
const concat = require('gulp-concat')
// uglify - минифицирует код js
const uglify = require('gulp-uglify')
// cleanCSS минифицирует код css
const cleanCSS = require('gulp-clean-css')
// rename переименование, можно также использовать concat в котором можно обьединять файлы и сразу писать имя исходного файла
const rename = require('gulp-rename')


// указываем переменную paths которая явщаяеться обьектом с путями от куда будет браться файл 
// src и то куда он будет записываться dest
const paths = {
  styles: {
    src: 'src/styles/**/*.less',
    dest: 'dist/css/'
  },
  scripts:{
    src: 'src/scripts/**/*.js',
    dest: 'dist/js/'
  }
}


// функция styles которая сначала принимает всё нами написанное на препроцессоре less
// затем спомощу плагина less вызываем функцию less(), которая преобразует less в css
// далее спомощу cleanCSS() минифицируем код в css 
// далее используем rename в этом плагине можем использовать префикс, базовое имя, и суфикс 
// после всех манипуляций указываем куда будет записать наш уже полностью обработаный код
function styles(){
  return gulp.src(paths.styles.src)
  .pipe(less())
  .pipe(cleanCSS())
  .pipe(rename({
    basename: 'main',
    suffix: '.min'
  }))
  .pipe(gulp.dest(paths.styles.dest))
}

function scripts(){
  return gulp.src(paths.scripts.src, {
    sourcemaps:true
  })
  .pipe(babel())
  .pipe(uglify())
  .pipe(concat('main.min.js'))
  .pipe(gulp.dest(paths.scripts.dest))
}


// функция watch вызываеться в файле less после чего вызыеться таск styles записаный через кому 
// при каждом сохранении код будет вызываться таск styles
// функция watch будет продолжать выполняться пока мы не нажмём ктрл с 
function watch(){
  gulp.watch(paths.styles.src, styles)
  gulp.watch(paths.scripts.src, scripts)
}

// функция для очищения указаной папки, в нашем случае dist
function clean(){
  return del(['dist'])
}

// метод series вызывает таски по той очерёдности по которой они в нём записаны 
const build = gulp.series(clean, gulp.parallel(styles, scripts), watch)
// при необходимости можно использовать метод parallel, в этом случае таски будут выполняться паралельно друг другу 
// в частности применяться на два не зависимых друг от друга файла
// const build = gulp.parallel(clean, styles, watch)

exports.clean = clean
exports.styles = styles
exports.watch = watch
exports.scripts = scripts
// ниже обычная записать, для её вызова нужно писать gulp build
exports.build = build
// ниже дефолт, тоесть мы можем написать просто gulp и будет вызвана то что равно дефолту 
exports.default = build

