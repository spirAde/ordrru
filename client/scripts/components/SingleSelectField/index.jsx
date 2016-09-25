import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

import './style.css';

class SingleSelectFieldComponent extends Component {

  constructor(props) {
    super(props);

    this.state = {
      selectedIndex: props.index || 0,
      boxIsOpen: false
    };
  }

  handleChange(index, event) {
    event.preventDefault();
    this.props.onChange(index);
    this.setState({
      selectedIndex: index,
      boxIsOpen: false
    });
  }

  handleClickBox(event) {
    event.preventDefault();
    this.setState({
      boxIsOpen: !this.state.boxIsOpen
    });
  }

  renderRows() {
    const { options, name } = this.props;
    return options.map((option, index) => {
      const classes = classNames('SingleSelectField-option', {
        'SingleSelectField-option--selected': this.state.selectedIndex === index,
        'SingleSelectField-option--first': index === 0,
        'SingleSelectField-option--last': index === this.props.options.length
      });

      return (
        <li className={classes} key={index} onClick={this.handleChange.bind(this, index)}>
          <label>
            <span>{option[name]}</span>
          </label>
        </li>
      );
    });
  }

  render() {
    const { options, name } = this.props;
    const wrapperClasses = classNames({
      'SingleSelectField-options-wrapper': true,
      'SingleSelectField-options-wrapper--opened': this.state.boxIsOpen
    });

    const rows = this.renderRows();

    return (
      <div className="SingleSelectField">
        <p className="SingleSelectField-caption" onClick={this.handleClickBox.bind(this)}>
          <span>{options[this.state.selectedIndex][name]}</span>
          <label><i></i></label>
        </p>
        <div className={wrapperClasses}>
          <ul className="SingleSelectField-options">
            {rows}
          </ul>
        </div>
      </div>
    );
  }
}

SingleSelectFieldComponent.propTypes = {
  options: PropTypes.array,
  name: PropTypes.string,
  index: PropTypes.number,
  onChange: PropTypes.func.isRequired
};

export default SingleSelectFieldComponent;
