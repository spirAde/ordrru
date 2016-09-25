import { createSelector } from 'reselect';

const bathhousesSelector = state => state.bathhouse.get('bathhouses');
const roomsSelector = state => state.bathhouse.get('rooms');
const validRoomsSelector = state => state.bathhouse.get('valid');
const activeRoomIdSelector = state => state.bathhouse.get('activeRoomId');
const orderSelector = state => state.order.get('order');
const stepsSelector = state => state.order.get('steps');
const schedulesSelector = state => state.schedule.get('schedules');

const RoomsListSelectors = createSelector(
  bathhousesSelector,
  roomsSelector,
  validRoomsSelector,
  activeRoomIdSelector,
  orderSelector,
  stepsSelector,
  schedulesSelector,
  (bathhouses, rooms, validRooms, activeRoomId, order, steps, schedules) => ({
    bathhouses,
    activeRoomId,
    order,
    steps,
    schedules,
    rooms: rooms.filter(room => validRooms.includes(room.get('id'))),
  })
);

export { RoomsListSelectors as default };
