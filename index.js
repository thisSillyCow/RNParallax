import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Platform, Animated, Text, View, Dimensions, StatusBar, TouchableOpacity } from 'react-native';
import { screenW, screenH, setSpText, scaleSize, isIphoneX, } from "./ScreenUtil";
const {
  height: SCREEN_HEIGHT,
} = Dimensions.get('window');

const IS_IPHONE_X = SCREEN_HEIGHT === 812 || SCREEN_HEIGHT === 896;
const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? (IS_IPHONE_X ? scaleSize(44) : scaleSize(20)) : scaleSize(0);
const NAV_BAR_HEIGHT = Platform.OS === 'ios' ? (IS_IPHONE_X ? scaleSize(88) : scaleSize(64)) : scaleSize(64);

const SCROLL_EVENT_THROTTLE = scaleSize(16);
const DEFAULT_HEADER_MAX_HEIGHT = scaleSize(170);
const DEFAULT_HEADER_MIN_HEIGHT = NAV_BAR_HEIGHT;
const DEFAULT_EXTRA_SCROLL_HEIGHT = scaleSize(30);
const DEFAULT_BACKGROUND_IMAGE_SCALE = 1.5;

const DEFAULT_NAVBAR_COLOR = 'rgba(0,0,0,0.4)';
const DEFAULT_BACKGROUND_COLOR = 'rgba(0,0,0,0.4)';
const DEFAULT_TITLE_COLOR = 'white';

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: DEFAULT_NAVBAR_COLOR,
    overflow: 'hidden',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: null,
    height: DEFAULT_HEADER_MAX_HEIGHT,
    resizeMode: 'cover',
  },
  bar: {
    backgroundColor: 'transparent',
    height: DEFAULT_HEADER_MIN_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  headerTitle: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: STATUS_BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    color: DEFAULT_TITLE_COLOR,
    textAlign: 'center',
    fontSize: setSpText(16),
  },
  absolute: {
    position: "absolute",
    width: SCREEN_HEIGHT,
  },
});
export class RNParallax extends Component {
  constructor() {
    super();
    this.state = {
      scrollY: new Animated.Value(0),
    };
  }

  getHeaderMaxHeight() {
    const { headerMaxHeight } = this.props;
    return headerMaxHeight;
  }

  getHeaderMinHeight() {
    const { headerMinHeight } = this.props;
    return headerMinHeight;
  }

  getHeaderScrollDistance() {
    return this.getHeaderMaxHeight() - this.getHeaderMinHeight();
  }

  getExtraScrollHeight() {
    const { extraScrollHeight } = this.props;
    return extraScrollHeight;
  }

  getBackgroundImageScale() {
    const { backgroundImageScale } = this.props;
    return backgroundImageScale;
  }

  getInputRange() {
    return [-this.getExtraScrollHeight(), 0, this.getHeaderScrollDistance()];
  }

  getHeaderHeight() {
    const { scrollY } = this.state;
    return scrollY.interpolate({
      inputRange: this.getInputRange(),
      outputRange: [this.getHeaderMaxHeight() + this.getExtraScrollHeight(), this.getHeaderMaxHeight(), this.getHeaderMinHeight()],
      extrapolate: 'clamp',
    });
  }

  getNavBarOpacity() {
    const { scrollY } = this.state;
    return scrollY.interpolate({
      inputRange: this.getInputRange(),
      outputRange: [0, 1, 1],
      extrapolate: 'clamp',
    });
  }

  getNavBarForegroundOpacity() {
    const { scrollY } = this.state;
    const { alwaysShowNavBar } = this.props;
    return scrollY.interpolate({
      inputRange: this.getInputRange(),
      outputRange: [alwaysShowNavBar ? 1 : 0, alwaysShowNavBar ? 1 : 0, 1],
      extrapolate: 'clamp',
    });
  }

  getImageOpacity() {
    const { scrollY } = this.state;
    return scrollY.interpolate({
      inputRange: this.getInputRange(),
      outputRange: [1, 1, 0],
      extrapolate: 'clamp',
    });
  }

  getImageTranslate() {
    const { scrollY } = this.state;
    return scrollY.interpolate({
      inputRange: this.getInputRange(),
      outputRange: [0, 0, -50],
      extrapolate: 'clamp',
    });
  }

  getImageScale() {
    const { scrollY } = this.state;
    return scrollY.interpolate({
      inputRange: this.getInputRange(),
      outputRange: [this.getBackgroundImageScale(), 1, 1],
      extrapolate: 'clamp',
    });
  }

  getTitleTranslateY() {
    const { scrollY } = this.state;
    return scrollY.interpolate({
      inputRange: this.getInputRange(),
      outputRange: [5, 0, 0],
      extrapolate: 'clamp',
    });
  }

  getTitleOpacity() {
    const { scrollY } = this.state;
    const { alwaysShowTitle } = this.props;
    return scrollY.interpolate({
      inputRange: this.getInputRange(),
      outputRange: [1, 1, alwaysShowTitle ? 1 : 0],
      extrapolate: 'clamp',
    });
  }

  renderBackgroundImage() {
    const { backgroundImage } = this.props;
    const imageOpacity = this.getImageOpacity();
    const imageTranslate = this.getImageTranslate();
    const imageScale = this.getImageScale();
    return (
      <View>
        <Animated.Image
          style={[
            styles.backgroundImage,
            {
              height: this.getHeaderMaxHeight(),
              opacity: imageOpacity,
              transform: [{ translateY: imageTranslate }, { scale: imageScale }],
            },
          ]}
          source={backgroundImage}
        />
        <View style={[styles.absolute, { backgroundColor: 'rgba(0,  0,  0,  0.4)', height: this.getHeaderMaxHeight() + scaleSize(30), }]}></View>
      </View>
    );
  }

  renderPlainBackground() {
    const { backgroundColor } = this.props;
    const imageOpacity = this.getImageOpacity();
    const imageTranslate = this.getImageTranslate();
    const imageScale = this.getImageScale();

    return (
      <Animated.View
        style={{
          height: this.getHeaderMaxHeight(),
          backgroundColor,
          opacity: imageOpacity,
          transform: [{ translateY: imageTranslate }, { scale: imageScale }],
        }}
      />
    );
  }

  renderNavbarBackground() {
    const { navbarColor } = this.props;
    const navBarOpacity = this.getNavBarOpacity();
    return (
      <Animated.View
        style={[
          styles.header,
          {
            height: this.getHeaderHeight(),
            backgroundColor: navbarColor,
            opacity: navBarOpacity,
          },
        ]}
      />
    );
  }

  renderHeaderBackground() {
    const { backgroundImage, backgroundColor } = this.props;
    const imageOpacity = this.getImageOpacity();
    return (
      <Animated.View
        style={[
          styles.header,
          {
            height: this.getHeaderHeight(),
            opacity: imageOpacity,
            backgroundColor: backgroundImage ? 'transparent' : backgroundColor,
          },
        ]}
      >
        {backgroundImage && this.renderBackgroundImage()}
        {!backgroundImage && this.renderPlainBackground()}
      </Animated.View>
    );
  }

  renderHeaderTitle() {
    const { title, } = this.props;
    const titleTranslateY = this.getTitleTranslateY();
    const titleOpacity = this.getTitleOpacity();
    return (
      <Animated.View
        style={[
          styles.headerTitle,
          {
            transform: [
              { translateY: titleTranslateY },
            ],
            height: this.getHeaderHeight(),
            opacity: titleOpacity,
          },
        ]}
      >
        {title()}
      </Animated.View>
    );
  }
  renderTitle() {
    const titleTranslateY = this.getTitleTranslateY();
    const titleOpacity = this.getTitleOpacity();
    const { scrollViewProps, moviePlayStyle, movieInfoStyle, palyIocnViewStyle } = this.props
    return (
      <TouchableOpacity style={{ position: 'absolute', top: 0, left: 0, right: 0, }} activeOpacity={1} onPress={() => scrollViewProps.modalViewShowFun()}>
        <Animated.View style={[{ transform: [{ translateY: titleTranslateY },], height: this.getHeaderHeight(), opacity: titleOpacity, }]}>
          <View style={{ flex: 1, paddingTop: scaleSize(70), alignItems: 'center', }}>
            <TouchableOpacity activeOpacity={1} onPress={() => scrollViewProps.moviePalyFun()} style={[moviePlayStyle,]}></TouchableOpacity>
            <View style={[movieInfoStyle, { marginTop: scaleSize(105) }]}>
              <TouchableOpacity activeOpacity={1} onPress={() => scrollViewProps.afterPlayFun()} style={[palyIocnViewStyle, { backgroundColor: 'transparent' }]}></TouchableOpacity>
              <TouchableOpacity activeOpacity={1} onPress={() => scrollViewProps.movieCacheFun()} style={[palyIocnViewStyle, { backgroundColor: 'transparent' }]}></TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    )
  }
  renderHeaderForeground() {
    const { renderNavBar } = this.props;
    const navBarOpacity = this.getNavBarForegroundOpacity();
    return (
      <Animated.View
        style={[
          styles.bar,
          {
            height: this.getHeaderMinHeight(),
            opacity: navBarOpacity,
          },
        ]}
      >
        {renderNavBar()}
      </Animated.View>
    );
  }
  onScrollToAnimated() {
    this.scrollView.getNode().scrollTo({ x: 0, y: 0, animated: true })
  }
  renderScrollView() {
    const {
      renderContent, scrollEventThrottle, scrollViewStyle, contentContainerStyle, innerContainerStyle, scrollViewProps,
    } = this.props;
    const { scrollY } = this.state;
    return (
      <Animated.ScrollView
        ref={ref => (this.scrollView = ref)}
        style={[styles.scrollView, scrollViewStyle,]}
        contentContainerStyle={contentContainerStyle}
        scrollEventThrottle={scrollEventThrottle}
        onScroll={
          Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          )
        }
        onScrollToAnimated={() => this.onScrollToAnimated()}
        {...scrollViewProps}
      >
        <View style={[{ marginTop: this.getHeaderMaxHeight(), }, innerContainerStyle]}>
          {renderContent()}
        </View>
      </Animated.ScrollView>
    );
  }

  render() {
    const { navbarColor, statusBarColor, containerStyle, headerMaxHeight } = this.props;
    return (
      <View style={[styles.container]}>
        <StatusBar backgroundColor={statusBarColor || navbarColor} />
        {/* {this.renderNavbarBackground()} */}
        {this.renderHeaderBackground()}
        {this.renderHeaderTitle()}
        {this.renderScrollView()}
        {this.renderHeaderForeground()}
        {this.renderTitle()}
      </View>
    );
  }
}

RNParallax.propTypes = {
  renderNavBar: PropTypes.func,
  renderContent: PropTypes.func.isRequired,
  backgroundColor: PropTypes.string,
  backgroundImage: PropTypes.any,
  navbarColor: PropTypes.string,
  title: PropTypes.any,
  titleStyle: PropTypes.any,
  headerMaxHeight: PropTypes.number,
  headerMinHeight: PropTypes.number,
  scrollEventThrottle: PropTypes.number,
  extraScrollHeight: PropTypes.number,
  backgroundImageScale: PropTypes.number,
  contentContainerStyle: PropTypes.any,
  innerContainerStyle: PropTypes.any,
  scrollViewStyle: PropTypes.any,
  containerStyle: PropTypes.any,
  alwaysShowTitle: PropTypes.bool,
  alwaysShowNavBar: PropTypes.bool,
  statusBarColor: PropTypes.string,
  scrollViewProps: PropTypes.object,
};

RNParallax.defaultProps = {
  renderNavBar: () => <View />,
  navbarColor: DEFAULT_NAVBAR_COLOR,
  backgroundColor: DEFAULT_BACKGROUND_COLOR,
  backgroundImage: null,
  title: null,
  titleStyle: styles.headerText,
  headerMaxHeight: DEFAULT_HEADER_MAX_HEIGHT,
  headerMinHeight: DEFAULT_HEADER_MIN_HEIGHT,
  scrollEventThrottle: SCROLL_EVENT_THROTTLE,
  extraScrollHeight: DEFAULT_EXTRA_SCROLL_HEIGHT,
  backgroundImageScale: DEFAULT_BACKGROUND_IMAGE_SCALE,
  contentContainerStyle: null,
  innerContainerStyle: null,
  scrollViewStyle: null,
  containerStyle: null,
  alwaysShowTitle: true,
  alwaysShowNavBar: true,
  statusBarColor: null,
  scrollViewProps: {},
};

export default RNParallax;
