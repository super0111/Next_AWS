import { createSelector } from "reselect";

const modelsSectionDomain = (state) => state.modelsReducer;

const modelsSectionState = () => createSelector(modelsSectionDomain, (substate) => (substate ? substate.toJS() : {}));

const makeSelectSearchText = () => createSelector(modelsSectionState(), (substate) => substate.searchText);
const makeSelectActiveModel = () => createSelector(modelsSectionState(), (substate) => substate.activeModel);
const makeSelectFrameworkState = () => createSelector(modelsSectionState(), (substate) => substate.frameworkState);
const makeSelectDomainState = () => createSelector(modelsSectionState(), (substate) => substate.domainState);
const makeSelectSelectedTags = () => createSelector(modelsSectionState(), (substate) => substate.selectedTags);

export default modelsSectionDomain;
export {
  modelsSectionState,
  makeSelectActiveModel,
  makeSelectSearchText,
  makeSelectFrameworkState,
  makeSelectDomainState,
  makeSelectSelectedTags,
};
