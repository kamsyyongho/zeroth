import { Segment } from '../../../types';
import log from '../../../util/log/logger';
import { EDITOR_CONTROLS } from '../components/EditorControls';
import {isMacOs} from '../../../util/misc';
import {META_KEYS} from '../../../constants'

export const setSelectionRange = (playingBlock: HTMLElement) => {
  const selection = window.getSelection();
  const range = document.createRange();

  if(playingBlock) {
    range.selectNodeContents(playingBlock);
    range.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(range);
  }
};

/** gets the time in segments of a word alignment item */
export const calculateWordTime = (
  segments: Segment[],
  segmentIndex: number,
  wordIndex: number,
) => {
  try {
    const segment = segments[segmentIndex];
    const word = segment.wordAlignments[wordIndex];
    const segmentTime = segment.start;
    const wordTime = word.start;
    let totalTime = segmentTime + wordTime;
    // set to 2 sig figs
    totalTime = Number(totalTime.toFixed(2));
    return totalTime;
  } catch (error) {
    return 0;
  }
};

export const getDisabledControls = (
  segments: Segment[],
  canUndo?: boolean,
  canRedo?: boolean,
  saveSegmentsLoading?: boolean,
  confirmSegmentsLoading?: boolean,
) => {
  if(segments?.length) {
    const disabledControls: EDITOR_CONTROLS[] = [];
    const mergeDisabled = segments.length < 2;
    if (!canUndo) {
      disabledControls.push(EDITOR_CONTROLS.undo);
    }
    if (!canRedo) {
      disabledControls.push(EDITOR_CONTROLS.redo);
    }
    if (mergeDisabled) {
      disabledControls.push(EDITOR_CONTROLS.merge);
    }
    const splitDisabled = !segments.some(
        segment => segment.wordAlignments.length > 0,
    );
    if (splitDisabled) {
      disabledControls.push(EDITOR_CONTROLS.split);
    }
    if (saveSegmentsLoading || confirmSegmentsLoading) {
      disabledControls.push(EDITOR_CONTROLS.save);
      disabledControls.push(EDITOR_CONTROLS.approvalRequest);
    }
    return disabledControls;
  }
};
const enabledMacShortcuts = {
  copy: [META_KEYS.META, "c"],
  paste: [META_KEYS.META, "v"],
  selectArrowRight: [META_KEYS.SHIFT, "ArrowRight"],
  selectArrowLeft: [META_KEYS.SHIFT, "ArrowLeft"],
};
const enabledWinShortcuts = {
  copy: [META_KEYS.CONTROL, "c"],
  paste: [META_KEYS.CONTROL, "v"],
  selectArrowRight: [META_KEYS.SHIFT, "ArrowRight"],
  selectArrowLeft: [META_KEYS.SHIFT, "ArrowLeft"],
};

export const getNativeShortcuts = () => {
  const checkMacOs = isMacOs();
  if(checkMacOs) {
    return enabledMacShortcuts;
  } else {
    return enabledWinShortcuts;
  }
};

export const checkNativeShortcuts = (inputKeys: string[]) => {
  const nativeCodeToCheck = Object.values(getNativeShortcuts());
  let isNativeShortcut = false;
  nativeCodeToCheck.forEach(shortcut => {
    let matchCount = 0;
    for(let i = 0; i < inputKeys.length; i++) {
      if(shortcut.includes(inputKeys[i])) {
        matchCount += 1;
      }
    }

    if (matchCount === shortcut.length && matchCount === inputKeys.length) {
      isNativeShortcut = true;
    }
  });

  return isNativeShortcut;
};

// alt and english ???????????????????????????????????????????????????????????
export const convertNonEnglishKeyToEnglish = (keycode: string) => {
  switch(keycode) {
    case '???':
    case '??':
      return 'q';
    case '???':
    case '???':
      return 'w';
    case '???':
    case '??':
      return 'e';
    case '???':
    case '??':
      return 'r';
    case '???':
    case '???':
      return 't';
    case '???':
    case '??':
      return 'y';
    case '???':
    case '??':
      return 'u';
    case '???':
    case '??':
      return 'i';
    case '???':
    case '??':
      return 'o';
    case '???':
    case '??':
      return 'p';
    case '???':
    case '??':
      return 'a';
    case '???':
    case '??':
      return 's';
    case '???':
    case '???':
      return 'd';
    case '???':
    case '??':
      return 'f';
    case '???':
    case '??':
      return 'g';
    case '???':
    case '??':
      return 'h';
    case '???':
    case '???':
      return 'j';
    case '???':
    case '??':
      return 'k';
    case '???':
    case '??':
      return 'l';
    case '???':
    case '??':
      return 'z';
    case '???':
    case '???':
      return 'x';
    case '???':
    case '??':
      return 'c';
    case '???':
    case '???':
      return 'v';
    case '???':
    case '???':
      return 'b';
    case '???':
    case '??':
      return 'n';
    case '???':
    case '??':
      return 'm';
    default:
      return keycode;
  }
};

export const getSegmentAndWordIndex = () => {
  const selectedBlock: any = window.getSelection();
  const selectedBlockNode: any = selectedBlock.anchorNode || selectedBlock.focusNode;
  const selectedBlockId: string = selectedBlockNode?.id || selectedBlockNode?.parentNode?.id;
  if(!selectedBlockNode || !selectedBlockId) return { segmentIndex: 0, wordIndex: 0 };

  const segmentAndWordIndex = selectedBlockId.split('-');
  segmentAndWordIndex.shift();

  return { segmentIndex: Number(segmentAndWordIndex[0]), wordIndex: Number(segmentAndWordIndex[1]) };
};

const inputKeys = [
  "Digit1",
  "Digit2",
  "Digit3",
  "Digit4",
  "Digit5",
  "Digit6",
  "Digit7",
  "Digit8",
  "Digit9",
  "Digit0",
  "KeyA",
  "KeyB",
  "KeyC",
  "KeyD",
  "KeyE",
  "KeyF",
  "KeyG",
  "KeyH",
  "KeyI",
  "KeyJ",
  "KeyK",
  "KeyL",
  "KeyM",
  "KeyN",
  "KeyO",
  "KeyP",
  "KeyQ",
  "KeyR",
  "KeyS",
  "KeyT",
  "KeyU",
  "KeyV",
  "KeyW",
  "KeyX",
  "KeyY",
  "KeyZ",
  "Comma",
  "Period",
  "Quote",
  "SemiColon",
  "Space",
  "Backspace",
];

export const isInputKey = (keyEvent: KeyboardEvent) => {
  const keyCode = keyEvent.code;
  if(keyEvent.ctrlKey || keyEvent.shiftKey || keyEvent.altKey) return false;
  if(inputKeys.includes(keyCode)) return true;
  return false;
}

