import React, { PropTypes } from 'react';
import './style.css';

import classNames from 'classnames';

const ModalComponent = ({ children, active, width, height }) => {
  const maskClasses = classNames('Modal-mask', {
    'Modal-mask--active': active,
  });

  const panelClasses = classNames('Modal-panel', {
    'Modal-panel--hidden': !active,
  });

  return (
    <div className="Modal">
      <div className={maskClasses}></div>
      <div className={panelClasses} style={{ width, height }}>
        {children}
      </div>
    </div>
  );
};

ModalComponent.defaultProps = {
  active: false,
  width: 500,
  height: 500,
};

ModalComponent.propTypes = {
  active: PropTypes.bool,
  children: PropTypes.array.isRequired,
  width: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  height: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
};

export default ModalComponent;
