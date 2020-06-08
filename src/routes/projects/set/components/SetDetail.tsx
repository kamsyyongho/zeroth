import { Button, Typography } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import React from 'reactn';
import { I18nContext } from '../../../../hooks/i18n/I18nContext';
import { CustomTheme } from '../../../../theme';
import { CONTENT_STATUS, VoiceData, VoiceDataResults, DataSet, SubSetCountResults } from '../../../../types';
import { SUB_SET_TYPES } from '../../../../constants'
import { ApiContext } from '../../../../hooks/api/ApiContext';


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
    // row: VoiceData;
    projectId: string;
    displaySubSetInTDP: (subSet: VoiceDataResults) => void;
    dataSetId: string;
}

export function SetDetail(props: SetDetailProps) {
    const classes = useStyles();
    const { translate, formatDate } = React.useContext(I18nContext);
    const api = React.useContext(ApiContext);
    const [testSet, setTestSet] = React.useState<VoiceDataResults>({} as VoiceDataResults);
    const [validationSet, setValidationSet] = React.useState<VoiceDataResults>({} as VoiceDataResults);
    const [trainingSet, setTrainingSet] = React.useState<VoiceDataResults>({} as VoiceDataResults);
    const [subSetCount, setSubSetCount] = React.useState<SubSetCountResults>({} as SubSetCountResults);

    const {
        // row,
        projectId,
        setDetailLoading,
        displaySubSetInTDP,
        dataSetId,
    } = props;

    const handleSubSetClick = (subSetType: string) => {
        switch (subSetType) {
            case SUB_SET_TYPES.test:
                displaySubSetInTDP(testSet);
                break;
            case SUB_SET_TYPES.validation:
                displaySubSetInTDP(validationSet);
                break;
            case SUB_SET_TYPES.training:
                displaySubSetInTDP(trainingSet);
                break;
            default:
                return;
        }
    };


    const getTestSet = async () => {
        if (api ?.dataSet) {
            const response = await api.dataSet ?.getSubSet(projectId, dataSetId, SUB_SET_TYPES.test);
            if (response.kind === "ok") {
                setTestSet(response.subSets);
                return true;
            }
        }
    };

    const getValidationSet = async () => {
        if (api ?.dataSet) {
            const response = await api.dataSet ?.getSubSet(projectId, dataSetId, SUB_SET_TYPES.validation);
            if (response.kind === "ok") {
                setValidationSet(response.subSets);
                return true;
            }
        }

    };

    const getTrainSet = async () => {
        if (api ?.dataSet) {
            const response = await api.dataSet ?.getSubSet(projectId, dataSetId, SUB_SET_TYPES.training);
            if (response.kind === "ok") {
                setTrainingSet(response.subSets);
                return true;
            }
        }
    };

    const getSubSetCount = async () => {
        if (api ?.dataSet) {
            const response = await api.dataSet ?.getSubSetCount(projectId, dataSetId);
            if (response.kind === "ok") {
                setSubSetCount(response.count);
            }
        }
    };


    React.useEffect(() => {
        getSubSetCount();
        return () => {
            setSubSetCount({} as SubSetCountResults);
        }
    }, []);

    return (<TableRow
        className={classes.row}
    >
        <TableCell
            colSpan={7}
            className={classes.cell}
        >
            <Grid container spacing={3}>
                <Grid
                    container
                    item
                    xs={12}
                    wrap='nowrap'
                    direction='row'
                    alignContent='space-around'
                    alignItems='flex-start'
                    justify='center'
                >
                    <Grid
                        container
                        item
                        xs={4}
                        direction='row'
                        justify='center'
                        alignContent='space-between'
                        spacing={2}>
                        <Grid item>
                            <Button
                                color='primary'
                                variant='outlined'
                                onClick={() => handleSubSetClick(SUB_SET_TYPES.test)}
                            >
                                {'Test'}
                            </Button>
                        </Grid>
                        <Grid item>
                            <Typography>{`Record Count : ${subSetCount.testCount}`}</Typography>
                        </Grid>
                    </Grid>
                    <Grid
                        container
                        item
                        xs={4}
                        direction='row'
                        justify='center'
                        alignContent='space-between'
                        spacing={2}>
                        <Grid item>
                            <Button
                                color='primary'
                                variant='outlined'
                                onClick={() => handleSubSetClick(SUB_SET_TYPES.validation)}
                            >
                                {'Validation'}
                            </Button>
                        </Grid>
                        <Grid item>
                            <Typography>{`Record Count : ${subSetCount.validationCount}`}</Typography>
                        </Grid>
                    </Grid>
                    <Grid
                        container
                        item
                        xs={4}
                        direction='row'
                        justify='center'
                        alignContent='space-between'
                        spacing={2}>
                        <Grid item>
                            <Button
                                color='primary'
                                variant='outlined'
                                onClick={() => handleSubSetClick(SUB_SET_TYPES.training)}
                            >
                                {'Train'}
                            </Button>
                        </Grid>
                        <Grid item>
                            <Typography>{`Record Count : ${subSetCount.trainCount}`}</Typography>
                        </Grid>
                    </Grid>
                </Grid>

            </Grid>
        </TableCell>
    </TableRow>);
}