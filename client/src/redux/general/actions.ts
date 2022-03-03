import {action} from 'typesafe-actions';
import {Constants} from './constants';

export function showTopLoading() {
	return action(Constants.SHOW_TOP_LOADING);
}

export function hideTopLoading() {
	return action(Constants.HIDE_TOP_LOADING);
}

export function redirectToNewRoute(newLocation: any) {
	return action(Constants.REDIRECT_TO_NEW_ROUTE, newLocation);
}