import { Button, Typography } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import BorderColorIcon from '@material-ui/icons/BorderColor';
import React from 'reactn';
import { I18nContext } from '../../../../hooks/i18n/I18nContext';
import { CustomTheme } from '../../../../theme';
import { CONTENT_STATUS, VoiceData } from '../../../../types';


const useStyles = makeStyles((theme: CustomTheme) =>
    createStyles({
        card: {
        },
        cardContent: {
            padding: 0,
        },
        cardHeader: {
            padding: 0,
        },
        row: {
            borderWidth: 0,
            borderRightWidth: 2,
            borderLeftWidth: 5,
            borderColor: theme.table.border,
            border: 'solid',
            borderCollapse: undefined,
            width: '30%',
        },
        cell: {
            backgroundColor: theme.palette.background.default,
            borderColor: theme.table.border,
            borderRightWidth: 2,
            margin: '5%',
        },
        category: {
            marginRight: theme.spacing(1),
        },
        memo: {
            paddingTop: '0 !important',
        },
        italic: {
            fontStyle: 'italic',
        },
    }),
);

interface SetDetailProps {
    setDetailLoading: boolean;
    row: VoiceData;
    // detailsRowColSpan: number;
    projectId: string;
    // onDelete: (voiceDataId: string, dataIndex: number) => void;
    // onSuccess: (updatedVoiceData: VoiceData, dataIndex: number) => void;
}

export function SetDetail(props: SetDetailProps) {
    const classes = useStyles();
    const { translate, formatDate } = React.useContext(I18nContext);
    const {
        row,
        // detailsRowColSpan,
        projectId,
        // onDelete,
        // onSuccess,
        setDetailLoading,
    } = props;
    const {
        startAt,
        endAt,
        fetchedAt,
        confirmedAt,
        originalFilename,
        sessionId,
        ip,
        webSocketCloseReason,
        webSocketCloseStatus,
        transcriber,
        transferredBytes,
    } = row;

    const startDate = new Date(startAt);
    const endDate = new Date(endAt);
    const fetchedDate = fetchedAt ? new Date(fetchedAt) : null;
    const confirmedDate = confirmedAt ? new Date(confirmedAt) : null;

    const handleEvaluateClick = () => {};

    return (<TableRow
        className={classes.row}
    >
        <TableCell
            colSpan={6}
            className={classes.cell}
        >
            <Grid container spacing={3}>
                <Grid
                    container
                    item
                    xs={7}
                    wrap='nowrap'
                    direction='column'
                    alignContent='center'
                    alignItems='flex-start'
                    justify='flex-start'
                >
                    <Grid
                        container
                        item
                        wrap='nowrap'
                        direction='row'
                        alignContent='center'
                        alignItems='center'
                        justify='flex-start'
                    >
                        <Typography
                            className={classes.category}
                            variant='subtitle2'
                        >
                            {`${translate('common.startAt')}:`}
                        </Typography>
                        <Typography>{formatDate(startDate)}</Typography>
                    </Grid>
                    <Grid
                        container
                        item
                        wrap='nowrap'
                        direction='row'
                        alignContent='center'
                        alignItems='center'
                        justify='flex-start'
                    >
                        <Typography
                            className={classes.category}
                            variant='subtitle2'
                        >
                            {`${translate('common.endAt')}:`}
                        </Typography>
                        <Typography>{formatDate(endDate)}</Typography>
                    </Grid>
                    <Grid
                        container
                        item
                        wrap='nowrap'
                        direction='row'
                        alignContent='center'
                        alignItems='center'
                        justify='flex-start'
                    >
                        <Typography
                            className={classes.category}
                            variant='subtitle2'
                        >
                            {`${translate('TDP.sessionId')}:`}
                        </Typography>
                        <Typography>{sessionId}</Typography>
                    </Grid>
                    <Grid
                        container
                        item
                        wrap='nowrap'
                        direction='row'
                        alignContent='center'
                        alignItems='center'
                        justify='flex-start'
                    >
                        <Typography
                            className={classes.category}
                            variant='subtitle2'
                        >
                            {`${translate('TDP.ip')}:`}
                        </Typography>
                        <Typography>{ip}</Typography>
                    </Grid>
                    <Grid
                        container
                        item
                        wrap='nowrap'
                        direction='row'
                        alignContent='center'
                        alignItems='center'
                        justify='flex-start'
                    >
                        <Typography
                            className={classes.category}
                            variant='subtitle2'
                        >
                            {`${translate('common.fetchedAt')}:`}
                        </Typography>
                        <Typography>{fetchedDate ? formatDate(fetchedDate) : ''}</Typography>
                    </Grid>
                    <Grid
                        container
                        item
                        wrap='nowrap'
                        direction='row'
                        alignContent='center'
                        alignItems='center'
                        justify='flex-start'
                    >
                        <Typography
                            className={classes.category}
                            variant='subtitle2'
                        >
                            {`${translate('common.confirmedAt')}:`}
                        </Typography>
                        <Typography>{confirmedDate ? formatDate(confirmedDate) : ''}</Typography>
                    </Grid>
                </Grid>
                <Grid
                    container
                    item
                    xs={5}
                    wrap='nowrap'
                    direction='column'
                    alignContent='center'
                    alignItems='flex-start'
                    justify='flex-start'
                >
                    <Grid
                        container
                        item
                        wrap='nowrap'
                        direction='row'
                        alignContent='center'
                        alignItems='center'
                        justify='flex-start'
                    >
                        <Typography
                            className={classes.category}
                            variant='subtitle2'
                        >
                            {`${translate('TDP.websocketCloseStatus')}:`}
                        </Typography>
                        <Typography>{webSocketCloseStatus}</Typography>
                    </Grid>
                    <Grid
                        container
                        item
                        wrap='nowrap'
                        direction='row'
                        alignContent='center'
                        alignItems='center'
                        justify='flex-start'
                    >
                        <Typography
                            className={classes.category}
                            variant='subtitle2'
                        >
                            {`${translate('TDP.websocketCloseReason')}:`}
                        </Typography>
                        <Typography>{webSocketCloseReason}</Typography>
                    </Grid>
                    <Grid
                        container
                        item
                        wrap='nowrap'
                        direction='row'
                        alignContent='center'
                        alignItems='center'
                        justify='flex-start'
                    >
                        <Typography
                            className={classes.category}
                            variant='subtitle2'
                        >
                            {`${translate('TDP.transferredBytes')}:`}
                        </Typography>
                        <Typography>{transferredBytes}</Typography>
                    </Grid>
                    <Grid
                        container
                        item
                        wrap='nowrap'
                        direction='row'
                        alignContent='center'
                        alignItems='center'
                        justify='flex-start'
                    >
                        <Typography
                            className={classes.category}
                            variant='subtitle2'
                        >
                            {`${translate('TDP.originalFilename')}:`}
                        </Typography>
                        <Typography>{originalFilename}</Typography>
                    </Grid>
                    <Grid
                        container
                        item
                        wrap='nowrap'
                        direction='row'
                        alignContent='center'
                        alignItems='center'
                        justify='flex-start'
                    >
                        <Typography
                            className={classes.category}
                            variant='subtitle2'
                        >
                            {`${translate('forms.transcriber')}:`}
                        </Typography>
                        <Typography className={!transcriber ? classes.italic : undefined}>{transcriber || translate('forms.none')}</Typography>
                    </Grid>
                    <Grid
                        container
                        item
                        wrap='nowrap'
                        direction='row'
                        alignContent='center'
                        alignItems='center'
                        justify='flex-start'
                    >
                        <Button
                            color='secondary'
                            variant='contained'
                            size='small'
                            onClick={handleEvaluateClick}
                            startIcon={<BorderColorIcon />}
                        >
                            {translate('SET.requestEvaluation')}
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
        </TableCell>
    </TableRow>);
}