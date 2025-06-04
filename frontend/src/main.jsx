import React from 'react';
import ReactDOM from 'react-dom/client';
import { ApolloProvider } from '@apollo/client';
import { CssVarsProvider } from '@mui/joy/styles';
import client from './client';
import App from './App';
import theme from './theme';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CssVarsProvider theme={theme}>
      <ApolloProvider client={client}>
        <Toaster />
        <App />
      </ApolloProvider>
    </CssVarsProvider>
  </React.StrictMode>
);