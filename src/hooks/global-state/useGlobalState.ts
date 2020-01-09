import { useState } from 'react';
import { Organization } from '../../types';

export interface GlobalState {
  organization?: Organization;
}

/**
 * Holds the global state that is used throughout the site
 */
export function useGlobalState() {
  const [state, setState] = useState<GlobalState>({});

  /**
   * updates the current state values with new new state
   * - does NOT erase previous non-updated values
   */
  function setGlobalState(newState: GlobalState) {
    const updatedState = { ...state, ...newState };
    setState(updatedState);
  }

  /**
   * Deletes values based on their keys
   * @param keys the state keys to delete
   */
  function deleteStateValues(keys: string[]) {
    const newState = { ...state };
    keys.forEach(key => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      //@ts-ignore
      delete newState[key];
    });
    setState(newState);
  }

  return { globalState: state, setGlobalState, deleteStateValues };
}
