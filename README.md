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
- Point web server to build directory (e.g. http://localhost/shopper/build)
- `npm install` installs local node modules in folder "node_modules"
- `gulp db` sets up the database by copying an empty template of it from "src" folder to "api" folder
- `gulp watch` executes tests, lints and builds the app after every file change
- `gulp watch_fast` builds the app after every file change without executing any tests or linting
- Open app in browser at web server location 

### Development
- `gulp build` builds the app (used by `gulp watch`)
- `gulp dist` packages the app for deployment

## License
GNU AFFERO GENERAL PUBLIC LICENSE
