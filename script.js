const products = [
  { name: 'Blusinhas', type: 'Suplex', price: 'R$ 29,90', sizes: ['P', 'M', 'G'], colors: ['Preta', 'Branca', 'Azul', 'Bege', 'Laranja', 'Marrom', 'Marrom escuro', 'Verde'],
     images: ['assets/blusinha-bege.jpeg', 'assets/blusinha-azul.jpeg', 'assets/blusinha-laranja.jpeg', 'assets/blusinha-marrom.jpeg',
     'assets/blusinha-marrom-escuro.jpeg', 'assets/blusinha-preta.jpeg', 'assets/blusinha-verde.jpeg' ]},
  { name: 'Camisetas lisas', type: 'Camisetas', price: 'R$ —', sizes: ['P', 'M', 'G'], colors: ['Preta', 'Branca', 'Azul', 'Bege', 'Marrom', 'Verde', 'Vinho'],
     images: ['assets/camiseta-azul.jpeg', 'assets/camiseta-bege.jpeg', 'assets/camiseta-branca.jpeg', 'assets/camiseta-marrom-escuro.jpeg',
      'assets/camiseta-preta.jpeg', 'assets/camiseta-verde.jpeg', 'assets/camiseta-azul.vinho']},
  { name: 'Blusinha Renda', type: 'Monte seu look', price: 'R$ —', sizes: ['P', 'M', 'G'], colors: ['Marrom Clara', 'Marrom Escuro', 'Preta', 'Azul'], image: 'assets/camiseta-renda.jpeg' },
  { name: 'Blusinha Alça Fina', type: 'Look Beline', price: 'R$ —', sizes: ['P', 'M', 'G'], image: 'assets/alça-fina.jpeg' },
  { name: 'Marroquina', type: 'Look Beline', price: 'R$ —', sizes: ['P', 'M', 'G'], colors: ['Azul', 'Verde', 'Rosa', 'Vinho'],images: ['assets/marroquina.jpeg', 'assets/marroquino-todos.jpeg']},
  { name: 'Viscose', type: 'Blusa e saia', price: 'R$ —', sizes: ['P', 'M', 'G'], colors: ['Poá', 'Listras', 'Flores', 'Marrom', 'Verde'], images: ['assets/viscose.jpeg', 'assets/viscose-todas.jpeg']},
  { name: 'Verde-Azul', type: 'Look Beline', price: 'R$ —', sizes: ['P', 'M', 'G'], colors: ['Verde', 'Azul'],image: 'assets/verde-azul.jpeg' },
  
];

// Troque pelo número da loja, apenas dígitos com DDI e DDD. Ex.: 5511999999999
const WHATSAPP_NUMBER = '5511942697535';
const grid = document.querySelector('#product-grid');
const dialog = document.querySelector('#order-dialog');
let selectedProduct;

grid.innerHTML = products.map((product, index) => {
  const imgs = product.images || [product.image];
  const controls = imgs.length > 1 ? `
    <button type="button" class="slide-btn prev" aria-label="Foto anterior">‹</button>
    <button type="button" class="slide-btn next" aria-label="Próxima foto">›</button>
    <div class="dots">${imgs.map((_, i) => `<i class="${i === 0 ? 'on' : ''}"></i>`).join('')}</div>` : '';
  return `
  <article class="product-card" data-index="${index}" tabindex="0" role="button" aria-label="Pedir ${product.name}">
    <div class="product-image">
      <div class="slides">${imgs.map((src, i) => `<img src="${src}" alt="${product.name}, foto ${i + 1}" loading="lazy">`).join('')}</div>
      ${controls}
    </div>
    <div class="product-info"><div><p>${product.name}</p><p class="type">${product.type}</p></div><div><p>${product.price}</p><button type="button">Pedir peça ↗</button></div></div>
  </article>`;
}).join('');

function openOrder(index) {
  selectedProduct = products[index];
  const firstImage = (selectedProduct.images || [selectedProduct.image])[0];
  document.querySelector('#dialog-image').src = firstImage;
  document.querySelector('#dialog-image').alt = selectedProduct.name;
  document.querySelector('#dialog-product-name').textContent = selectedProduct.name;
  document.querySelector('#dialog-product-price').textContent = selectedProduct.price;
  document.querySelector('#size-options').innerHTML = selectedProduct.sizes.map((size, i) => `<label><input type="radio" name="size" value="${size}" ${i === 0 ? 'checked' : ''}><span>${size}</span></label>`).join('');
  dialog.showModal();
  const colors = selectedProduct.colors || [];
  document.querySelector('#color-fieldset').hidden = colors.length === 0;
  document.querySelector('#color-options').innerHTML = colors.map((color, i) => `<label><input type="radio" name="color" value="${color}" ${i === 0 ? 'checked' : ''}><span>${color}</span></label>`
  ).join('');
}

grid.addEventListener('click', e => {
  const btn = e.target.closest('.slide-btn');
  if (btn) {
    const slides = btn.parentElement.querySelector('.slides');
    slides.scrollBy({ left: (btn.classList.contains('next') ? 1 : -1) * slides.clientWidth, behavior: 'smooth' });
    return;
  }
  const card = e.target.closest('.product-card');
  if (card) openOrder(card.dataset.index);
});
grid.addEventListener('keydown', e => {
  if (e.target.closest('.slide-btn')) return;
  const card = e.target.closest('.product-card');
  if (card && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openOrder(card.dataset.index); }
});
document.querySelectorAll('.close-dialog').forEach(btn =>
  btn.addEventListener('click', () => btn.closest('dialog').close())
);
grid.addEventListener('scroll', e => {
  if (!e.target.classList.contains('slides')) return;
  const i = Math.round(e.target.scrollLeft / e.target.clientWidth);
  e.target.parentElement.querySelectorAll('.dots i').forEach((d, n) => d.classList.toggle('on', n === i));
}, true);

// ---------- CARRINHO ----------
const cartDialog = document.querySelector('#cart-dialog');
const cartList = document.querySelector('#cart-items');
const checkoutForm = document.querySelector('#checkout-form');
let cart = [];
try { cart = JSON.parse(localStorage.getItem('beline-cart')) || []; } catch { cart = []; }

function saveCart() {
  try { localStorage.setItem('beline-cart', JSON.stringify(cart)); } catch {}
  renderCart();
}

function renderCart() {
  const count = document.querySelector('#cart-count');
  count.textContent = cart.length;
  count.dataset.zero = cart.length === 0;
  cartList.innerHTML = cart.length
    ? cart.map((item, i) => `
        <li>
          <div>
            <strong>${item.name}</strong>
            <span>Tam. ${item.size}${item.color ? ' · ' + item.color : ''} · ${item.price}</span>
          </div>
          <button type="button" data-remove="${i}" aria-label="Remover ${item.name}">Remover</button>
        </li>`).join('')
    : '<li class="cart-empty">Seu carrinho está vazio.</li>';
  checkoutForm.querySelector('button[type="submit"]').disabled = cart.length === 0;
}

// Adicionar ao carrinho (submit do pop-up da peça)
document.querySelector('#order-form').addEventListener('submit', e => {
  e.preventDefault();
  const size = document.querySelector('#order-form input[name="size"]:checked').value;
  const colorInput = document.querySelector('#order-form input[name="color"]:checked');
  cart.push({
    name: selectedProduct.name,
    price: selectedProduct.price,
    size,
    color: colorInput ? colorInput.value : ''
  });
  saveCart();
  dialog.close();
  cartDialog.showModal(); // abre o carrinho; se preferir continuar comprando, apague esta linha
});

// Abrir carrinho
document.querySelector('#cart-button').addEventListener('click', () => cartDialog.showModal());

// Remover item
cartList.addEventListener('click', e => {
  const btn = e.target.closest('[data-remove]');
  if (!btn) return;
  cart.splice(Number(btn.dataset.remove), 1);
  saveCart();
});

// Finalizar: manda tudo em uma mensagem
checkoutForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!cart.length) return;
  const name = document.querySelector('#customer-name').value.trim();
  const phone = document.querySelector('#customer-phone').value.trim();
  const payment = document.querySelector('#payment').value;

  const items = cart.map((item, i) =>
    `${i + 1}) ${item.name}\n   Tamanho: ${item.size}${item.color ? `\n   Cor: ${item.color}` : ''}\n   Preço: ${item.price}`
  ).join('\n\n');

  const message = `Oi, tenho interesse nessas peças!!\n\n${items}\n\nNome: ${name}\nNumero: ${phone}\nPagamento: ${payment}`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
});

renderCart();
