import {combineReducers, createStore} from 'redux';
import {generalReducer} from './general/reducer';
import {IGeneralState} from './general/types';
import {snackBarReducer} from './snackbar/reducer';
import {ISnackBarState} from './snackbar/types';

export interface IRootState {
	general: IGeneralState;
	snackBar: ISnackBarState;
}

const store = createStore<IRootState, any, any, any>(
	combineReducers({
		general: generalReducer,
		snackBar: snackBarReducer
	})
);

export default store;