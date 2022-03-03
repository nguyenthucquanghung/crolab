import createHistory from 'history/createBrowserHistory';
import store from './redux';
import { redirectToNewRoute } from './redux/general/actions';

const history = createHistory();

history.listen((location) => {

    store.dispatch(redirectToNewRoute(location));
})

export default history;