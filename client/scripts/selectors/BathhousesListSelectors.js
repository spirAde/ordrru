import { createSelector } from 'reselect';

const modeSelector = state => state.routing.locationBeforeTransitions.query.mode;
const activeCityIdSelector = state => state.city.get('activeCityId');
const activeRoomIdSelector = state => state.bathhouse.get('activeRoomId');

export const BathhousesListSelectors = createSelector(
  modeSelector,
  activeCityIdSelector,
  activeRoomIdSelector,
  (mode, activeCityId, activeRoomId) => {
    return {
      mode,
      activeCityId,
      activeRoomId,
    };
  }
);
