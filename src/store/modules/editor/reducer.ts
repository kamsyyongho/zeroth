import {
    Segment,
    SegmentResults,
    SegmentAndWordIndex,
    EditorStore,
    RevertData,
    EDIT_TYPE,
} from '../../../types';

const initialState: EditorStore = {
    segments: [],
    PlayingTimeData: {},
    playingLocation: {segmentIndex: 0, wordIndex: 0},
    undoStack: [] as RevertData[],
    redoStack: [] as RevertData[],
    revertData: {} as RevertData,
    unsavedSegmentIds: [],
};

export function EditorReducer( state = initialState, action: any) {
    const copyState = JSON.parse(JSON.stringify(state));
    switch (action.type) {
        case 'SET_SEGMENTS' :
            return {...state, segments: action.payload};
        case 'SET_PLAYING_LOCATION' :
            return {playingLocation: state.playingLocation, ...action.payload};
        case 'SET_UNDO' :
            const { segmentIndex, wordIndex, offset, editType, word } = action.payload;
            const updateSegment = {} as Segment;
            Object.assign(updateSegment, copyState.segments[segmentIndex]);
            if(editType === EDIT_TYPE.text) updateSegment.wordAlignments[wordIndex].word = word;

            const undoData: RevertData = {
                updatedSegment: updateSegment,
                editType: editType,
                textLocation: {segmentIndex, wordIndex, offset},
            };
            const undoStack = [...state.undoStack, undoData];
            return {
                ...state,
                undoStack,
            }
            // return Object.assign({}, state, {undoStack: undoStck});
        case 'ACTIVATE_UNDO' :
            const updateUndoStack = state.undoStack.slice(0);
            const lastUndoItem = updateUndoStack.pop();
            if(lastUndoItem) {
                const unsavedUndoSegmentId = !state.unsavedSegmentIds.includes(lastUndoItem.updatedSegment.id)
                    ? [...state.unsavedSegmentIds, lastUndoItem.updatedSegment.id] : state.unsavedSegmentIds;
                return {
                    ...state,
                    revertData: lastUndoItem,
                    undoStack: updateUndoStack,
                    redoStack: [...state.redoStack, lastUndoItem],
                    unsavedSegmentIds: unsavedUndoSegmentId,
                };
                // return Object.assign({}, state, {
                //     revertData: lastUndoItem,
                //     undoStack: updateUndoStack,
                //     redoStack: [...state.redoStack, lastUndoItem],
                //     unsavedSegmentIds: unsavedUndoSegmentId });
            }
            break;
        case 'ACTIVATE_REDO' :
            const updateRedoStack = state.redoStack.slice(0);
            const lastRedoItem = updateRedoStack.pop();
            if(lastRedoItem) {
                const unsavedRedoSegmentId = !state.unsavedSegmentIds.includes(lastRedoItem.updatedSegment.id)
                    ? [...state.unsavedSegmentIds, lastRedoItem.updatedSegment.id] : state.unsavedSegmentIds;
                return {
                    ...state,
                    revertData: lastRedoItem,
                    undoStack: [...state.undoStack, lastRedoItem],
                    redoStack: updateRedoStack,
                    unsavedSegmentIds: unsavedRedoSegmentId,
                };
                // return Object.assign({}, state, {
                //     revertData: lastRedoItem,
                //     undoStack: [...state.undoStack, lastRedoItem],
                //     redoStack: updateRedoStack,
                //     unsavedSegmentIds: unsavedRedoSegmentId,
                // });
            };
            break;
        case 'INIT_REVERT_DATA' :
            return{...state, revertData: null};
        case 'INIT_UNSAVED_SEGMENT_IDS' :
            return {...state, unsavedSegmentIds: []};
        case 'UPDATE_SEGMENT_WORD' :
            const updatedSegments = state.segments.slice();
            updatedSegments[action.payload.segmentIndex]['wordAlignments'][action.payload.wordIndex]['word'] = action.payload.word;
            return { ...state, segments: updatedSegments };
        default:
            return state;
    }
}
