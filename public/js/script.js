//cart toggle
let cartIcon = document.querySelector('.cartIcon');
let body = document.querySelector('body');
let closeCartBasket = document.querySelector('.close');
let starRating = document.querySelectorAll('.rating-star');

cartIcon.addEventListener('click', function() {
    body.classList.toggle('showCartBasket');
});

closeCartBasket.addEventListener('click', function() {
    body.classList.toggle('showCartBasket');
});

//image collage bluring
const collageImgs = [...document.querySelectorAll('.img')];
collageImgs.map((item, i) => {
    item.addEventListener('mouseover', () => {
        collageImgs.map((image, j) => {
            if(j != i){
                image.style.filter = 'blur(8px)';
                item.style.zIndex = 2;
            }
        });
    });
    item.addEventListener('mouseleave', () => {
        collageImgs.map((image, j) => {
            image.style = null;
        });
    });
});


// enables rating in product page
starRating.map((star, i) => {
    star.addEventListener('click', () => {
        for (let j = 0; j < 4; j++){
            if(j <= i){
                starRating[i].src = `../public/images/star.png`;
            }else{
                starRating[i].src = `../public/images/no-star.png`;
            }
        }
    })
});
