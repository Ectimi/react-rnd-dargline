import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { DragArea, DragItem } from '../.';
import './index.less';

function App() {
  return (
    <DragArea
      bounds="body"
      guidelineColor="red"
      onAdsorb={true}
      adsorbThreshold={5}
    >
      <DragItem>
        <div className="t t1">a</div>
      </DragItem>
      <DragItem>
        <div className="t t1">b</div>
      </DragItem>
      <DragItem>
        <div className="t t2">c</div>
      </DragItem>
      <DragItem>
        <div className="t t3">d</div>
      </DragItem>
    </DragArea>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
