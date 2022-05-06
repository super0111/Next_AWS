import {
    take,
    call,
    put,
    all,
    takeEvery,
    debounce,
    throttle,
    delay,
    select,
} from 'redux-saga/effects';

import {
    FETCH_FRAMEWORKS,
    FETCH_DOMAINS
} from '../containers/actions';
export function* watchForFetchDomains() {
    yield takeEvery(FETCH_DOMAINS, handleFetchDomains);
}
function* handleFetchDomains() {
    try {
    } catch (error) {
        console.warn("Error occurred in the handleFetchDomains saga", error);
    }
}
export default function* modelsSaga() {
    yield all([
        // watchForFetchDomains(),
    ]);
}

