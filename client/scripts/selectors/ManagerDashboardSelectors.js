import { createSelector } from 'reselect';

const viewportSelector = state => state.application.getIn(['device', 'viewport']);
const dateSelector = state => state.application.get('date');
const managerSelector = state => state.manager.get('manager');
const bathhouseSelector = state => state.bathhouse.get('bathhouses');
const roomsSelector = state => state.bathhouse.get('rooms');
const orderSelector = state => state.order.get('order');
const ordersSelector = state => state.order.get('orders');
const schedulesSelector = state => state.schedule.get('schedules');
const intervalSelector = state => state.schedule.get('interval');
const ordersIsFetchingSelector = state => state.schedule.get('isFetching');
const schedulesIsFetchingSelector = state => state.schedule.get('isFetching');

export const ManagerDashboardSelectors = createSelector(
  viewportSelector,
  dateSelector,
  managerSelector,
  bathhouseSelector,
  roomsSelector,
  orderSelector,
  ordersSelector,
  schedulesSelector,
  intervalSelector,
  ordersIsFetchingSelector,
  schedulesIsFetchingSelector,
  (
    viewport, date, manager, bathhouse, rooms, order, orders, schedules, interval,
    ordersIsFetching, schedulesIsFetching
  ) => ({
    viewport,
    date,
    manager,
    bathhouse,
    rooms,
    order,
    orders,
    schedules,
    interval,
    ordersIsFetching,
    schedulesIsFetching,
  })
);
