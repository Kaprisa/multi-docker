import React from 'react'
import axios from 'axios'

export default class Fib extends React.Component {
  state = {
    seenIndexes: [],
    values: {},
    index: ''
  }
  componentDidMount() {
    this.fetchValues()
    this.fetchIndexes()
  }
  async fetchValues() {
    const values = await axios.get('/api/values/current')
    this.setState({values: values.data})
  }
  async fetchIndexes() {
    const seenIndexes = await axios.get('/api/values/all')
    this.setState({seenIndexes: seenIndexes.data})
  }
  renderSeenIndexes() {
    return this.state.seenIndexes.map(({number}) => number.join(', '))
  }
  renderValues() {
    const entries = []
    for (let k in this.state.values) {
      entries.push(
        <div key={k}>
          For index {k} I calculated {this.state.values[k]}
        </div>
      )
    }
    return entries
  }
  handleSubmit = async () => {
    await axios.post('/api/values', {index: this.state.index})
    this.setState({index: ''})
  }
  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>Enter your index: </label>
          <input value={this.state.index} onChange={e => this.setState({index: e.target.value})}/>
          <button>Submit</button>
        </form>
        <h3>Indexes i've seen</h3>
        {this.renderSeenIndexes()}
        <h3>Indexes i've seen</h3>
        {this.renderValues()}
      </div>
    )
  }
}
