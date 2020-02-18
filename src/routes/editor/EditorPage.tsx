import { Container } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import { createStyles, makeStyles, useTheme } from '@material-ui/core/styles';
/* eslint import/no-webpack-loader-syntax: off */ // this lint rule is from create-react-app
import * as workerPath from "file-loader?name=[name].js!./workers/editor-page.worker";
import { useSnackbar } from 'notistack';
import { BulletList } from 'react-content-loader';
import ErrorBoundary from 'react-error-boundary';
import React, { useGlobal } from "reactn";
import { ApiContext } from '../../hooks/api/ApiContext';
import { I18nContext } from '../../hooks/i18n/I18nContext';
import { useWindowSize } from '../../hooks/window/useWindowSize';
import { CustomTheme } from '../../theme/index';
import { CONTENT_STATUS, Segment, SegmentAndWordIndex, SnackbarError, SNACKBAR_VARIANTS, Time, VoiceData, Word, WordAlignment, WordToCreateTimeFor } from '../../types';
import { PlayingWordAndSegment } from '../../types/editor.types';
import log from '../../util/log/logger';
import { AudioPlayer } from './AudioPlayer';
import { ConfirmationDialog } from '../shared/ConfirmationDialog';
import { NotFound } from '../shared/NotFound';
import { PageErrorFallback } from '../shared/PageErrorFallback';
import { SiteLoadingIndicator } from '../shared/SiteLoadingIndicator';
import { AssignSpeakerDialog } from './components/AssignSpeakerDialog';
import { EditorControls, EDITOR_CONTROLS } from './components/EditorControls';
import { EditorFetchButton } from './components/EditorFetchButton';
import { StarRating } from './components/StarRating';
import { Editor } from './Editor';
import { calculateWordTime, getDisabledControls } from './helpers/editor-page.helper';


const useStyles = makeStyles((theme: CustomTheme) =>
  createStyles({
    container: {
      marginTop: 25,
    },
  }),
);

/**
 * ensures that the selected word will be correctly
 * highlighted when setting the audio player seek 
 * from a text input focus
 */
const SEEK_SLOP = 0.00001;
const STARTING_PLAYING_LOCATION: SegmentAndWordIndex = [0, 0];
let internalSegmentsTracker: Segment[] = [];
/** used to debounce navigation when we change time after word click */
let wordWasClicked = false;
const AUDIO_PLAYER_HEIGHT = 384;

export enum PARENT_METHOD_TYPES {
  speaker
}

export interface ParentMethodResponse {
  payload: {
    segment: Segment,
    index: number,
  };
  type: PARENT_METHOD_TYPES,
}

/** props that need to be passed to the time pickers */
export interface TimePickerRootProps {
  timeFromPlayer?: Time;
  createTimeSection: (wordToAddTimeTo: Word, wordKey: string, isWord?: boolean) => void;
  deleteTimeSection: (wordKey: string, isWord?: boolean) => void;
  updateTimeSection: (wordToAddTimeTo: Word, wordKey: string, isWord?: boolean) => void;
  setDisabledTimes: (disabledTimes: Time[]) => void;
}

/** props that need to be passed to the split time picker */
export interface SplitTimePickerRootProps {
  segmentSplitTime?: number;
  onCreateSegmentSplitTimeBoundary: (segmentTimeBoundary: Required<Time>) => void;
  onSegmentSplitTimeBoundaryCreated: () => void;
  onSegmentSplitTimeChanged: (time: number) => void;
  onSegmentSplitTimeDelete: () => void;
}


export function EditorPage() {
  const { translate } = React.useContext(I18nContext);
  const windowSize = useWindowSize();
  const api = React.useContext(ApiContext);
  const { enqueueSnackbar } = useSnackbar();
  const [responseToPassToEditor, setResponseToPassToEditor] = React.useState<ParentMethodResponse | undefined>();
  const [canPlayAudio, setCanPlayAudio] = React.useState(false);
  const [playbackTime, setPlaybackTime] = React.useState(0);
  const [timeToSeekTo, setTimeToSeekTo] = React.useState<number | undefined>();
  const [currentPlayingLocation, setCurrentPlayingLocation] = React.useState<SegmentAndWordIndex>(STARTING_PLAYING_LOCATION);
  const [disabledTimes, setDisabledTimes] = React.useState<Time[] | undefined>();
  const [autoSeekLock, setAutoSeekLock] = React.useState(false);
  const [wordsClosed, setWordsClosed] = React.useState<boolean | undefined>();
  const [currentPlayingWordPlayerSegment, setCurrentlyPlayingWordPlayerSegment] = React.useState<PlayingWordAndSegment | undefined>();
  const [currentlyPlayingWordTime, setCurrentlyPlayingWordTime] = React.useState<Required<Time> | undefined>();
  const [wordToCreateTimeFor, setWordToCreateTimeFor] = React.useState<WordToCreateTimeFor | undefined>();
  const [wordToUpdateTimeFor, setWordToUpdateTimeFor] = React.useState<WordToCreateTimeFor | undefined>();
  const [segmentSplitTimeBoundary, setSegmentSplitTimeBoundary] = React.useState<Required<Time> | undefined>();
  const [segmentSplitTime, setSegmentSplitTime] = React.useState<number | undefined>();
  const [segmentIdToDelete, setSegmentIdToDelete] = React.useState<string | undefined>();
  const [deleteAllWordSegments, setDeleteAllWordSegments] = React.useState<boolean | undefined>();
  const [segmentIndexToAssignSpeakerTo, setSegmentIndexToAssignSpeakerTo] = React.useState<number | undefined>();
  const [timeFromPlayer, setTimeFromPlayer] = React.useState<Time | undefined>();
  const [editorReady, setEditorReady] = React.useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
  const [editorCommand, setEditorCommand] = React.useState<EDITOR_CONTROLS | undefined>();
  const [voiceDataLoading, setVoiceDataLoading] = React.useState(false);
  const [noAssignedData, setNoAssignedData] = React.useState(false);
  const [noRemainingContent, setNoRemainingContent] = React.useState(false);
  const [segmentsLoading, setSegmentsLoading] = React.useState(true);
  const [saveSegmentsLoading, setSaveSegmentsLoading] = React.useState(false);
  const [confirmSegmentsLoading, setConfirmSegmentsLoading] = React.useState(false);
  const [canUndo, setCanUndo] = React.useState(false);
  const [canRedo, setCanRedo] = React.useState(false);
  const [initialFetchDone, setInitialFetchDone] = React.useState(false);
  const [segments, setSegments] = React.useState<Segment[]>([]);

  // get the passed info if we got here via the details page
  interface NavigationPropsToGet {
    voiceData?: VoiceData;
    projectId?: string;
  }
  const [navigationProps, setNavigationProps] = useGlobal<{ navigationProps: NavigationPropsToGet; }>('navigationProps');
  const [voiceData, setVoiceData] = React.useState<VoiceData | undefined>(navigationProps?.voiceData);
  const [projectId, setProjectId] = React.useState<string | undefined>(navigationProps?.projectId);
  const readOnly = React.useMemo(() => !!navigationProps?.voiceData, []);

  const theme: CustomTheme = useTheme();
  const classes = useStyles();

  /**
   * Only `CONFIRMED` data can be rated, so we won't show if not
   */
  const alreadyConfirmed = React.useMemo(() => voiceData && voiceData.status === CONTENT_STATUS.CONFIRMED, [voiceData]);

  const openConfirmDialog = () => setConfirmDialogOpen(true);
  const closeConfirmDialog = () => setConfirmDialogOpen(false);

  const getAssignedData = async () => {
    if (api?.voiceData) {
      setVoiceDataLoading(true);
      const response = await api.voiceData.getAssignedData();
      if (response.kind === 'ok') {
        setNoAssignedData(response.noContent);
        setVoiceData(response.voiceData);
        if (response.voiceData?.projectId) {
          setProjectId(response.voiceData.projectId);
        }
      } else {
        log({
          file: `EditorPage.tsx`,
          caller: `getAssignedData - failed to get assigned data`,
          value: response,
          important: true,
        });
      }
      setVoiceDataLoading(false);
      setInitialFetchDone(true);
    }
  };

  const fetchMoreVoiceData = async () => {
    if (api?.voiceData) {
      setVoiceDataLoading(true);
      const response = await api.voiceData.fetchUnconfirmedData();
      if (response.kind === 'ok') {
        setNoAssignedData(response.noContent);
        setNoRemainingContent(response.noContent);
        setVoiceData(response.voiceData);
        if (response.voiceData?.projectId) {
          setProjectId(response.voiceData.projectId);
        }
      } else {
        log({
          file: `EditorPage.tsx`,
          caller: `fetchMoreVoiceData - failed to get voiceData`,
          value: response,
          important: true,
        });
      }
      setVoiceDataLoading(false);
      setInitialFetchDone(true);
    };
  };

  const getSegments = async () => {
    if (api?.voiceData && projectId && voiceData) {
      setSegmentsLoading(true);
      const response = await api.voiceData.getSegments(projectId, voiceData.id);
      if (response.kind === 'ok') {
        setSegments(response.segments);
      } else {
        log({
          file: `EditorPage.tsx`,
          caller: `getSegments - failed to get segments`,
          value: response,
          important: true,
        });
      }
      setSegmentsLoading(false);
    }
  };

  const confirmData = async () => {
    if (api?.voiceData && projectId && voiceData && !alreadyConfirmed) {
      setConfirmSegmentsLoading(true);
      closeConfirmDialog();
      const response = await api.voiceData.confirmData(projectId, voiceData.id);
      let snackbarError: SnackbarError | undefined = {} as SnackbarError;
      if (response.kind === 'ok') {
        snackbarError = undefined;
        enqueueSnackbar(translate('common.success'), { variant: SNACKBAR_VARIANTS.success });
        // to trigger the `useEffect` to fetch more
        setVoiceData(undefined);
      } else {
        log({
          file: `EditorPage.tsx`,
          caller: `confirmData - failed to confirm segments`,
          value: response,
          important: true,
        });
        snackbarError.isError = true;
        const { serverError } = response;
        if (serverError) {
          snackbarError.errorText = serverError.message || "";
        }
      }
      snackbarError?.isError && enqueueSnackbar(snackbarError.errorText, { variant: SNACKBAR_VARIANTS.error });
      setConfirmSegmentsLoading(false);
    }
  };

  const submitSegmentUpdate = async (segmentId: string, wordAlignments: WordAlignment[], transcript: string, segmentIndex: number, onSuccess: (segment: Segment) => void) => {
    if (api?.voiceData && projectId && voiceData && !alreadyConfirmed) {
      setSaveSegmentsLoading(true);
      const response = await api.voiceData.updateSegment(projectId, voiceData.id, segmentId, wordAlignments);
      let snackbarError: SnackbarError | undefined = {} as SnackbarError;
      if (response.kind === 'ok') {
        snackbarError = undefined;
        const updatedSegment: Segment = { ...segments[segmentIndex], wordAlignments: [...wordAlignments], transcript };
        const updatedSegments = [...segments];
        updatedSegments.splice(segmentIndex, 1, updatedSegment);
        setSegments(updatedSegments);
        onSuccess(updatedSegment);
      } else {
        log({
          file: `EditorPage.tsx`,
          caller: `submitSegmentUpdate - failed to update segment`,
          value: response,
          important: true,
        });
        snackbarError.isError = true;
        const { serverError } = response;
        if (serverError) {
          snackbarError.errorText = serverError.message || "";
        }
      }
      snackbarError?.isError && enqueueSnackbar(snackbarError.errorText, { variant: SNACKBAR_VARIANTS.error });
      setSaveSegmentsLoading(false);
    }
  };

  const submitSegmentTimeUpdate = async (segmentId: string, segmentIndex: number, start: number, length: number, onSuccess: (segment: Segment) => void) => {
    if (api?.voiceData && projectId && voiceData && segments.length && !alreadyConfirmed) {
      setSaveSegmentsLoading(true);
      const response = await api.voiceData.updateSegmentTime(projectId, voiceData.id, segmentId, start, length);
      let snackbarError: SnackbarError | undefined = {} as SnackbarError;
      if (response.kind === 'ok') {
        snackbarError = undefined;
        const updatedSegment: Segment = { ...segments[segmentIndex], start, length };
        const updatedSegments = [...segments];
        updatedSegments.splice(segmentIndex, 1, updatedSegment);
        setSegments(updatedSegments);
        onSuccess(updatedSegment);
      } else {
        log({
          file: `EditorPage.tsx`,
          caller: `submitSegmentTimeUpdate - failed to update segment time`,
          value: response,
          important: true,
        });
        snackbarError.isError = true;
        const { serverError } = response;
        if (serverError) {
          snackbarError.errorText = serverError.message || "";
        }
      }
      snackbarError?.isError && enqueueSnackbar(snackbarError.errorText, { variant: SNACKBAR_VARIANTS.error });
      setSaveSegmentsLoading(false);
    }
  };

  const submitSegmentMerge = async (firstSegmentIndex: number, secondSegmentIndex: number, onSuccess: (segment: Segment) => void) => {
    if (api?.voiceData && projectId && voiceData && segments.length && !alreadyConfirmed) {
      setSaveSegmentsLoading(true);
      const firstSegmentId = segments[firstSegmentIndex].id;
      const secondSegmentId = segments[secondSegmentIndex].id;
      const response = await api.voiceData.mergeTwoSegments(projectId, voiceData.id, firstSegmentId, secondSegmentId);
      let snackbarError: SnackbarError | undefined = {} as SnackbarError;
      if (response.kind === 'ok') {
        snackbarError = undefined;
        //cut out and replace the old segments
        const mergedSegments = [...segments];
        const NUMBER_OF_MERGE_SEGMENTS_TO_REMOVE = 2;
        mergedSegments.splice(firstSegmentIndex, NUMBER_OF_MERGE_SEGMENTS_TO_REMOVE, response.segment);
        // update the editor
        onSuccess(response.segment);
        // reset our new default baseline
        setSegments(mergedSegments);
      } else {
        log({
          file: `EditorPage.tsx`,
          caller: `submitSegmentMerge - failed to merge segments`,
          value: response,
          important: true,
        });
        snackbarError.isError = true;
        const { serverError } = response;
        if (serverError) {
          snackbarError.errorText = serverError.message || "";
        }
      }
      snackbarError?.isError && enqueueSnackbar(snackbarError.errorText, { variant: SNACKBAR_VARIANTS.error });
      setSaveSegmentsLoading(false);
    }
  };

  const submitSegmentSplit = async (segmentId: string, segmentIndex: number, splitIndex: number, onSuccess: (updatedSegments: [Segment, Segment]) => void) => {
    if (api?.voiceData && projectId && voiceData && !alreadyConfirmed) {
      setSaveSegmentsLoading(true);
      const response = await api.voiceData.splitSegment(projectId, voiceData.id, segmentId, splitIndex);
      let snackbarError: SnackbarError | undefined = {} as SnackbarError;
      if (response.kind === 'ok') {
        snackbarError = undefined;
        //cut out and replace the old segment
        const splitSegments = [...segments];
        const [firstSegment, secondSegment] = response.segments;
        const NUMBER_OF_SPLIT_SEGMENTS_TO_REMOVE = 1;
        splitSegments.splice(segmentIndex, NUMBER_OF_SPLIT_SEGMENTS_TO_REMOVE, firstSegment, secondSegment);
        // reset our new default baseline
        setSegments(splitSegments);
        // update the editor
        onSuccess(response.segments);
      } else {
        log({
          file: `EditorPage.tsx`,
          caller: `submitSegmentSplit - failed to split segment`,
          value: response,
          important: true,
        });
        snackbarError.isError = true;
        const { serverError } = response;
        if (serverError) {
          snackbarError.errorText = serverError.message || "";
        }
      }
      snackbarError?.isError && enqueueSnackbar(snackbarError.errorText, { variant: SNACKBAR_VARIANTS.error });
      setSaveSegmentsLoading(false);
    }
  };

  const submitSegmentSplitByTime = async (segmentId: string, segmentIndex: number, time: number, wordStringSplitIndex: number, onSuccess: (updatedSegments: [Segment, Segment]) => void) => {
    if (api?.voiceData && projectId && voiceData && !alreadyConfirmed) {
      setSaveSegmentsLoading(true);
      const response = await api.voiceData.splitSegmentByTime(projectId, voiceData.id, segmentId, time, wordStringSplitIndex);
      let snackbarError: SnackbarError | undefined = {} as SnackbarError;
      if (response.kind === 'ok') {
        snackbarError = undefined;
        //cut out and replace the old segment
        const splitSegments = [...segments];
        const [firstSegment, secondSegment] = response.segments;
        const NUMBER_OF_SPLIT_SEGMENTS_TO_REMOVE = 1;
        splitSegments.splice(segmentIndex, NUMBER_OF_SPLIT_SEGMENTS_TO_REMOVE, firstSegment, secondSegment);
        // reset our new default baseline
        setSegments(splitSegments);
        // update the editor
        onSuccess(response.segments);
      } else {
        log({
          file: `EditorPage.tsx`,
          caller: `submitSegmentSplitByTime - failed to split segment by time`,
          value: response,
          important: true,
        });
        snackbarError.isError = true;
        const { serverError } = response;
        if (serverError) {
          snackbarError.errorText = serverError.message || "";
        }
      }
      snackbarError?.isError && enqueueSnackbar(snackbarError.errorText, { variant: SNACKBAR_VARIANTS.error });
      setSaveSegmentsLoading(false);
    }
  };

  /**
   * Calculates start and end of the current playing word
   * - updates the state so it can be passed to the audio player
   * @params playingLocation
   */
  const buildPlayingAudioPlayerSegment = (playingLocation: SegmentAndWordIndex) => {
    const [segmentIndex, wordIndex] = playingLocation;
    let segmentsToUse = segments;
    if (!segmentsToUse.length) {
      segmentsToUse = [...internalSegmentsTracker];
    }
    const segment = segmentsToUse[segmentIndex];
    const wordAlignment = segment.wordAlignments[wordIndex];
    const startTime = segment.start + wordAlignment.start;
    const endTime = startTime + wordAlignment.length;
    const time: Required<Time> = {
      start: startTime,
      end: endTime,
    };
    setCurrentlyPlayingWordTime(time);
    const text = wordAlignment.word.replace('|', '');
    const color = theme.audioPlayer.wordRange;
    const currentlyPlayingWordToDisplay: WordToCreateTimeFor = {
      color,
      time,
      text,
    };
    const segmentText = segment.transcript;
    const segmentColor = theme.audioPlayer.segmentRange;
    const segmentStartTime = segment.start;
    const segmentEndTime = segmentStartTime + segment.length;
    const segmentTime: Required<Time> = {
      start: segmentStartTime,
      end: segmentEndTime,
    };
    const currentlyPlayingSegmentToDisplay: WordToCreateTimeFor = {
      color: segmentColor,
      time: segmentTime,
      text: segmentText,
    };
    setCurrentlyPlayingWordPlayerSegment([currentlyPlayingWordToDisplay, currentlyPlayingSegmentToDisplay]);
  };

  /** The worker used to calculate the current playing time */
  const RemoteWorker = React.useMemo(() => {
    if (window.Worker) {
      const worker = new Worker(workerPath);
      worker.addEventListener('message', message => {
        const playingLocation: SegmentAndWordIndex | undefined = message.data.playingLocation;
        const initialSegmentLoad: boolean = message.data.initialSegmentLoad;
        // to only update if the word has changed
        // compare strings generated from the tuples because we can't compare the tuples to each other
        if (playingLocation) {
          setCurrentPlayingLocation(playingLocation);
        }
        if (playingLocation && (initialSegmentLoad ||
          JSON.stringify(playingLocation) !== JSON.stringify(currentPlayingLocation))) {
          buildPlayingAudioPlayerSegment(playingLocation);
        }
      });
      return worker;
    };
  }, []);

  const onConfirmClick = () => {
    openConfirmDialog();
  };

  /**
   * keeps track of where the timer is
   * - used to keep track of which word is currently playing
   * - sets the segment index and word index of the currently playing word
   * @params time
   */
  const handlePlaybackTimeChange = (time: number, initialSegmentLoad = false) => {
    // prevents seeking again if we changed because of clicking a word
    if (wordWasClicked) {
      wordWasClicked = false;
    } else {
      setPlaybackTime(time);
      RemoteWorker?.postMessage({ time, segments, initialSegmentLoad, currentlyPlayingWordTime });
    }
    // to allow us to continue to force seeking the same word during playback
    setTimeToSeekTo(undefined);
  };

  /**
   * - sets the seek time in the audio player
   * - sets the current playing location if the audio player isn't locked
   */
  const handleWordClick = (wordLocation: SegmentAndWordIndex) => {
    const [segmentIndex, wordIndex] = wordLocation;
    if (typeof segmentIndex === 'number' && typeof wordIndex === 'number') {
      wordWasClicked = true;
      const wordTime = calculateWordTime(segments, segmentIndex, wordIndex);
      buildPlayingAudioPlayerSegment(wordLocation);
      setTimeToSeekTo(wordTime + SEEK_SLOP);
      if (!autoSeekLock) {
        setCurrentPlayingLocation(wordLocation);
      }
    }
  };

  const handlePlayerRendered = () => setCanPlayAudio(true);

  const handleDisabledTimesSet = (disabledTimes: Time[]) => {
    setDisabledTimes(disabledTimes);
  };

  const handleSegmentUpdate = (updatedSegment: Segment, segmentIndex: number) => {
    const updatedSegments = [...segments];
    updatedSegments[segmentIndex] = updatedSegment;
    setSegments(updatedSegments);
  };

  /** 
   * will be called in the editor to get the updated info
   * - used to update the attached segment data for the block
   */
  const updateEditorAfterSpeakerAssign = (updatedSegment: Segment, segmentIndex: number): ParentMethodResponse => {
    return {
      type: PARENT_METHOD_TYPES.speaker,
      payload: { segment: updatedSegment, index: segmentIndex },
    };
  };

  const handleSpeakerAssignSuccess = (updatedSegment: Segment, segmentIndex: number) => {
    const responseToPassToEditor = updateEditorAfterSpeakerAssign(updatedSegment, segmentIndex);
    setResponseToPassToEditor(responseToPassToEditor);
    handleSegmentUpdate(updatedSegment, segmentIndex);
  };

  const handleWordTimeCreationClose = () => {
    setDisabledTimes(undefined);
    setDeleteAllWordSegments(true);
    setWordsClosed(undefined);
    setSegmentIdToDelete(undefined);
    setWordToCreateTimeFor(undefined);
  };

  const handleAutoSeekToggle = (value: boolean) => setAutoSeekLock(value);

  const openSpeakerAssignDialog = (segmentIndex: number) => setSegmentIndexToAssignSpeakerTo(segmentIndex);

  const closeSpeakerAssignDialog = () => setSegmentIndexToAssignSpeakerTo(undefined);

  const handleEditorResponseHandled = () => setResponseToPassToEditor(undefined);

  const createTimeSection = (wordToAddTimeTo: Word, wordKey: string) => {
    setWordToCreateTimeFor({ ...wordToAddTimeTo, wordKey });
  };

  const updateTimeSection = (wordToAddTimeTo: Word, wordKey: string) => {
    setWordToUpdateTimeFor({ ...wordToAddTimeTo, wordKey });
  };

  const deleteTimeSection = (wordKey: string) => {
    setSegmentIdToDelete(wordKey);
  };

  const handleCommandHandled = () => setEditorCommand(undefined);

  /**
   * to reset the value once the peaks has made the segment uneditable
   * - for when a word edit popper is closed
   */
  const handleSegmentStatusEditChange = () => setWordsClosed(undefined);

  const handleSegmentDelete = (time?: number) => {
    setSegmentIdToDelete(undefined);
    setDeleteAllWordSegments(undefined);
    if (typeof time === 'number') {
      handlePlaybackTimeChange(time);
    }
  };

  const handlePlayingAudioSegmentCreate = () => setCurrentlyPlayingWordPlayerSegment(undefined);

  const handleAudioSegmentCreate = () => {
    setWordToCreateTimeFor(undefined);
  };

  const handleCreateSegmentSplitTimeBoundary = (segmentTimeBoundary: Required<Time>) => setSegmentSplitTimeBoundary(segmentTimeBoundary);

  const handleSegmentSplitTimeBoundaryCreated = () => setSegmentSplitTimeBoundary(undefined);

  const handleSegmentSplitTimeChanged = (time: number) => setSegmentSplitTime(time);

  const handleSegmentSplitTimeDelete = () => {
    setSegmentSplitTime(undefined);
    setSegmentSplitTimeBoundary(undefined);
  };

  const handleAudioSegmentUpdate = () => setWordToUpdateTimeFor(undefined);

  const handleSectionChange = (time: Time, wordKey: string) => {
    setTimeFromPlayer(time);
  };

  const onUpdateUndoRedoStack = (canUndo: boolean, canRedo: boolean) => {
    setCanUndo(canUndo);
    setCanRedo(canRedo);
  };

  const resetVariables = () => {
    internalSegmentsTracker = [];
    wordWasClicked = false;
    setSegmentsLoading(true);
    setSegments([]);
    setPlaybackTime(0);
    setCanPlayAudio(false);
    setCanUndo(false);
    setCanRedo(false);
    setCurrentPlayingLocation(STARTING_PLAYING_LOCATION);
    setCurrentlyPlayingWordPlayerSegment(undefined);
    setCurrentlyPlayingWordTime(undefined);
    setSegmentSplitTimeBoundary(undefined);
    handleWordTimeCreationClose();
    setNavigationProps({});
  };

  React.useEffect(() => {
    internalSegmentsTracker = segments;
  }, [segments]);

  React.useEffect(() => {
    getSegments();
  }, [voiceData, projectId]);

  // once we've loaded new segments
  React.useEffect(() => {
    // if we have loaded new voice data
    if (!voiceDataLoading && !segmentsLoading && voiceData) {
      handlePlaybackTimeChange(0, true);
    }
  }, [voiceDataLoading, segmentsLoading, voiceData]);

  // subsequent fetches
  React.useEffect(() => {
    if (!voiceDataLoading && !voiceData && initialFetchDone && !noRemainingContent && !noAssignedData) {
      resetVariables();
      getAssignedData();
    }
  }, [voiceData, initialFetchDone, voiceDataLoading, noRemainingContent, noAssignedData]);

  // initial fetch and dismount logic
  React.useEffect(() => {
    if (readOnly) {
      getSegments();
    } else {
      getAssignedData();
    }
    return () => {
      resetVariables();
      if (RemoteWorker) {
        RemoteWorker.terminate();
      }
    };
  }, []);

  if (voiceDataLoading) {
    return <SiteLoadingIndicator />;
  }

  if (!readOnly && initialFetchDone && noAssignedData && !noRemainingContent) {
    return <EditorFetchButton onClick={fetchMoreVoiceData} />;
  }

  if (noRemainingContent || !voiceData || !projectId) {
    return <NotFound text={translate('editor.nothingToTranscribe')} />;
  }

  const disabledControls = getDisabledControls(segments, canUndo, canRedo, saveSegmentsLoading, confirmSegmentsLoading);

  const editorHeight = windowSize.height && (windowSize?.height - AUDIO_PLAYER_HEIGHT);
  const editorContainerStyle: React.CSSProperties = {
    height: editorHeight,
    minHeight: 250,
  };

  return (
    <>
      {!readOnly && <EditorControls
        onCommandClick={setEditorCommand}
        onConfirm={onConfirmClick}
        disabledControls={disabledControls}
        loading={saveSegmentsLoading || confirmSegmentsLoading}
        editorReady={editorReady}
      />}
      <Container >
        {readOnly && <StarRating
          voiceData={voiceData}
          projectId={projectId}
        />}
        <Paper
          className={classes.container}
          elevation={5}
        >
          <div style={editorContainerStyle}>
            {segmentsLoading ? <BulletList /> :
              !!segments.length && (<Editor
                key={voiceData.id}
                readOnly={readOnly}
                responseFromParent={responseToPassToEditor}
                onParentResponseHandled={handleEditorResponseHandled}
                editorCommand={editorCommand}
                onCommandHandled={handleCommandHandled}
                height={editorHeight}
                segments={segments}
                onReady={setEditorReady}
                playingLocation={currentPlayingLocation}
                loading={saveSegmentsLoading}
                onUpdateUndoRedoStack={onUpdateUndoRedoStack}
                onWordClick={handleWordClick}
                updateSegment={submitSegmentUpdate}
                updateSegmentTime={submitSegmentTimeUpdate}
                splitSegment={submitSegmentSplit}
                splitSegmentByTime={submitSegmentSplitByTime}
                mergeSegments={submitSegmentMerge}
                assignSpeaker={openSpeakerAssignDialog}
                onWordTimeCreationClose={handleWordTimeCreationClose}
                timePickerRootProps={{
                  setDisabledTimes: handleDisabledTimesSet,
                  createTimeSection: createTimeSection,
                  updateTimeSection: updateTimeSection,
                  deleteTimeSection: deleteTimeSection,
                  timeFromPlayer: timeFromPlayer,
                }}
                splitTimePickerRootProps={{
                  segmentSplitTime,
                  onCreateSegmentSplitTimeBoundary: handleCreateSegmentSplitTimeBoundary,
                  onSegmentSplitTimeBoundaryCreated: handleSegmentSplitTimeBoundaryCreated,
                  onSegmentSplitTimeChanged: handleSegmentSplitTimeChanged,
                  onSegmentSplitTimeDelete: handleSegmentSplitTimeDelete,
                }}
              />)
            }
          </div>
          {!!voiceData.length && <ErrorBoundary
            key={voiceData.id}
            FallbackComponent={PageErrorFallback}
          >
            <AudioPlayer
              key={voiceData.id}
              url={voiceData.audioUrl}
              timeToSeekTo={timeToSeekTo}
              disabledTimes={disabledTimes}
              segmentIdToDelete={segmentIdToDelete}
              onAutoSeekToggle={handleAutoSeekToggle}
              wordsClosed={wordsClosed}
              deleteAllWordSegments={deleteAllWordSegments}
              onSegmentDelete={handleSegmentDelete}
              onSegmentCreate={handleAudioSegmentCreate}
              onSegmentUpdate={handleAudioSegmentUpdate}
              onPlayingSegmentCreate={handlePlayingAudioSegmentCreate}
              onSegmentStatusEditChange={handleSegmentStatusEditChange}
              currentPlayingWordPlayerSegment={currentPlayingWordPlayerSegment}
              wordToCreateTimeFor={wordToCreateTimeFor}
              wordToUpdateTimeFor={wordToUpdateTimeFor}
              onTimeChange={handlePlaybackTimeChange}
              onSectionChange={handleSectionChange}
              onReady={handlePlayerRendered}
              segmentSplitTimeBoundary={segmentSplitTimeBoundary}
              segmentSplitTime={segmentSplitTime}
              onSegmentSplitTimeChanged={handleSegmentSplitTimeChanged}
            />
          </ErrorBoundary>}
        </Paper>
      </Container >
      <ConfirmationDialog
        titleText={`${translate('editor.confirmTranscript')}?`}
        submitText={translate('editor.confirm')}
        open={confirmDialogOpen}
        onSubmit={confirmData}
        onCancel={closeConfirmDialog}
      />
      <AssignSpeakerDialog
        projectId={projectId}
        dataId={voiceData.id}
        segment={(segmentIndexToAssignSpeakerTo !== undefined) ? segments[segmentIndexToAssignSpeakerTo] : undefined}
        segmentIndex={segmentIndexToAssignSpeakerTo}
        open={segmentIndexToAssignSpeakerTo !== undefined}
        onClose={closeSpeakerAssignDialog}
        onSuccess={handleSpeakerAssignSuccess}
      />
    </>
  );
}
