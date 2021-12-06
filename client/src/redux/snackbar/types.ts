import { ActionType } from 'typesafe-actions';
import { SnackBarType } from '../../utils/enumerates';
import * as actions from './actions';

export type SnackBarActions = ActionType<typeof actions>;

export interface ISnackBarState {
    showSnackBar: boolean;
    msg: string;
    duration: number;
    type: SnackBarType;
}