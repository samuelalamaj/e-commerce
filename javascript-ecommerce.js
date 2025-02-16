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


async function fetchProducts() {
    const url =` https://fakestoreapi.com/products`;

    try{
        const response = await fetch(url);
        if(!response.ok){
            throw new Error(`Response status: ${response.status}`);
            //displayProducts(data.data, searchQuery);
        }
        const products = await response.json();
        // displayProducts(products);

        createCarousel(products.slice(0, 6),(products)=> displayProducts(products), 'product-container');

        
        console.log('Products fetched:',products);
    } catch(error){
        productContainer.innerHTML = `Failed to fetch products. Please try again later`;
        console.error(error.message);
    }
}

//Display products in the page

const displayProducts = function(products, limit = null){
    const displayedProducts = limit ? products.slice(0,limit) : products;
    return displayedProducts.map((product) => `
        <div class="product-card" onclick="showProductDetail(${product.id})">
            <img src="${product.image}" alt="${product.title}">
            <h3 class='product-title'>${product.title.substring(0,19)}</h3>
            <p class='product-price'>${product.price}€</p>
        </div>
    `).join('')
}

//Show product details
async function showProductDetail(productId){
    try{
        const response  = await fetch(`${API_URL}/${productId}`);
        if(!response.ok){
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
    } catch(error){
        console.error("Error fetching product details:", error)
        alert("Failed to load product details.Please try again later")
    }
}

//Changing the quantity
const changeQuantity = function(change){
    const quantitySpan = document.getElementById('quantity-value');
    let quantity = parseInt(quantitySpan.innerText);

    quantity +=change;
    if(quantity < 1) quantity = 1; 
    quantitySpan.innerText = quantity
}


//Go to back to homepage

const backToHomepage = function(){
   homepage.style.display = 'grid';
   shopCategories.style.display = 'grid';
   homepageProducts.style.display = 'grid';
   moreInformation.style.display = 'grid';
   productDetailSelection.style.display = 'none';

   const allProductSection =document.querySelector('.all-products-section');
   if(allProductSection){
    allProductSection.remove();
   }

   const productDetail = document.getElementById("product-detail");
   productDetail.innerHTML = "";
}
  


//Carousel function

const createCarousel = function(products, displayFn, containerId){
    const container = document.getElementById(containerId);

    function updateCarousel(){
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

        prevBtn.addEventListener('click', function() {
            if(currentIndex > 0){
                currentIndex -= 1;
                updateCarousel();
            }
        });

        nextBtn.addEventListener('click', function(){
            if(currentIndex + productsPerPage < products.length
            ){
                currentIndex += 1;
                updateCarousel();
            }
        });
    }
    updateCarousel();
}

//Display all products


shopButtons.forEach(button =>{
    button.addEventListener('click', showAllProducts);
});

async function showAllProducts(){

    homepage.style.display = 'none';
    shopCategories.style.display = 'none';
    homepageProducts.style.display = 'none';
    moreInformation.style.display = 'none';
    productDetailSelection.style.display = 'none';

    const allProductSection = document.createElement('section');
    allProductSection.className = 'all-products-section';

    const title = document.createElement('h2');
    title.className = 'all-products-title';
    title.innerHTML = 'shop all';

    const backButton = document.createElement('button');
    backButton.className = 'back-btn';
    backButton.innerHTML = '❮ Back';
    backButton.onclick = backToHomepage;


    const productsGrid = document.createElement('div');
    productsGrid.className = 'products-grid';

    productsGrid.innerHTML = `
        <div class="loading"> Loading products ... </div>`;
    allProductSection.append(title)
    allProductSection.appendChild(backButton);
    allProductSection.append(productsGrid);
    
    const footer = document.querySelector('footer');
    document.body.insertBefore(allProductSection, footer);

    try{
        const response = await fetch(API_URL);
        if(!response.ok){
            throw new Error (`HTTP error! status: ${response.status}`);
        }
        const products = await response.json();

        productsGrid.innerHTML = displayProducts(products);
    } catch(error){

        productsGrid.innerHTML = `
            <div class='error'>
                Failed to load products. Please try again later.
                <button onclick="showAllProducts()">Retry</button>
            </div>
        `;

        console.error('Error, error');
    }
    

}



fetchProducts()

