import logo from './logo.svg';
import './App.css';
import react, {Component, useState} from 'react';
import Mint from './Components/Mint'

class App extends Component {

    render() {
      
      return (
        <div className="App">
          <Mint/>     
        </div>
      );
    }
}

export default App;

