import { SnackBarType } from "../../utils/enumerates";
import { Constants } from "./constants";
import { ISnackBarState } from "./types";
import { SnackBarActions } from './types';

const initialState: ISnackBarState = {
    showSnackBar: false,
    msg: "",
    duration: 0,
    type: SnackBarType.Info,
}

export function snackBarReducer(
    state: ISnackBarState = initialState,
    action: SnackBarActions
): ISnackBarState {
    switch (action.type) {
        case Constants.SHOW_SNACK_BAR:
            return {
                showSnackBar: true,
                msg: action.payload.msg,
                duration: action.payload.duration,
                type: action.payload.type,
            };
        case Constants.HIDE_SNACK_BAR:
            return initialState;
        default:
            return state;
    }
}