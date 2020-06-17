import { ClickAwayListener, Popper, SvgIcon, Tooltip, Typography } from '@material-ui/core';
import Button, { ButtonProps } from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Fade from '@material-ui/core/Fade';
import Grid from '@material-ui/core/Grid';
import { createStyles, makeStyles, useTheme } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import DeveloperModeIcon from '@material-ui/icons/DeveloperMode';
import MultilineChartIcon from '@material-ui/icons/MultilineChart';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import { default as PublishIcon } from '@material-ui/icons/Publish';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import ToggleIcon from 'material-ui-toggle-icon';
import { AiOutlineColumnWidth } from 'react-icons/ai';
import ScaleLoader from 'react-spinners/ScaleLoader';
import React, { useGlobal } from 'reactn';
import { I18nContext } from '../../../hooks/i18n/I18nContext';
import { ICONS } from '../../../theme/icons';
import { isMacOs } from '../../../util/misc';
import { ConfidenceSlider } from './ConfidenceSlider';

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      paddingBottom: 1,
      backgroundColor: theme.palette.secondary.dark,
    },
    buttonGroup: {
      height: 60,
    },
    button: {
      border: `0 !important`,
    },
    buttonRoot: {
      color: theme.palette.secondary.contrastText,
      backgroundColor: theme.palette.secondary.dark,
      "&:hover": {
        backgroundColor: theme.palette.secondary.light,
      }
    },
    buttonSelected: {
      color: theme.palette.secondary.contrastText,
      backgroundColor: theme.palette.secondary.light,
      "&:hover": {
        backgroundColor: theme.palette.secondary.light,
      }
    },
    buttonDisabled: {
      color: `${theme.palette.grey[700]} !important`,
    },
    toggle: {
      color: theme.palette.secondary.contrastText,
    },
    popper: {
      zIndex: theme.zIndex.drawer,
    },
    status: {
      color: theme.palette.common.white,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }
  }),
);

export enum EDITOR_CONTROLS {
  confirm,
  save,
  undo,
  redo,
  merge,
  split,
  toggleMore,
  createWord,
  editSegmentTime,
  setThreshold,
  speaker,
  debug,
}

const EDITOR_STATUS = {
  loading: 'loading',
  saved: 'saved',
  error: 'error',
}

const primaryControlOrder = [
  EDITOR_CONTROLS.save,
  EDITOR_CONTROLS.undo,
  EDITOR_CONTROLS.redo,
  EDITOR_CONTROLS.merge,
  EDITOR_CONTROLS.split,
  EDITOR_CONTROLS.toggleMore,
  // EDITOR_CONTROLS.createWord,
  EDITOR_CONTROLS.editSegmentTime,
  EDITOR_CONTROLS.setThreshold,
  // EDITOR_CONTROLS.debug,
];

const secondaryControlOrder = [
  EDITOR_CONTROLS.confirm,
];

/** keeps track of the editor state for the keyboard listener
 * - outside the component to keep it out of the react lifecycle
 */
let editorInFocus = false;

interface EditorControlsProps {
  onCommandClick: (newMode: EDITOR_CONTROLS) => void;
  onConfirm: () => void;
  disabledControls?: EDITOR_CONTROLS[];
  loading?: boolean;
  editorReady?: boolean;
  playingLocation: number[];
  isSegmentUpdateError: boolean;
}

export const EditorControls = (props: EditorControlsProps) => {
  const {
    onCommandClick,
    onConfirm,
    disabledControls = [],
    loading,
    editorReady,
    playingLocation,
    isSegmentUpdateError,
  } = props;
  const { translate, osText } = React.useContext(I18nContext);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [sliderOpen, setSliderOpen] = React.useState(false);
  const [editorDebugMode, setEditorDebugMode] = useGlobal('editorDebugMode');
  const [showEditorPopups, setShowEditorPopups] = useGlobal('showEditorPopups');
  const [editorFocussed, setEditorFocussed] = useGlobal('editorFocussed');
  const [statusEl, setStatusEl] = React.useState<any>();

  const handleThresholdClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleClickAway = () => {
    if (sliderOpen) {
      setAnchorEl(null);
    }
  };

  const handleClick = (command: EDITOR_CONTROLS) => {
    onCommandClick(command);
    if(playingLocation) {
      const playingBlock = document.getElementById(`word-${playingLocation[0]}-${playingLocation[1]}`);
      const selection = window.getSelection();
      const range = document.createRange();

      if(playingBlock) {
        range.selectNodeContents(playingBlock);
        range.collapse(true);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  }

  const open = Boolean(anchorEl);

  const classes = useStyles();
  const theme = useTheme();

  // to prevent the keypress listeners from firing twice
  // the editor will handle the shortcuts when it is focussed
  React.useEffect(() => {
    editorInFocus = !!editorFocussed;
  }, [editorFocussed]);

  const renderButton = (label: string, Icon: JSX.Element | null, tooltipText: string, buttonProps?: ButtonProps, selected?: boolean) => (
    <Button
      key={label}
      {...buttonProps}
      classes={{
        root: selected ? classes.buttonSelected : classes.buttonRoot,
        disabled: classes.buttonDisabled,
      }}
      className={classes.button}
    >
      <Tooltip
        placement='bottom'
        title={tooltipText ? <Typography variant='h6' >{tooltipText}</Typography> : ''}
        arrow={true}
      >
        <Grid
          container
          direction='column'
          alignItems='center'
        >
          {Icon}
          {label}
        </Grid>
      </Tooltip>
    </Button>
  );

  const renderButtons = (controlOrder: EDITOR_CONTROLS[]) => {
    return controlOrder.map((control) => {
      let label = '';
      let tooltipText = '';
      let icon: JSX.Element | null = null;
      let props: ButtonProps = {};
      let selected = false;
      switch (control) {
        case EDITOR_CONTROLS.save:
          label = translate('common.save');
          icon = <ICONS.Save />;
          tooltipText = osText('save');
          props = {
            onClick: () => handleClick(EDITOR_CONTROLS.save),
            disabled: disabledControls.includes(EDITOR_CONTROLS.save),
          };
          break;
        case EDITOR_CONTROLS.confirm:
          label = translate('editor.approvalRequest');
          icon = <PublishIcon />;
          props = {
            onClick: onConfirm,
            disabled: disabledControls.includes(EDITOR_CONTROLS.confirm),
          };
          break;
        case EDITOR_CONTROLS.undo:
          label = translate('editor.undo');
          icon = <ICONS.Undo />;
          tooltipText = osText('undo');
          props = {
            onClick: () => handleClick(EDITOR_CONTROLS.undo),
            disabled: disabledControls.includes(EDITOR_CONTROLS.undo),
          };
          break;
        case EDITOR_CONTROLS.redo:
          label = translate('editor.redo');
          icon = <ICONS.Redo />;
          tooltipText = osText('redo');
          props = {
            onClick: () => handleClick(EDITOR_CONTROLS.redo),
            disabled: disabledControls.includes(EDITOR_CONTROLS.redo),
          };
          break;
        case EDITOR_CONTROLS.merge:
          label = translate('editor.merge');
          icon = <ICONS.Merge />;
          tooltipText = osText('merge');
          props = {
            onClick: () => handleClick(EDITOR_CONTROLS.merge),
            disabled: disabledControls.includes(EDITOR_CONTROLS.merge),
          };
          break;
        case EDITOR_CONTROLS.split:
          label = translate('editor.split');
          icon = <ICONS.Split />;
          tooltipText = osText('split');
          props = {
            onClick: () => handleClick(EDITOR_CONTROLS.split),
            disabled: disabledControls.includes(EDITOR_CONTROLS.split),
          };
          break;
        case EDITOR_CONTROLS.toggleMore:
          label = translate('editor.toggleMore');
          icon = <ToggleIcon
            on={!!showEditorPopups}
            onIcon={<VisibilityIcon />}
            offIcon={<VisibilityOffIcon />}
          />;
          tooltipText = osText('toggleMore');
          selected = !!showEditorPopups;
          props = {
            onClick: () => handleClick(EDITOR_CONTROLS.toggleMore),
            disabled: disabledControls.includes(EDITOR_CONTROLS.toggleMore),
          };
          break;
        case EDITOR_CONTROLS.createWord:
          label = translate('editor.createWord');
          icon = <AddIcon />;
          props = {
            onClick: () => handleClick(EDITOR_CONTROLS.createWord),
            disabled: disabledControls.includes(EDITOR_CONTROLS.createWord),
          };
          break;
        case EDITOR_CONTROLS.editSegmentTime:
          label = translate('editor.editSegmentTime');
          icon = <SvgIcon><AiOutlineColumnWidth /></SvgIcon>;
          tooltipText = osText('editSegmentTime');
          props = {
            // onClick: () => onCommandClick(EDITOR_CONTROLS.editSegmentTime),
            disabled: disabledControls.includes(EDITOR_CONTROLS.editSegmentTime),
          };
          break;
        case EDITOR_CONTROLS.setThreshold:
          label = translate('editor.wordConfidence');
          icon = <MultilineChartIcon />;
          selected = !!anchorEl;
          props = {
            onClick: (event: React.MouseEvent<HTMLElement>) => {
              handleThresholdClick(event);
              handleClick(EDITOR_CONTROLS.setThreshold);
            },
            disabled: disabledControls.includes(EDITOR_CONTROLS.setThreshold),
          };
          break;
        case EDITOR_CONTROLS.debug:
          label = 'DEBUG';
          icon = <DeveloperModeIcon />;
          selected = !!editorDebugMode;
          props = {
            onClick: () => {
              setEditorDebugMode(!editorDebugMode);
              handleClick(EDITOR_CONTROLS.debug);
            },
            disabled: disabledControls.includes(EDITOR_CONTROLS.debug),
          };
          break;
      }
      if (loading || !editorReady) {
        props.disabled = true;
      }
      return renderButton(label, icon, tooltipText, props, selected);
    });
  };

  React.useEffect(() => {
    const statusTextEl = (
        <Typography className={classes.status}>
          {translate('forms.status')}
        </Typography>
    )
    if(loading) {
      const loadingEl = (<ScaleLoader
          color={theme.palette.common.white}
          loading={true}
      />);
      setStatusEl(loadingEl);
      setTimeout(() => {
        setStatusEl(statusTextEl);
      }, 1500);
    }
    if(!isSegmentUpdateError) {
      const successEl = (
          <div className={classes.status}>
            <CheckCircleOutlineIcon />
            <Typography className={classes.status}>
              {translate('common.saved')}
            </Typography>
          </div>
      );
      setStatusEl(successEl);
      setTimeout(() => {
        setStatusEl(statusTextEl);
      }, 1500);
    } else if (isSegmentUpdateError) {
      const errorEl = (
          <div className={classes.status}>
            <ErrorOutlineIcon />
            <Typography className={classes.status}>
              {translate('common.error')}
            </Typography>
          </div>
      );
      setStatusEl(errorEl);
      setTimeout(() => {
        setStatusEl(statusTextEl);
      }, 1500);
    }

  }, [loading, isSegmentUpdateError])


  // set on mount and reset values on unmount
  React.useEffect(() => {/**
    * handle shortcut key presses
    */
    const handleKeyPress = (event: KeyboardEvent) => {
      const keyName = isMacOs() ? 'metaKey' : 'ctrlKey';
      const { key, shiftKey } = event;
      switch (key) {
        case 'h':
          return;
        case 'x':
          if (shiftKey && event[keyName]) {
            event.preventDefault();
            onCommandClick(EDITOR_CONTROLS.speaker);
          }
          break;
        case 's':
          if (event[keyName]) {
            event.preventDefault();
            onCommandClick(EDITOR_CONTROLS.save);
          }
          break;
        case 'z':
          if (event[keyName] && !editorInFocus) {
            event.preventDefault();
            if (shiftKey) {
              onCommandClick(EDITOR_CONTROLS.redo);
            } else {
              onCommandClick(EDITOR_CONTROLS.undo);
            }
          }
          break;
        case 'Backspace':
          if (shiftKey && !editorInFocus) {
            event.preventDefault();
            onCommandClick(EDITOR_CONTROLS.merge);
          }
          break;
        case 'Enter':
          if (shiftKey && !editorInFocus) {
            event.preventDefault();
            onCommandClick(EDITOR_CONTROLS.split);
          }
          break;
        case 'Alt':
          event.preventDefault();
          if (shiftKey && !editorInFocus) {
            onCommandClick(EDITOR_CONTROLS.editSegmentTime);
          } else {
            onCommandClick(EDITOR_CONTROLS.toggleMore);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      setEditorDebugMode(false);
      setShowEditorPopups(false);
      editorInFocus = false;
    };
  }, []);

  return (
    <Grid
      container
      justify='space-between'
      direction="row"
      alignItems="center"
      className={classes.container}
    >
      <ButtonGroup
        variant="contained"
        aria-label="primary editor buttons"
        className={classes.buttonGroup}
      >
        {renderButtons(primaryControlOrder)}
      </ButtonGroup>
      {/*{loading && <ScaleLoader
        color={theme.palette.common.white}
        loading={true}
      />}*/}
      {statusEl}
      <ButtonGroup
        variant="contained"
        aria-label="secondary editor buttons"
        className={classes.buttonGroup}
      >
        {renderButtons(secondaryControlOrder)}
      </ButtonGroup>
      <ClickAwayListener onClickAway={handleClickAway} >
        <Popper open={open} anchorEl={anchorEl} transition className={classes.popper} >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} >
              <ConfidenceSlider
                isOpen={open}
                setSliderOpen={setSliderOpen}
              />
            </Fade>
          )}
        </Popper>
      </ClickAwayListener>
    </Grid>
  );
};