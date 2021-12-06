import { action } from 'typesafe-actions';
import { SnackBarType } from '../../utils/enumerates';
import { Constants } from './constants';

export function showSnackBar(pMsg: string, pDuration: number, pType: SnackBarType) {
    return action(Constants.SHOW_SNACK_BAR, {
        msg: pMsg,
        duration: pDuration,
        type: pType
    });
}
export function hideSnackBar() {
    return action(Constants.HIDE_SNACK_BAR);
}