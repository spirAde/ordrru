'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

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

var _fill = require('lodash/fill');

var _fill2 = _interopRequireDefault(_fill);

var _floor = require('lodash/floor');

var _floor2 = _interopRequireDefault(_floor);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactImmutableProptypes = require('react-immutable-proptypes');

var _reactImmutableProptypes2 = _interopRequireDefault(_reactImmutableProptypes);

var _index = require('../Icon/index.jsx');

var _index2 = _interopRequireDefault(_index);

var _shallowEqualImmutable = require('../../utils/shallowEqualImmutable');

var _shallowEqualImmutable2 = _interopRequireDefault(_shallowEqualImmutable);

require('./style.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CommentComponent = function (_Component) {
  (0, _inherits3.default)(CommentComponent, _Component);

  function CommentComponent() {
    (0, _classCallCheck3.default)(this, CommentComponent);
    return (0, _possibleConstructorReturn3.default)(this, (CommentComponent.__proto__ || (0, _getPrototypeOf2.default)(CommentComponent)).apply(this, arguments));
  }

  (0, _createClass3.default)(CommentComponent, [{
    key: 'shouldComponentUpdate',

    /**
     * shouldComponentUpdate
     * @return {boolean}
     * */
    value: function shouldComponentUpdate(nextProps, nextState) {
      return !(0, _shallowEqualImmutable2.default)(this.props, nextProps) || !(0, _shallowEqualImmutable2.default)(this.state, nextState);
    }
  }, {
    key: 'renderStars',
    value: function renderStars(rating) {
      var fullStarsCount = (0, _floor2.default)(rating / 2);
      var halfStarsCount = (0, _floor2.default)(rating - fullStarsCount * 2);
      var emptyStarsCount = (0, _floor2.default)(5 - fullStarsCount - halfStarsCount);

      var fullStars = (0, _fill2.default)(Array(fullStarsCount), 'icon-star-full');
      var halfStars = (0, _fill2.default)(Array(halfStarsCount), 'icon-star-half');
      var emptyStars = (0, _fill2.default)(Array(emptyStarsCount), 'icon-star-empty');

      return [].concat((0, _toConsumableArray3.default)(fullStars), (0, _toConsumableArray3.default)(halfStars), (0, _toConsumableArray3.default)(emptyStars)).map(function (icon, index) {
        return _react2.default.createElement(_index2.default, { name: icon, color: '#F4740C', key: index });
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var comment = this.props.comment;

      var stars = this.renderStars(comment.get('evaluation'));

      return _react2.default.createElement(
        'div',
        { className: 'Comment' },
        _react2.default.createElement(
          'div',
          { className: 'Comment-top' },
          _react2.default.createElement(
            'div',
            { className: 'Comment-user' },
            'Василий Пупкин'
          ),
          _react2.default.createElement(
            'div',
            { className: 'Comment-evaluation' },
            stars
          )
        ),
        _react2.default.createElement(
          'div',
          { className: 'Comment-bottom' },
          _react2.default.createElement(
            'p',
            { className: 'Comment-text' },
            comment.get('text')
          )
        )
      );
    }
  }]);
  return CommentComponent;
}(_react.Component);

CommentComponent.propTypes = {
  comment: _reactImmutableProptypes2.default.map.isRequired
};

exports.default = CommentComponent;

//# sourceMappingURL=index.js.map