import Button from '@material-ui/core/Button';
import { useTheme } from '@material-ui/core/styles';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import { useSnackbar } from 'notistack';
import MoonLoader from 'react-spinners/MoonLoader';
import { CellProps } from 'react-table';
import React from 'reactn';
import { ApiContext } from '../../../../hooks/api/ApiContext';
import { I18nContext } from '../../../../hooks/i18n/I18nContext';
import { SnackbarError, SNACKBAR_VARIANTS, User } from '../../../../types';
import log from '../../../../util/log/logger';
import { ConfirmationDialog } from '../../../shared/ConfirmationDialog';

interface UsersCellResetPasswordButtonProps {
  cellData: CellProps<User>;
}

export function UsersCellResetPasswordButton(props: UsersCellResetPasswordButtonProps) {
  const { cellData } = props;
  const { translate } = React.useContext(I18nContext);
  const api = React.useContext(ApiContext);
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = React.useState(false);
  const [confirmationOpen, setConfirmationOpen] = React.useState(false);

  const user: User = cellData.cell.value;
  const index = cellData.cell.row.index;
  const key = `${index}-submit`;

  const theme = useTheme();

  const confirmReset = () => setConfirmationOpen(true);
  const closeConfirmation = () => setConfirmationOpen(false);

  const resetPassword = async () => {
    if (api?.IAM) {
      closeConfirmation();
      setIsLoading(true);
      const response = await api.IAM.resetPasswordOfUser(user.id);
      let snackbarError: SnackbarError | undefined = {} as SnackbarError;
      if (response.kind === "ok") {
        snackbarError = undefined;
        enqueueSnackbar(translate('common.success'), { variant: SNACKBAR_VARIANTS.success });
      } else {
        log({
          file: `UsersCellResetPasswordButton.tsx`,
          caller: `resetPassword - failed to reset password`,
          value: response,
          error: true,
        });
        snackbarError.isError = true;
        const { serverError } = response;
        if (serverError) {
          snackbarError.errorText = serverError.message || "";
        }
      }
      snackbarError?.isError && enqueueSnackbar(snackbarError.errorText, { variant: SNACKBAR_VARIANTS.error });
      setIsLoading(false);
    }
  };

  return (
    <React.Fragment key={key}>
      <Button
        disabled={isLoading}
        onClick={confirmReset}
        variant="outlined"
        color="secondary"
        startIcon={isLoading ?
          <MoonLoader
            sizeUnit={"px"}
            size={15}
            color={theme.palette.secondary.main}
            loading={true}
          /> : <VpnKeyIcon />}
      >{translate("profile.resetPassword")}</Button>
      <ConfirmationDialog
        titleText={`${translate('IAM.resetUserPassword', { email: user.email })}?`}
        submitText={translate('common.reset')}
        open={confirmationOpen}
        onSubmit={resetPassword}
        onCancel={closeConfirmation}
      />
    </React.Fragment>
  );
}