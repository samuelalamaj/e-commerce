'use strict';

const API_URL = 'https://fakestoreapi.com/products';
const productContainer = document.getElementById('product-container');
let currentIndex = 0;
const productsPerPage = 3;


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

        createCarousel(products.slice(0, 6), displayProducts, 'product-container');

        
        console.log('Products fetched:',products);
    } catch(error){
        productContainer.innerHTML = `Failed to fetch products. Please try again later`;
        console.error(error.message);
    }
}

//Display products in the page

const displayProducts = function(products){
    return products.slice(0,6).map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.title}">
            <h3 class='product-title'>${product.title.substring(0,19)}</h3>
            <p class='product-price'>${product.price}€</p>
        </div>
    `).join('')
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



fetchProducts()

