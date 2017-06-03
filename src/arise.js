import React from 'react';
import ReactDOM from 'react-dom';

let div;

export default class Arise extends React.Component {

  static universal(props) {
    if (!div) {
      div = document.createElement('div');
      document.body.appendChild(div);
    }
    return ReactDOM.render( <Arise { ... props } universalPositioning={ true } />, div );
  }

  get passPropsToState() { return ['show']; }

  constructor(props) {
    super(props);
    this._bindFunctions('open', 'close', '_reposition');
    this.state = this._stateFromProps(props);
  }

  componentWillReceiveProps(newProps) {
    this.setState( this._stateFromProps(newProps, this.props) );
  }

  componentDidMount() {
    this._handleTransitions();
    this._reposition();
  }

  componentDidUpdate(prevProps, prevState) {
    this._handleTransitions(prevState);
    this._reposition();
  }

  open() { this.setState({ show: true }); }

  close() { this.setState({ show: false }); }

  toggle() { this.setState({ show: !this.state.show }); }

  render() {
    const { show } = this.state;
    const { html, children, modal, popupClass } = this.props;
    const modalClasses = this.props.modalClasses || {};
    const contentOpts = html ?
      { dangerouslySetInnerHTML : { __html: html } } : { children };
    console.info(this.state, this.props);
    if (modal) {
      return <div className={ modalClasses.container || 'Arise-modal-container' } ref="container">
        <div ref="overlay" className={ modalClasses.overlay || 'Arise-modal-overlay' }
          onClick={ this.close } />
        <div className={ modalClasses.content || 'Arise-modal-content '} ref="content"
          { ... contentOpts } />
      </div>;
    } else {
      return <div className={ popupClass || 'Arise-popup' } ref="container"
        { ... contentOpts } />;
    }
  }

  _handleTransitions(prevState = {}) {
    if (prevState.show == this.state.show) return;
    let { container } = this.refs;
    let { showClass, hideTransitionClass } = this.props;
    let sc = showClass || 'Arise-show',
      htc = hideTransitionClass || 'Arise-hide-transition',
      cl = container.classList;
    const listener = (e) => {
      container.removeEventListener('transitionend', listener);
      cl.remove(htc);
    };
    if (this.state.show) {
      cl.add(sc);
    } else {
      container.addEventListener('transitionend', listener);
      cl.remove(sc);
      cl.add(htc);
    }
  }

  _reposition() {
    let { modal, anchorElement, popupPadding, universalPositioning } = this.props;
    let { show } = this.state;
    let { container } = this.refs;
    if (modal || !show) return;
    let bottom, left;
    if (universalPositioning) {
      let bcr = anchorElement.getBoundingClientRect();
      bottom = bcr.bottom + ( window.scrollY || window.pageYOffset );
      left = bcr.left + ( window.scrollX || window.pageXOffset );
    } else {
      bottom = anchorElement.offsetTop + anchorElement.offsetHeight;
      left = anchorElement.offsetLeft;
    }
    container.style.top = `calc(${ bottom }px + ${ popupPadding || '5px' })`;
    container.style.left = left + 'px';
  }

  _bindFunctions() {
    let arg;
    for (let i=0; arg = arguments[i]; i++) {
      this[arg] = this[arg].bind(this);
    }
  }

  _stateFromProps(newProps, oldProps) {
    let vars = this.passPropsToState, p;
    let newState = {};
    oldProps = oldProps || {};
    for (let i=0; p = vars[i]; i++) {
      if (newProps[p] !== oldProps[p]) newState[p] = newProps[p];
    }
    return newState;
  }

}
