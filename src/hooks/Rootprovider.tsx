import DateFnsUtils from '@date-io/date-fns';
import { CssBaseline } from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { ThemeProvider } from '@material-ui/styles';
import { SnackbarProvider } from 'notistack';
import React from 'react';
import { SNACKBAR } from '../constants';
import { Api } from '../services/api/api';
import { theme } from '../theme/index';
import { ApiContext } from './api/ApiContext';
import { GlobalStateContext, ParsedGlobalState } from './global-state/GlobalStateContext';
import { I18nContext, ParsedI18n } from './i18n/I18nContext';
import { KeycloakContext, ParsedKeycloak } from "./keycloak/KeycloakContext";
import { NavigationPropsContext, ParsedNavigationProps } from './navigation-props/NavigationPropsContext';

interface RootProviderProps {
  children: React.ReactNode;
  api: Api;
  i18n: ParsedI18n;
  keycloak: ParsedKeycloak;
  navigationProps: ParsedNavigationProps;
  globalState: ParsedGlobalState;
}

/**
 * Wraps the app in all required global providers
 * @param props the context values to pass to the providers
 */
export default function RootProvider(props: RootProviderProps) {
  const {children, api, i18n, keycloak, navigationProps, globalState} = props;
  return (
    <I18nContext.Provider value={i18n}>
      <MuiPickersUtilsProvider utils={DateFnsUtils} locale={i18n.pickerLocale}>
        <ThemeProvider theme={theme} >
          <CssBaseline />
          <KeycloakContext.Provider value={keycloak}>
            <ApiContext.Provider value={api}>
              <NavigationPropsContext.Provider value={navigationProps}>
                <GlobalStateContext.Provider value={globalState}>
                  <SnackbarProvider maxSnack={3} anchorOrigin={SNACKBAR.anchorOrigin} autoHideDuration={SNACKBAR.autoHideDuration} >
                    {children}
                  </SnackbarProvider>
                </GlobalStateContext.Provider>
              </NavigationPropsContext.Provider>
            </ApiContext.Provider>
          </KeycloakContext.Provider>
        </ThemeProvider>
      </MuiPickersUtilsProvider>
    </I18nContext.Provider>
  );
}

