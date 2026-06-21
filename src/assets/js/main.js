const fimEl = document.querySelector('#fim');

if (fimEl) {
  const fimArr = [['fim', 'pt', '🇵🇹'], ['fine', 'it', '🇮🇹'], ['finir', 'fr', '🇫🇷'], ['einde', 'nl', '🇳🇱']];
  const fimRand = Math.floor(Math.random() * fimArr.length);
  
  fimEl.innerHTML = `&#8212; <i lang="${fimArr[fimRand][1]}">${fimArr[fimRand][0]} <span>${fimArr[fimRand][2]}</span></i>`;
}
