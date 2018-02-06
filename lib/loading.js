import React, { Component } from "react";
import PropTypes from "prop-types";
import { ActivityIndicator } from 'react-native';

import {
  StyleSheet,
  View,
  ViewPropTypes,
  Text,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Easing,
  Keyboard
} from 'react-native';

const TOAST_MAX_WIDTH = 0.8;
const BACKGROUND_START = 'rgba(0,0,0,0)';
const BACKGROUND_TARGET = 'rgba(0,0,0,0.5)';
const OPACITY_START = 0;
const OPACITY_TARGET = 1;
const TOAST_ANIMATION_DURATION = 200;
const DIMENSION = Dimensions.get('window');
let KEYBOARD_HEIGHT = 0;

Keyboard.addListener('keyboardDidChangeFrame', function ({ endCoordinates }) {
  KEYBOARD_HEIGHT = DIMENSION.height - endCoordinates.screenY;
});

const WINDOW_WIDTH = DIMENSION.width;

let baseStyles = StyleSheet.create({
  backgroundStyle: {
    position: 'absolute',
    width: WINDOW_WIDTH,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  containerStyle: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    opacity: OPACITY_TARGET,
    borderRadius: 5,
    marginHorizontal: WINDOW_WIDTH * ((1 - TOAST_MAX_WIDTH) / 2)
  },
  textStyle: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center'
  },
  titleStyle: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  shadowStyle: {
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 2
    },
    shadowOpacity: 0.6,
    shadowRadius: 2,
    elevation: 2
  }
});

class Loading extends Component {
  static displayName = 'Loading';

  static propTypes = {
    ...ViewPropTypes,
    containerStyle: ViewPropTypes.style,
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
    opacity: OPACITY_TARGET,
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

  renderLoadingView() {
    let { props } = this;
    const textStyle = [
      baseStyles.textStyle,
      props.textStyle,
      props.textColor && { color: props.textColor }
    ];
    const titleStyle = [
      baseStyles.textStyle,
      baseStyles.titleStyle,
      props.textStyle,
      props.textColor && { color: props.textColor }
    ];

    if (this.props.message && this.props.title) {
      return <View>
        <Text style={[textStyle, titleStyle, {paddingBottom: 8}]}>
          {this.props.title}
        </Text>
        <Text style={textStyle}>
          {this.props.message}
        </Text>
        <ActivityIndicator style={ {paddingTop: 11} } />
      </View>
    }
    else if (this.props.message || this.props.title) {
      return <View>
        <Text style={textStyle}>
          {this.props.message || this.props.title}
        </Text>
        <ActivityIndicator style={ {paddingTop: 11} } />
      </View>
    }
    else {
      return <View>
        <ActivityIndicator />
      </View>
    }
  }

  render() {
    if (!this.state.visible && !this._animating) return null;

    let { props } = this;
    let position = {
      top: 0,
      bottom: KEYBOARD_HEIGHT
    };
    const outerViewStyle = [
      baseStyles.backgroundStyle,
      position
    ];
    const mainViewStyle = [
      baseStyles.containerStyle,
      props.containerStyle,
      props.backgroundColor && { backgroundColor: props.backgroundColor },
      {
        opacity: this.state.opacity
      },
      props.shadow && baseStyles.shadowStyle,
      props.shadowColor && { shadowColor: props.shadowColor }
    ];

    return <View
      style={outerViewStyle}
      pointerEvents="auto"
    >
      <TouchableWithoutFeedback
        onPress={() => this.onPress()}
      >
        <Animated.View
          style={mainViewStyle}
          pointerEvents="none"
          ref={element => this._root = element}
        >
          {this.renderLoadingView()}
        </Animated.View>
      </TouchableWithoutFeedback>
    </View>
  }
}

export default Loading;

