Hypermedia coffee - sample app
==============================

[![Build Status](https://travis-ci.org/toddb/hypermedia-coffee.png?branch=master)](https://travis-ci.org/toddb/hypermedia-coffee)
[![Dependency Status](https://david-dm.org/toddb/hypermedia-coffee.png)](https://david-dm.org/toddb/hypermedia-coffee)
[![devDependency Status](https://david-dm.org/toddb/hypermedia-coffee/dev-status.png)](https://david-dm.org/toddb/hypermedia-coffee#info=devDependencies)
[![Coverage Status](https://coveralls.io/repos/toddb/hypermedia-coffee/badge.png?branch=coverage)](https://coveralls.io/r/toddb/hypermedia-coffee?branch=coverage)


This is a sample single-page application through a semantic link (hypermedia/REST) design and test-first. The code structure was originally based on boilerplate code from [Pith](https://github.com/sym3tri/pith). It has since morphed so the yucky-ness is all my responsibility. While it looks ordered there is still not a good enough separation of naming/thinking around client and server code. Also within the server code, the routes, resources and representations still get IMHO confused over their roles. Finally, then in the tests you'll see a poor naming around those issues mentioned. Confusion abounds because object-style REST still dominant in the underlying libraries which subtly inflect your design and you need to workaround - routes is just one example.

This app is the smallest possible app I could think of that is representative of a complex enough domain. While the central business domain object is merely an order, it has a state machine to manage its workflow/life cyle. It has an external payment service as part of a state transition. The application itself has authentication and authorisation working through such cross-cutting concerns. Finally, and here's the weirdest part, I have played with the idea of a viewstate for the order. Think of the viewstate as ALL the interactions that a customer makes with a resource while on the client-side GUI. I played with this idea because I want A/B testing build in - I want to know what happens on the client so I modelled this in as a resource. Remember resources are conceptual or real, now or the future. It changed my design - I'm less sure whether its for the better or for the worse.

If you are interested in the ideas. The coffee domain comes from [Jim Weber's material](http://www.infoq.com/articles/webber-rest-workflow). I've included the customer state machine in `docs` folder.
[Hypermedia design](http://amundsen.com/hypermedia/) is well explained by Mike Amundsen but his implementation isn't deep enough for a real system (nor did he try to make it).
The specifics of [single-page apps](http://singlepageappbook.com/index.html) are starting to be well covered by Mikito Takada. He particularly addresses
the [issues of](http://singlepageappbook.com/goal.html):

1. *Architecture*: what (conceptual) parts does our app consist of? How do the different parts communicate with each other? How do they depend on each other?
2. *Asset packaging*: how is our app structured into files and files into logical modules? How are these modules built and loaded into the browser? How can the modules be loaded for unit testing?
3. *Run-time state*: when loaded into the browser, what parts of the app are in memory? How do we perform transitions between states and gain visibility into the current state for troubleshooting?

Myself, I am concerned with test-first, hypermedia design. If you look in the tests what you should see is a separation of the server and client.
I have been trying out ideas of how to test the client code without a server. So you'll see the use of faking and expectations to manage the HTTP boundary. With the introduction of [angularjs](http://angularjs.com), I threw out a lot of testing code I had written that wrapped jasmine. I might now throw out a lot of it again and use the [blueprint dsl by apiary](http://apiary.io/blueprint) - but they now have deprecated it and I don't understand why. Thus the missing piece in the sample is the human-readable documentation. At best it is the tests. But that's not going to fly because you still need to know the semantic links available in the application. One additional complexity I noticed was that to get testing running locally I needed to implement a CORS middleware. That was a pain but I suspect in a production system you are going to need it anyway as you open up your API.  The other issue I found was that my route testing strategy isn't right. I haven't fixed it yet.

I am also concerned about pyramid testings. So, not only will you see attempts to keep client code all unit tested. There are integration tests for the server that polices the HTTP interface's design. You will also see system tests through the browser to check that
everything still holds together.

Disclaimer: this code is only tested on OS X.

# Components
Pith is comprised of the following components:   
- Dependency Management System ([RequireJS](http://requirejs.org))
- Server-side and Development package management ([npm](https://npmjs.org/))
- Client-side package management ([bower](http://jamjs.org/))
- Micro & Integration Testing ([Testacular](http://karma-runner.github.com/0.8/index.html) / [Mocha](http://visionmedia.github.com/mocha) / [Chai](http://chaijs.com/)) / [Sinon](http://sinonjs.org/)
- Acceptance Testing ( [supertest](https://github.com/visionmedia/supertest)
- DOM Manipulation ([jQuery](http://jquery.com))
- Utility functions ([Underscore](http://underscorejs.org) / [Underscore:String](http://epeli.github.com/underscore.string))
- CSS defaults and cool widgets ([Twitter Bootstrap](http://twitter.github.com/bootstrap/))
- Build system ([gulp](http://gulpjs.com/))
- Lightweight backend web server ([NodeJS](nodejs.org) / [Express](http://expressjs.com))

# Dependencies
- [nodejs](http://nodejs.org) - even then you can use a local version through `go
- [mongo](http://www.mongodb.org/)
- gcc - for some node modeuls - I used (commandline tools for XCode)[http://developer.apple.com/downloads] - then on 10.8.4 still had problems (`xcode-select: Error: No Xcode is selected. Use xcode-select -switch <path-to-xcode>`). Solution: `sudo xcode-select -switch /usr/bin`

Ensure that your mongo db is running. At this stage, it is assume to be a local installation on localhost:27017

    $ mongod
    all output going to: /usr/local/var/log/mongodb/mongo.log

# Quick Setup
- fork this repo
- `git clone <your-new-github-url>`
- `sudo npm install -g grunt-cli` *(if not already installed)*
- `sudo npm install -g jamjs -d`
- `npm install -d` Installs all server-side dependencies (node_modules)
- `./node_modules/protractor/bin/install_selenium_standalone` - installs selenium webdriver for `grunt acceptance`
- `jam install` Downloads and installs all client-side dependencies (public\vendor) - (note: this says it fails but doesn't).
- `jam rebuild` Creates the `require.config.js` dependency file [Note: currently patched unstable version of angularjs - see `exec:jam-rebuild`]
- `grunt` Do the initial build so css and template files are compiled.
- `npm start` Starts the web server (alternatively `grunt server`)

  Express server listening on port 8888 in development mode
  Using mongodb://localhost:27017/development

- Point your browser to `http://localhost:8888`

# Starting servers
- `grunt exec:[dev|test|prod]` Starts the relevant sever against mongodb instance - currently all run on same port :-(

# Running Tests
In command line and headless (requires PhantomJS and your server started `npm start` or `grunt exec:server`)
- `grunt test` Run all the tests headless from the commandline
- `grunt `unit` Run the unit tests headless from the commandline
- `grunt `integration` Run the integration tests headless from the commandline (requires `mongod` running)
- `grunt `acceptance` Run the acceptance headless and with browsers from the commandline

Also you can run karma in watch mode:
- grunt `karma:unit-watch` - Runs all the test continuously on changes to files.
- grunt `karma:acceptance-watch` - Runs all the test continuously on changes to files.

# Other Commands
- `grunt` Default runs all build tasks in development mode. Compiles less files, lints JS files and compile all client-side JavaScript.
- `grunt prod` Kick off a production-ready build. Like the default but with more optimized/minified/etc output.
- `grunt server` Kick off a development-ready build that does prod checks and spins up server, and opens browser.
- `grunt open:dev` Open up the browser at localhost:8888.


# Watch Commands
- `grunt watch` All inclusive watch to update generated files when the sources change. Recompiles less files, lints JS files, and recompiles templates.

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
