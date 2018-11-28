import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import { GestureEventListeners } from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import '@polymer/marked-element/marked-element.js';
import '@polymer/prism-element/prism-highlighter.js';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin.js';
import { LightDomHelper } from './vaadin-light-dom-helper.js';
import './vaadin-demo-shadow-dom-renderer.js';
import './vaadin-demo-iframe-renderer.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import './vaadin-demo-ready-event-emitter.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="vaadin-demo-snippet-default-theme">
  <template>
    <style>
    /**
     * GHColors theme by Avi Aryan (http://aviaryan.in)
     * Inspired by Github syntax coloring
     */

    code[class*="lang-"],
    pre[class*="lang-"] {
        color: #393A34;
        font-family: "Source Code Pro", "Consolas", "Bitstream Vera Sans Mono", "Courier New", Courier, monospace;
        direction: ltr;
        text-align: left;
        white-space: pre;
        word-spacing: normal;
        word-break: normal;
        font-size: 0.875em;
        line-height: 1.4;

        -moz-tab-size: 4;
        -o-tab-size: 4;
        tab-size: 4;

        -webkit-hyphens: none;
        -moz-hyphens: none;
        -ms-hyphens: none;
        hyphens: none;
    }

    pre[class*="lang-"]::-moz-selection,
    pre[class*="lang-"] ::-moz-selection,
    code[class*="lang-"]::-moz-selection,
    code[class*="lang-"] ::-moz-selection {
        background: #b3d4fc;
    }

    pre[class*="lang-"]::selection,
    pre[class*="lang-"] ::selection,
    code[class*="lang-"]::selection,
    code[class*="lang-"] ::selection {
        background: #b3d4fc;
    }

    /* Code blocks */
    pre[class*="lang-"] {
        padding: 1em;
        margin: .5em 0;
        overflow: auto;
        border: 1px solid #ddd;
        background-color: white;
    }

    /* Inline code */
    :not(pre) > code[class*="lang-"] {
        padding: .2em;
        padding-top: 1px;
        padding-bottom: 1px;
        background: #f8f8f8;
        border: 1px solid #ddd;
    }

    .token.comment,
    .token.prolog,
    .token.doctype,
    .token.cdata {
        color: #998;
        font-style: italic;
    }

    .token.namespace {
        opacity: .7;
    }

    .token.string,
    .token.attr-value {
        color: #e3116c;
    }

    .token.punctuation,
    .token.operator {
        color: #393A34; /* no highlight */
    }

    .token.entity,
    .token.url,
    .token.symbol,
    .token.number,
    .token.boolean,
    .token.variable,
    .token.constant,
    .token.property,
    .token.regex,
    .token.inserted {
        color: #36acaa;
    }

    .token.atrule,
    .token.keyword,
    .token.attr-name,
    .lang-autohotkey .token.selector {
        color: #00a4db;
    }

    .token.function,
    .token.deleted,
    .lang-autohotkey .token.tag {
        color: #9a050f;
    }

    .token.tag,
    .token.selector,
    .lang-autohotkey .token.keyword {
        color: #00009f;
    }

    .token.important,
    .token.function,
    .token.bold {
        font-weight: bold;
    }

    .token.italic {
        font-style: italic;
    }
    </style>
  </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
let instanceIndex = 0;
class VaadinDemoSnippet extends
  ThemableMixin(
    GestureEventListeners(PolymerElement)) {
  static get template() {
    return html`
    <style>
      :host {
        display: block;

        background-color: white;
        box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
        margin-bottom: 3em;
        @apply --demo-snippet;
      }

      #demo {
        display: block;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        margin: 0;
        @apply --demo-snippet-demo;
      }

      .code-container {
        margin: 0;
        background-color: rgba(0, 0, 0, 0.02);
        font-size: 0.95em;
        overflow: auto;
        position: relative;
        padding: 0;
        @apply --demo-snippet-code;
      }

      .code-container .code {
        padding: 1.4em 2em;
        margin: 0;
        overflow: auto;
        max-height: 18.5em;
        @apply --demo-snippet-code;
      }

      .code-container .code > pre {
        margin: 0;
      }

      .code-container button {
        position: absolute;
        top: 0.5em;
        right: 0.5em;
        text-transform: uppercase;
        border: none;
        border-radius: 0.25em;
        cursor: pointer;
        background: rgba(0, 0, 0, 0.3);
        color: #fff;
      }

      .code-container button:focus,
      .code-container button:hover {
        background: rgba(0, 0, 0, 0.6);
      }
    </style>

    <prism-highlighter></prism-highlighter>

    <div id="demo">
      <template is="dom-if" if="[[_isIframe]]" restamp="">
        <vaadin-demo-iframe-renderer src="[[iframeSrc]]" id="[[id]]" demo-components-root="[[demoComponentsRoot]]" no-toolbar="[[noToolbar]]">
          <slot></slot>
        </vaadin-demo-iframe-renderer>
      </template>
      <template is="dom-if" if="[[!_isIframe]]" restamp="">
        <vaadin-demo-shadow-dom-renderer id="[[id]]">
          <slot></slot>
        </vaadin-demo-shadow-dom-renderer>
      </template>
    </div>

    <div class="code-container">
      <marked-element markdown="[[_markdown]]" id="marked">
        <div class="code" slot="markdown-html"></div>
      </marked-element>
      <button id="copyButton" title="copy to clipboard" on-tap="_copyToClipboard">Copy</button>
    </div>
`;
  }

  static get is() {
    return 'vaadin-demo-snippet';
  }

  static get properties() {
    return {
      id: {
        type: String,
        value: () => {
          return `vaadin-demo-snippet-${instanceIndex++}`;
        }
      },
      iframeSrc: String,
      demoComponentsRoot: String,
      noToolbar: Boolean,
      _isIframe: {
        type: Boolean,
        value: false,
        computed: '_computeIsIframe(iframeSrc)'
      },
      _markdown: String
    };
  }

  ready() {
    super.ready();

    if (this.hasAttribute('ignore-ie') && !!navigator.userAgent.match(/Trident/)) {
      let node = this.previousSibling;
      while (!(node instanceof VaadinDemoSnippet)) {
        const drop = node;
        node = node.previousSibling;
        drop.parentNode.removeChild(drop);
      }
      this.parentNode.removeChild(this);
      return;
    }

    LightDomHelper.querySelectorAsync('template', this)
      .then(template => {
        try {
          const host = this.getRootNode().host.getRootNode().host;
          // set the root directory for lazy loaded elements in demos
          this.demoComponentsRoot = `${host.srcBaseHref}/demo-elements`;
        } catch (e) {
          console.error('Unable to get the `baseHref` from the <vaadin-component-demo>');
        }
        this._showDemo(template);
      })
      .catch(error => {
        throw new Error('vaadin-demo-snippet requires a <template> child');
      });
  }

  _computeIsIframe(iframeSrc) {
    return (typeof iframeSrc === 'string') && iframeSrc.trim() !== '';
  }

  _showDemo(template) {
    // Hide the use of window.addDemoReadyListener
    let snippet = this.$.marked.unindent(template.innerHTML)
      .replace(/window\.addDemoReadyListener\('[^{]+/g, `window.addEventListener('WebComponentsReady', function() `);

    // Hide the use of window.Vaadin.demoComponentsRoot
    snippet = snippet.replace(/`(\${Vaadin\.Demo\.componentsRoot})(.+)`/gi, `'$2'`);

    // Hide the use of window.__importModule for dynamic imports
    snippet = snippet.replace(/(Vaadin\.Demo\.import\(')/gi, `import('.`);

    // Remove style-scoped classes that are appended when ShadyDOM is enabled
    Array.from(this.classList).forEach(e => snippet = snippet.replace(new RegExp('\\s*' + e, 'g'), ''));
    snippet = snippet.replace(/ class=""/g, '');

    // Boolean properties are displayed as checked="", so remove the ="" bit.
    snippet = snippet.replace(/=""/g, '');
    this._markdown = '```html\n' + snippet.trim() + '```';
  }

  _copyToClipboard() {
    // From https://github.com/google/material-design-lite/blob/master/docs/_assets/snippets.js
    const snipRange = document.createRange();
    const selectedSource = this.shadowRoot.querySelector('marked-element > .code');
    snipRange.selectNodeContents(selectedSource);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(snipRange);
    let result = false;
    try {
      result = document.execCommand('copy');
      this.$.copyButton.textContent = 'done';
    } catch (err) {
      // Copy command is not available
      console.error(err);
      this.$.copyButton.textContent = 'error';
    }

    // Return to the copy button after a second.
    setTimeout(this._resetCopyButtonState.bind(this), 1000);

    selection.removeAllRanges();
    return result;
  }

  _resetCopyButtonState() {
    this.$.copyButton.textContent = 'copy';
  }
}
customElements.define(VaadinDemoSnippet.is, VaadinDemoSnippet);
