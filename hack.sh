# chmod +x hack.sh
jam install angularjs-unstable
cp public/vendor/angularjs-unstable/angular.js public/vendor/angularjs
rm -rf public/vendor/angularjs-unstable/
jam rebuild