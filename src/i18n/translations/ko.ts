/* eslint-disable @typescript-eslint/camelcase */
import { ResourceLanguage } from 'i18next';

export const ko: ResourceLanguage = {
  translation: {
    common: {
      okay: 'Okay',
      delete: '삭제',
      submit: '제출',
      cancel: '취소',
      create: 'Create',
      edit: 'Edit',
      error: '오류',
      success: 'Success',
      failure: 'Failure',
      clear: 'Clear',
      createdAt: 'Creation date',
      length: 'Length',
      score: 'Score',
    },
    table: {
      page: 'Page',
      pageOf: 'Page {{current}} of {{total}}',
      labelDisplayedRows: '{{from}}-{{to}} of {{count}}',
      labelRowsPerPage: 'Rows per page',
      noResults: 'No results',
      filterResults: 'Filter results',
    },
    path: {
      home: '홈',
      IAM: 'IAM',
      projects: 'Projects',
      models: 'Models',
    },
    menu: {
      login: '로그인',
      logout: '로그아웃',
      changeLanguage: '언어 바꾸기',
    },
    forms: {
      validation: {
        required: 'Required',
        email: 'Email is not valid',
        number: 'Must be a number',
        integer: 'Must be an integer',
        min: '{{target}} must be greater than {{value}}',
        max: '{{target}} must be greater than {{value}}',
        greaterThan: '{{target}} must be greater than {{value}}',
        lessThan: '{{target}} must be less than {{value}}',
        greaterEqualTo: '{{target}} must be greater than or equal to {{value}}',
        lessEqualTo: '{{target}} must be less than or equal to {{value}}',
        between: '{{target}} must between {{first}} and {{second}}',
        between_characters:
          '{{target}} must between {{first}} and {{second}} characters long',
      },
      email: '이메일',
      name: '이름',
      text: 'Text',
      file: 'File',
      thresholdHc: 'High confidence threshold',
      thresholdLc: 'Low confidence threshold',
      description: 'Description',
      location: 'Location',
      sampleRate: 'Sample rate (kHz)',
      top: 'Top',
      sub: 'Sub',
      privacySetting: 'Privacy setting',
      fileUpload: 'File upload',
      source: 'Source',
      private: 'Private',
      public: 'Public',
      languageModel: 'Language Model',
      acousticModel: 'Acoustic Model',
      status: 'Status',
      startDate: 'Start Date',
      endDate: 'End Date',
      lengthMin: 'Min Length',
      lengthMax: 'Max Length',
      scoreMin: 'Min Score',
      scoreMax: 'Max Score',
      transcript: 'Transcript',
      none: 'None',
      today: '오늘',
    },
    IAM: {
      user: '사용자',
      roles: '역할',
      invite: '초대',
      header: 'Identity and Access Management',
      inviteUser: 'Invite user',
      deleteUser: 'Delete user',
      deleteUser_plural: 'Delete {{count}} users',
    },
    projects: {
      createProject: 'Create project',
      editProject: 'Edit project',
      deleteProject: 'Delete project',
      deleteProject_plural: 'Delete {{count}} projects',
      header: 'Project Management',
      apiKey: 'API Key',
      apiSecret: 'API Secret',
      thresholdHc: 'High confidence threshold',
      thresholdLc: 'Low confidence threshold',
      TDP: 'TDP',
    },
    modelConfig: {
      header: 'Model configuration',
      header_plural: 'Model configuration',
      create: 'Create configuration',
      edit: 'Edit configuration',
      delete: 'Delete model configuration',
    },
    models: {
      header: 'Model Management',
      tabs: {
        acousticModel: {
          header: 'Acoustic Model',
          create: 'Create acoustic model',
          delete: 'Delete acoustic model',
          delete_plural: 'Delete {{count}} acoustic models',
        },
        languageModel: {
          header: 'Language Model',
          create: 'Create language model',
          edit: 'Edit language model',
          delete: 'Delete language model',
          delete_plural: 'Delete {{count}} language models',
        },
      },
      createSubGraph: 'Create sub graph',
      editSubGraph: 'Edit sub graph',
      deleteSubGraph: 'Delete sub graph',
      deleteSubGraph_plural: 'Delete {{count}} sub graphs',
      createModel: 'Create model',
      editModel: 'Edit model',
    },
  },
};