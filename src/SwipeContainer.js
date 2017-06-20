import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import './SwipeContainer.css'
import Hammer from 'react-hammerjs'

import isEqualShallow from 'is-equal-shallow'

const AUTOBIND_PROPS = ['onPan', 'onPanStart', 'onPanEnd', 'onTransitionEnd']

const getInitialState = () => ({
  panOffset: null,
  contentWidth: null,
  contentHeight: null,
  implicitPrevProps: null,
  implicitNextProps: null
})

class SwipeContainer extends Component {
  constructor(props) {
    super(props)
    this.state = getInitialState()

    AUTOBIND_PROPS.forEach(name => {
      this[name] = this[name].bind(this)
    })
  }
  componentWillReceiveProps(nextProps) {
    const { currentProps } = nextProps
    if (
      !this.state.panOffset &&
      !isEqualShallow(this.props.currentProps, currentProps)
    ) {
      const bounds = ReactDOM.findDOMNode(this).getBoundingClientRect()
      const { prevProps, nextProps } = this.props
      if (isEqualShallow(currentProps, prevProps)) {
        this.setState({
          implicitPrevProps: this.props.currentProps,
          contentWidth: bounds.width,
          contentHeight: bounds.height
        })
      } else if (isEqualShallow(currentProps, nextProps)) {
        this.setState({
          implicitNextProps: this.props.currentProps,
          contentWidth: bounds.width,
          contentHeight: bounds.height
        })
      } else {
        console.warn('implicit transition miss')
        this.resetEverything()
      }
    }
  }
  componentDidUpdate(prevProps, prevState) {
    const { contentWidth } = this.state
    let targetCurrentLeft, targetCloneLeft
    if (this.state.implicitPrevProps && !prevState.implicitPrevProps) {
      targetCurrentLeft = 0
      targetCloneLeft = contentWidth
    } else if (this.state.implicitNextProps && !prevState.implicitNextProps) {
      targetCurrentLeft = 0
      targetCloneLeft = -1 * contentWidth
    } else {
      return
    }

    const { _currentContent, _cloneContent } = this
    setTimeout(() => {
      _currentContent.style.left = `${targetCurrentLeft}px`
      _currentContent.classList.add('transitioning')
      _cloneContent.style.left = `${targetCloneLeft}px`
      _cloneContent.classList.add('transitioning')
    }, 10)
  }
  render() {
    return (
      <Hammer
        onPan={this.onPan}
        onPanStart={this.onPanStart}
        onPanEnd={this.onPanEnd}
      >
        <div className="swipe-container" onTransitionEnd={this.onTransitionEnd}>
          {this.renderContent()}
        </div>
      </Hammer>
    )
  }
  renderContent() {
    let { contentWidth, contentHeight, panOffset } = this.state
    let cloneProps
    if (this.state.implicitPrevProps) {
      cloneProps = this.state.implicitPrevProps
      panOffset = -1 * contentWidth
    } else if (this.state.implicitNextProps) {
      cloneProps = this.state.implicitNextProps
      panOffset = contentWidth
    } else if (panOffset > 0) {
      cloneProps = this.props.prevProps
    } else if (panOffset < 0) {
      cloneProps = this.props.nextProps
    }

    if (panOffset !== null) {
      const style = {
        position: 'absolute',
        display: 'flex',
        width: `${contentWidth}px`,
        height: `${contentHeight}px`
      }
      const cloneLeft = panOffset > 0
        ? panOffset - contentWidth
        : panOffset + contentWidth
      const results = [
        <div
          key="current"
          ref={ref => (this._currentContent = ref)}
          style={Object.assign({ left: `${panOffset}px` }, style)}
        >
          {React.createElement(
            this.props.contentComponent,
            this.props.currentProps
          )}
        </div>
      ]

      if (cloneProps) {
        results.push(
          <div
            key="clone"
            ref={ref => (this._cloneContent = ref)}
            style={Object.assign({ left: `${cloneLeft}px` }, style)}
          >
            {React.createElement(this.props.contentComponent, cloneProps)}
          </div>
        )
      }

      return results
    } else {
      return React.createElement(
        this.props.contentComponent,
        this.props.currentProps
      )
    }
  }
  onPan(ev) {
    this.setState({ panOffset: ev.deltaX })
  }
  onPanStart(ev) {
    const bounds = ReactDOM.findDOMNode(this).getBoundingClientRect()
    this.setState({
      contentWidth: bounds.width,
      contentHeight: bounds.height
    })
  }
  onPanEnd(ev) {
    const { contentWidth } = this.state
    const { _currentContent, _cloneContent } = this

    let targetCurrentLeft, targetCloneLeft
    if (
      _cloneContent &&
      (Math.abs(ev.deltaX) >= contentWidth / 2 ||
        Math.abs(ev.overallVelocityX) >= 0.5)
    ) {
      targetCloneLeft = 0
      if (ev.deltaX < 0) {
        targetCurrentLeft = -1 * contentWidth
      } else {
        targetCurrentLeft = contentWidth
      }
      this._triggerOnSwiped = true
    } else {
      targetCurrentLeft = 0
      if (ev.deltaX < 0) {
        targetCloneLeft = contentWidth
      } else {
        targetCloneLeft = -1 * contentWidth
      }
      this._triggerOnSwiped = false
    }

    _currentContent.style.left = `${targetCurrentLeft}px`
    _currentContent.classList.add('transitioning')
    if (_cloneContent) {
      _cloneContent.style.left = `${targetCloneLeft}px`
      _cloneContent.classList.add('transitioning')
    }
  }
  onTransitionEnd(ev) {
    if (this._triggerOnSwiped) {
      if (this.state.panOffset < 0) {
        this.props.onSwipedNext()
      } else if (this.state.panOffset > 0) {
        this.props.onSwipedPrev()
      }
    }
    this.resetEverything()
  }
  resetEverything() {
    this.setState(getInitialState())
    this._currentContent = this._cloneContent = this._triggerOnSwiped = null
  }
}

export default SwipeContainer
