Shopper
=======
The simple shareable shopping list

Prerequisites
-------------
- Git of course
- Local web server with PHP installed (XAMPP, LAMP, ...)
- Node.js
- Node modules
  - npm install -g grunt
  - npm install -g grunt-cli
  - npm install -g bower

Installation
------------
- Check out git repo
- Point web server to build directory
- Setup database by copying an empty template of it from "COPY_TO_API" folder to "api" folder
- Install Node.js with package manager npm
- Install dependencies (in repo root directory)
  - npm install
  - bower update
- Run (also in repo root directory)
  - grunt watch
- Open website in browser at web server location (e.g. http://localhost/shopper/build)

License
-------
GNU AFFERO GENERAL PUBLIC LICENSE
