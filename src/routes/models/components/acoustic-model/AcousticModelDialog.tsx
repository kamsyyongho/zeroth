import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import AddIcon from '@material-ui/icons/Add';
import { Field, Form, Formik } from 'formik';
import { useSnackbar } from 'notistack';
import React from 'react';
import MoonLoader from 'react-spinners/MoonLoader';
import * as yup from 'yup';
import { VALIDATION } from '../../../../constants/validation.constants';
import { ApiContext } from '../../../../hooks/api/ApiContext';
import { I18nContext } from '../../../../hooks/i18n/I18nContext';
import { SnackbarError } from '../../../../types';
import { AcousticModel } from '../../../../types/models.types';
import log from '../../../../util/log/logger';
import { TextFormField } from '../../../shared/form-fields/TextFormField';

interface AcousticModelDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: (model: AcousticModel) => void
}


export function AcousticModelDialog(props: AcousticModelDialogProps) {
  const { open, onClose, onSuccess } = props;
  const { enqueueSnackbar } = useSnackbar();
  const { translate } = React.useContext(I18nContext);
  const api = React.useContext(ApiContext);
  const [loading, setLoading] = React.useState(false)
  const [isError, setIsError] = React.useState(false)

  const theme = useTheme();
  // to expand to fullscreen on small displays
  const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));

  // validation translated text
  const requiredTranslationText = translate("forms.validation.required") as string;
  const nameText = translate("forms.validation.between", { target: translate('forms.name'), first: VALIDATION.MODELS.ACOUSTIC.name.min, second: VALIDATION.MODELS.ACOUSTIC.name.max, context: 'characters' }) as string;
  const sampleRateText = translate("forms.validation.between", { target: translate('forms.name'), first: VALIDATION.MODELS.ACOUSTIC.sampleRate.min, second: VALIDATION.MODELS.ACOUSTIC.sampleRate.max }) as string;

  const formSchema = yup.object({
    name: yup.string().min(VALIDATION.MODELS.ACOUSTIC.name.min, nameText).max(VALIDATION.MODELS.ACOUSTIC.name.max, nameText).required(requiredTranslationText).trim(),
    location: yup.string().required(requiredTranslationText).trim(),
    sampleRate: yup.number().min(VALIDATION.MODELS.ACOUSTIC.name.min, sampleRateText).max(VALIDATION.MODELS.ACOUSTIC.name.max, sampleRateText).required(requiredTranslationText),
    description: yup.string().trim(),
  })
  type FormValues = yup.InferType<typeof formSchema>;
  const initialValues: FormValues = {
    name: "",
    location: "",
    sampleRate: 8,
    description: "",
  };

  const handleSubmit = async (values: FormValues) => {
    if (api && api.models) {
      setLoading(true);
      setIsError(false);
      const { name, description, location, sampleRate } = values;
      const response = await api.models.postAcousticModel(name.trim(), sampleRate, location.trim(), description.trim());
      let snackbarError: SnackbarError | undefined = {} as SnackbarError;
      if (response.kind === "ok") {
        snackbarError = undefined;
        enqueueSnackbar(translate('common.success'), { variant: 'success' });
        onSuccess(response.acousticModel);
        onClose();
      } else {
        log({
          file: `AcousticModelDialog.tsx`,
          caller: `handleSubmit - failed create acoustic model`,
          value: response,
          important: true,
        })
        snackbarError.isError = true;
        setIsError(true);
        const { serverError } = response;
        if (serverError) {
          snackbarError.errorText = serverError.message || "";
        }
      }
      snackbarError && snackbarError.isError && enqueueSnackbar(snackbarError.errorText, { variant: 'error' });
      setLoading(false);
    }
  }

  return (
    <Dialog
      fullScreen={fullScreen}
      open={open}
      onClose={onClose}
      aria-labelledby="responsive-dialog-title"
    >
      <DialogTitle id="responsive-dialog-title">{translate('models.tabs.acousticModel.create')}</DialogTitle>
      <Formik initialValues={initialValues} onSubmit={handleSubmit} validationSchema={formSchema}>
        {(formikProps) => (
          <>
            <DialogContent>
              <Form>
                <Field autoFocus name='name' component={TextFormField} label={translate("forms.name")} errorOverride={isError} />
                <Field name='location' component={TextFormField} label={translate("forms.location")} errorOverride={isError} />
                <Field name='sampleRate' component={TextFormField} label={translate("forms.sampleRate")} errorOverride={isError} />
                <Field name='description' component={TextFormField} label={translate("forms.description")} errorOverride={isError} />
              </Form>
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose} color="primary">
                {translate("common.cancel")}
              </Button>
              <Button onClick={formikProps.submitForm} color="primary" variant="outlined"
                startIcon={loading ?
                  <MoonLoader
                    sizeUnit={"px"}
                    size={15}
                    color={theme.palette.primary.main}
                    loading={true}
                  /> : <AddIcon />}
              >
                {translate('models.createModel')}
              </Button>
            </DialogActions>
          </>
        )}
      </Formik>
    </Dialog>
  );
}