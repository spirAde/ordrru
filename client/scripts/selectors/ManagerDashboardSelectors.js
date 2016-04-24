import { createSelector } from 'reselect';

const managerSelector = state => state.manager.get('manager');
const bathhouseSelector = state => state.bathhouse.get('bathhouses');
const roomsSelector = state => state.bathhouse.get('rooms');
const ordersSelector = state => state.order.get('orders');
const schedulesSelector = state => state.schedule.get('schedules');
const viewportSelector = state => state.application.getIn(['device', 'viewport']);
const dateSelector = state => state.application.get('date');

export const ManagerDashboardSelectors = createSelector(
  viewportSelector,
  dateSelector,
  managerSelector,
  bathhouseSelector,
  roomsSelector,
  ordersSelector,
  schedulesSelector,
  (viewport, date, manager, bathhouse, rooms, orders, schedules) => ({
    viewport,
    date,
    manager,
    bathhouse,
    rooms,
    orders,
    schedules,
  })
);
