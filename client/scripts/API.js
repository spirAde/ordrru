import fetch from 'isomorphic-fetch';
import isEmpty from 'lodash/lang/isEmpty';

const baseUrl = 'http://localhost:3000/api';

/**
 * Bathhouses api methods
 * */
export const Bathhouses = {
  /**
   * find bathhouses and rooms for city
   * */
  find: async (filter = {}) => {
    const conditions = isEmpty(filter) ? `` : `?filter=${JSON.stringify(filter)}`;
    return fetch(`${baseUrl}/bathhouses${conditions}`);
  }
};

/**
 * Schedule api methods
 * */
export const Schedules = {
  /**
   * find schedule for room
   * */
  find: async (filter = {}) => {
    const conditions = isEmpty(filter) ? `` : `?filter=${JSON.stringify(filter)}`;
    return fetch(`${baseUrl}/schedules${conditions}`);
  }
};
