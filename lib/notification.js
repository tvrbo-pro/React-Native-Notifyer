import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  Dimensions,
  TouchableOpacity,
  Easing,
  Platform
} from 'react-native';

const STATUS_BAR_PADDING = (Platform.OS === 'ios') ? 15 : 0;
const NOTIFICATION_PADDING = 15;
const NOTIFICATION_HEIGHT = 80 + STATUS_BAR_PADDING;

const DIMENSION = Dimensions.get('window');
const WINDOW_WIDTH = DIMENSION.width;

let baseStyles = StyleSheet.create({
  mainView: {
    position: 'absolute',
    width: WINDOW_WIDTH
    // justifyContent: 'center',
    // alignItems: 'center'
  },
  animatedViewStyle: {
    padding: NOTIFICATION_PADDING,
    paddingTop: NOTIFICATION_PADDING + STATUS_BAR_PADDING,
    backgroundColor: '#f5f5f5',
    opacity: 1,
    borderRadius: 0
  },
  shadowStyle: {
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 2
    },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 4
  },
  textStyle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center'
  }
});

class NotificationView extends Component {
  static displayName = 'NotificationView';

  static propTypes = {
    ...View.propTypes,
    viewStyle: View.propTypes.style,
    textStyle: Text.propTypes.style,
    visible: PropTypes.bool.isRequired,
    duration: PropTypes.number.isRequired,
    animation: PropTypes.number, // ms
    shadow: PropTypes.bool,
    backgroundColor: PropTypes.string,
    opacity: PropTypes.number,
    shadowColor: PropTypes.string,
    textColor: PropTypes.string,
    onPress: PropTypes.func
  };

  static defaultProps = {
    animation: true,
    shadow: true,
    top: - NOTIFICATION_HEIGHT - NOTIFICATION_PADDING * 2,
    textColor: '#333',
    backgroundColor: '#f5f5f5'
  };

  _animating = false;
  _root = null;
  _hideTimeout = null;

  constructor() {
    super(...arguments);
    this.state = {
      top: new Animated.Value(- NOTIFICATION_HEIGHT - NOTIFICATION_PADDING * 2)
    };
  }

  componentDidMount() {
    if (this.props.visible) this._show()
  }

  componentWillUnmount() {
    this._hide();
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.visible === this.props.visible) return;
    else if (nextProps.visible) {
      clearTimeout(this._hideTimeout);
      this._show()
    }
    else {
      this._hide();
    }

    this.setState({ visible: nextProps.visible });
  }

  _show() {
    if (this._animating) return;
    clearTimeout(this._hideTimeout);

    this._animating = true;
    this._root.setNativeProps({
      pointerEvents: 'auto'
    });

    Animated.timing(this.state.top, {
      toValue: 0,
      duration: this.props.animation,
      easing: Easing.out(Easing.ease)
    })
    .start(({ finished }) => {
      if (!finished) return;

      this._animating = !finished;
      if (this.props.duration > 0) {
        this._hideTimeout = setTimeout(() => this._hide(), this.props.duration);
      }
    });
  }

  _hide() {
    clearTimeout(this._showTimeout);
    clearTimeout(this._hideTimeout);

    if (!this._animating) return;
    this._root.setNativeProps({
      pointerEvents: 'none'
    });

    this.props.onHide && this.props.onHide();

    Animated.timing(this.state.top, {
      toValue: - NOTIFICATION_HEIGHT - NOTIFICATION_PADDING * 2,
      duration: this.props.animation,
      easing: Easing.in(Easing.ease)
    })
      .start(({ finished }) => {
        if (!finished) return;

        this._animating = false;
        this.props.onHidden && this.props.onHidden();
      });
  }

  render() {
    if(!(this.props.visible || this._animating)) return;

    let { props } = this;
    let position = {
      top: 0,
      // bottom: NOTIFICATION_HEIGHT
    };

    const mainViewStyle = [baseStyles.mainView, position];
    const animatedViewStyle = [
      baseStyles.animatedViewStyle,
      props.viewStyle,
      props.backgroundColor && { backgroundColor: props.backgroundColor },
      {
        top: this.state.top
      },
      props.shadow && baseStyles.shadowStyle,
      props.shadowColor && { shadowColor: props.shadowColor }
    ];
    const textStyle = [
      baseStyles.textStyle,
      props.textStyle,
      props.textColor && { color: props.textColor }
    ];

    return <View style={mainViewStyle} pointerEvents="box-none">
      <TouchableOpacity
        onPress={this.props.onPress ? this.props.onPress : null}
      >
        <Animated.View
          style={animatedViewStyle}
          pointerEvents="none"
          ref={element => this._root = element}
        >
          <Text style={textStyle}>
            {this.props.children}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    </View>
  }
}

export default NotificationView;
