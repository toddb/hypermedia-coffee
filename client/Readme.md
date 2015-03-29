
# Components
The project is comprised of the following components:

- Dependency Management System ([RequireJS](http://requirejs.org))
- Server-side package management ([npm](https://npmjs.org))
- Client-side package management ([bower](http://http://bower.io))
- Unit Testing ([Protector]() / [Mocha](http://visionmedia.github.com/mocha) / [Chai](http://chaijs.com/)) / [Sinon](http://sinonjs.org/)
- System Testing ( [angularjs scenario](http://angularjs.org/)
- Templating System - client ([angularjs](http://angularjs.org))
- CSS defaults and widgets ([Twitter Bootstrap](http://twitter.github.com/bootstrap/)))
- Build system ([gulp](http://gulpjs.com))

# Dependencies
- [nodejs](http://nodejs.org)
- [bower](http://bower.io)
- [gulp](http://gulpjs.com)
- git - git needs to be installed to use bower

# Quick Setup

- `npm install`

# Updating client packages

- `./node_modules/.bin/bower update`

# Building the project

Run the following command to 'compile' the javascript into the 'dist' directory.

- `./node_modules/.bin/gulp`

*Note:* if you have bower installed globally then you won't need to provide the path to the local version of `bower`

# Running Tests
