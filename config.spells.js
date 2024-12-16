SystemJS.config({
    baseURL:'https://unpkg.com/',
    defaultExtension: true,
    packages: {
      ".": {
        main: './spells.js',
        defaultExtension: 'js'
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
            react: true
        }
      },
      'modules/*[cm]?jsx?': {
          'babelOptions': {
            react: true
        }
      }
    },
    map: {
      'plugin-babel': 'systemjs-plugin-babel@latest/plugin-babel.js',
      'systemjs-babel-build': 'systemjs-plugin-babel@latest/systemjs-babel-browser.js',
      'react': 'react@17.0.1/umd/react.development.js',
      'react-dom': 'react-dom@17.0.1/umd/react-dom.development.js',
      '@material-ui/core': '@material-ui/core@4.11.1/umd/material-ui.development.js'
    },
    transpiler: 'plugin-babel'
  });
  
  SystemJS.import('./spells')
    .catch(console.error.bind(console));
  