process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

process.on('unhandledRejection', err => {
  throw err;
});

require('../config/env.cjs');

const fs = require('fs');
const chalk = require('react-dev-utils/chalk');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const clearConsole = require('react-dev-utils/clearConsole');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const {
  choosePort,
  createCompiler,
  prepareProxy,
  prepareUrls,
} = require('react-dev-utils/WebpackDevServerUtils');
const openBrowser = require('react-dev-utils/openBrowser');
const semver = require('semver');
const paths = require('../config/paths.cjs');
const configFactory = require('../config/webpack.config.cjs');
const createDevServerConfig = require('../config/webpackDevServer.config.cjs');
const getClientEnvironment = require('../config/env.cjs');
const react = require(require.resolve('react', { paths: [paths.appPath] }));

const env = getClientEnvironment(paths.publicUrlOrPath.slice(0, -1));
const useYarn = fs.existsSync(paths.yarnLockFile);
const isInteractive = process.stdout.isTTY;

if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
  process.exit(1);
}

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

if (process.env.HOST) {
  console.log(
    chalk.cyan(
      `Attempting to bind to HOST environment variable: ${chalk.yellow(
        chalk.bold(process.env.HOST)
      )}`
    )
  );
  console.log(
    `If this was unintentional, check that you haven't mistakenly set it in your shell.`
  );
  console.log(
    `Learn more here: ${chalk.yellow('https://cra.link/advanced-config')}`
  );
  console.log();
}

const { checkBrowsers } = require('react-dev-utils/browsersHelper');
checkBrowsers(paths.appPath, isInteractive)
  .then(() => {
    return choosePort(HOST, DEFAULT_PORT);
  })
  .then(port => {
    if (port == null) {
      return;
    }

    const config = configFactory('development');
    const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
    const appName = require(paths.appPackageJson).name;
    const useTypeScript = fs.existsSync(paths.appTsConfig);
    const urls = prepareUrls(
      protocol,
      HOST,
      port,
      paths.publicUrlOrPath.slice(0, -1)
    );
    const compiler = createCompiler({
      appName,
      config,
      urls,
      useYarn,
      useTypeScript,
      webpack,
    });
    const proxySetting = require(paths.appPackageJson).proxy;
    const proxyConfig = prepareProxy(
      proxySetting,
      paths.appPublic,
      paths.publicUrlOrPath
    );
    const serverConfig = {
      ...createDevServerConfig(proxyConfig, urls.lanUrlForConfig),
      host: HOST,
      port,
    };
    const devServer = new WebpackDevServer(serverConfig, compiler);
    devServer.startCallback(() => {
      if (isInteractive) {
        clearConsole();
      }
      if (env.raw.FAST_REFRESH && semver.lt(react.version, '16.10.0')) {
        console.log(
          chalk.yellow(
            `Fast Refresh requires React 16.10 or higher. You are using React ${react.version}.`
          )
        );
      }
      console.log(chalk.cyan('Starting the development server...\n'));
      openBrowser(urls.localUrlForBrowser);
    });
    ['SIGINT', 'SIGTERM'].forEach(function (sig) {
      process.on(sig, function () {
        devServer.stop();
        process.exit();
      });
    });
    if (process.env.CI !== 'true') {
      process.stdin.on('end', function () {
        devServer.stop();
        process.exit();
      });
    }
  })
  .catch(err => {
    if (err && err.message) {
      console.log(err.message);
    }
    process.exit(1);
  });
