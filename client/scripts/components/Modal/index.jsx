import React, { PropTypes } from 'react';
import './style.css';

import classNames from 'classnames';

const ModalComponent = ({ children, active }) => {
  const maskClasses = classNames({
    'Modal-mask': true,
    'Modal-mask--active': active,
  });

  const panelClasses = classNames({
    'Modal-panel': true,
    'Modal-panel--hidden': !active,
  });

  return (
    <div className="Modal">
      <div className={maskClasses} />
      <div className={panelClasses}>
        {children}
      </div>
    </div>
  );
};

ModalComponent.defaultProps = {
  active: false,
};

ModalComponent.propTypes = {
  active: PropTypes.bool,
  children: PropTypes.array.isRequired,
};

export default ModalComponent;
