import { Button, Card, CardContent, Grid } from '@material-ui/core';
import CardActions from '@material-ui/core/CardActions';
import { useTheme } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import { useSnackbar } from 'notistack';
import React from 'react';
import { BulletList } from 'react-content-loader';
import MoonLoader from 'react-spinners/MoonLoader';
import { ApiContext } from '../../../../hooks/api/ApiContext';
import { I18nContext } from '../../../../hooks/i18n/I18nContext';
import { deleteAcousticModelResult, ServerError } from '../../../../services/api/types';
import { AcousticModel } from '../../../../types';
import log from '../../../../util/log/logger';
import { ConfirmationDialog } from '../../../shared/ConfirmationDialog';
import { CheckedModelById, EditOpenByModelId } from '../language-model/LanguageModelGridList';
import { AcousticModelDialog } from './AcousticModelDialog';
import { AcousticModelGridItem } from './AcousticModelGridItem';

export function AcousticModelGridList() {
  const api = React.useContext(ApiContext);
  const { translate } = React.useContext(I18nContext);
  const { enqueueSnackbar } = useSnackbar();
  const [models, setModels] = React.useState<AcousticModel[]>([]);
  const [modelsLoading, setModelsLoading] = React.useState(true);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [confirmationOpen, setConfirmationOpen] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState<EditOpenByModelId>({});
  const [checkedModels, setCheckedModels] = React.useState<CheckedModelById>({});

  const theme = useTheme();

  const handleEditOpen = (modelId: number) => setEditOpen(prevOpen => {
    return { ...prevOpen, [modelId]: true };
  });
  const handleEditClose = (modelId: number) => setEditOpen(prevOpen => {
    return { ...prevOpen, [modelId]: false };
  });

  const handleCreateOpen = () => setCreateOpen(true);
  const handleCreateClose = () => setCreateOpen(false);

  const confirmDelete = () => setConfirmationOpen(true);
  const closeConfirmation = () => setConfirmationOpen(false);

  let modelsToDelete: number[] = [];
  Object.keys(checkedModels).forEach(modelId => {
    const checked = checkedModels[Number(modelId)];
    if (checked) {
      modelsToDelete.push(Number(modelId));
    }
  });

  /**
   * remove the deleted models from all lists
   */
  const handleDeleteSuccess = (idsToDelete: number[]) => {
    const modelsCopy = models.slice();
    // count down to account for removing indexes
    for (let i = models.length - 1; i >= 0; i--) {
      const model = models[i];
      if (idsToDelete.includes(model.id)) {
        modelsCopy.splice(i, 1);
      }
    }
    modelsToDelete = [];
    setCheckedModels({});
    setModels(modelsCopy);
  };

  const handleModelCheck = (modelId: number, value: boolean): void => {
    setCheckedModels((prevCheckedModels) => {
      return { ...prevCheckedModels, [modelId]: value };
    });
  };

  React.useEffect(() => {
    const getModels = async () => {
      if (api && api.models) {
        const response = await api.models.getAcousticModels();
        if (response.kind === 'ok') {
          setModels(response.acousticModels);
        } else {
          log({
            file: `AcousticModelGridList.tsx`,
            caller: `getModels - failed to get acoustic models`,
            value: response,
            important: true,
          });
        }
        setModelsLoading(false);
      }
    };
    getModels();
  }, [api]);

  const handleModelDelete = async () => {
    setDeleteLoading(true);
    closeConfirmation();
    const deleteProjectPromises: Promise<deleteAcousticModelResult>[] = [];
    const successIds: number[] = [];
    modelsToDelete.forEach(modelId => {
      if (api && api.models) {
        deleteProjectPromises.push(api.models.deleteAcousticModel(modelId));
      } else {
        return;
      }
    });
    let serverError: ServerError | undefined;
    const responseArray = await Promise.all(deleteProjectPromises);
    responseArray.forEach((response, responseIndex) => {
      if (response.kind !== "ok") {
        log({
          file: `AcousticModelGridList.tsx`,
          caller: `handleModelDelete - Error:`,
          value: response,
          error: true,
        });
        serverError = response.serverError;
        let errorMessageText = translate('common.error');
        if (serverError && serverError.message) {
          errorMessageText = serverError.message;
        }
        enqueueSnackbar(errorMessageText, { variant: 'error' });
      } else {
        successIds.push(modelsToDelete[responseIndex]);
        enqueueSnackbar(translate('common.success'), { variant: 'success', preventDuplicate: true });
      }
    });
    // update the model list
    handleDeleteSuccess(successIds);
    setDeleteLoading(false);
  };


  const handleModelListUpdate = (model: AcousticModel, isEdit?: boolean) => {
    if (isEdit) {
      setModels(prevModels => {
        const idToUpdate = model.id;
        for (let i = 0; i < prevModels.length; i++) {
          if (prevModels[i].id === idToUpdate) {
            prevModels[i] = model;
          }
        }
        return prevModels;
      });
    } else {
      setModels(prevModels => {
        prevModels.push(model);
        return prevModels;
      });
    }
  };

  const handleEditSuccess = (updatedModel: AcousticModel, isEdit?: boolean) => {
    handleModelListUpdate(updatedModel, isEdit);
    handleEditClose(updatedModel.id);
  };



  const renderModels = () => models.map((model, index) => (
    <AcousticModelGridItem
      key={index}
      model={model}
      editOpen={editOpen}
      checkedModels={checkedModels}
      handleEditOpen={handleEditOpen}
      handleEditClose={handleEditClose}
      handleEditSuccess={handleEditSuccess}
      handleModelCheck={handleModelCheck}
    />
  ));

  if (modelsLoading) {
    return <BulletList />;
  }

  return (
    <Card>
      <AcousticModelDialog
        open={createOpen}
        onClose={handleCreateClose}
        onSuccess={handleModelListUpdate}
      />
      {!!models.length &&
        (<CardContent>
          <Grid container spacing={2} >
            {renderModels()}
          </Grid>
        </CardContent>)}
      <CardActions>
        {!!models.length && <Button
          disabled={!modelsToDelete.length}
          variant="contained"
          color="secondary"
          onClick={confirmDelete}
          startIcon={deleteLoading ? <MoonLoader
            sizeUnit={"px"}
            size={15}
            color={theme.palette.common.white}
            loading={true}
          /> : <DeleteIcon />}
        >
          {translate('common.delete')}
        </Button>}
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateOpen}
          startIcon={<AddIcon />}
        >
          {translate('models.tabs.acousticModel.create')}
        </Button>
      </CardActions>
      <ConfirmationDialog
        destructive
        titleText={`${translate('models.tabs.acousticModel.delete', { count: modelsToDelete.length })}?`}
        submitText={translate('common.delete')}
        open={confirmationOpen}
        onSubmit={handleModelDelete}
        onCancel={closeConfirmation}
      />
    </Card>
  );
}