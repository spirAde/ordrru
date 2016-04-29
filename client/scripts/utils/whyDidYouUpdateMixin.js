/* eslint-disable no-console */
import isFunction from 'lodash/isFunction';
import keys from 'lodash/keys';
import union from 'lodash/union';
import isObject from 'lodash/isObject';
import isEqual from 'lodash/isEqual';
import isArray from 'lodash/isArray';

import { Iterable, is } from 'immutable';

function isRequiredUpdateObject(obj) {
  return isArray(obj) || (obj && obj.constructor === Object.prototype.constructor);
}

function deepDiff(prevProps, nextProps, property) {
  const notify = (status) => {
    console.warn('Update %s', status);
    console.log('%cbefore', 'font-weight: bold', Iterable.isIterable(prevProps) ? prevProps.toJS() : prevProps);
    console.log('%cafter ', 'font-weight: bold', Iterable.isIterable(nextProps) ? nextProps.toJS() : nextProps);
  };
  
  if (!isEqual(prevProps, nextProps) || !is(prevProps, nextProps)) {
    console.group(property);
    
    if ([prevProps, nextProps].every(isFunction)) {
      notify('avoidable?');
    } else if (![prevProps, nextProps].every(isRequiredUpdateObject)) {
      notify('required.');
    } else {
      const keysList = union(keys(prevProps), keys(nextProps));
      for (const key of keysList) {
        deepDiff(prevProps[key], nextProps[key], key);
      }
    }
    
    console.groupEnd();
  } else if (prevProps !== nextProps) {
    console.group(property);
    notify('avoidable!');
    
    if (isObject(prevProps) && isObject(nextProps)) {
      const keysList = union(keys(prevProps), keys(nextProps));
      for (const key of keysList) {
        deepDiff(prevProps[key], nextProps[key], key);
      }
    }
    
    console.groupEnd();
  }
}

const WhyDidYouUpdateMixin = {
  componentDidUpdate(prevProps, prevState) {
    deepDiff(
      { props: prevProps, state: prevState },
      { props: this.props, state: this.state },
      this.constructor.displayName
    );
  },
};

export default WhyDidYouUpdateMixin;
