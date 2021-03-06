import { Capacity, ModelConfig, Threshold } from '../../../types';
import { GeneralApiProblem } from './api-problem.types';

//////////////
// REQUESTS //
//////////////

export interface CreateModelConfigRequest {
  acousticModelId: string;
  name: string;
  thresholdLr: Threshold | null;
  thresholdHr: Threshold | null;
  description: string;
  shareable: boolean;
  topGraphId: string;
  subGraphIds: string[];
}

export interface UpdateModelConfigRequest {
  thresholdLr: Threshold | null;
  thresholdHr: Threshold | null;
  description: string;
  shareable: boolean;
}

export type ThresholdRequest = Pick<
    UpdateModelConfigRequest,
  'thresholdHr' | 'thresholdLr'
>;

/////////////
// RESULTS //
/////////////

export type getModelConfigsResult =
  | { kind: 'ok'; modelConfigs: ModelConfig[] }
  | GeneralApiProblem;
export type getCapacity =
    | { kind: 'ok'; capacity: Capacity }
    | GeneralApiProblem;
export type postModelConfigResult =
  | { kind: 'ok'; modelConfig: ModelConfig }
  | GeneralApiProblem;
export type updateModelConfigResult =
  | { kind: 'ok'; modelConfig: ModelConfig }
  | GeneralApiProblem;
export type updateThresholdResult = { kind: 'ok' } | GeneralApiProblem;
export type importModelConfig = { kind: 'ok'; modelConfig: ModelConfig } | GeneralApiProblem;
export type deleteModelConfigResult = { kind: 'ok' } | GeneralApiProblem;
export type updateDeployment = { kind: 'ok' } | GeneralApiProblem;
export type destroyDeployment = { kind: 'ok' } | GeneralApiProblem;
