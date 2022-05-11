import React, { Fragment } from 'react';
import * as ReactDOM from 'react-dom';
import { DragArea, DragItem } from '../src/index';
import './index.less';

function App() {
  return (
    <Fragment>
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
    </Fragment>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
