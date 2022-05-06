export const SET_SEARCH_TEXT = 'SET_SEARCH_TEXT';
export const SET_ACTIVE_MODEL = 'SET_ACTIVE_MODEL';
export const FETCH_FRAMEWORKS = 'FETCH_FRAMEWORKS';
export const FETCH_DOMAINS = 'FETCH_DOMAINS';
export const SET_FRAMEWORK_STATE = 'SET_FRAMEWORK_STATE';
export const SET_DOMAIN_STATE = 'SET_DOMAIN_STATE';
export const SET_SELECTED_TAGS = 'SET_SELECTED_TAGS';

export function setSearchText(searchText) {
  return {
    type: SET_SEARCH_TEXT,
    searchText,
  };
}


export function setActiveModel(model) {
  return {
    type: SET_ACTIVE_MODEL,
    model,
  };
}

export function setFrameworkState(state) {
  return {
    type: SET_FRAMEWORK_STATE,
    payload: state,
  };
}

export function setDomainState(state) {
  return {
    type: SET_DOMAIN_STATE,
    payload: state,
  };
}

export function setSelectedTags(tags) {
  return {
    type: SET_SELECTED_TAGS,
    payload: tags,
  };
}

