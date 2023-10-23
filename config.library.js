SystemJS.config({
  baseURL: 'https://unpkg.com/',
  defaultExtension: true,
  packages: {
    ".": {
      main: './library-app.js'
    }
  },
  meta: {
    '*.js': {
      'babelOptions': {
        react: true
      }
    },
    '*.jsx': {
      'babelOptions': {
        react: true,
        blacklist: []
      }
    },
    'modules/*[cm]?jsx?': {
      'babelOptions': {
        react: true,
        blacklist: []
      }
    }
  },
  map: {
    'plugin-babel': 'systemjs-plugin-babel@latest/plugin-babel.js',
    'systemjs-babel-build': 'systemjs-plugin-babel@latest/systemjs-babel-browser.js',
    'react': 'react@18.2.0/umd/react.development.js',
    'react-dom': 'react-dom@18.2.0/umd/react-dom.development.js'
  },
  transpiler: 'plugin-babel'
});

SystemJS.import('./library.app.js')
  .catch(console.error.bind(console));