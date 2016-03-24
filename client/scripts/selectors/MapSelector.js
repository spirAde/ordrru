import { createSelector } from 'reselect';

const citiesSelector = state => state.city.get('cities');
const activeCityIdSelector = state => state.city.get('activeCityId');
const bathhousesSelector = state => state.bathhouse.get('bathhouses');
const roomsSelector = state => state.bathhouse.get('rooms');
const validRoomsSelector = state => state.bathhouse.get('valid');
const activeRoomIdSelector = state => state.bathhouse.get('activeRoomId');
const orderSelector = state => state.user.get('order');
const stepsSelector = state => state.user.get('steps');
const schedulesSelector = state => state.schedule.get('schedules');

export const MapSelector = createSelector(
  citiesSelector,
  activeCityIdSelector,
  bathhousesSelector,
  roomsSelector,
  validRoomsSelector,
  activeRoomIdSelector,
  orderSelector,
  stepsSelector,
  schedulesSelector,
  (cities, activeCityId, bathhouses, rooms, validRooms, activeRoomId, order, steps, schedules) => {
    return {
      bathhouses,
      activeRoomId,
      order,
      steps,
      schedules,
      city: cities.find(city => city.get('id') === activeCityId),
      rooms: rooms.filter(room => validRooms.includes(room.get('id'))),
    };
  }
);
