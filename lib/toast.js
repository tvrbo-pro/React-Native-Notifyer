import React, { Component } from "react";
import PropTypes from "prop-types";

import {
  StyleSheet,
  View,
  Text,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Easing,
  Keyboard
} from 'react-native';
const TOAST_MAX_WIDTH = 0.8;
const TOAST_ANIMATION_DURATION = 200;
const DIMENSION = Dimensions.get('window');
let KEYBOARD_HEIGHT = 0;

Keyboard.addListener('keyboardDidChangeFrame', function ({ endCoordinates }) {
  KEYBOARD_HEIGHT = DIMENSION.height - endCoordinates.screenY;
});

const WINDOW_WIDTH = DIMENSION.width;

let styles = StyleSheet.create({
  defaultStyle: {
    position: 'absolute',
    width: WINDOW_WIDTH,
    justifyContent: 'center',
    alignItems: 'center'
  },
  containerStyle: {
    padding: 15,
    backgroundColor: '#000',
    opacity: 0.8,
    borderRadius: 5,
    marginHorizontal: WINDOW_WIDTH * ((1 - TOAST_MAX_WIDTH) / 2)
  },
  shadowStyle: {
    shadowColor: '#000',
    shadowOffset: {
      width: 4,
      height: 4
    },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 10
  },
  textStyle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center'
  }
});

class Toast extends Component {
  static displayName = 'Toast';

  static propTypes = {
    ...View.propTypes,
    containerStyle: View.propTypes.style,
    duration: PropTypes.number,
    visible: PropTypes.bool,
    position: PropTypes.number,
    animation: PropTypes.number, // 0 == no animation
    shadow: PropTypes.bool,
    backgroundColor: PropTypes.string,
    opacity: PropTypes.number,
    shadowColor: PropTypes.string,
    textColor: PropTypes.string,
    textStyle: Text.propTypes.style
  };

  static defaultProps = {
    visible: false,
    animation: true,
    shadow: true,
    opacity: 0.8,
    hideOnPress: true
  };

  constructor() {
    super(...arguments);
    this.state = {
      visible: this.props.visible,
      opacity: new Animated.Value(0)
    };
  }

  componentDidMount = () => {
    if (this.state.visible) {
      this._show()
    }
  };

  componentWillReceiveProps = nextProps => {
    if (nextProps.visible !== this.props.visible) {
      if (nextProps.visible) {
        clearTimeout(this._hideTimeout);
        this._show()
      } else {
        this._hide();
      }

      this.setState({
        visible: nextProps.visible
      });
    }
  };

  componentWillUnmount = () => {
    this._hide();
  };

  shouldComponentUpdate = (nextProps, nextState) => {
    return this.state.visible !== nextState.visible;
  };

  onPress() {
    if (this.props.onPress) {
      this.props.onPress();
    }
  }

  _animating = false;
  _root = null;
  _hideTimeout = null;

  _show = () => {
    if (this._animating) return;
    this._animating = true;
    clearTimeout(this._hideTimeout);

    this._root.setNativeProps({
      pointerEvents: 'auto'
    });

    Animated.timing(this.state.opacity, {
      toValue: this.props.opacity,
      duration: this.props.animation ? TOAST_ANIMATION_DURATION : 0,
      easing: Easing.out(Easing.ease)
    }).start(({ finished }) => {
      this._animating = !finished;
    });
  };

  _hide = () => {
    clearTimeout(this._hideTimeout);
    if (this._animating) return;
    this._animating = true;

    this._root.setNativeProps({
      pointerEvents: 'none'
    });
    Animated.timing(this.state.opacity, {
      toValue: 0,
      duration: this.props.animation ? TOAST_ANIMATION_DURATION : 0,
      easing: Easing.in(Easing.ease)
    }).start(({ finished }) => {
      if (finished) {
        this._animating = false;
        this.props.onHidden && this.props.onHidden(this.props.siblingManager);
      }
    });
  };

  render() {
    if (!this.state.visible && !this._animating) return null;

    let { props } = this;
    let position = {
      top: 0,
      bottom: KEYBOARD_HEIGHT
    };
    const outerViewStyle = [
      styles.defaultStyle,
      position
    ];
    const mainViewStyle = [
      styles.containerStyle,
      props.containerStyle,
      props.backgroundColor && { backgroundColor: props.backgroundColor },
      {
        opacity: this.state.opacity
      },
      props.shadow && styles.shadowStyle,
      props.shadowColor && { shadowColor: props.shadowColor }
    ];
    const textStyle = [
      styles.textStyle,
      props.textStyle,
      props.textColor && { color: props.textColor }
    ];

    return <View
      style={outerViewStyle}
      pointerEvents="box-none"
    >
      <TouchableWithoutFeedback
        onPress={() => this.onPress()}
      >
        <Animated.View
          style={mainViewStyle}
          pointerEvents="none"
          ref={ele => this._root = ele}
        >
          <Text style={textStyle}>
            {this.props.message}
          </Text>
        </Animated.View>
      </TouchableWithoutFeedback>
    </View>
  }
}

export default Toast;

