import './index.less'
var htmlStr = require('./index.html')

class FreelogAlphaReveal extends HTMLElement {
  constructor() {
    super()
    this.innerHTML = htmlStr
  }

  connectedCallback (){
    
  }
}


customElements.define('freelog-alpha-reveal', FreelogAlphaReveal);
