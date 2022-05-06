import { fromJS } from "immutable";

import {
  SET_SEARCH_TEXT,
  SET_ACTIVE_MODEL,
  SET_FRAMEWORK_STATE,
  SET_DOMAIN_STATE,
  SET_SELECTED_TAGS,
} from "./actions";

const initialState = fromJS({
  searchText: '',
  activeModel: null,
  domains:[],
  frameworks:[],
  frameworkState: {},
  domainState: {},
  selectedTags: [],
});

function modelsReducer(state = initialState, action) {
  
  switch (action.type) {
    case SET_SEARCH_TEXT:
      return state.set("searchText", action.searchText);
    case SET_ACTIVE_MODEL:
      return state.set("activeModel", action.model);
    case SET_FRAMEWORK_STATE:
      return state.set("frameworkState", action.payload);
    case SET_DOMAIN_STATE:
      return state.set("domainState", action.payload);
    case SET_SELECTED_TAGS:
      return state.set("selectedTags", action.payload);
    default:
      return state;
  }
}

export default modelsReducer;
