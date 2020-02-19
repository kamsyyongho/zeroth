import { Badge, Button, Grid, Tooltip, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import SvgIcon from '@material-ui/core/SvgIcon';
import clsx from 'clsx';
import { ContentBlock } from 'draft-js';
import { MdPersonAdd, MdPersonPin } from 'react-icons/md';
import VisibilitySensor from "react-visibility-sensor";
import React, { useGlobal } from 'reactn';
import { I18nContext } from '../../../hooks/i18n/I18nContext';
import { CustomTheme } from '../../../theme/index';
import { DEFAULT_OFFSET, Segment, SegmentBlockData } from '../../../types';
import { formatSecondsDuration } from '../../../util/misc';
import { SegmentBlockSubProps } from './SegmentBlock';

const useStyles = makeStyles((theme: CustomTheme) =>
  createStyles({
    root: {
      margin: theme.spacing(1),
    },
    hiddenIcon: {
      color: theme.palette.background.paper,
    },
    button: {
      marginLeft: theme.spacing(2),
      textTransform: 'none',
    },
    outlineHidden: {
      borderColor: `${theme.palette.background.paper} !important`,
    },
    infoGrid: {
      marginBottom: theme.spacing(1),
      "&:hover": {
        cursor: 'default',
      }
    },
    block: {
      marginLeft: theme.spacing(1),
    },
    tooltipContent: {
      maxWidth: 'none',
    },
    changedTextBadge: {
      backgroundColor: theme.editor.changes,
    },
    highRistkBadge: {
      marginLeft: theme.spacing(1),
    },
    timeButton: {
      padding: 0,
      margin: 0,
    },
  }),
);


interface SegmentBlockHeadProps extends SegmentBlockSubProps {
  block: ContentBlock,
  showEditorPopups?: boolean,
  isPlayingBlock?: boolean,
}


const SegmentBlockHead = (props: SegmentBlockHeadProps) => {
  const classes = useStyles();
  const { translate } = React.useContext(I18nContext);
  const [showEditorPopups, setShowEditorPopups] = useGlobal('showEditorPopups');
  const { readOnly, assignSpeakerForSegment, block } = props;
  const rawBlockData = block.getData();
  const blockData: SegmentBlockData = rawBlockData.toJS();
  const segment = blockData.segment || {} as Segment;
  const { id, transcript, decoderTranscript, start, speaker, highRisk } = segment;
  const displayTextChangedHover = (!readOnly && (transcript?.trim() !== decoderTranscript?.trim()) && !!decoderTranscript?.trim());
  const displayTime = typeof start === 'number' ? formatSecondsDuration(start) : `${translate('editor.calculating')}..`;
  const handleSpeakerPress = () => {
    if (id && assignSpeakerForSegment && typeof assignSpeakerForSegment === 'function') {
      assignSpeakerForSegment(id);
    }
  };
  const iconHidden = !speaker && !showEditorPopups;
  const icon = <SvgIcon className={iconHidden ? classes.hiddenIcon : undefined} fontSize='small' component={speaker ? MdPersonPin : MdPersonAdd} />;
  const speakerButton = (<Button
    size='small'
    startIcon={icon}
    onClick={handleSpeakerPress}
    color={showEditorPopups ? 'primary' : undefined}
    variant={'outlined'}
    disabled={!showEditorPopups}
    className={clsx(classes.button, !showEditorPopups && classes.outlineHidden)}
  >
    {speaker ? (<span
      contentEditable={false} // prevents the editor from placing the cursor within the content
    >
      {speaker}
    </span>)
      : ('')}
  </Button>);

  return (
    <Grid
      container
      wrap='nowrap'
      direction='row'
      alignContent='center'
      alignItems='center'
      justify='flex-start'
      className={classes.infoGrid}
    >
      <Button
        disabled
        className={classes.timeButton}
      >
        <Badge
          invisible={!displayTextChangedHover}
          variant="dot"
          color='error'
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          classes={{
            colorError: classes.changedTextBadge,
          }}
        >
          <Badge
            invisible={!highRisk}
            variant="dot"
            color='error'
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            classes={{
              colorError: classes.highRistkBadge,
            }}
          >
            <Typography
              contentEditable={false} // prevents the editor from placing the cursor within the content
            >
              {displayTime}
            </Typography>
          </Badge>
        </Badge>
      </Button>
      <VisibilitySensor
        offset={DEFAULT_OFFSET}
        scrollCheck
      >
        {({ isVisible }) => {
          let isOpen = false;
          let title: React.ReactNode = '';
          if (isVisible) {
            isOpen = !!showEditorPopups;
            if (displayTextChangedHover) {
              title = <Typography contentEditable={false} variant='body1' >{decoderTranscript}</Typography>;
            }
          }
          return (<>
            <Tooltip
              placement='right-start'
              title={title}
              open={isOpen}
              arrow={false}
              classes={{ tooltip: classes.tooltipContent }}
            >
              {speakerButton}
            </Tooltip>
          </>);
        }
        }
      </VisibilitySensor>
    </Grid>
  );
};

export const MemoizedSegmentBlockHead = React.memo(SegmentBlockHead);