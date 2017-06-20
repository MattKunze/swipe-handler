import React, { Component } from 'react'
import './App.css'

import SwipeContainer from './SwipeContainer'

const colors = [
  '#F22613',
  '#DB0A5B',
  '#96281B',
  '#674172',
  '#913D88',
  '#446CB3',
  '#2C3E50',
  '#3A539B',
  '#34495E',
  '#87D37C',
  '#00B16A',
  '#1E824C',
  '#F89406',
  '#D35400',
  '#F2784B',
  '#6C7A89'
]

class App extends Component {
  constructor(props) {
    super(props)
    this.state = { color: colors[1] }
  }
  render() {
    const { color } = this.state
    return (
      <div className="App">
        <div className="App-header">
          {this.renderButton('Previous', -1)}
          {this.renderButton('Next', 1)}
        </div>
        <div className="App-container">
          <SwipeContainer
            contentComponent={Badge}
            currentProps={this.state}
            prevProps={this.getOffsetState(color, -1)}
            nextProps={this.getOffsetState(color, 1)}
            onSwipedPrev={this.onSwiped.bind(this, -1)}
            onSwipedNext={this.onSwiped.bind(this, 1)}
          />
        </div>
      </div>
    )
  }
  renderButton(label, offset) {
    const nextState = this.getOffsetState(this.state.color, offset)
    if (nextState) {
      const onClick = this.setState.bind(this, nextState, null)
      return <a onClick={onClick}>{label}: {nextState.color}</a>
    } else {
      return <span>{label}:</span>
    }
  }
  getOffsetState(color, offset) {
    const currentIndex = colors.findIndex(t => t === color)
    const nextIndex = currentIndex + offset
    if (nextIndex >= 0 && nextIndex < colors.length) {
      return { color: colors[nextIndex] }
    }
  }
  onSwiped(offset) {
    this.setState(this.getOffsetState(this.state.color, offset))
  }
}

function Badge(props) {
  const style = {
    backgroundColor: props.color,
    flexGrow: 1
    // width: '100%',
    // height: '100%'
  }
  return <div style={style}>{props.color}</div>
}

export default App
