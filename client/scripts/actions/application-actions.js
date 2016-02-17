export const SET_CURRENT_DATE = 'SET_CURRENT_DATE';
export const SET_CURRENT_PERIOD = 'SET_CURRENT_PERIOD';

export function setCurrentDate(date) {
  return {
    type: SET_CURRENT_DATE,
    payload: {
      date
    }
  };
}

export function setCurrentPeriod(period) {
  return {
    type: SET_CURRENT_PERIOD,
    payload: {
      period
    }
  };
}
