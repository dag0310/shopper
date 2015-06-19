# Shopper
The simple shareable shopping list

## Developer corner

### Prerequisites
- Local web server with PHP installed (e.g. [XAMPP](https://www.apachefriends.org))
- [Node.js](http://nodejs.org/)
- `npm install -g gulp`

### Installation
Execute the following command line statements inside the repository's root directory!

- Check out git repo
- `npm install` installs local node modules in folder "node_modules"
- `gulp dist` creates the application in the "dist" folder
- Open app in browser at web server location (e.g. http://localhost/shopper/dist)

### Development
- `gulp watch` executes tests, lints and builds the app after every file change
- `gulp watch_fast` builds the app after every file change without executing any tests or linting
- `gulp build` builds the app for development/debugging
- `gulp dist` packages the app for deployment
- Further gulp commands can be found in "gulpfile.js"

## License
GNU AFFERO GENERAL PUBLIC LICENSE
