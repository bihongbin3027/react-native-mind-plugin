import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { PanResponder, View } from 'react-native';

import { Svg, G } from 'react-native-svg';

import { emitter } from './core/utils';

import options from './core/options';
import command from './core/command';
import Collection from './collection';

//引入插件
import { Navigation } from './plugins';

//引入布局算法
require('./layout/compact');
require('./layout/normal');

class Minder extends Component {
  static propTypes = {
    dataList: PropTypes.array,
  };

  constructor(props) {
    super(props);

    this.state = {
      x: 0,
      y: 0,
      scale: 1,
    };

    this._initX = 0;
    this._initY = 0;
    this._initDistance = 0;

    this.move = this.move.bind(this);
    this.press = this.press.bind(this);
    this.pressOut = this.pressOut.bind(this);
    this.moveToStart = this.moveToStart.bind(this);
  }

  UNSAFE_componentWillMount() {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      // onStartShouldSetPanResponderCapture: () => true,
      // onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: this.press,
      onPanResponderMove: this.move,
      onPanResponderRelease: this.pressOut,
    });
  }

  move(evn, gestureState) {
    if (gestureState.numberActiveTouches === 1) {
      const dx = gestureState.dx + this._initX;
      const dy = gestureState.dy + this._initY;

      this.setState({
        x: dx,
        y: dy,
      });
    }

    if (gestureState.numberActiveTouches === 2) {
      let dx = Math.abs(
        evn.nativeEvent.touches[0].pageX - evn.nativeEvent.touches[1].pageX
      );
      let dy = Math.abs(
        evn.nativeEvent.touches[0].pageY - evn.nativeEvent.touches[1].pageY
      );
      let newDistance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
      let scale = this.state.scale + (newDistance / this._initDistance - 1);

      this._initDistance = newDistance;

      if (scale > 2 || scale < 0.5) {
        return;
      }

      this.setState({ scale: scale });
    }
  }

  press(evn, gestureState) {
    if (gestureState.numberActiveTouches === 2) {
      let dx = Math.abs(
        evn.nativeEvent.touches[0].pageX - evn.nativeEvent.touches[1].pageX
      );
      let dy = Math.abs(
        evn.nativeEvent.touches[0].pageY - evn.nativeEvent.touches[1].pageY
      );
      this._initDistance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    }
  }

  pressOut() {
    this._initX = this.state.x;
    this._initY = this.state.y;
  }

  moveToStart(point) {
    this.setState({
      x: -point.x,
      y: -point.y,
    });
    this._initX = -point.x;
    this._initY = -point.y;
  }

  render() {
    if (!this.props.dataList || !this.props.dataList.length) {
      return <Svg />;
    }

    const pageContent = this.props.dataList.map((nodeTree) => {
      return (
        <Collection
          moveToStart={this.moveToStart}
          nodeTree={nodeTree}
          key={nodeTree.root.data.node_id}
        />
      );
    });

    return (
      <View>
        <Svg style={{ flex: 1 }} {...this._panResponder.panHandlers}>
          <G
            x={this.state.x}
            y={this.state.y + this.props.height / 2}
            scale={this.state.scale}
          >
            {pageContent}
            {options.get('navigation') ? <Navigation /> : <G />}
          </G>
        </Svg>
      </View>
    );
  }
}

module.exports.Minder = Minder;
module.exports.emitter = emitter;
module.exports.command = command;
