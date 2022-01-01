import {Constants} from "./constants";
import {IGeneralState} from "./types";
import {GeneralActions} from './types';

const initialState: IGeneralState = {
	showTopLoading: false,
}

export function generalReducer(
	state: IGeneralState = initialState,
	action: GeneralActions
): IGeneralState {
	switch (action.type) {
		case Constants.SHOW_TOP_LOADING:
			return {...state, showTopLoading: true};
		case Constants.HIDE_TOP_LOADING:
			return {...state, showTopLoading: false};
		default:
			return state;
	}
}