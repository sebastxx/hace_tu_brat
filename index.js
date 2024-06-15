const textInput = document.getElementById('textInput');
const numInput = document.getElementById('friedLevel');
const textOverlay = document.getElementById('textOverlay');
// textOverlay.innerText = textInput.value;
const bratButPic = document.getElementById('bratButPic');

textInput.addEventListener('input', function () {
  const fryLevel = document.getElementById('friedLevel').value;
  const text = this.value;
  textOverlay.innerText = text;
  textOverlay.style.textAlign = 'justify';
  textOverlay.style.textAlignLast = 'justify';
  textFit(textOverlay, { maxFontSize: 170 });
  // bratButPic.style.display = 'none';
  downloadImg(1 - fryLevel / 100);
});

numInput.addEventListener('input', function () {
  const num = this.value;
  const text = document.getElementById('textInput').value;
  textOverlay.innerText = text;
  if (text.length < 20) {
    textOverlay.style.textAlign = 'center';
    textOverlay.style.textAlignLast = 'auto';
    textOverlay.style.display = 'flex';
    textOverlay.style.justifyContent = 'center';
    textOverlay.style.alignItems = 'center';
  } else {
    textOverlay.style.textAlign = 'justify';
    textOverlay.style.textAlignLast = 'justify';
    textOverlay.style.display = 'block';
    textFit(textOverlay, { maxFontSize: 170 });
  }
  // bratButPic.style.display = 'none';
  downloadImg(1 - num / 100);
});

const hiddenClone = (element) => {
  // Crear un clon del elemento
  var clone = element.cloneNode(true);

  // Posicionar el elemento relativamente dentro del
  // cuerpo pero aún fuera de la vista
  var style = clone.style;
  style.position = 'relative';
  style.top = window.innerHeight + 'px';
  style.left = 0;

  // Agregar el clon al cuerpo y devolver el clon
  document.body.appendChild(clone);
  return clone;
};

const downloadImg = (fryLevel) => {
  var clone = hiddenClone(document.getElementById('textOverlay'));
  // Usar el clon con htm2canvas y eliminar el clon
  html2canvas(clone, { scrollY: -window.scrollY }).then((canvas) => {
    var dataURL = canvas.toDataURL('image/jpeg', fryLevel);
    document.body.removeChild(clone);
    var link = document.createElement('a');
    link.href = dataURL;
    bratButPic.src = dataURL;
    bratButPic.style.display = 'block';

    link.download = `brat.jpeg`;
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);
  });
};

function toggleColor() {
  var body = document.getElementsByTagName('body')[0];

  if (body.classList.contains('white')) {
    setupTheme('green');
  } else {
    setupTheme('white');
  }
}

function queryState() {
  var body = document.getElementsByTagName('body')[0];
  return body.classList.contains('white') ? 'white' : 'green';
}

function setupTheme(color) {
  var body = document.getElementsByTagName('body')[0];
  var button = document.getElementById('toggleButton');
  const bratButPic = document.getElementById('bratButPic');
  //
  if (color === 'white') {
    body.classList.remove('green');
    body.classList.add('white');
    button.style.backgroundColor = '#8ACF00';
    bratButPic.src = '/brat-deluxe.png';
  } else {
    body.classList.remove('white');
    body.classList.add('green');
    button.style.backgroundColor = 'white';
    bratButPic.src = '/brat.png';
  }
}

// Establecer el estado inicial
document.getElementsByTagName('body')[0].classList.add('white');
setupTheme('green');

const generateBrat = () => {
  const type = getType();
  const period = getPeriod();

  const fileName = `top_${type}_${period}`;
  window.scrollTo(0, 0);
  var clone = hiddenClone(offScreen());
  // usar clon con htm2canvas y elimina clon
  html2canvas(clone, { scrollY: -window.scrollY }).then((canvas) => {
    var dataURL = canvas.toDataURL(
      getMode() === 'brat' ? 'image/jpeg' : 'image/png',
      getMode() === 'brat' ? 0.25 : 1.0
    );
    document.body.removeChild(clone);
    const newWindow = window.open('about:blank');
    let img = newWindow.document.createElement('img');

    // Establecer el atributo src a la URL de datos
    img.src = dataURL;

    // Agregar el elemento img al cuerpo de la nueva ventana
    newWindow.document.body.appendChild(img);
  });
};
