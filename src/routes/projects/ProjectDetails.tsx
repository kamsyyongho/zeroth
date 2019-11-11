import { Card, CardContent, CardHeader, Container, TextField, Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React from "react";
import { BulletList } from 'react-content-loader';
import { RouteComponentProps } from "react-router";
import { Link } from 'react-router-dom';
import { ApiContext } from '../../hooks/api/ApiContext';
import { I18nContext } from '../../hooks/i18n/I18nContext';
import { ProblemKind } from '../../services/api/types';
import { ModelConfig, PATHS, Project, SubGraph, TopGraph } from '../../types';
import { AcousticModel, LanguageModel } from '../../types/models.types';
import log from '../../util/log/logger';
import { Breadcrumb, HeaderBreadcrumbs } from '../shared/HeaderBreadcrumbs';
import { ModelConfigList } from '../shared/model-config/ModelConfigList';

interface ProjectDetailsProps {
  projectId: string;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      padding: 0,
    },
    cardContent: {
      padding: 0,
    },
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
  }),
);

export function ProjectDetails({ match }: RouteComponentProps<ProjectDetailsProps>) {
  const { projectId } = match.params;
  const projectIdNumber = Number(projectId);
  const { translate } = React.useContext(I18nContext);
  const api = React.useContext(ApiContext);
  const [isValidId, setIsValidId] = React.useState(true);
  const [isValidProject, setIsValidProject] = React.useState(true);
  const [projectLoading, setProjectLoading] = React.useState(true);
  const [modelConfigsLoading, setModelConfigsLoading] = React.useState(true);
  const [topGraphsLoading, setTopGraphsLoading] = React.useState(true);
  const [subGraphsLoading, setSubGraphsLoading] = React.useState(true);
  const [languageModelsLoading, setLanguageModelsLoading] = React.useState(true);
  const [acousticModelsLoading, setAcousticModelsLoading] = React.useState(true);
  const [project, setProject] = React.useState<Project | undefined>(undefined);
  const [modelConfigs, setModelConfigs] = React.useState<ModelConfig[]>([]);
  const [topGraphs, setTopGraphs] = React.useState<TopGraph[]>([]);
  const [subGraphs, setSubGraphs] = React.useState<SubGraph[]>([]);
  const [languageModels, setLanguageModels] = React.useState<LanguageModel[]>([]);
  const [acousticModels, setAcousticModels] = React.useState<AcousticModel[]>([]);


  const handleModelConfigCreate = (newModelConfig: ModelConfig) => {
    setModelConfigs((prevModelConfigs) => {
      prevModelConfigs.push(newModelConfig);
      return prevModelConfigs;
    });
  };
  const handleSubGraphListUpdate = (newSubGraph: SubGraph) => {
    setSubGraphs((prevSubGraphs) => {
      prevSubGraphs.push(newSubGraph);
      return prevSubGraphs;
    });
  };
  const handleAcousticModelCreate = (newAcousticModel: AcousticModel) => {
    setAcousticModels((prevAcousticModels) => {
      prevAcousticModels.push(newAcousticModel);
      return prevAcousticModels;
    });
  };
  const handleLanguageModelCreate = (newLanguageModel: LanguageModel) => {
    setLanguageModels((prevLanguageModels) => {
      prevLanguageModels.push(newLanguageModel);
      return prevLanguageModels;
    });
  };

  /**
   * remove the deleted model config from the list
   */
  const handleModelConfigDelete = (modelConfigId: number) => {
    const modelConfigsCopy = modelConfigs.slice();
    // count down to account for removing indexes
    for (let i = modelConfigsCopy.length - 1; i >= 0; i--) {
      const modelConfig = modelConfigsCopy[i];
      if (modelConfig.id === modelConfigId) {
        modelConfigsCopy.splice(i, 1);
      }
    }
    setModelConfigs(modelConfigsCopy);
  };

  //!
  //TODO
  //* IMMEDIATELY REDIRECT IF USER DOESN'T HAVE THE CORRECT ROLES

  const classes = useStyles();

  React.useEffect(() => {
    const getProject = async () => {
      if (api && api.projects) {
        const response = await api.projects.getProject(projectIdNumber);
        if (response.kind === 'ok') {
          setProject(response.project);
        } else if (response.kind === ProblemKind["not-found"]) {
          log({
            file: `ProjectDetails.tsx`,
            caller: `getProject - project does not exist`,
            value: response,
            important: true,
          });
          setIsValidProject(false);
        } else {
          log({
            file: `ProjectDetails.tsx`,
            caller: `getProject - failed to get project`,
            value: response,
            important: true,
          });
        }
        setProjectLoading(false);
      }
    };
    const getModelConfigs = async () => {
      if (api && api.modelConfig) {
        const response = await api.modelConfig.getModelConfigs(projectIdNumber);
        if (response.kind === 'ok') {
          setModelConfigs(response.modelConfigs);
        } else {
          log({
            file: `ProjectDetails.tsx`,
            caller: `getModelConfigs - failed to get model configs`,
            value: response,
            important: true,
          });
        }
        setModelConfigsLoading(false);
      }
    };
    const getTopGraphs = async () => {
      if (api && api.models) {
        const response = await api.models.getTopGraphs();
        if (response.kind === 'ok') {
          setTopGraphs(response.topGraphs);
        } else {
          log({
            file: `ProjectDetails.tsx`,
            caller: `getTopGraphs - failed to get topgraphs`,
            value: response,
            important: true,
          });
        }
        setTopGraphsLoading(false);
      }
    };
    const getSubGraphs = async () => {
      if (api && api.models) {
        const response = await api.models.getSubGraphs();
        if (response.kind === 'ok') {
          setSubGraphs(response.subGraphs);
        } else {
          log({
            file: `ProjectDetails.tsx`,
            caller: `getSubGraphs - failed to get subgraphs`,
            value: response,
            important: true,
          });
        }
        setSubGraphsLoading(false);
      }
    };
    const getLanguageModels = async () => {
      if (api && api.models) {
        const response = await api.models.getLanguageModels();
        if (response.kind === 'ok') {
          setLanguageModels(response.languageModels);
        } else {
          log({
            file: `ProjectDetails.tsx`,
            caller: `getLanguageModels - failed to get language models`,
            value: response,
            important: true,
          });
        }
        setLanguageModelsLoading(false);
      }
    };
    const getAcousticModels = async () => {
      if (api && api.models) {
        const response = await api.models.getAcousticModels();
        if (response.kind === 'ok') {
          setAcousticModels(response.acousticModels);
        } else {
          log({
            file: `ProjectDetails.tsx`,
            caller: `getAcousticModels - failed to get acoustic models`,
            value: response,
            important: true,
          });
        }
        setAcousticModelsLoading(false);
      }
    };
    if (isNaN(projectIdNumber)) {
      setIsValidId(true);
      setProjectLoading(false);
      log({
        file: `ProjectDetails.tsx`,
        caller: `project id not valid`,
        value: projectId,
        important: true,
      });
    } else {
      getProject();
      getModelConfigs();
      getTopGraphs();
      getSubGraphs();
      getLanguageModels();
      getAcousticModels();
    }
  }, [api, projectId, projectIdNumber]);

  const renderContent = () => {
    if (!isValidId) {
      return <Typography>{'INVALID PROJECT ID'}</Typography>;
    }
    if (!project || !isValidProject) {
      return <Typography>{'PROJECT NOT FOUND'}</Typography>;
    }
    const breadcrumbs: Breadcrumb[] = [
      PATHS.projects,
      {
        rawTitle: project.name,
      }
    ];
    return (<Card>
      <CardHeader
        action={<Button
          component={Link}
          to={`${PATHS.TDP.function && PATHS.TDP.function(project.id)}`}
          variant="contained"
          color="primary">
          {'TEST TDP BUTTON'}
        </Button>}
        title={<HeaderBreadcrumbs breadcrumbs={breadcrumbs} />}
      />
      <CardContent className={classes.cardContent} >
        {projectLoading ? <BulletList /> :
          <>
            <TextField
              id="api-key"
              label={translate('projects.apiKey')}
              defaultValue={project.apiKey}
              className={classes.textField}
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
              variant="filled"
            />
            <TextField
              id="api-secret"
              label={translate('projects.apiSecret')}
              defaultValue={project.apiSecret}
              className={classes.textField}
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
              variant="filled"
            />
          </>
        }
      </CardContent>
    </Card>);
  };

  return (
    <Container maxWidth={false} className={classes.container} >
      {projectLoading ? <BulletList /> :
        renderContent()
      }
      {isValidProject && <ModelConfigList
        projectId={projectIdNumber}
        modelConfigs={modelConfigs}
        modelConfigsLoading={modelConfigsLoading}
        topGraphs={topGraphs}
        subGraphs={subGraphs}
        languageModels={languageModels}
        acousticModels={acousticModels}
        handleModelConfigCreate={handleModelConfigCreate}
        handleModelConfigDelete={handleModelConfigDelete}
        handleSubGraphListUpdate={handleSubGraphListUpdate}
        handleAcousticModelCreate={handleAcousticModelCreate}
        handleLanguageModelCreate={handleLanguageModelCreate}
      />}
    </Container >
  );
}