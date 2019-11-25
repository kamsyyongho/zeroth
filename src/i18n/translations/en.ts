/* eslint-disable @typescript-eslint/camelcase */
import { ResourceLanguage } from 'i18next';

export const en: ResourceLanguage = {
  translation: {
    common: {
      okay: 'Okay',
      delete: 'Delete',
      submit: 'Submit',
      cancel: 'Cancel',
      create: 'Create',
      edit: 'Edit',
      save: 'Save',
      discard: 'Discard',
      dismiss: 'Dismiss',
      error: 'Error',
      reset: 'Reset',
      success: 'Success',
      failure: 'Failure',
      clear: 'Clear',
      createdAt: 'Creation date',
      length: 'Length',
      score: 'Score',
      upload: 'Upload',
      forbidden: 'Forbidden',
      view: 'View',
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
      home: 'Home',
      IAM: 'IAM',
      projects: 'Projects',
      models: 'Models',
      transcribers: 'Transcribers',
    },
    menu: {
      login: 'Login',
      logout: 'Logout',
      changeLanguage: 'Change language',
      profile: 'Profile',
    },
    profile: {
      user: 'User profile',
      organization: 'Organization profile',
      fullName: '{{given}} {{family}}',
      resetPassword: 'Reset password',
    },
    organization: {
      rename: 'Rename',
      renameOrg: 'Rename organization',
    },
    transcribers: {
      count: 'Count',
      rating: 'Rating',
    },
    forms: {
      validation: {
        required: 'Required',
        email: 'Email is not valid',
        number: 'Must be a number',
        integer: 'Must be an integer',
        greaterThan: '{{target}} must be greater than {{value}}',
        lessThan: '{{target}} must be less than {{value}}',
        greaterEqualTo: '{{target}} must be greater than or equal to {{value}}',
        lessEqualTo: '{{target}} must be less than or equal to {{value}}',
        between: '{{target}} must between {{first}} and {{second}}',
        between_characters:
          '{{target}} must between {{first}} and {{second}} characters long',
        maxFileSize: 'Max total file size exceeded. ({{value}})',
      },
      dropZone: {
        main: 'Drag and drop a file or click',
        text: 'Drag and drop a text file or click',
        audio: 'Drag and drop an audio file or click',
        main_plural: 'Drag and drop files or click',
        text_plural: 'Drag and drop text files or click',
        audio_plural: 'Drag and drop audio files or click',
        reject: {
          main: 'File {{name}} was rejected.',
          notSupported: 'File type not supported.',
          exceedSizeLimit: 'File is too big. Size limit is {{size}}.',
        },
      },
      numberFiles: 'Number of files to upload: {{count}}',
      email: 'Email',
      name: 'Name',
      text: 'Text',
      file: 'File',
      thresholdHc: 'High confidence threshold',
      thresholdLc: 'Low confidence threshold',
      description: 'Description',
      location: 'Location',
      sampleRate: 'Sample rate (kHz)',
      top: 'Top',
      sub: 'Sub',
      modelConfig: 'Model configuration',
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
      transcriber: 'Transcriber',
      none: 'None',
      today: 'Today',
      assign: 'Assign',
    },
    IAM: {
      user: 'User',
      roles: 'Roles',
      invite: 'Invite',
      header: 'Identity and Access Management',
      inviteUser: 'Invite user',
      deleteUser: 'Delete user',
      deleteUser_plural: 'Delete {{count}} users',
      resetUserPassword: `({{email}}) - Reset password`,
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
    },
    TDP: {
      TDP: 'TDP',
      uploadData: 'Upload data',
    },
    editor: {
      editor: 'Editor',
    },
    modelConfig: {
      header: 'Model configuration',
      header_plural: 'Model configurations',
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
          edit: 'Edit acoustic model',
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
    audioPlayer: {
      noUrl: 'No audio URL',
    },
  },
};
