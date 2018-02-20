Hypermedia coffee - sample app - client and api
===============================================

[![Build Status](https://travis-ci.org/toddb/hypermedia-coffee.png?branch=master)](https://travis-ci.org/toddb/hypermedia-coffee)
[![Coverage Status](https://coveralls.io/repos/toddb/hypermedia-coffee/badge.png?branch=coverage)](https://coveralls.io/r/toddb/hypermedia-coffee?branch=coverage)


This is a sample single-page application through a [Hypermedia-style of Web API](http://www.apiacademy.co/lessons/api-design/web-api-architectural-styles). This API is the smallest possible app I could think of that is representative of a complex enough domain. While the central business domain object is merely an order, it has a state machine to manage its workflow/lifecyle. It has an external payment service as part of a state transition (faked). The application itself has authentication and authorisation working through such cross-cutting concerns.

If you are interested in the ideas. The coffee domain comes from [Jim Weber's material](http://www.infoq.com/articles/webber-rest-workflow).

[![Coffee State Machine](https://raw.githubusercontent.com/toddb/hypermedia-coffee/master/docs/customer-state-machine.jpg)]()

[Hypermedia design](http://amundsen.com/hypermedia/) is well explained by Mike Amundsen but his implementation isn't deep enough for a real system (nor did he try to make it).
The specifics of [single-page apps](http://singlepageappbook.com/index.html) are starting to be well covered by Mikito Takada. He particularly addresses
the [issues of](http://singlepageappbook.com/goal.html):

1. *Architecture*: what (conceptual) parts does our app consist of? How do the different parts communicate with each other? How do they depend on each other?
2. *Asset packaging*: how is our app structured into files and files into logical modules? How are these modules built and loaded into the browser? How can the modules be loaded for unit testing?
3. *Run-time state*: when loaded into the browser, what parts of the app are in memory? How do we perform transitions between states and gain visibility into the current state for troubleshooting?

I am concerned with test-first, hypermedia design. If you look in the tests what you should see is a separation of the api and client. I have been trying out ideas of how to test the client code without a server - but I think that you end up reimplementing the server. So I have deleted the faking and expectations to manage the HTTP boundary. I am also concerned about pyramid testings. So, not only will you see attempts to keep client code all micro (unit) tested. There are integration tests for the server that polices the HTTP interface's design. You will also see system tests through the browser to check that everything still holds together.

 Documenting the design is another problem. The current trend, such as [blueprint dsl by apiary](http://apiary.io/blueprint), isn't going to cut it for hypermedia APIs (it will for the object/CRUD style). Thus the missing piece in the sample is the human-readable documentation. At best it is the tests. But that's not going to fly because you still need to know the semantic links available in the application. At this stage, if you want to explore the API then you should do it through the browser. For example, in Firefox, I set the HTTP headers to ask for `application/json;q=0.91`. See the `docs/firefox-accept-json.png`. Also add [JSONView](https://addons.mozilla.org/en-Us/firefox/addon/jsonview/) to the browser.

Disclaimer: this code is only tested on OS X.

# Components
The basic system is comprised of the following components:
- Dependency Management System ([RequireJS](http://requirejs.org))
- Server-side and Development package management ([npm](https://npmjs.org/))
- Client-side package management ([bower](http://jamjs.org/))
- Micro & Integration Testing ([Testacular](http://karma-runner.github.com/0.8/index.html) / [Mocha](http://mochajs.org/) / [Chai](http://chaijs.com/)) / [Sinon](http://sinonjs.org/)
- Acceptance Testing ( [supertest](https://github.com/visionmedia/supertest)
- DOM Manipulation ([jQuery](http://jquery.com))
- Utility functions ([Underscore](http://underscorejs.org) / [Underscore:String](http://epeli.github.com/underscore.string))
- CSS defaults and cool widgets ([Twitter Bootstrap](http://twitter.github.com/bootstrap/))
- Build system ([gulp](http://gulpjs.com/))
- Lightweight backend web server ([NodeJS](nodejs.org) / [Express](http://expressjs.com))

# Dependencies
- `bzip2` is required for a compile of one of the node dependencies 
- [nodejs/npm](http://nodejs.org) - even then you can use a local version through `setup.sh` which loads v10.5 into `node_lib`
- [mongo](http://www.mongodb.org/) (required for integration and acceptance tests, as well as a running system)
- gcc - for some node modules - I used (commandline tools for XCode)[http://developer.apple.com/downloads] - then on 10.8.4 still had problems (`xcode-select: Error: No Xcode is selected. Use xcode-select -switch <path-to-xcode>`). Solution: `sudo xcode-select -switch /usr/bin`


# Quick Setup

Once you have the dependencies, you need to clone the respository and install the package dependencies in both `api` and `client`:

- fork this repo
- `git clone <your-new-github-url>`
- `build.sh`   <-- this is what [travis.ci](https://travis-ci.org/toddb/hypermedia-coffee/) is doing!

You can also do each separately if you want incremental setup on the dependencies:

- `cd server; go.sh`
- `cd client; go.sh`


# Starting mongo

Ensure that your `mongo` db is running. At this stage, it is assume to be a local installation on `localhost:27017`

1. new terminal/console
2. mongod

```
Express server listening on port 8888 in development mode
Using mongodb://localhost:27017/development
```

# Starting API

Starts the relevant sever against mongodb instance:

1. new terminal/console
2. `cd api`
3. `npm start`

```
/usr/local/bin/node server.js
Express server listening on port 8888 in development mode
Using mongodb://localhost:27017/development
Account: bob exists.
```

# Starting client

To run a client that builds with a distribution version saved in `client/dist` and then opens a browser:

1. new terminal/console
2. `cd client`
3. `gulp client` Builds the files, opens a browser

```
/usr/local/bin/node /Users/hypermedia-coffee/client/node_modules/gulp/bin/gulp.js --color --gulpfile /Users/hypermedia-coffee/client/gulpfile.js client
[15:25:37] Using gulpfile ~/Documents/src/hypermedia-coffee/client/gulpfile.js
[15:25:37] Starting 'clean'...
[15:25:37] Finished 'clean' after 16 ms
[15:25:37] Starting 'build'...
[15:25:37] Starting 'requirejsBuild'...
[15:25:37] Starting 'assets'...

css/site.css
----------------
css/../../bower_components/bootstrap/dist/css/bootstrap.css
css/site.css

scripts/bootstrap.js
----------------
/Users/hypermedia-coffee/client/bower_components/requirejs/require.js

scripts/app.js
----------------
/Users/hypermedia-coffee/client/bower_components/jquery/dist/jquery.js
/Users/hypermedia-coffee/client/bower_components/angular/angular.js
/Users/hypermedia-coffee/client/bower_components/angularAMD/angularAMD.js
...
scripts/controller/PayController.js
scripts/controller/AuthenticatorCtrl.js
scripts/app.js
scripts/boot.js

[15:25:42] Finished 'requirejsBuild' after 5.63 s
[15:25:42] Finished 'assets' after 5.6 s
[15:25:42] Finished 'build' after 5.67 s
[15:25:42] Starting 'default'...
[15:25:42] Finished 'default' after 7.3 μs
[15:25:42] Starting 'client'...
[15:25:42] Webserver started at http://localhost:63344
[15:25:42] Finished 'client' after 5.68 ms
```

# Developing a client

I develop the client code using [Webstorm](https://www.jetbrains.com/webstorm/). Webstorm (or intellij) have a build in sever for running the client. I recommend this approach. Right-click on `client/src/index.html`  and choose `Open in browser`.

# LICENSE:

(BSD License)

Copyright (c) 2015, toddb@goneopen.com
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

The views and conclusions contained in the software and documentation are those
of the authors and should not be interpreted as representing official policies,
either expressed or implied, of the FreeBSD Project.
