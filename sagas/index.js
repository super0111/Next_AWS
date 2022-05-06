import { all, spawn, call } from "redux-saga/effects";
import modelsSaga from "./modelsSaga";

const sagas = [
    modelsSaga,
];


export default function* rootSaga() {
  yield all(sagas.map(saga =>
    spawn(function* () {
      while (true) {
        try {
          yield call(saga);
          break;
        } catch (error) {
          console.warn(error);
        }
      }
    }),
  ));
}
