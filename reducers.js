import { combineReducers } from 'redux';
import modelsReducer from "./containers/reducer";

const appReducer = combineReducers({
  modelsReducer,
});

const rootReducers = (state, action) => {
  return appReducer(state, action);
}

export default rootReducers;
