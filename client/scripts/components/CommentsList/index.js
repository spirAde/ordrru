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

var _reactImmutableProptypes = require('react-immutable-proptypes');

var _reactImmutableProptypes2 = _interopRequireDefault(_reactImmutableProptypes);

var _reactRedux = require('react-redux');

var _reactIntl = require('react-intl');

var _CommentsListSelectors = require('../../selectors/CommentsListSelectors');

var _CommentsListSelectors2 = _interopRequireDefault(_CommentsListSelectors);

var _index = require('../Comment/index.jsx');

var _index2 = _interopRequireDefault(_index);

var _shallowEqualImmutable = require('../../utils/shallowEqualImmutable');

var _shallowEqualImmutable2 = _interopRequireDefault(_shallowEqualImmutable);

require('./style.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CommentsListComponent = function (_Component) {
  (0, _inherits3.default)(CommentsListComponent, _Component);

  function CommentsListComponent() {
    (0, _classCallCheck3.default)(this, CommentsListComponent);
    return (0, _possibleConstructorReturn3.default)(this, (CommentsListComponent.__proto__ || (0, _getPrototypeOf2.default)(CommentsListComponent)).apply(this, arguments));
  }

  (0, _createClass3.default)(CommentsListComponent, [{
    key: 'shouldComponentUpdate',

    /**
     * shouldComponentUpdate
     * @return {boolean}
     * */
    value: function shouldComponentUpdate(nextProps, nextState) {
      return !(0, _shallowEqualImmutable2.default)(this.props, nextProps) || !(0, _shallowEqualImmutable2.default)(this.state, nextState);
    }
  }, {
    key: 'renderComments',
    value: function renderComments() {
      var comments = this.props.comments;

      return comments.map(function (comment) {
        return _react2.default.createElement(_index2.default, {
          key: comment.get('id'),
          comment: comment
        });
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props;
      var isActive = _props.isActive;
      var commentsIsFetching = _props.commentsIsFetching;

      if (isActive && !commentsIsFetching) {
        var commentsItems = this.renderComments();

        return _react2.default.createElement(
          'div',
          { className: 'CommentsList' },
          _react2.default.createElement(
            'div',
            { className: 'CommentsList-header' },
            _react2.default.createElement(_reactIntl.FormattedMessage, { id: 'comments' })
          ),
          _react2.default.createElement(
            'div',
            { className: 'CommentsList-list' },
            commentsItems
          )
        );
      }

      return null;
    }
  }]);
  return CommentsListComponent;
}(_react.Component);

CommentsListComponent.propTypes = {
  comments: _reactImmutableProptypes2.default.list,
  isActive: _react.PropTypes.bool.isRequired,
  commentsIsFetching: _react.PropTypes.bool.isRequired
};

exports.default = (0, _reactRedux.connect)(_CommentsListSelectors2.default)(CommentsListComponent);

//# sourceMappingURL=index.js.map