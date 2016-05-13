import { createSelector } from 'reselect';

const viewportSelector = state => state.application.getIn(['device', 'viewport']);
const dateSelector = state => state.application.get('date');
const managerSelector = state => state.manager.get('manager');
const bathhouseSelector = state => state.bathhouse.get('bathhouses');
const roomsSelector = state => state.bathhouse.get('rooms');
const ordersSelector = state => state.order.get('orders');
const schedulesSelector = state => state.schedule.get('schedules');
const ordersIsFetchingSelector = state => state.schedule.get('isFetching');
const schedulesIsFetchingSelector = state => state.schedule.get('isFetching');

export const ManagerDashboardSelectors = createSelector(
  viewportSelector,
  dateSelector,
  managerSelector,
  bathhouseSelector,
  roomsSelector,
  ordersSelector,
  schedulesSelector,
  ordersIsFetchingSelector,
  schedulesIsFetchingSelector,
  (
    viewport, date, manager, bathhouse, rooms, orders, schedules, ordersIsFetching,
    schedulesIsFetching
  ) => ({
    viewport,
    date,
    manager,
    bathhouse,
    rooms,
    orders,
    schedules,
    ordersIsFetching,
    schedulesIsFetching,
  })
);
