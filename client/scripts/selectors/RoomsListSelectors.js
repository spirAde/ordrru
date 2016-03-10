import { createSelector } from 'reselect';

const bathhousesSelector = state => state.bathhouse.get('bathhouses');
const roomsSelector = state => state.bathhouse.get('rooms');
const validRoomsSelector = state => state.bathhouse.get('valid');
const activeRoomIdSelector = state => state.bathhouse.get('activeRoomId');
const orderSelector = state => state.user.get('order');
const schedulesSelector = state => state.schedule.get('schedules');

export const RoomsListSelectors = createSelector(
  bathhousesSelector,
  roomsSelector,
  validRoomsSelector,
  activeRoomIdSelector,
  orderSelector,
  schedulesSelector,
  (bathhouses, rooms, validRooms, activeRoomId, order, schedules) => {
    return {
      bathhouses,
      activeRoomId,
      order,
      schedules,
      rooms: rooms.filter(room => validRooms.includes(room.get('id'))),
    };
  }
);
