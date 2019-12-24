import { Container, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from "react";
import { BulletList } from 'react-content-loader';
import { RouteComponentProps } from "react-router";
import { PERMISSIONS } from '../../constants';
import { ApiContext } from '../../hooks/api/ApiContext';
import { I18nContext } from '../../hooks/i18n/I18nContext';
import { KeycloakContext } from '../../hooks/keycloak/KeycloakContext';
import { NavigationPropsContext } from '../../hooks/navigation-props/NavigationPropsContext';
import { ProblemKind } from '../../services/api/types';
import { ModelConfig, Project, SubGraph, TopGraph } from '../../types';
import { AcousticModel, LanguageModel } from '../../types/models.types';
import log from '../../util/log/logger';
import { ModelConfigList } from './ModelConfigList';

interface ModelConfigPageProps {
  projectId: string;
}

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      backgroundColor: theme.palette.background.default,
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

export function ModelConfigPage({ match }: RouteComponentProps<ModelConfigPageProps>) {
  const { projectId } = match.params;
  const { translate } = React.useContext(I18nContext);
  const api = React.useContext(ApiContext);
  const { getProps, clearProps } = React.useContext(NavigationPropsContext);
  const { hasPermission } = React.useContext(KeycloakContext);
  const [isValidId, setIsValidId] = React.useState(true);
  const [isValidProject, setIsValidProject] = React.useState(true);
  const [projectLoading, setProjectLoading] = React.useState(true);
  const [modelConfigsLoading, setModelConfigsLoading] = React.useState(true);
  const [topGraphsLoading, setTopGraphsLoading] = React.useState(true);
  const [subGraphsLoading, setSubGraphsLoading] = React.useState(true);
  const [languageModelsLoading, setLanguageModelsLoading] = React.useState(true);
  const [acousticModelsLoading, setAcousticModelsLoading] = React.useState(true);

  const [modelConfigs, setModelConfigs] = React.useState<ModelConfig[]>([]);

  // get the passed project if we got here via the details page
  interface NavigationPropsToGet {
    project: Project;
  }
  const navigationProps = getProps<NavigationPropsToGet>(['project']);
  const [project, setProject] = React.useState<Project | undefined>(navigationProps.project);

  const [topGraphs, setTopGraphs] = React.useState<TopGraph[]>([]);
  const [subGraphs, setSubGraphs] = React.useState<SubGraph[]>([]);
  const [languageModels, setLanguageModels] = React.useState<LanguageModel[]>([]);
  const [acousticModels, setAcousticModels] = React.useState<AcousticModel[]>([]);

  const classes = useStyles();

  // to clear any stored navigation props on component dismount
  React.useEffect(() => {
    return () => {
      clearProps();
    };
  }, []);

  const canModify = React.useMemo(() => hasPermission(PERMISSIONS.crud), []);

  const handleModelConfigUpdate = (modelConfig: ModelConfig, isEdit?: boolean) => {
    if (isEdit) {
      setModelConfigs(prevConfigs => {
        const idToUpdate = modelConfig.id;
        for (let i = 0; i < prevConfigs.length; i++) {
          if (prevConfigs[i].id === idToUpdate) {
            prevConfigs[i] = modelConfig;
          }
        }
        return prevConfigs;
      });
    } else {
      setModelConfigs(prevConfigs => {
        prevConfigs.push(modelConfig);
        return prevConfigs;
      });
    }
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
  const handleModelConfigDelete = (modelConfigId: string) => {
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

  React.useEffect(() => {
    const getProject = async () => {
      if (api?.projects) {
        const response = await api.projects.getProject(projectId);
        if (response.kind === 'ok') {
          setProject(response.project);
        } else if (response.kind === ProblemKind["not-found"]) {
          log({
            file: `ModelConfigPage.tsx`,
            caller: `getProject - project does not exist`,
            value: response,
            important: true,
          });
          setIsValidProject(false);
        } else {
          log({
            file: `ModelConfigPage.tsx`,
            caller: `getProject - failed to get project`,
            value: response,
            important: true,
          });
        }
        setProjectLoading(false);
      }
    };
    const getModelConfigs = async () => {
      if (api?.modelConfig) {
        const response = await api.modelConfig.getModelConfigs(projectId);
        if (response.kind === 'ok') {
          setModelConfigs(response.modelConfigs);
        } else {
          log({
            file: `ModelConfigPage.tsx`,
            caller: `getModelConfigs - failed to get model configs`,
            value: response,
            important: true,
          });
        }
        setModelConfigsLoading(false);
      }
    };
    const getTopGraphs = async () => {
      if (api?.models) {
        const response = await api.models.getTopGraphs();
        if (response.kind === 'ok') {
          setTopGraphs(response.topGraphs);
        } else {
          log({
            file: `ModelConfigPage.tsx`,
            caller: `getTopGraphs - failed to get topgraphs`,
            value: response,
            important: true,
          });
        }
        setTopGraphsLoading(false);
      }
    };
    const getSubGraphs = async () => {
      if (api?.models) {
        const response = await api.models.getSubGraphs();
        if (response.kind === 'ok') {
          setSubGraphs(response.subGraphs);
        } else {
          log({
            file: `ModelConfigPage.tsx`,
            caller: `getSubGraphs - failed to get subgraphs`,
            value: response,
            important: true,
          });
        }
        setSubGraphsLoading(false);
      }
    };
    const getLanguageModels = async () => {
      if (api?.models) {
        const response = await api.models.getLanguageModels();
        if (response.kind === 'ok') {
          setLanguageModels(response.languageModels);
        } else {
          log({
            file: `ModelConfigPage.tsx`,
            caller: `getLanguageModels - failed to get language models`,
            value: response,
            important: true,
          });
        }
        setLanguageModelsLoading(false);
      }
    };
    const getAcousticModels = async () => {
      if (api?.models) {
        const response = await api.models.getAcousticModels();
        if (response.kind === 'ok') {
          setAcousticModels(response.acousticModels);
        } else {
          log({
            file: `ModelConfigPage.tsx`,
            caller: `getAcousticModels - failed to get acoustic models`,
            value: response,
            important: true,
          });
        }
        setAcousticModelsLoading(false);
      }
    };
    if (!projectId) {
      setIsValidId(false);
      setProjectLoading(false);
      log({
        file: `ModelConfigPage.tsx`,
        caller: `project id not valid`,
        value: projectId,
        important: true,
      });
    } else {
      getModelConfigs();
      // only get if we weren't passed anything from the previous page
      if (!project) {
        getProject();
      } else {
        setProjectLoading(false);
      }
      if (canModify) {
        getTopGraphs();
        getSubGraphs();
        getLanguageModels();
        getAcousticModels();
      }
    }
  }, [api, projectId]);

  const renderContent = () => {
    if (!isValidId) {
      return <Typography>{translate('common.invalidId')}</Typography>;
    }
    if (!project || !isValidProject) {
      return <Typography>{translate('common.notFound')}</Typography>;
    }
    return (
      <ModelConfigList
        project={project}
        canModify={canModify}
        modelConfigs={modelConfigs}
        modelConfigsLoading={modelConfigsLoading}
        topGraphs={topGraphs}
        subGraphs={subGraphs}
        languageModels={languageModels}
        acousticModels={acousticModels}
        handleModelConfigUpdate={handleModelConfigUpdate}
        handleModelConfigDelete={handleModelConfigDelete}
        handleSubGraphListUpdate={handleSubGraphListUpdate}
        handleAcousticModelCreate={handleAcousticModelCreate}
        handleLanguageModelCreate={handleLanguageModelCreate}
      />);
  };

  return (
    <Container maxWidth={false} className={classes.container} >
      {projectLoading ? <BulletList /> :
        renderContent()
      }
    </Container >
  );
}