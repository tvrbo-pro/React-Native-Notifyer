import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  StyleSheet,
  View,
  Text,
  Animated,
  Dimensions,
  TouchableOpacity,
  Easing,
  Platform,
  Keyboard
} from "react-native";

let KEYBOARD_HEIGHT = 0;
const VIEW_MAX_WIDTH = 0.8;
const TARGET_OPACITY = 0.6;
const TOAST_ANIMATION_DURATION = 100;
const DIMENSION = Dimensions.get("window");
const WINDOW_WIDTH = DIMENSION.width;

Keyboard.addListener('keyboardDidChangeFrame', function ({ endCoordinates }) {
  KEYBOARD_HEIGHT = DIMENSION.height - endCoordinates.screenY;
});

let baseStyles = StyleSheet.create({
  backgroundViewStyle: {
    position: 'absolute',
    width: WINDOW_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    opacity: 0
  },
  containerViewStyle: {
    padding: 10,
    backgroundColor: '#fff',
    opacity: 1,
    borderRadius: 5,
    marginHorizontal: WINDOW_WIDTH * ((1 - VIEW_MAX_WIDTH) / 2)
  },
  textStyle: {
    fontSize: 16,
    color: "#000",
    textAlign: "center"
  },
  titleStyle: {
    fontWeight: 'bold'
  },
  shadowStyle: {
    shadowColor: "#333",
    shadowOffset: {
      width: 2,
      height: 2
    },
    shadowOpacity: 0.6,
    shadowRadius: 1,
    elevation: 1
  }
});

class Loading extends Component {
  static displayName = "Loading";

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
    textColor: PropTypes.string,
    onPress: PropTypes.func
  };

  static defaultProps = {
    animation: true,
    shadow: true
  };

  _animating = false;
  _root = null;
  _hideTimeout = null;

  constructor() {
    super(...arguments);
    this.state = {
      opacity: new Animated.Value(0)
    };
  }

  componentDidMount() {
    if (this.props.visible) this._show();
  }

  componentWillUnmount() {
    this._hide();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible === this.props.visible) return;
    else if (nextProps.visible) {
      clearTimeout(this._hideTimeout);
      this._show();
    } else {
      this._hide();
    }

    this.setState({ visible: nextProps.visible });
  }

  onPress() {
    if (this.props.onPress) {
      this.props.onPress();
    }
  }

  _show() {
    clearTimeout(this._hideTimeout);

    if (this._animating) return;
    this._animating = true;

    this._root.setNativeProps({
      pointerEvents: "auto"
    });

    Animated.timing(this.state.opacity, {
      toValue: TARGET_OPACITY,
      duration: this.props.animation ? TOAST_ANIMATION_DURATION : 0,
      easing: Easing.out(Easing.ease)
    }).start(({ finished }) => {
      this._animating = !finished;
    });
  }

  _hide() {
    clearTimeout(this._hideTimeout);

    if (this._animating) return;
    this._animating = true;

    this._root.setNativeProps({
      pointerEvents: "none"
    });

    Animated.timing(this.state.opacity, {
      toValue: 0,
      duration: this.props.animation ? TOAST_ANIMATION_DURATION : 0,
      easing: Easing.in(Easing.ease)
    }).start(({ finished }) => {
      if (!finished) return;

      this._animating = false;
      this.props.onHidden && this.props.onHidden();
    });
  }

  renderText() {
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
      return [
        <Text key={0} style={[textStyle, titleStyle]}>
          {this.props.title}
        </Text>,
        <Text key={1} style={textStyle}>
          {this.props.message}
        </Text>
      ]
    }
    else if (this.props.message || this.props.title) {
      return <Text style={textStyle}>
        {this.props.message || this.props.title}
      </Text>
    }
    else return null;
  }

  render() {
    if (!(this.props.visible || this._animating)) return;

    let { props } = this;
    let position = {
      top: 0,
      bottom: KEYBOARD_HEIGHT,
      left: 0,
      right: 0
    };

    const backgroundViewStyle = [baseStyles.backgroundViewStyle, position];
    const containerViewStyle = [
      baseStyles.containerViewStyle,
      props.viewStyle,
      props.backgroundColor && { backgroundColor: props.backgroundColor },
      {
        opacity: this.state.opacity
      },
      props.shadow && baseStyles.shadowStyle
    ];

    return (
      <View style={backgroundViewStyle} pointerEvents="box-none">
        <TouchableOpacity
          onPress={() => this.onPress()}
        >
          <Animated.View
            style={containerViewStyle}
            pointerEvents="none"
            ref={element => (this._root = element)}
          >
            {this.renderText()}
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  }
}

export default Loading;
