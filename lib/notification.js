import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  StyleSheet,
  View,
  ViewPropTypes,
  Text,
  Animated,
  Dimensions,
  TouchableOpacity,
  Easing,
  Platform,
  StatusBar,
} from "react-native";

const STATUS_BAR_PADDING = Platform.OS === "ios" ? 15 : StatusBar.currentHeight;
const NOTIFICATION_PADDING = 15;
const NOTIFICATION_HEIGHT = 80 + STATUS_BAR_PADDING;
const ANIMATION_DURATION = 200;

const DIMENSION = Dimensions.get("window");
const WINDOW_WIDTH = DIMENSION.width;

let baseStyles = StyleSheet.create({
  mainView: {
    position: "absolute",
    width: WINDOW_WIDTH
  },
  animatedViewStyle: {
    padding: NOTIFICATION_PADDING,
    paddingTop: NOTIFICATION_PADDING + STATUS_BAR_PADDING,
    backgroundColor: "#fff",
    opacity: 1,
    borderRadius: 0
  },
  textStyle: {
    fontSize: 16,
    color: "#000"
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

class NotificationView extends Component {
  static displayName = "NotificationView";

  static propTypes = {
    ...ViewPropTypes,
    viewStyle: ViewPropTypes.style,
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
    animation: ANIMATION_DURATION,
    shadow: true
  };

  _animating = false;
  _root = null;
  _hideTimeout = null;

  constructor() {
    super(...arguments);
    this.state = {
      top: new Animated.Value(-NOTIFICATION_HEIGHT - NOTIFICATION_PADDING * 2)
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
    this._hide();
  }

  _show() {
    clearTimeout(this._hideTimeout);

    if (this._animating) return;
    this._animating = true;

    this._root.setNativeProps({
      pointerEvents: "auto"
    });

    Animated.timing(this.state.top, {
      toValue: 0,
      duration: this.props.animation,
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

    Animated.timing(this.state.top, {
      toValue: -NOTIFICATION_HEIGHT - NOTIFICATION_PADDING * 2,
      duration: this.props.animation,
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
        <Text key={0} style={[textStyle, titleStyle, { paddingBottom: 8 }]}>
          {this.props.title}
        </Text>,
        <Text key={1} style={[textStyle, { fontSize: 14 }]}>
          {this.props.message}
        </Text>
      ]
    }
    else if (this.props.message || this.props.title) {
      return <Text style={[textStyle, { textAlign: 'center' }]}>
        {this.props.message || this.props.title}
      </Text>
    }
    else return null;
  }

  render() {
    if (!(this.props.visible || this._animating)) return;

    let { props } = this;
    let position = {
      top: 0
    };

    const mainViewStyle = [baseStyles.mainView, position];
    const animatedViewStyle = [
      baseStyles.animatedViewStyle,
      props.viewStyle,
      props.backgroundColor && { backgroundColor: props.backgroundColor },
      {
        top: this.state.top
      },
      props.shadow && baseStyles.shadowStyle
    ];

    return (
      <View style={mainViewStyle} pointerEvents="box-none">
        <TouchableOpacity
          onPress={() => this.onPress()}
        >
          <Animated.View
            style={animatedViewStyle}
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

export default NotificationView;
