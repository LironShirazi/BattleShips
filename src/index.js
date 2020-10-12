import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { createMuiTheme, ThemeProvider } from "@material-ui/core";
// import { Provider } from 'react-redux';
// import { createStore } from 'redux';

// const store = createStore(rootReducer);
const theme = createMuiTheme({
  palette: {
     primary: {
        main:    "#d73030"
               },
     secondary: {
         main:    "#b22222" 
                }
           },
fontFamily: 'roboto' //recommended
});


ReactDOM.render(
  // <React.StrictMode>
      <>
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </>
  // </React.StrictMode>,
  ,document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
