import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { createStyles, makeStyles, useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import AddIcon from '@material-ui/icons/Add';
import BackupIcon from '@material-ui/icons/Backup';
import clsx from 'clsx';
import { Field, Form, Formik } from 'formik';
import { useSnackbar } from 'notistack';
import MoonLoader from 'react-spinners/MoonLoader';
import React, { useGlobal } from 'reactn';
import * as yup from 'yup';
import { ApiContext } from '../../../hooks/api/ApiContext';
import { I18nContext } from '../../../hooks/i18n/I18nContext';
import { ProblemKind } from '../../../services/api/types';
import { ModelConfig, SnackbarError, SNACKBAR_VARIANTS } from '../../../types';
import log from '../../../util/log/logger';
import { DropZoneFormField } from '../../shared/form-fields/DropZoneFormField';
import { SelectFormField, SelectFormFieldOptions } from '../../shared/form-fields/SelectFormField';

const useStyles = makeStyles((theme) =>
  createStyles({
    hidden: {
      visibility: 'hidden',
    },
  }),
);

interface AudioUploadDialogProps {
  open: boolean;
  projectId: string;
  modelConfigs: ModelConfig[];
  onClose: () => void;
  onSuccess: () => void;
  modelConfigDialogOpen?: boolean;
  openModelConfigDialog?: (hideBackdrop?: boolean) => void;
}

/** this is using the same simple (incorrect) method for calculating file size as file upload library */
const MAX_TOTAL_FILE_SIZE_LIMIT = 50000000; // 50 MB in bytes
const MAX_TOTAL_FILE_SIZE_LIMIT_STRING = '50 MB';

const ACCEPTED_FILE_TYPES = ['audio/wav', 'audio/mp3'];

export function AudioUploadDialog(props: AudioUploadDialogProps) {
  const {
    open,
    projectId,
    modelConfigs,
    onClose,
    onSuccess,
    modelConfigDialogOpen,
    openModelConfigDialog,
  } = props;
  const { enqueueSnackbar } = useSnackbar();
  const [uploadQueueEmpty, setUploadQueueEmpty] = useGlobal('uploadQueueEmpty');
  const { translate } = React.useContext(I18nContext);
  const api = React.useContext(ApiContext);
  const [loading, setLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);
  const [duplicateError, setDuplicateError] = React.useState('');
  const [maxSizeError, setMaxSizeError] = React.useState('');

  const theme = useTheme();
  const classes = useStyles();

  const handleClose = () => {
    setIsError(false);
    onClose();
  };

  // to expand to fullscreen on small displays
  const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));

  let allModelConfigsStillTraining = true;
  const formSelectOptions: SelectFormFieldOptions = modelConfigs.map((modelConfig) => {
    const disabled = modelConfig.progress < 100;
    if (!disabled) {
      allModelConfigsStillTraining = false;
    }
    return { label: modelConfig.name, value: modelConfig.id, disabled };
  });

  const validFilesCheck = (files: File[]) => !!files.length && files.every(file => file instanceof File);


  // validation translated text
  const noAvailableModelConfigText = (modelConfigs.length && allModelConfigsStillTraining) ? translate('models.validation.allModelConfigsStillTraining', { count: modelConfigs.length }) : '';
  const requiredTranslationText = translate("forms.validation.required");
  const maxFileSizeText = translate("forms.validation.maxFileSize", { value: MAX_TOTAL_FILE_SIZE_LIMIT_STRING });

  const handleMaxFileSizeExceeded = (totalSize?: string) => {
    if (!totalSize) {
      setMaxSizeError('');
    } else {
      setMaxSizeError(translate('forms.validation.maxFileSize', { value: totalSize }));
    }
  };

  const handleDuplicateFileNames = (fileName?: string) => {
    if (!fileName) {
      setDuplicateError('');
    } else {
      setDuplicateError(`${translate('forms.dropZone.reject.duplicateFileNames')}: ${fileName}`);
    }
  };

  const testMaxTotalFileSize = (files: File[]) => {
    let fileSizeCounter = 0;
    let isValid = true;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      fileSizeCounter += file.size;
      if (fileSizeCounter >= MAX_TOTAL_FILE_SIZE_LIMIT) {
        isValid = false;
        break;
      }
    }
    return isValid;
  };

  const formSchema = yup.object({
    selectedModelConfigId: yup.string().nullable().required(requiredTranslationText),
    files: yup.array<File>().required(requiredTranslationText).test('files', maxFileSizeText, testMaxTotalFileSize),
  });
  type FormValues = yup.InferType<typeof formSchema>;
  const initialValues: FormValues = {
    selectedModelConfigId: null,
    files: [],
  };

  const handleSubmit = async (values: FormValues) => {
    const { files, selectedModelConfigId } = values;
    if (!validFilesCheck(files) || selectedModelConfigId === null) {
      return;
    }
    if (api?.rawData && !loading && !duplicateError && !maxSizeError) {
      setLoading(true);
      setIsError(false);
      const response = await api.rawData.uploadRawData(projectId, selectedModelConfigId, files);
      let snackbarError: SnackbarError | undefined = {} as SnackbarError;
      if (response.kind === 'ok') {
        // to trigger polling for upload progress
        // this logic is in the header component
        setUploadQueueEmpty(false);
        snackbarError = undefined;
        enqueueSnackbar(translate('common.success'), { variant: SNACKBAR_VARIANTS.success });
        onSuccess();
        onClose();
      } else {
        if (response.kind === ProblemKind['rejected']) {
          log({
            file: `AudioUploadDialog.tsx`,
            caller: `handleSubmit - uploaded file size exceeded`,
            value: response,
            important: true,
          });
        } else {
          log({
            file: `AudioUploadDialog.tsx`,
            caller: `handleSubmit - failed to upload audio file(s)`,
            value: response,
            important: true,
          });
        }
        snackbarError.isError = true;
        setIsError(true);
        const { serverError } = response;
        if (serverError) {
          snackbarError.errorText = serverError.message || "";
        }
      }
      snackbarError?.isError && enqueueSnackbar(snackbarError.errorText, { variant: SNACKBAR_VARIANTS.error });
      setLoading(false);
    }
  };

  return (
    <Dialog
      fullScreen={fullScreen}
      disableBackdropClick={loading}
      disableEscapeKeyDown={loading}
      open={open}
      onClose={handleClose}
      aria-labelledby="audio-upload-dialog"
      classes={{
        container: clsx(modelConfigDialogOpen && classes.hidden)
      }}
    >
      <DialogTitle id="audio-upload-dialog">{translate(`TDP.uploadData`)}</DialogTitle>
      <Formik initialValues={initialValues} onSubmit={handleSubmit} validationSchema={formSchema}>
        {(formikProps) => (
          <>
            <DialogContent>
              <Form>
                <Field
                  name='selectedModelConfigId'
                  component={SelectFormField}
                  options={formSelectOptions}
                  label={translate("forms.modelConfig")}
                  errorOverride={isError || noAvailableModelConfigText}
                  helperText={noAvailableModelConfigText}
                />
                {(typeof openModelConfigDialog === 'function') && <Button
                  fullWidth
                  color="primary"
                  onClick={() => openModelConfigDialog(true)}
                  startIcon={<AddIcon />}
                >
                  {translate('modelConfig.create')}
                </Button>}
                <Field
                  showPreviews
                  maxFileSize={MAX_TOTAL_FILE_SIZE_LIMIT}
                  acceptedFiles={ACCEPTED_FILE_TYPES}
                  name='files'
                  dropZoneText={translate('forms.dropZone.audio_plural')}
                  component={DropZoneFormField}
                  onDuplicateFileNames={handleDuplicateFileNames}
                  onMaxFileSizeExceeded={handleMaxFileSizeExceeded}
                  helperText={!!formikProps.values.files.length && translate('forms.numberFiles', { count: formikProps.values.files.length })}
                  errorOverride={isError || !!formikProps.errors.files || duplicateError || maxSizeError}
                  errorTextOverride={formikProps.errors.files || duplicateError || maxSizeError}
                />
              </Form>
            </DialogContent>
            <DialogActions>
              <Button disabled={loading} onClick={handleClose} color="primary">
                {translate("common.cancel")}
              </Button>
              <Button
                disabled={!formikProps.isValid || isError || loading || !!duplicateError || !!maxSizeError}
                onClick={formikProps.submitForm}
                color="primary"
                variant="outlined"
                startIcon={loading ?
                  <MoonLoader
                    sizeUnit={"px"}
                    size={15}
                    color={theme.palette.primary.main}
                    loading={true}
                  /> : <BackupIcon />}
              >
                {translate("common.upload")}
              </Button>
            </DialogActions>
          </>
        )}
      </Formik>
    </Dialog>
  );
}