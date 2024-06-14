/*global define:true, document:true, window:true, HTMLElement:true*/

(function (root, factory) {
  'use strict';

  // UMD shim
  if (typeof define === 'function' && define.amd) {
    // AMD
    define([], factory);
  } else if (typeof exports === 'object') {
    // Node/CommonJS
    module.exports = factory();
  } else {
    // Browser
    root.textFit = factory();
  }
})(typeof global === 'object' ? global : this, function () {
  'use strict';

  var defaultSettings = {
    alignVert: false, // si es verdadero, textFit alineará verticalmente usando tablas CSS
    alignHoriz: false, // si es verdadero, textFit establecerá text-align: center
    multiLine: true, // si es verdadero, textFit no establecerá white-space: no-wrap
    detectMultiLine: true, // desactivar para desactivar la detección automática de múltiples líneas
    minFontSize: 6,
    maxFontSize: 80,
    reProcess: true, // si es verdadero, textFit volverá a procesar nodos ya ajustados. Establecer a 'false' para mejor rendimiento
    widthOnly: false, // si es verdadero, textFit ajustará el texto al ancho del elemento, independientemente de la altura del texto
    alignVertWithFlexbox: false, // si es verdadero, textFit utilizará flexbox para alineación vertical
  };

  return function textFit(els, options) {
    if (!options) options = {};

    // Extender opciones.
    var settings = {};
    for (var key in defaultSettings) {
      if (options.hasOwnProperty(key)) {
        settings[key] = options[key];
      } else {
        settings[key] = defaultSettings[key];
      }
    }

    // Convertir objetos jQuery en arrays
    if (typeof els.toArray === 'function') {
      els = els.toArray();
    }

    // Soporte para pasar un solo elemento
    var elType = Object.prototype.toString.call(els);
    if (
      elType !== '[object Array]' &&
      elType !== '[object NodeList]' &&
      elType !== '[object HTMLCollection]'
    ) {
      els = [els];
    }

    // Procesar cada elemento que hemos pasado.
    for (var i = 0; i < els.length; i++) {
      processItem(els[i], settings);
    }
  };

  /**
   * La esencia. Dado un elemento, ajusta el texto dentro de su contenedor.
   * @param  {DOMElement} el       Elemento hijo.
   * @param  {Object} settings     Opciones para el ajuste.
   */
  function processItem(el, settings) {
    if (
      !isElement(el) ||
      (!settings.reProcess && el.getAttribute('textFitted'))
    ) {
      return false;
    }

    // Establecer el atributo textFitted para saber que se procesó.
    if (!settings.reProcess) {
      el.setAttribute('textFitted', 1);
    }

    var innerSpan, originalHeight, originalHTML, originalWidth;
    var low, mid, high;

    // Obtener datos del elemento.
    originalHTML = el.innerHTML;
    originalWidth = innerWidth(el);
    originalHeight = innerHeight(el);

    // No procesar si no podemos encontrar las dimensiones del contenedor.
    if (!originalWidth || (!settings.widthOnly && !originalHeight)) {
      if (!settings.widthOnly)
        throw new Error(
          '¡Establezca una altura y ancho estáticos en el elemento de destino ' +
          el.outerHTML +
          ' antes de usar textFit!'
        );
      else
        throw new Error(
          '¡Establezca un ancho estático en el elemento de destino ' +
          el.outerHTML +
          ' antes de usar textFit!'
        );
    }

    // Añadir un span textFitted dentro de este contenedor.
    if (originalHTML.indexOf('textFitted') === -1) {
      innerSpan = document.createElement('span');
      innerSpan.className = 'textFitted';
      // El bloque en línea asegura que tome el tamaño de su contenido, incluso si está encerrado
      // en otras etiquetas como <p>
      innerSpan.style['display'] = 'inline-block';
      innerSpan.innerHTML = originalHTML;
      el.innerHTML = '';
      el.appendChild(innerSpan);
    } else {
      // Reprocesamiento.
      innerSpan = el.querySelector('span.textFitted');
      // Eliminar alineación vertical si estamos reprocesando.
      if (hasClass(innerSpan, 'textFitAlignVert')) {
        innerSpan.className = innerSpan.className.replace(
          'textFitAlignVert',
          ''
        );
        innerSpan.style['height'] = '';
        el.className.replace('textFitAlignVertFlex', '');
      }
    }

    // Preparar y establecer la alineación
    if (settings.alignHoriz) {
      el.style['text-align'] = 'center';
      innerSpan.style['text-align'] = 'center';
    }

    // Comprobar si esta cadena es de múltiples líneas
    // No garantizado que funcione siempre si se usan alturas de línea extrañas
    var multiLine = settings.multiLine;
    if (
      settings.detectMultiLine &&
      !multiLine &&
      innerSpan.getBoundingClientRect().height >=
      parseInt(window.getComputedStyle(innerSpan)['font-size'], 10) * 2
    ) {
      multiLine = true;
    }

    // Si no tratamos esto como una cadena de múltiples líneas, no permitir que se envuelva.
    if (!multiLine) {
      el.style['white-space'] = 'nowrap';
    }

    low = settings.minFontSize;
    high = settings.maxFontSize;

    // Búsqueda binaria para el mejor ajuste más alto
    var size = low;
    while (low <= high) {
      mid = (high + low) >> 1;
      innerSpan.style.fontSize = mid + 'px';
      var innerSpanBoundingClientRect = innerSpan.getBoundingClientRect();
      if (
        innerSpanBoundingClientRect.width <= originalWidth &&
        (settings.widthOnly ||
          innerSpanBoundingClientRect.height <= originalHeight)
      ) {
        size = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
      // await injection point
    }
    // encontrado, actualizando fuente si es diferente:
    if (innerSpan.style.fontSize != size + 'px')
      innerSpan.style.fontSize = size + 'px';

    // Nuestra altura está finalizada. Si estamos alineando verticalmente, configurarlo.
    if (settings.alignVert) {
      addStyleSheet();
      var height = innerSpan.scrollHeight;
      if (window.getComputedStyle(el)['position'] === 'static') {
        el.style['position'] = 'relative';
      }
      if (!hasClass(innerSpan, 'textFitAlignVert')) {
        innerSpan.className = innerSpan.className + ' textFitAlignVert';
      }
      innerSpan.style['height'] = height + 'px';
      if (
        settings.alignVertWithFlexbox &&
        !hasClass(el, 'textFitAlignVertFlex')
      ) {
        el.className = el.className + ' textFitAlignVertFlex';
      }
    }
  }

  // Calcular la altura sin relleno.
  function innerHeight(el) {
    var style = window.getComputedStyle(el, null);
    return (
      el.getBoundingClientRect().height -
      parseInt(style.getPropertyValue('padding-top'), 10) -
      parseInt(style.getPropertyValue('padding-bottom'), 10)
    );
  }

  // Calcular el ancho sin relleno.
  function innerWidth(el) {
    var style = window.getComputedStyle(el, null);
    return (
      el.getBoundingClientRect().width -
      parseInt(style.getPropertyValue('padding-left'), 10) -
      parseInt(style.getPropertyValue('padding-right'), 10)
    );
  }

  // Devuelve true si es un elemento DOM
  function isElement(o) {
    return typeof HTMLElement === 'object'
      ? o instanceof HTMLElement // DOM2
      : o &&
      typeof o === 'object' &&
      o !== null &&
      o.nodeType === 1 &&
      typeof o.nodeName === 'string';
  }

  function hasClass(element, cls) {
    return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
  }

  // Mejor que una dependencia de hoja de estilo
  function addStyleSheet() {
    if (document.getElementById('textFitStyleSheet')) return;
    var style = [
      '.textFitAlignVert{',
      'position: absolute;',
      'top: 0; right: 0; bottom: 0; left: 0;',
      'margin: auto;',
      'display: flex;',
      'justify-content: center;',
      'flex-direction: column;',
      '}',
      '.textFitAlignVertFlex{',
      'display: flex;',
      '}',
      '.textFitAlignVertFlex .textFitAlignVert{',
      'position: static;',
      '}',
    ].join('');

    var css = document.createElement('style');
    css.type = 'text/css';
    css.id = 'textFitStyleSheet';
    css.innerHTML = style;
    document.body.appendChild(css);
  }
});
