'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactHelmet = require('react-helmet');

var _reactHelmet2 = _interopRequireDefault(_reactHelmet);

var _reactImmutableProptypes = require('react-immutable-proptypes');

var _reactImmutableProptypes2 = _interopRequireDefault(_reactImmutableProptypes);

var _reactRedux = require('react-redux');

var _HomeSelectors = require('../selectors/HomeSelectors');

var _HomeSelectors2 = _interopRequireDefault(_HomeSelectors);

var _userActions = require('../actions/user-actions');

var _index = require('../components/Face/index.jsx');

var _index2 = _interopRequireDefault(_index);

var _index3 = require('../components/HowUseIt/index.jsx');

var _index4 = _interopRequireDefault(_index3);

var _index5 = require('../components/Testimonials/index.jsx');

var _index6 = _interopRequireDefault(_index5);

var _index7 = require('../components/Interesting/index.jsx');

var _index8 = _interopRequireDefault(_index7);

var _index9 = require('../components/Footer/index.jsx');

var _index10 = _interopRequireDefault(_index9);

var _configs = require('../../../common/data/configs.json');

var _configs2 = _interopRequireDefault(_configs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * HomePage - smart component, container, welcome page
 * Smart components - none
 * Dumb components - FaceComponent, HowUseItComponent, TestimonialsComponent,
 *                   InterestingComponent, FooterComponent
 * */

var HomePage = function (_Component) {
  (0, _inherits3.default)(HomePage, _Component);

  /**
   * constructor
   * @param {Object} props
   */

  function HomePage(props) {
    (0, _classCallCheck3.default)(this, HomePage);
    return (0, _possibleConstructorReturn3.default)(this, (HomePage.__proto__ || (0, _getPrototypeOf2.default)(HomePage)).call(this, props));

    //this.handleChangeCity = this.handleChangeCity.bind(this);
    //this.handleChangeOrganizationType = this.handleChangeOrganizationType.bind(this);
  }

  (0, _createClass3.default)(HomePage, [{
    key: 'componentDidMount',
    value: function componentDidMount() {}
    //this.props.changeCity(this.props.cities[0].id);
    //this.props.changeOrganizationType(this.props.types[0].id);

    /**
     * handle change selected city
     * @param {number} index - index of cities array
     */
    /*handleChangeCity(index) {
      this.props.changeCity(this.props.cities[index].id);
    }*/

    /**
     * handle change selected organization type(bathhouse or carwash)
     * @param {number} index - index of organization types array
     */
    /*handleChangeOrganizationType(index) {
      this.props.changeOrganizationType(this.props.types[index].id);
    }*/

    /**
     * render
     * @return {XML} - React element
     * */

  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(_reactHelmet2.default, { title: 'Home' }),
        _react2.default.createElement(_index2.default, null),
        _react2.default.createElement(_index4.default, null),
        _react2.default.createElement(_index6.default, null),
        _react2.default.createElement(_index10.default, null)
      );
    }
  }]);
  return HomePage;
}(_react.Component);

/**
 * propTypes
 * @property {Array.<Object>} cities - list of cities
 * @property {Array.<Object>} types - list of organization types
 * @property {Function} changeCity - change selected city
 * @property {Function} changeOrganizationType - change selected organization type
 */

HomePage.propTypes = {
  cities: _reactImmutableProptypes2.default.list,
  changeCity: _react.PropTypes.func.isRequired,
  changeOrganizationType: _react.PropTypes.func.isRequired
};

/**
 * pass method to props
 * @param {Function} dispatch
 * @return {Object} props - list of methods
 * */
exports.default = (0, _reactRedux.connect)(_HomeSelectors2.default, {
  changeCity: _userActions.changeCity,
  changeOrganizationType: _userActions.changeOrganizationType
})(HomePage);

//# sourceMappingURL=HomePage.js.map