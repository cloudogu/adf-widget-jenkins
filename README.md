# adf-widget-jenkins

jenkins widget for the [angular-dashboard-framework](https://github.com/sdorra/angular-dashboard-framework).

## Build

The widget is build with the help of [node](https://nodejs.org/), [npm](https://www.npmjs.com/), [bower](http://bower.io/) and [gulp](http://gulpjs.com/). For a install instruction for node and npm, please have a look [here](https://docs.npmjs.com/getting-started/installing-node).

#### Installing bower and gulp

```bash
npm install -g bower
npm install -g gulp
```

#### Installing dependencies

```bash
npm install
bower install
```

#### Build the adf-widget-jenkins

```bash
gulp
```

The compiled and optimized files can be found in the dist directory.

#### Other build goals

Each goal can be used as parameter for the gulp command.

* *clean*: removes the dist folder
* *lint*: checks css and javascript files for common errors
* *serve*: starts an webserver to test the widgets in local development. To provide the widgets with test data, "https://builds.apache.org/" is stored as the URL in `jenkins.js` by default. For local development, a [CORS plugin](https://chrome.google.com/webstore/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf) must be used in the browser.

## Usage

Include the script in your index.html and be sure it is loaded after [angular](https://angularjs.org/) and after the [angular-dashboard-framework](https://github.com/sdorra/angular-dashboard-framework).

```html
<script type="text/javascript" src="path/to/jenkins.min.js"></script>
```

Define a dependency for the module:

```javascript
angular.module('sample', ['adf', 'adf.widget.jenkins']);
```
