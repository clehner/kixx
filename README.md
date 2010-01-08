Kixx
====

Modular Web Browser Plug-in Platform
------------------------------------

__Enabling the next generation of web applications.__

Brought to you by [The Fireworks Project](http://www.fireworksproject.com).

Kixx is simply an extension built for the [Mozilla
Firefox](http://www.mozilla.com/en-US/firefox/firefox.html) web browser that
provides a plugin platform for a modular system of applications we call
"toolpacks".

The main goal of Kixx is to provide a simple means of installing, persisting,
importing, and managing client side modules including code libraries and user
facing applications.  The philosophy behind Kixx is to maintain a modular
environment of loosely joined small peices, facilitating more efficient and
innovative development of complex Internet enabled software systems using web
browsers as the platform. The Kixx environment is designed to use common web
technologies including (X)HTML, CSS, and JavaScript.

Kixx plans to be compatible with other browsers, but it is currently only
implemented for the Mozilla platform, specifically the Firefox Web Browser.

Although installable bundles are available, this is pre-release software.  It
is untested and under active development.

WARNING: Critical functionality is still missing in the latest release, 0.7!

Why I created Kixx
------------------

The web is pretty cool. It was cool in 1998, and then it got even cooler in
2004 with the arrival of [AJAX][ajax] in GMail and Google Maps. All kinds of
awesome API's and data feeds like [RSS][rss] and [Atom][atom] have arrived as
well. The idea of mashing together data feeds available on the web to make even
more awesome stuff is approaching a crescendo with the Twitter API. Oh, and
how cool is GitHub?

This stuff is great for us nerds, but there are also some nagging limitations
that are getting in the way of building the next generation of awesomeness.

For example, we can't make requests to domains that do not belong to us from
within a web browser, but we can use other convoluted, insecure techniques to
make it work.

If a user has multiple pages open in a tabbed browser, we can't make them talk
to each other.

If we want to build a web application, we have to find and rent a host server,
and then write the code to run it. If our app becomes popular we have to
scramble ahead to keep up with demand.

Kixx is being built to make these problems go away.

### Here are the design goals for Kixx.

1. Extremely modular architecture.
2. Use common web technologies like JavaScript, HTML5, CSS, images, and browser plugins.
3. Make it easy to access data streams from all types of sources.
4. Include offline capabilities.
5. Integrate with the common browsers.

Disclaimer: These design goals are constantly in flux as I discover new ideas.
However, Kixx is in the early stages of development, so I reserve the right to
change my mind whenever I want to.

#### I can explain further.

__First__, modularity is the programmer's dream, we all know this. If we are given
a bucket full of little blocks we can connect them together and make a spaceship.
If our evil little sister dumped a full bottle of glue into our bucket of blocks,
half of them would be all stuck together. Unable to get them apart, our spaceship
building plans would evaporate.

__Second__, while you may be a super genious that can run circles around me in
Lisp, bend C++ to your will, and run a webserver from a bash script, I only
know HTML from tech school (and I can write bad JavaScript too). By using
technologies that I know how you use and putting them in a controlled
environment, we both can use the system. I can write my silly little Twitter
app, and you can do whatever it is that you do with that big brain of yours.

__Third__, you know that programming is really just pushing data around (because
you are so smart). You also know that stupid people often make it really hard
to push data around, especially on the web.  So, we're going to fix that.

__Fourth__, I'm not deaf to all the "always online, high speed access
everywhere" hype, but I think you'll agree that offline capabilities adds a lot
of power to your apps. Don't believe me? Look at the iPhone (or Droid, or Pre,
or whatever it is today).

__Fifth__, You know what happens out there in the real world, everyone is on
the web all the time. The browser is a far cry from a great platform, but it
never let that stand in its way. The browsers all need help, and we are going
to give it to them. Actually, by building an API for all the common browsers
you get cross platform deployment on all the common operating systems too.
w00t! 

If you were around in the seventies, you recognize this as the Unix Philosophy.  I don't
remember much of the 70's, but I [read about it somewhere][unix].

1. Small is beautiful.
2. Make each program do one thing well.
3. Build a prototype as soon as possible.
4. Choose portability over efficiency.
5. Store data in flat text files.
6. Use software leverage to your advantage.
7. Use shell scripts to increase leverage and portability.
8. Avoid captive user interfaces.
9. Make every program a filter.

I don't follow this like a religion, but I do like to use it as a guiding
principle.  If it was a religion, you'll see as you read on that I've sinned on
more than one occasion.

Implementation
--------------

### Start off easy with a Firefox extension.
Just to get a protoype of this concept out the door, I decided to begin by
implementing a Firefox extension.  If you know anything about the [Mozilla
platform][mozilla_platform], you'll know that it has just about everything we need to build
a prototype of this project.

### Abstract the API and bury the platform
After choosing to build as a browser extension using the Mozilla platform
the next step was to figure out how to effectively hide the implementation
details and provide an API that was a little more friendly than this.

    function getFileSize(path) {
      var file =
          Components.classes["@mozilla.org/file/local;1"].
          createInstance(Components.interfaces.nsILocalFile);
      file.initWithPath(path);
      return file.fileSize;
    }


Eventually the goal is to reach a stable API, but currently I'm the only person
working on or using this, so I break the API all the time.  Once a stable API
has been reached, then we can begin integration into other browsers and start
breaking everything again.  Actually, to be truthful, I don't think this
project will even reach stability before we start porting it to other browsers
and making it even more unstable. But, the goal, eventually, is to reach
stability.

### Add some salt and pepper to JavaScript.
Since we're bound to using common web technologies, JavaScript will be our
primary programming language. Now, before all you braniacs out there start
whining, you should [take another look at JavaScript][crockford_video].

Javascript has closures and it has prototypal inheritence. That's cool, but one
thing it does not have is modular a importing system (other than `<script />`).
Most of us also believe that JavaScript is limited to the scope of the page
that it is running in, but this does not have to be the case. We can place a
Javascript execution frame in the background of Firefox and allow it to run all
the time as a real background process.  It could even talk to other web pages,
and allow them to talk to one another.

To make JavaScript taste better, I've added a few dashes of
[CommonJS][commonjs] to make that ugly API I listed above go down a little
easier.  CommonJS is a working group that is trying to organize a few standards
that look like this.

    // in numbers.js, a background worker thread
    exports.myFavoriteNumber = 7;

    // in page.js, a locally served html+JS+css app
    myModule = require("numbers");
    alert(myModule.myFavoriteNumber); // alerts '7'
    myModule.myFavoriteNumber += 1;

    // in pagetoo.js within the same app
    myModule = require("numbers");
    alert(myModule.myFavoriteNumber); // alerts '8'

So, I've implemented this system, and so far I really like it.  Needless to say,
I can't wait to actually start using it on a regular basis.

### Chop into fine bits.

The next step is to build a packaging system that would not only differentiate
all the little modules, but also keep track of the dependencies and make sure
everything stays ok and does not blow up on us. Once again, CommonJS helped
out a lot on this with the [packages spec][packages].

You'll notice (after you have clicked on that link and read the spec) that
the CommonJS folks are mostly server side JavaScript gurus. I don't have
anything against that, but it seemed to me there is no reason we could not
use this standard on the client too.

I don't agree with everything that is going on with CommonJS, but I figured
it would be in my best interest to implement it *as is* for now. For the most
part I think it is a cool idea and I think most of the people working on it
are smarter than me. So, there you have it.

However, I have not yet actually implemented the package manager. It is the
next item on my todo list though. In fact, it is sitting, untested, on a local
source branch somewhere, if I could only remember where.  Geez, Git makes it
easy to create too many branches.

### Assemble into something awesome and serve immdiately.

Once the package manager is complete, you will be able to build your own modules.
They could be useful little libraries of JavaScript, ports of larger projects
like jQuery or Dojo, or complete programs with HTML, CSS, and JavaScript.

Once your module is complete, you will package it up and put it on a server
somewhere.  Then, users who have installed Kixx on their browser will be able
to install it over the network in a matter of seconds and begin using it
without restarting the browser or Windows.

Before you package up your module, you'll list all the other modules it is
dependent on in a manifest that will be included with the package. When
the user installs your module, Kixx will automagically install the dependencies if they
are needed.

Usage
-----
In it's current implementation Kixx is quite useless. The best way to use it is
to fork this project and use Git to [clone the repository onto your local
disk](http://help.github.com/forking/).  That way you can stay up to date on
the changes and check the release notes for more information.

Once have have cloned the repository, or
[downloaded](http://github.com/kixxauth/kixx/downloads) and unpacked the latest
version of the source tree, you'll need to [follow the
instructions](https://developer.mozilla.org/en/Setting_up_extension_development_environment)
for installing an extension into Firefox for development. The `install.rdf`
file can be found in the `tree` directory.

### That's it in a nutshell.
So, come help me build Kixx.  It's gonna be great.

* [Home Page](http://www.fireworksproject.com/projects/kixx)
* [Kixx on GitHub](http://github.com/kixxauth/kixx)
* [Twitter](http://twitter.com/kixxauth)
* kixxuath at gmail dot com
* [fireworksfactory.blogspot.com/](http://fireworksfactory.blogspot.com/)


License
-------
Licensed under The MIT License:

The MIT License

Copyright (c) 2009 Fireworks Technology Projects Inc.
[www.fireworksproject.com](http://www.fireworksproject.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

 [ajax]: http://en.wikipedia.org/wiki/Ajax_%28programming%29
 [rss]: http://en.wikipedia.org/wiki/Rss
 [atom]: http://en.wikipedia.org/wiki/Atom_%28standard%29
 [mozilla_platform]: https://developer.mozilla.org/en/The_Mozilla_platform
 [unix]: http://en.wikipedia.org/wiki/Unix_philosophy
 [crockford_video]: http://en.wikipedia.org/wiki/Unix_philosophy
 [commonjs]: http://wiki.commonjs.org/wiki/CommonJS
 [packages]: http://wiki.commonjs.org/wiki/Packages/0.1
