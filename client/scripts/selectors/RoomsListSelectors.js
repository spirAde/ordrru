import { createSelector } from 'reselect';

const bathhousesSelector = state => state.bathhouse.get('bathhouses');
const roomsSelector = state => state.bathhouse.get('rooms');
const validRoomsSelector = state => state.bathhouse.get('valid');
const activeRoomIdSelector = state => state.bathhouse.get('activeRoomId');
const orderSelector = state => state.user.get('order');
const stepsSelector = state => state.user.get('steps');
const schedulesSelector = state => state.schedule.get('schedules');

export const RoomsListSelectors = createSelector(
  bathhousesSelector,
  roomsSelector,
  validRoomsSelector,
  activeRoomIdSelector,
  orderSelector,
  stepsSelector,
  schedulesSelector,
  (bathhouses, rooms, validRooms, activeRoomId, order, steps, schedules) => {
    return {
      bathhouses,
      activeRoomId,
      order,
      steps,
      schedules,
      rooms: rooms.filter(room => validRooms.includes(room.get('id'))),
    };
  }
);
