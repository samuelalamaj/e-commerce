'use strict';

const API_URL = 'https://fakestoreapi.com/products';
const productContainer = document.getElementById('product-container');
const homepage = document.querySelector(".homepage");
const shopCategories = document.querySelector(".shop_categories");
const homepageProducts = document.querySelector(".homepage-products");
const productDetailSelection = document.querySelector(".product-detail-section");
const moreInformation = document.querySelector(".more-information");
let currentIndex = 0;
const productsPerPage = 3;
const shopButtons = document.querySelectorAll('.btn-shop');
const API_CATEGORIES_URL = 'https://fakestoreapi.com/products/categories';
let currentProducts = [];
let currentSort = 'default';
let currentCategory = 'all';


async function fetchProducts() {
    const url = ` https://fakestoreapi.com/products`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
            //displayProducts(data.data, searchQuery);
        }
        const products = await response.json();
        // displayProducts(products);

        createCarousel(products.slice(0, 6), (products) => displayProducts(products), 'product-container');


        console.log('Products fetched:', products);
    } catch (error) {
        productContainer.innerHTML = `Failed to fetch products. Please try again later`;
        console.error(error.message);
    }
}



//Display products in the page

const displayProducts = function (products, limit = null) {
    const displayedProducts = limit ? products.slice(0, limit) : products;
    return displayedProducts.map((product) => `
        <div class="product-card" onclick="showProductDetail(${product.id})">
            <img src="${product.image}" alt="${product.title}">
            <h3 class='product-title'>${product.title.substring(0, 19)}</h3>
            <p class='product-price'>${product.price}€</p>
        </div>
    `).join('')
}

//Show product details
async function showProductDetail(productId) {
    try {
        const response = await fetch(`${API_URL}/${productId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch product details.Please try again later`);
        }
        const product = await response.json();

        //Display none for homepage sections
        homepage.style.display = 'none';
        shopCategories.style.display = "none";
        homepageProducts.style.display = "none";
        moreInformation.style.display = 'none';

        productDetailSelection.style.display = 'block';

        //Product details
        document.getElementById("product-detail").innerHTML = `
        <div class="product-detail-container">
            <div class="product-image">
                <img src="${product.image}" alt="${product.title}">
            </div>
            <div class="product-info">
                <h2>${product.title}</h2>
                <p class="price"> €${product.price} </p>
                <p class="description">${product.description}</p>
                <div class="product-actions">
                    <div class="quantity-selector">
                        <button onclick = "changeQuantity(-1)"> <ion-icon name="remove-outline"></ion-icon> </button>
                        <span id="quantity-value">1</span>
                        <button onclick = "changeQuantity(+1)"> <ion-icon name="add-outline"></ion-icon> </button>
                    </div>
                    <button onclick="addToCart(${product.id})" class="add-to-cart-btn">
                        Add to cart
                    </button>
                 </div>
                </div>
            </div>
                
        `;
    } catch (error) {
        console.error("Error fetching product details:", error)
        alert("Failed to load product details.Please try again later")
    }
    const allProductSection = document.querySelector('.all-products-section')
    if(allProductSection){
        allProductSection.remove();
       }
}

//Changing the quantity
const changeQuantity = function (change) {
    const quantitySpan = document.getElementById('quantity-value');
    let quantity = parseInt(quantitySpan.innerText);

    quantity += change;
    if (quantity < 1) quantity = 1;
    quantitySpan.innerText = quantity
}

/////////////////////////////////////////////
//*************************************** */

let cart = [];

//load cart from localhost 
function loadCart(){
    const savedCart = localStorage.getItem('cart');
    if(savedCart){
        cart = JSON.parse(savedCart);
        updateCartCounter();
    }
    
    
}

//save cart

function saveCart(){
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCounter();
}

//Update cart counter(span)
const updateCartCounter = function(){
    const cartCount = document.querySelector('.cart-count');
    if(cartCount){
        const totalItems = cart.reduce((total,item)=> total + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

//Add to cart 

async function addToCart(productId) {

    try{

        const quantityElement = document.getElementById('quantity-value');
        const quantity  = quantityElement ? parseInt(quantityElement.textContent) : 1;

        const response = await fetch(`${API_URL}/${productId}`);
        const product = await response.json();

        const existingProduct = cart.find(item => item.id === productId );

        if(existingProduct){
            existingProduct.quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                title: product.title,
                price: product.price,
                image:product.image,
                quantity: quantity
            });
        }


        saveCart();
        updateCartDisplay();

        
    } catch(error){
        console.error('Error adding to cart:', error);

    }
}

//Cart display

function updateCartDisplay(){
    const cartItems = document.querySelector('.cart-items');
    const cartTotal = document.querySelector('.cart-total');

    if(!cartItems || !cartTotal) return;

    if(cart.length === 0){
        cartItems.innerHTML = '<p> Your cart is empty</p>'
        cartTotal.innerHTML = '<h3>Total: €0.00 </h3>'
        return;
    }

    cartItems.innerHTML = cart.map(item =>`
        <div class="cart-item">
            <img src="${item.image}" alt="${item.title}">
            <div class="item-details">
                <h3>${item.title}</h3>
                <p>${item.price}</p>
                <div class="quantity">
                    <button onclick = "updateQuantity(${item.id}, ${item.quantity-1})"><ion-icon name="remove-outline"></ion-icon> </button></button>
                    <span>${item.quantity}</span>
                    <button onclick = "updateQuantity(${item.id}, ${item.quantity + 1})"><ion-icon name="add-outline"></ion-icon></button>
                </div>
            </div>
            <button onclick="removeFromCart(${item.id})" class="remove-btn"><ion-icon name="close-outline"></ion-icon> </button>
        </div>
    `).join('');

    //update total price
    const total = cart.reduce((sum, item)=> sum + (item.price * item.quantity), 0);
    
    cartTotal.innerHTML = `<h3>Total €${total.toFixed(2)}</h3> `


    }

    //update quantity in the cart

    function updateQuantity(productId, newQuantity){
        if(newQuantity < 1){
            removeFromCart(productId);
            return;
        }

        const item = cart.find(item => item.id === productId);
        if(item){
            item.quantity = newQuantity;
            saveCart();
            updateCartDisplay();
        }
    }

    //Remove item from cart

    function removeFromCart (productId){
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        updateCartDisplay();
    }

    
    function initializeCart(){
        // createCartStructure();

        const cartIcon = document.querySelector('.cart-icon');
        if(cartIcon){
            cartIcon.addEventListener('click', function(){
                const cartContainer = document.querySelector('.cart-container');
                if(cartContainer){
                    cartContainer.classList.toggle('hidden');
                    if(!cartContainer.classList.contains('hidden')){
                        updateCartDisplay();

                        if(homepage){homepage.style.display = 'none'};
                        if(shopCategories){shopCategories.style.display = 'none'};
                        if(homepageProducts){homepageProducts.style.display = 'none'};
                    }  else{
                        homepage.style.display = 'grid';
                        shopCategories.style.display = 'grid';
                        homepageProducts.style.display= 'grid';
                    }  
                }


                    });
            console.log('button clicked');
        }

        loadCart();
        updateCartDisplay();

        
    }

    document.addEventListener('DOMContentLoaded', initializeCart);


////////////////////////////////////////


//Go to back to homepage

const backToHomepage = function () {
    homepage.style.display = 'grid';
    shopCategories.style.display = 'grid';
    homepageProducts.style.display = 'grid';
    moreInformation.style.display = 'grid';
    productDetailSelection.style.display = 'none';

    const allProductSection = document.querySelector('.all-products-section');
    if (allProductSection) {
        allProductSection.innerHTML = '';
    }

    const productDetail = document.getElementById("product-detail");
    productDetail.innerHTML = "";
}



//Carousel function

const createCarousel = function (products, displayFn, containerId) {
    const container = document.getElementById(containerId);

    function updateCarousel() {
        const carouselContainer = document.createElement('div');
        carouselContainer.className = 'carousel-grid-container';

        //Nagvigation buttons:

        const prevBtn = document.createElement('button');
        prevBtn.innerHTML = '❮ ';
        prevBtn.className = 'carousel-btn prev-btn';

        const nextBtn = document.createElement('button');
        nextBtn.innerHTML = '❯';
        nextBtn.className = 'carousel-btn next-btn';

        // Make the products visible using the display function

        const visibleProducts = products.slice(currentIndex, currentIndex + productsPerPage);
        carouselContainer.innerHTML = displayFn(visibleProducts);

        //Update the carousel container

        container.innerHTML = '';
        container.appendChild(prevBtn);
        container.appendChild(carouselContainer);
        container.appendChild(nextBtn);

        //Add event listener to buttons

        prevBtn.addEventListener('click', function () {
            if (currentIndex > 0) {
                currentIndex -= 1;
                updateCarousel();
            }
        });

        nextBtn.addEventListener('click', function () {
            if (currentIndex + productsPerPage < products.length
            ) {
                currentIndex += 1;
                updateCarousel();
            }
        });
    }
    updateCarousel();
}

//Display all products


shopButtons.forEach(button => {
    button.addEventListener('click', showAllProducts);
});

//Fetching categories from api

async function fetchCategories(){
    const response = await fetch(API_CATEGORIES_URL);
    if(!response.ok){
        throw new Error('Failed to fetch Categories');
    }
    return response.json();
}

//Fetching products from api

async function fetchProduct(){
    const response = await fetch(API_URL);
    if(!response.ok){
        throw new Error('Failed to fetch products from API');
    }
    return response.json();
}

//Creating categories option

function createCategoryOptions(categories, categorySelect){
    categorySelect.innerHTML = '<option value = "all"> All categories</option>';

    categories.forEach(category =>{
    const displayName = category.charAt(0).toUpperCase() + category.slice(1);
    categorySelect.innerHTML += `
    <option value ="${category}"> ${displayName}</option>
    `;
    });
}

function filterListeners(sortSelect, categorySelect, productsGrid){
    sortSelect.addEventListener('change', ()=>{
        currentSort = sortSelect.value;
        updateProductDisplay(productsGrid);
    });

    categorySelect.addEventListener('change', () =>{
        currentCategory = categorySelect.value;
        updateProductDisplay(productsGrid);
    });
}


async function showAllProducts() {
    //Display none to homepage 
    homepage.style.display = 'none';
    shopCategories.style.display = 'none';
    homepageProducts.style.display = 'none';
    moreInformation.style.display = 'none';
    productDetailSelection.style.display = 'none';

    const allProductSection = document.createElement('section');
    allProductSection.className = 'all-products-section';

    const title = document.createElement('h2');
    title.className = 'all-products-title';
    title.innerHTML = `shop all`;

    const backButton = document.createElement('button');
    backButton.className = 'back-btn';
    backButton.innerHTML = '❮ Back';
    backButton.onclick = backToHomepage;
    
    //Creating filter elements
    const filtersContainer = document.createElement('div');
    filtersContainer.className = 'filters-container';

    const sortSelect = document.createElement('select');
    sortSelect.className = 'sort-select';
    sortSelect.innerHTML = `
        <option value = 'default'> Sort by...</option>
        <option value = 'low-to-high'>Price: Low to High </option>
        <option value = 'high-to-low'>Price:High to Low </option>
        `;
    
    const categorySelect = document.createElement('select');
    categorySelect.className = 'category-select';
    categorySelect.innerHTML = `<option value="all"> All Categories </option>`;
    
    filtersContainer.appendChild(sortSelect);
    filtersContainer.appendChild(categorySelect);
   
    const productsGrid = document.createElement('div');
    productsGrid.className = 'products-grid';
    productsGrid.innerHTML = `<div class='loading'> Loading products</div>`
    

    //Add elements in all-product-section
    productsGrid.innerHTML = `
        <div class="loading"> Loading products ... </div>`;

    allProductSection.appendChild(title)
    allProductSection.appendChild(backButton);
    allProductSection.appendChild(filtersContainer);
    allProductSection.append(productsGrid);

    const footer = document.querySelector('footer');
    document.body.insertBefore(allProductSection, footer);
    allProductSection.insertBefore(filtersContainer, backButton);
   

    //fetching categories and the products
    try {

        const categories = await fetchCategories();
        const products = await fetchProduct();

        currentProducts = products;

        createCategoryOptions(categories, categorySelect);

        filterListeners(sortSelect, categorySelect, productsGrid);

        updateProductDisplay(productsGrid);

    } catch (error) {

        productsGrid.innerHTML = `
            <div class='error'>
                Failed to load products. Please try again later.
                <button onclick="showAllProducts()">Retry</button>
            </div>
        `;

        console.error('Error, error');
    }


}

function updateProductDisplay(productsGrid) {
    let filteredProducts = currentProducts;

    if(currentCategory !== 'all'){
        filteredProducts = currentProducts.filter(product => product.category === currentCategory
        );
    }


    if(currentSort === 'low-to-high'){
        filteredProducts.sort((a,b)=> a.price - b.price);
    } else if(currentSort === 'high-to-low'){
       filteredProducts.sort((a,b)=>b.price-a.price);
    }

    if(filteredProducts.length ===0){
        productsGrid.innerHTML = `
        <div class='no-products'>
            No products in this category.
        </div>`;
    }else{
        productsGrid.innerHTML = displayProducts(filteredProducts)
    }
}

fetchProducts()

