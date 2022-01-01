import {ActionType} from 'typesafe-actions';
import * as actions from './actions';

export type GeneralActions = ActionType<typeof actions>;

export interface IGeneralState {
	showTopLoading: boolean;
}